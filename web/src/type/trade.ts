import { StickerType } from "./sticker";

export type TradeSticker = string | null;

export interface TradeBy {
  give: TradeSticker[];
  receive: TradeSticker[];
  type: StickerType | "multi";
  savedAt: number;
  key: string;
}

export interface Trade {
  name: string;
  trades: TradeBy[];
  savedAt: number;
  isLock: boolean;
}

export interface TradeState {
  trades: Record<string, Trade>;
}
