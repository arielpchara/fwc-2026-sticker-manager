import { describe, it, expect, beforeEach } from 'vitest'
import { setOwn, getOwn, compareWith, getExtras, addSurplus } from '../core/stickerService.js'
import type { Repository } from '../core/stickerService.js'
import type { OwnRecord } from '../storage/ownRepository.js'
import type { Inventory } from '../domain/inventory.js'
import { codesOf } from '../domain/inventory.js'

function makeRepo(): Repository {
  let store: OwnRecord = { inv: {}, hash: '', updatedAt: '' }
  return {
    async load() {
      return { ...store, inv: { ...store.inv } }
    },
    async save(inv: Inventory) {
      const sorted = Object.entries(inv).sort(([a], [b]) => a.localeCompare(b))
      const newHash = JSON.stringify(sorted)
      if (store.hash === newHash) return false
      store = { inv: { ...inv }, hash: newHash, updatedAt: new Date().toISOString() }
      return true
    },
  }
}

describe('stickerService', () => {
  let repo: Repository

  beforeEach(() => {
    repo = makeRepo()
  })

  describe('setOwn', () => {
    it('parses text and saves stickers', async () => {
      const result = await setOwn('BRA1,ARG1,FWC3', repo)
      expect(result.saved).toBe(true)
      expect(result.count).toBe(3)
      expect(result.stickers).toEqual(['ARG1', 'BRA1', 'FWC3'])
      expect(result.totalCopies).toBe(3)
    })

    it('is idempotent: second call with same text returns saved=false', async () => {
      await setOwn('BRA1,ARG1', repo)
      const second = await setOwn('BRA1,ARG1', repo)
      expect(second.saved).toBe(false)
    })

    it('ignores invalid tokens in text', async () => {
      const result = await setOwn('BRA1 invalid BRA0 ARG1', repo)
      expect(result.stickers).toEqual(['ARG1', 'BRA1'])
    })

    it('deduplicates codes', async () => {
      const result = await setOwn('BRA1 BRA1 BRA1', repo)
      expect(result.count).toBe(1)
      expect(result.stickers).toEqual(['BRA1'])
      expect(result.totalCopies).toBe(3)
    })

    it('saves empty collection for text with no valid codes', async () => {
      const result = await setOwn('no valid codes here', repo)
      expect(result.stickers).toEqual([])
      expect(result.count).toBe(0)
      expect(result.totalCopies).toBe(0)
    })

    it('parses xN count from text', async () => {
      const result = await setOwn('BRA1 x3 ARG1', repo)
      expect(result.count).toBe(2)
      expect(result.totalCopies).toBe(4)
      const record = await getOwn(repo)
      expect(record.inv).toEqual({ ARG1: 1, BRA1: 3 })
    })

    it('parses grouped format with counts', async () => {
      const result = await setOwn('BRA: 1x3, 2', repo)
      expect(result.count).toBe(2)
      expect(result.totalCopies).toBe(4)
      expect(result.stickers).toEqual(['BRA1', 'BRA2'])
    })
  })

  describe('getOwn', () => {
    it('returns empty state initially', async () => {
      const record = await getOwn(repo)
      expect(codesOf(record.inv)).toEqual([])
    })

    it('returns stickers after setOwn', async () => {
      await setOwn('BRA1 ARG1', repo)
      const record = await getOwn(repo)
      expect(codesOf(record.inv)).toEqual(['ARG1', 'BRA1'])
    })
  })

  describe('compareWith', () => {
    it('returns stickers they have that I dont', async () => {
      await setOwn('BRA1 ARG1', repo)
      const result = await compareWith('BRA1 ARG1 FWC3 BRA2', repo)
      expect(result.missing).toEqual(['BRA2', 'FWC3'])
      expect(result.count).toBe(2)
    })

    it('returns everything when own is empty', async () => {
      const result = await compareWith('BRA1 ARG1', repo)
      expect(result.missing).toEqual(['ARG1', 'BRA1'])
    })

    it('returns empty when I have everything they have', async () => {
      await setOwn('BRA1 ARG1 FWC3', repo)
      const result = await compareWith('BRA1 ARG1', repo)
      expect(result.missing).toEqual([])
      expect(result.count).toBe(0)
    })

    it('returns empty when their text is empty', async () => {
      await setOwn('BRA1', repo)
      const result = await compareWith('', repo)
      expect(result.missing).toEqual([])
    })

    it('handles special codes', async () => {
      await setOwn('BRA1', repo)
      const result = await compareWith('BRA1 00', repo)
      expect(result.missing).toEqual(['00'])
    })
  })

  describe('addSurplus', () => {
    it('adds surplus to existing sticker', async () => {
      await setOwn('RSA5', repo)
      const result = await addSurplus('RSA5 (x1)', repo)
      expect(result.updated).toEqual(['RSA5'])
      expect(result.count).toBe(1)
      expect(result.saved).toBe(true)
      const record = await getOwn(repo)
      expect(record.inv['RSA5']).toBe(2)
    })

    it('adds sticker not in collection yet', async () => {
      const result = await addSurplus('RSA5 (x2)', repo)
      expect(result.updated).toEqual(['RSA5'])
      expect(result.saved).toBe(true)
      const record = await getOwn(repo)
      expect(record.inv['RSA5']).toBe(3)
    })

    it('updates multiple stickers', async () => {
      await setOwn('RSA5', repo)
      const result = await addSurplus('RSA5 (x1), RSA12 (x1)', repo)
      expect(result.count).toBe(2)
      expect(result.saved).toBe(true)
      const record = await getOwn(repo)
      expect(record.inv['RSA5']).toBe(2)
      expect(record.inv['RSA12']).toBe(2)
    })

    it('is idempotent — same surplus returns saved=false', async () => {
      await addSurplus('RSA5 (x1)', repo)
      const result = await addSurplus('RSA5 (x1)', repo)
      expect(result.count).toBe(0)
      expect(result.saved).toBe(false)
    })

    it('does not affect codes not in surplus text', async () => {
      await setOwn('RSA5 BRA1', repo)
      await addSurplus('RSA5 (x1)', repo)
      const record = await getOwn(repo)
      expect(record.inv['BRA1']).toBe(1)
    })

    it('handles empty surplus text', async () => {
      const result = await addSurplus('', repo)
      expect(result.count).toBe(0)
      expect(result.saved).toBe(false)
    })
  })

  describe('getExtras', () => {
    it('returns empty when no extra stickers exist', async () => {
      await setOwn('BRA1 ARG1', repo)
      const result = await getExtras(repo)
      expect(result.totalUnique).toBe(0)
      expect(result.totalSurplus).toBe(0)
      expect(result.items).toEqual([])
    })

    it('returns extras when there are duplicates', async () => {
      await setOwn('BRA1 x3 ARG1 x2 FWC3', repo)
      const result = await getExtras(repo)
      expect(result.totalUnique).toBe(2)
      expect(result.totalSurplus).toBe(3)
      expect(result.items).toContainEqual({ code: 'BRA1', qty: 3, surplus: 2 })
      expect(result.items).toContainEqual({ code: 'ARG1', qty: 2, surplus: 1 })
    })

    it('returns empty when collection is empty', async () => {
      const result = await getExtras(repo)
      expect(result.totalUnique).toBe(0)
    })

    it('sorts extras by code', async () => {
      await setOwn('BRA1 x2 ARG1 x2', repo)
      const result = await getExtras(repo)
      expect(result.items.map((e) => e.code)).toEqual(['ARG1', 'BRA1'])
    })
  })
})
