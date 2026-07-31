import { parseText, parseInventory } from "../parser/textParser.js";
import { parseSurplus } from "../parser/surplusParser.js";
import { missing } from "../domain/collection.js";
import {
  codesOf,
  totalCopies,
  extras,
  type Inventory,
  type ExtraItem,
} from "../domain/inventory.js";
import {
  load,
  save,
  type StickersRecord,
} from "../storage/stickersRepository.js";

export interface Repository {
  load(dir?: string): Promise<StickersRecord>;
  save(inv: Inventory, dir?: string): Promise<boolean>;
}

export interface SetOwnResult {
  stickers: string[];
  count: number;
  totalCopies: number;
  saved: boolean;
}

export interface CompareResult {
  missing: string[];
  count: number;
}

export interface AddSurplusResult {
  updated: string[];
  count: number;
  saved: boolean;
}

export interface ExtrasResult {
  items: ExtraItem[];
  totalSurplus: number;
  totalUnique: number;
}

const defaultRepo: Repository = { load, save };

export async function setOwn(
  text: string,
  repo: Repository = defaultRepo,
): Promise<SetOwnResult> {
  const inv = parseInventory(text);
  const stickers = codesOf(inv);
  const saved = await repo.save(inv);
  return {
    stickers,
    count: stickers.length,
    totalCopies: totalCopies(inv),
    saved,
  };
}

export async function getOwn(
  repo: Repository = defaultRepo,
): Promise<StickersRecord> {
  return repo.load();
}

export async function compareWith(
  theirText: string,
  repo: Repository = defaultRepo,
): Promise<CompareResult> {
  const current = await repo.load();
  const theirs = parseText(theirText);
  const result = missing(codesOf(current.inventory), theirs);
  return { missing: result, count: result.length };
}

export async function addSurplus(
  text: string,
  repo: Repository = defaultRepo,
): Promise<AddSurplusResult> {
  const current = await repo.load();
  const surplus = parseSurplus(text);
  const updated: string[] = [];

  for (const [code, surplusQty] of Object.entries(surplus)) {
    const newTotal = 1 + surplusQty;
    if (current.inventory[code] !== newTotal) {
      updated.push(code);
    }
    current.inventory[code] = newTotal;
  }

  const saved = updated.length > 0 ? await repo.save(current.inventory) : false;
  return { updated, count: updated.length, saved };
}

export async function getExtras(
  repo: Repository = defaultRepo,
): Promise<ExtrasResult> {
  const current = await repo.load();
  const items = extras(current.inventory);
  return {
    items,
    totalSurplus: items.reduce((sum, e) => sum + e.surplus, 0),
    totalUnique: items.length,
  };
}
