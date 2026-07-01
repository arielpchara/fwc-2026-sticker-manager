import { parseInventory, parseText } from '../../../src/parser/textParser.js'
import { parseSurplus } from '../../../src/parser/surplusParser.js'
import { codesOf, totalCopies, extras, type Inventory } from '../../../src/domain/inventory.js'
import type { ExtraItem } from '../../../src/domain/inventory.js'

export interface ParseOwnResult {
  inv: Inventory
  stickers: string[]
  count: number
  totalCopies: number
}

export interface ParseSurplusResult {
  surplus: Inventory
  codes: string[]
}

export function parseOwnText(text: string): ParseOwnResult {
  const inv = parseInventory(text)
  const stickers = codesOf(inv)
  return {
    inv,
    stickers,
    count: stickers.length,
    totalCopies: totalCopies(inv),
  }
}

export function parseSurplusText(text: string): ParseSurplusResult {
  const surplus = parseSurplus(text)
  return {
    surplus,
    codes: codesOf(surplus),
  }
}

export function computeExtras(inv: Inventory): ExtraItem[] {
  return extras(inv)
}

export { codesOf, totalCopies, parseText }
export type { Inventory, ExtraItem }
