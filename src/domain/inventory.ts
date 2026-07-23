export type Inventory = Record<string, number>;

export function codesOf(inv: Inventory): string[] {
  return Object.keys(inv).sort();
}

export function totalCopies(inv: Inventory): number {
  return Object.values(inv).reduce((a, b) => a + b, 0);
}

export interface ExtraItem {
  code: string;
  qty: number;
  surplus: number;
}

export function extras(inv: Inventory): ExtraItem[] {
  return Object.entries(inv)
    .filter(([, qty]) => qty >= 2)
    .map(([code, qty]) => ({ code, qty, surplus: qty - 1 }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function totalSurplus(inv: Inventory): number {
  return extras(inv).reduce((sum, e) => sum + e.surplus, 0);
}

export function mergeCounts(...invs: Inventory[]): Inventory {
  const result: Inventory = {};
  for (const inv of invs) {
    for (const [code, qty] of Object.entries(inv)) {
      result[code] = (result[code] ?? 0) + qty;
    }
  }
  return result;
}

export function emptyInventory(): Inventory {
  return {};
}
