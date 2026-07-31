import { Inventory } from "../type/sticker";
import { PREFIX } from "../constants/stickers";
import { getMaxStickerPerTeam } from "./teamsTools";

export function generateEmptyInventory(): Inventory {
  const inventory: Inventory = {
    "00": 0,
  };
  for (const prefix of PREFIX) {
    for (let i = 1; i <= getMaxStickerPerTeam(prefix); i++) {
      const code = `${prefix}${i}`;
      inventory[code] = 0;
    }
  }
  return inventory;
}
