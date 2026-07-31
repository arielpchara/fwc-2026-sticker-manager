import { describe, it, expect } from 'vitest'
import { isValid, normalize, parseCode } from '../domain/sticker.js'

describe('normalize', () => {
  it('uppercases input', () => {
    expect(normalize('bra1')).toBe('BRA1')
  })
  it('trims whitespace', () => {
    expect(normalize('  BRA1  ')).toBe('BRA1')
  })
  it('uppercases and trims', () => {
    expect(normalize(' arg12 ')).toBe('ARG12')
  })
})

describe('isValid', () => {
  describe('valid codes', () => {
    it.each([
      'BRA1',
      'BRA9',
      'BRA10',
      'BRA19',
      'BRA20',
      'ARG1',
      'FWC3',
      '00',
      'ZZZ1',
      'ZZZ20',
    ])('accepts %s', (code) => {
      expect(isValid(code)).toBe(true)
    })
  })

  describe('invalid codes', () => {
    it.each([
      'BRA0',      // 0 not allowed (only 00)
      'BRA21',     // > 20
      'BRA99',     // > 20
      'BR1',       // only 2 letters
      'BRAA1',     // 4 letters
      '1BRA',      // number first
      'bra1',      // lowercase (not normalized)
      '123',       // pure digits
      '',          // empty
      'BRA',       // no number
      '0',         // single zero
      'BRA001',    // extra digit
      'BRA00',     // team+00 not allowed
      'ARG00',
    ])('rejects %s', (code) => {
      expect(isValid(code)).toBe(false)
    })
  })
})

describe('parseCode', () => {
  it('returns normalized code for valid lowercase input', () => {
    expect(parseCode('bra1')).toBe('BRA1')
  })
  it('returns normalized code for valid uppercase input', () => {
    expect(parseCode('ARG12')).toBe('ARG12')
  })
  it('returns null for invalid input', () => {
    expect(parseCode('BRA0')).toBeNull()
    expect(parseCode('invalid')).toBeNull()
    expect(parseCode('')).toBeNull()
  })
  it('handles standalone 00', () => {
    expect(parseCode('00')).toBe('00')
  })
  it('rejects team+00 (only standalone 00 is valid)', () => {
    expect(parseCode('BRA00')).toBeNull()
  })
  it('trims and uppercases before validating', () => {
    expect(parseCode('  bra20  ')).toBe('BRA20')
  })
})
