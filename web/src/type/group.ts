import { Stickers } from "./sticker";

export type StickerGroupByTeam = { team: string; stickers: Stickers };
export type StickerGroupByGroup = {
  labelKey: string;
  teams: StickerGroupByTeam[];
};
