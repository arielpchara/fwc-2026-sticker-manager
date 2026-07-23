import type { Inventory } from "../type/sticker.js";
import { GROUPS, PREFIX_TO_GROUP } from "../constants/groups.js";
import { maxStickers } from "../constants/stickers.js";

export type InventoryFilters = {
  query: string;
  missing: boolean;
  extras: boolean;
  groups: string[];
  teams: string[];
};

export function allAlbumCodes(): string[] {
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

function codeMatchesGroupTeam(
  code: string,
  groups: string[],
  teams: string[],
): boolean {
  const prefix = code === "00" ? "00" : code.slice(0, 3);
  const g = PREFIX_TO_GROUP.get(prefix);
  const groupKey = g ? g.labelKey : "specialLabel";

  const groupOk = groups.length === 0 || groups.includes(groupKey);
  const teamOk = teams.length === 0 || teams.includes(prefix);

  return groupOk && teamOk;
}

export function filterInventory(
  inv: Inventory,
  filters: InventoryFilters,
): Inventory {
  const q = filters.query.trim().toUpperCase();
  const result: Inventory = {};

  if (filters.missing && filters.extras) {
    // mutually exclusive: return empty
    return result;
  }

  if (filters.missing) {
    const all = allAlbumCodes();
    for (const code of all) {
      if (
        !inv[code] &&
        (!q || code.includes(q)) &&
        codeMatchesGroupTeam(code, filters.groups, filters.teams)
      ) {
        result[code] = 0;
      }
    }
    return result;
  }

  if (filters.extras) {
    for (const [code, qty] of Object.entries(inv)) {
      if (
        qty >= 2 &&
        (!q || code.includes(q)) &&
        codeMatchesGroupTeam(code, filters.groups, filters.teams)
      ) {
        result[code] = qty;
      }
    }
    return result;
  }

  // only query or no filters
  if (q) {
    for (const [code, qty] of Object.entries(inv)) {
      if (
        code.includes(q) &&
        codeMatchesGroupTeam(code, filters.groups, filters.teams)
      ) {
        result[code] = qty;
      }
    }
    return result;
  }

  // group/team only
  if (filters.groups.length || filters.teams.length) {
    for (const [code, qty] of Object.entries(inv)) {
      if (codeMatchesGroupTeam(code, filters.groups, filters.teams)) {
        result[code] = qty;
      }
    }
    return result;
  }

  return { ...inv };
}

export function countFiltered(filtered: Inventory): number {
  return Object.keys(filtered).length;
}

export function hasActiveFilters(filters: InventoryFilters): boolean {
  return Boolean(
    filters.query.trim() ||
    filters.missing ||
    filters.extras ||
    filters.groups.length ||
    filters.teams.length,
  );
}

export function hasActiveFiltersHideMissing(
  filters: InventoryFilters,
): boolean {
  return Boolean(filters.query.trim() || filters.missing || filters.extras);
}

export function filterOnlyExtrasFromInventory(inventory: Inventory): Inventory {
  return Object.entries(inventory).reduce(
    (extraInventory, [sticker, quantity]) => {
      if (quantity > 1) {
        return {
          ...extraInventory,
          [sticker]: quantity - 1,
        };
      }
      return extraInventory;
    },
    {} as Inventory,
  );
}
