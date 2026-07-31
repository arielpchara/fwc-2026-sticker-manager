import { extractStickerFromText } from "./stickerService.js";
import type { Inventory } from "../type/sticker.js";

export function findMissing(text: string, inventory: Inventory): string[] {
  const stickers = extractStickerFromText(text);
  return Object.keys(stickers).filter((code) => !inventory[code]);
}

export function findOffer(text: string, extraInventory: Inventory): string[] {
  const stickers = extractStickerFromText(text);
  return Object.keys(stickers).filter((code) => extraInventory[code] > 0);
}
