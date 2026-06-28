import { describe, it, expect } from 'vitest'
import { parseText } from '../parser/textParser.js'

describe('parseText', () => {
  it('parses space-separated codes', () => {
    expect(parseText('BRA1 ARG1 FWC3')).toEqual(['ARG1', 'BRA1', 'FWC3'])
  })
  it('parses comma-separated codes', () => {
    expect(parseText('BRA1,ARG1,FWC3')).toEqual(['ARG1', 'BRA1', 'FWC3'])
  })
  it('parses newline-separated codes', () => {
    expect(parseText('BRA1\nARG1\nFWC3')).toEqual(['ARG1', 'BRA1', 'FWC3'])
  })
  it('parses mixed separators', () => {
    expect(parseText('BRA1, ARG1\nFWC3;BRA2')).toEqual(['ARG1', 'BRA1', 'BRA2', 'FWC3'])
  })
  it('ignores garbage tokens', () => {
    expect(parseText('BRA1 !!! hello 999 ARG1')).toEqual(['ARG1', 'BRA1'])
  })
  it('deduplicates codes', () => {
    expect(parseText('BRA1 BRA1 BRA1')).toEqual(['BRA1'])
  })
  it('returns empty for empty string', () => {
    expect(parseText('')).toEqual([])
  })
  it('returns empty for whitespace-only string', () => {
    expect(parseText('   \n  ')).toEqual([])
  })
  it('normalizes lowercase codes', () => {
    expect(parseText('bra1 arg12')).toEqual(['ARG12', 'BRA1'])
  })
  it('handles special 00 code', () => {
    expect(parseText('BRA1 00 ARG1')).toEqual(['00', 'ARG1', 'BRA1'])
  })
  it('handles team+00 codes', () => {
    expect(parseText('BRA00 ARG00')).toEqual(['ARG00', 'BRA00'])
  })
  it('rejects invalid codes silently', () => {
    expect(parseText('BRA0 BRA21 BR1 BRAA1')).toEqual([])
  })
  it('parses a realistic mixed text', () => {
    const text = 'minha lista: BRA1, BRA2, ARG00, 00 e também FWC3'
    expect(parseText(text)).toEqual(['00', 'ARG00', 'BRA1', 'BRA2', 'FWC3'])
  })
})
