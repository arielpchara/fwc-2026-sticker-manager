import { describe, it, expect, beforeEach } from 'vitest'
import { parseText, parseInventory } from '../parser/textParser.js'
import { setOwn, getOwn, compareWith } from '../core/stickerService.js'
import type { Repository } from '../core/stickerService.js'
import type { OwnRecord } from '../storage/ownRepository.js'
import type { Inventory } from '../domain/inventory.js'
import { codesOf } from '../domain/inventory.js'

const REAL_WORLD_TEXT = `🏆 *Copa 2026* — *❌ Faltam 191* — 803/994 (81%)

🌟 Introdução:
FWC1, FWC2, FWC3, FWC5, FWC7, FWC8, FWC9, FWC10, FWC17, FWC18, FWC19

🇲🇽 México:
MEX1, MEX12

🇰🇷 Coreia do Sul:
KOR4, KOR6, KOR20

🇨🇿 República Tcheca:
CZE3, CZE12, CZE15, CZE20

🇨🇦 Canadá:
CAN14, CAN17

🇧🇦 Bósnia e Herzegovina:
BIH2, BIH6, BIH19, BIH20

🇶🇦 Catar:
QAT2, QAT5, QAT12, QAT15

🇨🇭 Suíça:
SUI13, SUI16, SUI18

🇧🇷 Brasil:
BRA2, BRA3, BRA6, BRA10, BRA19

🇲🇦 Marrocos:
MAR3, MAR5, MAR9, MAR20

🇭🇹 Haiti:
HAI2, HAI9, HAI13, HAI17, HAI20

🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia:
SCO15, SCO16, SCO20

🇺🇸 Estados Unidos:
USA5, USA10, USA17

🇵🇾 Paraguai:
PAR3, PAR7, PAR9

🇦🇺 Austrália:
AUS3, AUS19

🇹🇷 Turquia:
TUR1, TUR2, TUR3, TUR5, TUR8, TUR9, TUR19

🇩🇪 Alemanha:
GER1, GER3, GER8, GER11, GER15, GER16, GER18

🇨🇼 Curaçao:
CUW4, CUW7, CUW19, CUW20

🇨🇮 Costa do Marfim:
CIV2, CIV11

🇪🇨 Equador:
ECU9, ECU13, ECU15

🇳🇱 Holanda:
NED1, NED18

🇯🇵 Japão:
JPN2, JPN4, JPN16, JPN19

🇸🇪 Suécia:
SWE12, SWE16, SWE17, SWE20

🇹🇳 Tunísia:
TUN2, TUN4, TUN6, TUN19, TUN20

🇧🇪 Bélgica:
BEL2, BEL3, BEL9, BEL10, BEL11, BEL13, BEL17

🇪🇬 Egito:
EGY6

🇮🇷 Irã:
IRN10, IRN12, IRN13, IRN15, IRN18, IRN19

🇳🇿 Nova Zelândia:
NZL2, NZL3, NZL4, NZL7, NZL8

🇪🇸 Espanha:
ESP3, ESP4

🇨🇻 Cabo Verde:
CPV1, CPV13, CPV15, CPV18, CPV19, CPV20

🇸🇦 Arábia Saudita:
KSA1, KSA7, KSA9, KSA10, KSA20

🇺🇾 Uruguai:
URU1, URU4, URU11

🇫🇷 França:
FRA2, FRA10, FRA15, FRA18

🇸🇳 Senegal:
SEN1

🇮🇶 Iraque:
IRQ1, IRQ3, IRQ5, IRQ6, IRQ15, IRQ16, IRQ18, IRQ19

🇳🇴 Noruega:
NOR5, NOR19, NOR20

🇦🇷 Argentina:
ARG1, ARG7, ARG18

🇩🇿 Argélia:
ALG5, ALG17, ALG19

🇦🇹 Áustria:
AUT5, AUT9, AUT14, AUT18, AUT19

🇯🇴 Jordânia:
JOR19

🇵🇹 Portugal:
POR3, POR5, POR9, POR18

🇨🇩 Congo RD:
COD2, COD7, COD9, COD10, COD13, COD15, COD19

🇺🇿 Uzbequistão:
UZB4, UZB8, UZB10, UZB12, UZB20

🇨🇴 Colômbia:
COL1, COL2, COL5, COL12, COL17

🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra:
ENG17, ENG19

🇭🇷 Croácia:
CRO9, CRO16

🇬🇭 Gana:
GHA12, GHA16

🇵🇦 Panamá:
PAN3, PAN5, PAN17, PAN18, PAN20

Bora trocar? 📲

Android: https://play.google.com/store/apps/details?id=com.igames.cupvi

iOS: https://apps.apple.com/br/app/figurinhas-controle-do-%C3%A1lbum/id6762934579`

