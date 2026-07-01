import { describe, it, expect } from 'vitest'
import { parseSurplus } from '../parser/surplusParser.js'

describe('parseSurplus', () => {
  it('parses single code with surplus', () => {
    expect(parseSurplus('RSA5 (x1)')).toEqual({ RSA5: 1 })
  })

  it('parses multiple codes on same line', () => {
    expect(parseSurplus('RSA5 (x1), RSA12 (x1), RSA16 (x1)')).toEqual({ RSA5: 1, RSA12: 1, RSA16: 1 })
  })

  it('parses codes across multiple lines', () => {
    const text = 'RSA5 (x1), RSA12 (x1)\nKOR12 (x1), KOR17 (x1)'
    expect(parseSurplus(text)).toEqual({ RSA5: 1, RSA12: 1, KOR12: 1, KOR17: 1 })
  })

  it('parses varying surplus counts', () => {
    expect(parseSurplus('BRA1 (x3), BRA2 (x1)')).toEqual({ BRA1: 3, BRA2: 1 })
  })

  it('accumulates duplicate codes', () => {
    expect(parseSurplus('RSA5 (x1), RSA5 (x2)')).toEqual({ RSA5: 3 })
  })

  it('handles special 00 code', () => {
    expect(parseSurplus('00 (x2)')).toEqual({ '00': 2 })
  })

  it('ignores team+00 codes', () => {
    expect(parseSurplus('BRA00 (x1)')).toEqual({})
  })

  it('returns empty for text with no surplus entries', () => {
    expect(parseSurplus('some random text')).toEqual({})
  })

  it('returns empty for empty string', () => {
    expect(parseSurplus('')).toEqual({})
  })

  it('ignores invalid codes', () => {
    expect(parseSurplus('BRA0 (x1)')).toEqual({})
  })

  it('parses full real-world surplus text', () => {
    const text = `RSA5 (x1), RSA12 (x1), RSA16 (x1), RSA20 (x1)
KOR12 (x1), KOR17 (x1)
CZE11 (x1)
BIH2 (x1)
SUI4 (x1), SUI8 (x1)
USA13 (x1), USA20 (x1)
PAR20 (x1)
GER4 (x1)
ECU9 (x1), ECU14 (x1), ECU18 (x1)
BEL1 (x1), BEL13 (x1)
NZL3 (x1), NZL4 (x1), NZL8 (x1), NZL16 (x1)
FRA19 (x1)
ARG7 (x1), ARG11 (x1)
POR2 (x1)
COD10 (x1)
UZB17 (x1)
ENG10 (x1)
GHA14 (x1)
PAN1 (x1)`
    const inv = parseSurplus(text)
    expect(Object.keys(inv)).toHaveLength(32)
    expect(inv['RSA5']).toBe(1)
    expect(inv['PAN1']).toBe(1)
  })
})
