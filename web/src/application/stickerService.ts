import { cleanText } from "../../../src/parser/cleaner.js";
import { extractStickers } from "../../../src/parser/extractStickers.js";

export function extractStickerFromText(text: string) {
  return extractStickers(cleanText(text));
}