const EXPECTED_CODES = [
  'ALG17','ALG19','ALG5',
  'ARG1','ARG18','ARG7',
  'AUS19','AUS3',
  'AUT14','AUT18','AUT19','AUT5','AUT9',
  'BEL10','BEL11','BEL13','BEL17','BEL2','BEL3','BEL9',
  'BIH19','BIH2','BIH20','BIH6',
  'BRA10','BRA19','BRA2','BRA3','BRA6',
  'CAN14','CAN17',
  'CIV11','CIV2',
  'COD10','COD13','COD15','COD19','COD2','COD7','COD9',
  'COL1','COL12','COL17','COL2','COL5',
  'CPV1','CPV13','CPV15','CPV18','CPV19','CPV20',
  'CRO16','CRO9',
  'CUW19','CUW20','CUW4','CUW7',
  'CZE12','CZE15','CZE20','CZE3',
  'ECU13','ECU15','ECU9',
  'EGY6',
  'ENG17','ENG19',
  'ESP3','ESP4',
  'FRA10','FRA15','FRA18','FRA2',
  'FWC1','FWC10','FWC17','FWC18','FWC19','FWC2','FWC3','FWC5','FWC7','FWC8','FWC9',
  'GER1','GER11','GER15','GER16','GER18','GER3','GER8',
  'GHA12','GHA16',
  'HAI13','HAI17','HAI2','HAI20','HAI9',
  'IRN10','IRN12','IRN13','IRN15','IRN18','IRN19',
  'IRQ1','IRQ15','IRQ16','IRQ18','IRQ19','IRQ3','IRQ5','IRQ6',
  'JOR19',
  'JPN16','JPN19','JPN2','JPN4',
  'KOR20','KOR4','KOR6',
  'KSA1','KSA10','KSA20','KSA7','KSA9',
  'MAR20','MAR3','MAR5','MAR9',
  'MEX1','MEX12',
  'NED1','NED18',
  'NOR19','NOR20','NOR5',
  'NZL2','NZL3','NZL4','NZL7','NZL8',
  'PAN17','PAN18','PAN20','PAN3','PAN5',
  'PAR3','PAR7','PAR9',
  'POR18','POR3','POR5','POR9',
  'QAT12','QAT15','QAT2','QAT5',
  'SCO15','SCO16','SCO20',
  'SEN1',
  'SUI13','SUI16','SUI18',
  'SWE12','SWE16','SWE17','SWE20',
  'TUN19','TUN2','TUN20','TUN4','TUN6',
  'TUR1','TUR19','TUR2','TUR3','TUR5','TUR8','TUR9',
  'URU1','URU11','URU4',
  'USA10','USA17','USA5',
  'UZB10','UZB12','UZB20','UZB4','UZB8',
]

