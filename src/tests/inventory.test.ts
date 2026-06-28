import { describe, it, expect } from 'vitest'
import { codesOf, totalCopies, extras, mergeCounts, type Inventory } from '../domain/inventory.js'

describe('codesOf', () => {
  it('returns sorted codes from inventory', () => {
    expect(codesOf({ BRA1: 1, ARG1: 1 })).toEqual(['ARG1', 'BRA1'])
  })
  it('returns empty for empty inventory', () => {
    expect(codesOf({})).toEqual([])
  })
})

describe('totalCopies', () => {
  it('sums all quantities', () => {
    expect(totalCopies({ BRA1: 3, ARG1: 2, FWC3: 1 })).toBe(6)
  })
  it('returns 0 for empty inventory', () => {
    expect(totalCopies({})).toBe(0)
  })
})

describe('extras', () => {
  it('returns codes with qty >= 2', () => {
    const result = extras({ BRA1: 3, ARG1: 1, FWC3: 2 })
    expect(result).toEqual([
      { code: 'BRA1', qty: 3, surplus: 2 },
      { code: 'FWC3', qty: 2, surplus: 1 },
    ])
  })
  it('returns empty array when no extras', () => {
    expect(extras({ BRA1: 1, ARG1: 1 })).toEqual([])
  })
  it('returns empty for empty inventory', () => {
    expect(extras({})).toEqual([])
  })
  it('sorts results by code', () => {
    const result = extras({ ZZZ: 2, AAA: 3 })
    expect(result).toEqual([
      { code: 'AAA', qty: 3, surplus: 2 },
      { code: 'ZZZ', qty: 2, surplus: 1 },
    ])
  })
})

describe('mergeCounts', () => {
  it('merges two inventories', () => {
    const a: Inventory = { BRA1: 1, ARG1: 1 }
    const b: Inventory = { BRA1: 1, FWC3: 2 }
    expect(mergeCounts(a, b)).toEqual({ ARG1: 1, BRA1: 2, FWC3: 2 })
  })
  it('handles single inventory', () => {
    expect(mergeCounts({ BRA1: 1 })).toEqual({ BRA1: 1 })
  })
  it('handles empty inventories', () => {
    expect(mergeCounts({}, { BRA1: 1 }, {})).toEqual({ BRA1: 1 })
  })
  it('returns empty when all empty', () => {
    expect(mergeCounts({}, {})).toEqual({})
  })
})
