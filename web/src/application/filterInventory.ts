import type { Stickers } from "../type/sticker.js";
import { GROUPS } from "../constants/groups.js";
import { maxStickers } from "../constants/stickers.js";

export type InventoryFilters = {
  query: string;
  missing: boolean;
  extras: boolean;
};

function allAlbumCodes(): string[] {
  const codes: string[] = [];
  for (const g of GROUPS) {
    for (const p of g.prefixes) {
      const max = maxStickers(p);
      for (let i = 1; i <= max; i++) {
        codes.push(p + i);
      }
    }
  }
  const maxFWC = maxStickers("FWC");
  for (let i = 1; i <= maxFWC; i++) codes.push("FWC" + i);
  codes.push("00");
  return codes;
}

export function filterInventory(
  inv: Stickers,
  filters: InventoryFilters,
): Stickers {
  const q = filters.query.trim().toUpperCase();
  const result: Stickers = {};

  if (filters.missing && filters.extras) {
    // mutually exclusive: return empty
    return result;
  }

  if (filters.missing) {
    const all = allAlbumCodes();
    for (const code of all) {
      if (!inv[code] && (!q || code.includes(q))) {
        result[code] = 0;
      }
    }
    return result;
  }

  if (filters.extras) {
    for (const [code, qty] of Object.entries(inv)) {
      if (qty >= 2 && (!q || code.includes(q))) {
        result[code] = qty;
      }
    }
    return result;
  }

  // only query or no filters
  if (q) {
    for (const [code, qty] of Object.entries(inv)) {
      if (code.includes(q)) result[code] = qty;
    }
    return result;
  }

  return { ...inv };
}

export function countFiltered(filtered: Stickers): number {
  return Object.keys(filtered).length;
}

export function hasActiveFilters(filters: InventoryFilters): boolean {
  return Boolean(filters.query.trim() || filters.missing || filters.extras);
}