describe('real-world WhatsApp sticker list', () => {
  describe('parseText', () => {
    it('extracts exactly 191 codes (matching "Faltam 191" in the header)', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes).toHaveLength(191)
    })

    it('extracts all expected codes correctly', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes).toEqual(EXPECTED_CODES)
    })

    it('ignores emojis', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes.some((c) => /[^\x00-\x7F]/.test(c))).toBe(false)
    })

    it('ignores Portuguese country names and section headers', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes).not.toContain('BRA')
      expect(codes).not.toContain('COP')
      expect(codes).not.toContain('FAL')
    })

    it('ignores percentages and fractions (803/994, 81%)', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes.some((c) => /\d/.test(c[0]))).toBe(false)
    })

    it('ignores app store URLs', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes).not.toContain('APP')
      expect(codes).not.toContain('COM')
    })

    it('includes all FWC introduction codes (11 codes)', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      const fwc = codes.filter((c) => c.startsWith('FWC'))
      expect(fwc).toEqual(['FWC1','FWC10','FWC17','FWC18','FWC19','FWC2','FWC3','FWC5','FWC7','FWC8','FWC9'])
      expect(fwc).toHaveLength(11)
    })

    it('includes all BRA codes (5 codes)', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      const bra = codes.filter((c) => c.startsWith('BRA'))
      expect(bra).toEqual(['BRA10','BRA19','BRA2','BRA3','BRA6'])
      expect(bra).toHaveLength(5)
    })

    it('handles the single-sticker entry (EGY6, SEN1, JOR19)', () => {
      const codes = parseText(REAL_WORLD_TEXT)
      expect(codes).toContain('EGY6')
      expect(codes).toContain('SEN1')
      expect(codes).toContain('JOR19')
    })
  })

  describe('parseInventory', () => {
    it('returns all 191 codes with qty 1', () => {
      const inv = parseInventory(REAL_WORLD_TEXT)
      const codes = Object.keys(inv).sort()
      expect(codes).toHaveLength(191)
      expect(codes).toEqual(EXPECTED_CODES)
      for (const qty of Object.values(inv)) {
        expect(qty).toBe(1)
      }
    })
  })

  describe('stickerService integration', () => {
    let repo: Repository

    beforeEach(() => {
      let store: OwnRecord = { inv: {}, hash: '', updatedAt: '' }
      repo = {
        async load() { return { ...store, inv: { ...store.inv } } },
        async save(inv: Inventory) {
          const sorted = Object.entries(inv).sort(([a], [b]) => a.localeCompare(b))
          const newHash = JSON.stringify(sorted)
          if (store.hash === newHash) return false
          store = { inv: { ...inv }, hash: newHash, updatedAt: new Date().toISOString() }
          return true
        },
      }
    })

    it('setOwn saves all 191 codes from real-world text', async () => {
      const result = await setOwn(REAL_WORLD_TEXT, repo)
      expect(result.count).toBe(191)
      expect(result.totalCopies).toBe(191)
      expect(result.saved).toBe(true)
    })

    it('getOwn returns all 191 codes after setOwn', async () => {
      await setOwn(REAL_WORLD_TEXT, repo)
      const record = await getOwn(repo)
      expect(codesOf(record.inv)).toHaveLength(191)
      expect(codesOf(record.inv)).toEqual(EXPECTED_CODES)
    })

    it('compareWith returns only codes the other person has that I dont', async () => {
      await setOwn('BRA2, BRA3, BRA6, BRA10, BRA19', repo)
      const result = await compareWith(REAL_WORLD_TEXT, repo)
      expect(result.count).toBe(191 - 5)
      expect(result.missing).not.toContain('BRA2')
      expect(result.missing).not.toContain('BRA19')
      expect(result.missing).toContain('FWC1')
      expect(result.missing).toContain('ARG1')
    })

    it('compareWith returns empty when I already own everything in the list', async () => {
      await setOwn(REAL_WORLD_TEXT, repo)
      const result = await compareWith(REAL_WORLD_TEXT, repo)
      expect(result.count).toBe(0)
      expect(result.missing).toEqual([])
    })

    it('setOwn is idempotent with the same real-world text', async () => {
      await setOwn(REAL_WORLD_TEXT, repo)
      const second = await setOwn(REAL_WORLD_TEXT, repo)
      expect(second.saved).toBe(false)
    })
  })
})
