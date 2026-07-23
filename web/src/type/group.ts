import { Inventory } from "./sticker";

export type StickerGroupByTeam = { team: string; stickers: Inventory };
export type StickerGroupByGroup = {
  labelKey: string;
  teams: StickerGroupByTeam[];
};
