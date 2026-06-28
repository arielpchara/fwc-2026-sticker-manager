import { describe, it, expect } from 'vitest'
import { parseGrouped } from '../parser/groupedParser.js'
import { codesOf } from '../domain/inventory.js'

const SAMPLE_TEXT = `Figurinhas App - Lista
Eua Méx Can 26
Faltantes
FWC 🏆: 3, 4
FWC 🌎: 6
FWC 📜: 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
MEX 🇲🇽: 1, 2, 3, 4, 5, 6, 8, 9, 10, 13, 18
RSA 🇿🇦: 1, 3, 12, 16, 17, 18
KOR 🇰🇷: 1, 4, 5, 8, 9, 12, 14, 15, 16, 17, 18, 19, 20
CZE 🇨🇿: 2, 11, 12, 13, 14, 15, 17
CAN 🇨🇦: 2, 4, 6, 10, 14, 15, 16, 17, 18, 19, 20
BIH 🇧🇦: 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 15, 19
QAT 🇶🇦: 1, 3, 4, 6, 7, 8, 9, 11, 12, 14, 16, 18, 19, 20
SUI 🇨🇭: 1, 4, 9, 11, 13, 14, 16, 17, 18, 19
BRA 🇧🇷: 2, 3, 5, 10, 11, 14, 16, 17, 18
MAR 🇲🇦: 1, 5, 6, 7, 13, 16, 18, 19, 20
HAI 🇭🇹: 1, 2, 5, 6, 10, 14, 17, 18
SCO 🏴󠁧󠁢󠁳󠁣󠁴󠁿: 2, 3, 5, 9, 10, 13, 15, 16, 18, 19, 20
USA 🇺🇸: 1, 4, 8, 9, 12, 13, 14, 18, 19
PAR 🇵🇾: 2, 3, 14, 18, 20
AUS 🇦🇺: 3, 5, 6, 7, 10, 11, 12, 14, 15, 16, 18, 19, 20
TUR 🇹🇷: 1, 2, 3, 5, 6, 8, 9, 10, 12, 15, 16, 18, 19
GER 🇩🇪: 3, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19
CUW 🇨🇼: 1, 2, 3, 4, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19
CIV 🇨🇮: 2, 3, 5, 6, 8, 9, 12, 13, 14, 15, 17, 19, 20
ECU 🇪🇨: 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 20
NED 🇳🇱: 1, 2, 3, 6, 7, 9, 11, 14, 17, 18
JPN 🇯🇵: 2, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20
SWE 🇸🇪: 1, 2, 5, 6, 8, 10, 12, 13, 15, 17, 19, 20
TUN 🇹🇳: 1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 20
BEL 🇧🇪: 2, 5, 6, 7, 10, 12, 13, 14, 15, 17, 18, 19
EGY 🇪🇬: 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 16, 17, 18, 20
IRN 🇮🇷: 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 17, 20
NZL 🇳🇿: 1, 7, 9, 11, 13, 14, 18, 20
ESP 🇪🇸: 1, 7, 8, 9, 10, 11, 12, 13, 14
CPV 🇨🇻: 2, 4, 5, 6, 11, 17
KSA 🇸🇦: 1, 3, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20
URU 🇺🇾: 1, 3, 6, 7, 10, 12, 13, 20
FRA 🇫🇷: 1, 2, 5, 12, 13, 14, 15, 18, 19, 20
SEN 🇸🇳: 1, 6, 10, 11, 12, 13, 15, 16, 19
IRQ 🇮🇶: 1, 2, 3, 6, 8, 9, 10, 11, 15, 17, 18, 19, 20
NOR 🇳🇴: 1, 4, 7, 8, 14, 18, 19, 20
ARG 🇦🇷: 1, 2, 4, 6, 7, 8, 9, 12, 13, 14, 16, 17, 20
ALG 🇩🇿: 1, 2, 10, 11, 12, 14, 15, 17, 19
AUT 🇦🇹: 1, 3, 4, 5, 7, 8, 9, 17, 20
JOR 🇯🇴: 1, 2, 3, 5, 7, 8, 9, 12, 13, 14, 17, 18, 19
POR 🇵🇹: 2, 3, 4, 6, 7, 13, 16, 20
COD 🇨🇩: 1, 4, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19
UZB 🇺🇿: 1, 2, 4, 5, 8, 11, 12, 13, 14, 16, 17
COL 🇨🇴: 1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 16, 17, 19, 20
ENG 🏴󠁧󠁢󠁥󠁮󠁧󠁿: 1, 2, 3, 6, 8, 10, 11, 13, 15, 19, 20
CRO 🇭🇷: 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 17, 18, 19, 20
GHA 🇬🇭: 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 20
PAN 🇵🇦: 1, 3, 8, 9, 11, 12, 14, 17, 18, 19, 20

Baixe o app
https://www.figuritas.app/pt/baixar`

const EXPECTED_COUNT = 547
const EXPECTED_UNIQUE = 547

describe('parseGrouped', () => {
  it('extracts all stickers from the full sample', () => {
    const inv = parseGrouped(SAMPLE_TEXT)
    const codes = codesOf(inv)
    expect(codes.length).toBe(EXPECTED_COUNT)
  })

  it('merges duplicate FWC lines into one prefix', () => {
    const inv = parseGrouped(SAMPLE_TEXT)
    const fwcCodes = Object.keys(inv).filter((c) => c.startsWith('FWC'))
    expect(fwcCodes).toContain('FWC3')
    expect(fwcCodes).toContain('FWC4')
    expect(fwcCodes).toContain('FWC6')
    expect(fwcCodes).toContain('FWC9')
    expect(fwcCodes).toContain('FWC10')
    expect(fwcCodes).toContain('FWC19')
    expect(fwcCodes).toHaveLength(14)
  })

  it('ignores header lines and URL', () => {
    const inv = parseGrouped(SAMPLE_TEXT)
    expect(inv['BRA']).toBeUndefined()
    expect(inv['APP']).toBeUndefined()
    expect(inv['COM']).toBeUndefined()
  })

  it('assigns all codes qty 1 when no xN suffix', () => {
    const inv = parseGrouped(SAMPLE_TEXT)
    for (const qty of Object.values(inv)) {
      expect(qty).toBe(1)
    }
  })

  it('handles empty text', () => {
    const inv = parseGrouped('')
    expect(inv).toEqual({})
  })

  it('handles text with no matching lines', () => {
    const inv = parseGrouped('some random text without codes')
    expect(inv).toEqual({})
  })

  it('rejects prefixes with 4+ letters', () => {
    const inv = parseGrouped('ABCD: 1, 2\nFWC: 3')
    expect(inv).toEqual({ FWC3: 1 })
  })

  it('parses xN count suffix in grouped lines', () => {
    const inv = parseGrouped('BRA: 1x3, 2, 5x2')
    expect(inv).toEqual({ BRA1: 3, BRA2: 1, BRA5: 2 })
  })

  it('ignores invalid numbers (0, 21, 99)', () => {
    const inv = parseGrouped('BRA: 0, 21, 99, 1')
    expect(inv).toEqual({ BRA1: 1 })
  })

  it('parses special 00 sticker in grouped lines (emits standalone 00)', () => {
    const inv = parseGrouped('FWC: 3, 00')
    expect(inv).toEqual({ '00': 1, FWC3: 1 })
  })
})
