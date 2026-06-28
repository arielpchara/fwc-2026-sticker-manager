import { parseText, parseInventory } from '../parser/textParser.js'
import { missing } from '../domain/collection.js'
import { codesOf, totalCopies, extras, type Inventory, type ExtraItem } from '../domain/inventory.js'
import { load, save, type OwnRecord } from '../storage/ownRepository.js'

export interface Repository {
  load(dir?: string): Promise<OwnRecord>
  save(inv: Inventory, dir?: string): Promise<boolean>
}

export interface SetOwnResult {
  stickers: string[]
  count: number
  totalCopies: number
  saved: boolean
}

export interface CompareResult {
  missing: string[]
  count: number
}

export interface ExtrasResult {
  items: ExtraItem[]
  totalSurplus: number
  totalUnique: number
}

const defaultRepo: Repository = { load, save }

export async function setOwn(
  text: string,
  repo: Repository = defaultRepo,
): Promise<SetOwnResult> {
  const inv = parseInventory(text)
  const stickers = codesOf(inv)
  const saved = await repo.save(inv)
  return { stickers, count: stickers.length, totalCopies: totalCopies(inv), saved }
}

export async function getOwn(repo: Repository = defaultRepo): Promise<OwnRecord> {
  return repo.load()
}

export async function compareWith(
  theirText: string,
  repo: Repository = defaultRepo,
): Promise<CompareResult> {
  const current = await repo.load()
  const theirs = parseText(theirText)
  const result = missing(codesOf(current.inv), theirs)
  return { missing: result, count: result.length }
}

export async function getExtras(repo: Repository = defaultRepo): Promise<ExtrasResult> {
  const current = await repo.load()
  const items = extras(current.inv)
  return {
    items,
    totalSurplus: items.reduce((sum, e) => sum + e.surplus, 0),
    totalUnique: items.length,
  }
}
