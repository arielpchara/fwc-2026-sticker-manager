import { describe, it, expect, beforeEach } from 'vitest'
import { setOwn, getOwn, compareWith } from '../core/stickerService.js'
import type { Repository } from '../core/stickerService.js'
import type { OwnRecord } from '../storage/ownRepository.js'

/** In-memory repository for testing — no disk IO */
function makeRepo(): Repository {
  let store: OwnRecord = { stickers: [], hash: '', updatedAt: '' }
  return {
    async load() {
      return { ...store, stickers: [...store.stickers] }
    },
    async save(stickers) {
      const sorted = [...stickers].sort()
      const newHash = sorted.join(',')
      if (store.hash === newHash) return false
      store = { stickers: sorted, hash: newHash, updatedAt: new Date().toISOString() }
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
    })

    it('saves empty collection for text with no valid codes', async () => {
      const result = await setOwn('no valid codes here', repo)
      expect(result.stickers).toEqual([])
      expect(result.count).toBe(0)
    })
  })

  describe('getOwn', () => {
    it('returns empty state initially', async () => {
      const record = await getOwn(repo)
      expect(record.stickers).toEqual([])
    })

    it('returns stickers after setOwn', async () => {
      await setOwn('BRA1 ARG1', repo)
      const record = await getOwn(repo)
      expect(record.stickers).toEqual(['ARG1', 'BRA1'])
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
      const result = await compareWith('BRA1 00 ARG00', repo)
      expect(result.missing).toEqual(['00', 'ARG00'])
    })
  })
})
