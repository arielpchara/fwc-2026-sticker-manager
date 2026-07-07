import { describe, it, expect } from 'vitest'
import { cleanText } from '../parser/cleaner.js'

describe('cleanText', () => {
  it('removes emojis', () => {
    expect(cleanText('🏆 Cup 2026')).toBe('Cup 2026')
    expect(cleanText('🇲🇽 MEX')).toBe('MEX')
    expect(cleanText('✅ STICKERS')).toBe('STICKERS')
    expect(cleanText('🔑 39I8BC')).toBe('39I8BC')
  })

  it('removes entire bold blocks', () => {
    expect(cleanText('*Cup 2026*')).toBe('')
    expect(cleanText('foo *bar* baz')).toBe('foo baz')
    expect(cleanText('*MEX*: 1, 2, 3')).toBe(': 1, 2, 3')
  })

  it('removes page references', () => {
    expect(cleanText('· pg. 0')).toBe('')
    expect(cleanText('· pg. 1')).toBe('')
    expect(cleanText('· pg. 106-109')).toBe('')
    expect(cleanText('pgs. 8-9')).toBe('')
    expect(cleanText('pg 5')).toBe('')
    expect(cleanText('text · pg. 3 here')).toBe('text here')
  })

  it('removes divider lines', () => {
    expect(cleanText('─────────────')).toBe('')
    expect(cleanText('-------------')).toBe('')
    expect(cleanText('=============')).toBe('')
    expect(cleanText('•••••••••••')).toBe('')
  })

  it('strips the full real-world paste', () => {
    const input = [
      '🏆 *Cup 2026*',
      '🔑 *39I8BC*',
      '✅ *STICKERS I HAVE (601)*',
      '─────────────',
      '*We Are 26* · pg. 0',
      '*Cup 2026 (FWC1–FWC4)* · pg. 1',
      '*Cup History (FWC9–FWC19)* · pg. 106-109',
      '*Ball and Host Countries* · pg. 2-3',
      '🇲🇽 *MEX* · pg. 8-9',
    ].join('\n')

    const result = cleanText(input)

    expect(result).toBe('')
  })

  it('keeps valid codes not inside bold blocks', () => {
    const input = [
      'BRA1 BRA2 ARG1',
      '*Some Header*',
      '00 FWC3',
    ].join('\n')

    const result = cleanText(input)

    expect(result).toBe('BRA1 BRA2 ARG1 00 FWC3')
  })

  it('handles empty string', () => {
    expect(cleanText('')).toBe('')
  })

  it('handles nullish input', () => {
    expect(cleanText('   \n  ')).toBe('')
  })
})
