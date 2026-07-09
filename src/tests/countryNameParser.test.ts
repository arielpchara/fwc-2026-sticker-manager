import { describe, it, expect } from 'vitest'
import { parseInventory } from '../parser/textParser.js'

const sample = `📋 FIGURINHAS QUE FALTAM — Copa 2026
🏆 Capa: 3, 4, 7
🇲🇽 México: 14, 18
🇰🇷 Coréia do Sul: 20
🇨🇿 República Tcheca: 13, 14, 18
🇨🇦 Canadá: 17
🇧🇦 Bósnia e Herzegovina: 1, 19
🇶🇦 Catar: 2
🇧🇷 Brasil: 2, 12, 13, 17, 19
🇲🇦 Marrocos: 3, 7
🇭🇹 Haiti: 6, 10, 11, 13, 14, 19
🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia: 17
🇺🇸 Estados Unidos: 1, 5, 14
🇵🇾 Paraguai: 1, 7, 11, 20
🇦🇺 Austrália: 1
🇩🇪 Alemanha: 19, 20
🇨🇼 Curaçao: 2, 6, 15, 16, 19
🇨🇮 Costa do Marfim: 1, 10, 15, 19
🇸🇪 Suécia: 10, 13, 14, 16, 18
🇹🇳 Tunísia: 2, 20
🇧🇪 Bélgica: 13
🇪🇬 Egito: 11, 12, 13
🇮🇷 Irã: 2, 10, 15, 18, 19
🇳🇿 Nova Zelândia: 7, 13
🇪🇸 Espanha: 10
🇨🇻 Cabo Verde: 3
🇺🇾 Uruguai: 3, 11
🇫🇷 França: 5, 9, 14, 19
🇮🇶 Iraque: 1, 3, 9, 18
🇳🇴 Noruega: 12, 13, 17
🇦🇷 Argentina: 10, 12
🇩🇿 Argélia: 19
🇦🇹 Áustria: 6, 15
🇯🇴 Jordânia: 2, 7, 13
🇵🇹 Portugal: 5, 8, 12, 14, 18
🇨🇩 RD Congo: 1, 12, 15
🇺🇿 Uzbequistão: 1, 13
🇨🇴 Colômbia: 1
🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra: 14
🇭🇷 Croácia: 2
🇬🇭 Gana: 18
🇵🇦 Panamá: 10, 15`

describe('country name parser via parseInventory', () => {
  it('parses the full sample list into correct codes', () => {
    const inv = parseInventory(sample)
    const codes = Object.keys(inv).sort()

    const expected = [
      'FWC3','FWC4','FWC7',
      'MEX14','MEX18',
      'KOR20',
      'CZE13','CZE14','CZE18',
      'CAN17',
      'BIH1','BIH19',
      'QAT2',
      'BRA2','BRA12','BRA13','BRA17','BRA19',
      'MAR3','MAR7',
      'HAI6','HAI10','HAI11','HAI13','HAI14','HAI19',
      'SCO17',
      'USA1','USA5','USA14',
      'PAR1','PAR7','PAR11','PAR20',
      'AUS1',
      'GER19','GER20',
      'CUW2','CUW6','CUW15','CUW16','CUW19',
      'CIV1','CIV10','CIV15','CIV19',
      'SWE10','SWE13','SWE14','SWE16','SWE18',
      'TUN2','TUN20',
      'BEL13',
      'EGY11','EGY12','EGY13',
      'IRN2','IRN10','IRN15','IRN18','IRN19',
      'NZL7','NZL13',
      'ESP10',
      'CPV3',
      'URU3','URU11',
      'FRA5','FRA9','FRA14','FRA19',
      'IRQ1','IRQ3','IRQ9','IRQ18',
      'NOR12','NOR13','NOR17',
      'ARG10','ARG12',
      'ALG19',
      'AUT6','AUT15',
      'JOR2','JOR7','JOR13',
      'POR5','POR8','POR12','POR14','POR18',
      'COD1','COD12','COD15',
      'UZB1','UZB13',
      'COL1',
      'ENG14',
      'CRO2',
      'GHA18',
      'PAN10','PAN15',
    ].sort()

    expect(codes).toEqual(expected)
  })

  it('handles EN names and accents', () => {
    const inv = parseInventory('Brazil: 1, 2\nSouth Korea: 20\nCapa: 3')
    expect(inv).toEqual({ BRA1: 1, BRA2: 1, KOR20: 1, FWC3: 1 })
  })

  it('ignores unknown country lines', () => {
    const inv = parseInventory('Atlantis: 1, 2\nBRA: 3')
    expect(inv).toEqual({ BRA3: 1 })
  })
})
