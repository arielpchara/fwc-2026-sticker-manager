import { Inventory } from "../type/sticker";
import { PREFIX } from "../constants/stickers";

export function generateEmptyInventory(): Inventory {
  const inventory: Inventory = {};
  for (const prefix of PREFIX) {
    let max = 20;
    if (prefix === "00") max = 1;
    if (prefix === "FWC") max = 19;
    if (prefix === "CC") max = 14;
    for (let i = 1; i <= 20; i++) {
      const code = `${prefix}${prefix !== "00" ? i : ""}`;
      inventory[code] = 0;
    }
  }
  return inventory;
}
