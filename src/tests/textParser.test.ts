import { describe, it, expect } from 'vitest'
import { parseText, parseInventory } from '../parser/textParser.js'

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

describe('parseInventory', () => {
  it('returns qty 1 for codes without suffix', () => {
    const inv = parseInventory('BRA1 ARG1')
    expect(inv).toEqual({ ARG1: 1, BRA1: 1 })
  })
  it('parses xN count suffix with space', () => {
    const inv = parseInventory('BRA1 x3 ARG1')
    expect(inv).toEqual({ ARG1: 1, BRA1: 3 })
  })
  it('parses xN count suffix without space', () => {
    const inv = parseInventory('BRA1x3 ARG1')
    expect(inv).toEqual({ ARG1: 1, BRA1: 3 })
  })
  it('parses xN with multiple spaces', () => {
    const inv = parseInventory('BRA1  x3  ARG1')
    expect(inv).toEqual({ ARG1: 1, BRA1: 3 })
  })
  it('parses mixed qty and non-qty codes', () => {
    const inv = parseInventory('BRA1x3 ARG1 FWC3x2')
    expect(inv).toEqual({ ARG1: 1, BRA1: 3, FWC3: 2 })
  })
  it('parses lowercase x suffix', () => {
    const inv = parseInventory('BRA1X3 ARG1')
    expect(inv).toEqual({ ARG1: 1, BRA1: 3 })
  })
  it('accumulates duplicate codes', () => {
    const inv = parseInventory('BRA1 x2 BRA1 x3')
    expect(inv).toEqual({ BRA1: 5 })
  })
  it('ignores xN with N < 1', () => {
    const inv = parseInventory('BRA1 x0 ARG1')
    expect(inv).toEqual({ ARG1: 1 })
  })
  it('does not extract substrings from longer tokens', () => {
    const inv = parseInventory('BRAA1')
    expect(inv).toEqual({})
  })
  it('handles grouped format alongside token format', () => {
    const text = 'minha lista: BRA1, BRA2\nFWC: 3, 4'
    const inv = parseInventory(text)
    expect(inv).toEqual({ BRA1: 1, BRA2: 1, FWC3: 1, FWC4: 1 })
  })
  it('parses grouped format with xN counts', () => {
    const text = 'BRA: 1x3, 2, 5x2'
    const inv = parseInventory(text)
    expect(inv).toEqual({ BRA1: 3, BRA2: 1, BRA5: 2 })
  })
  it('handles special 00 in grouped format (not double-matched as standalone)', () => {
    const text = 'FWC: 3, 00'
    const inv = parseInventory(text)
    expect(inv).toEqual({ FWC00: 1, FWC3: 1 })
    expect(inv['00']).toBeUndefined()
  })
})
