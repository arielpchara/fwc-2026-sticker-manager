import { parseInventory, parseText } from '../../../src/parser/textParser.js'
import { parseSurplus } from '../../../src/parser/surplusParser.js'
import { codesOf, totalCopies, extras, type Inventory, totalSurplus } from '../../../src/domain/inventory.js'
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

export function totalExtras(inv: Inventory): number {
  return totalSurplus(inv)
}

export function compareWith(theirText: string, myInv: Inventory): { missing: string[]; count: number } {
  const theirs = parseText(theirText)
  const missing = theirs.filter((code) => !myInv[code])
  return { missing, count: missing.length }
}

export function canGive(theirText: string, extras: ExtraItem[]): { offer: string[]; count: number } {
  const theirs = new Set(parseText(theirText))
  const offer = extras.filter((e) => theirs.has(e.code)).map((e) => e.code)
  return { offer, count: offer.length }
}

export { codesOf, totalCopies, parseText }
export type { Inventory, ExtraItem }
