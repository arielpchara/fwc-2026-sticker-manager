import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../storage/hooks.js";
import {
  setOwn,
  mergeOwn,
  removeOwn,
  addSurplus,
  setSurplus,
} from "../storage/stickerSlice.js";
import { upsertEntry, removeEntry } from "../storage/compareSlice.js";
import { deleteTrade, setTrade } from "../storage/tradeSlice.js";
import {
  parseOwnText,
  parseSurplusText,
  computeExtras,
  parseText,
  totalExtras,
} from "./stickerService.js";
import type { Inventory } from "./stickerService.js";
import { CompareEntry } from "../type/compare.js";
import type { TradeBy, Trade } from "../type/trade.js";

export function useOwnStickers() {
  const inv = useAppSelector((s) => s.sticker.inv);
  const dispatch = useAppDispatch();

  const updateOwn = useCallback(
    (text: string) => {
      const codes = parseText(text);
      const newInv: Inventory = {};
      for (const c of codes) newInv[c] = 1;
      dispatch(setOwn(newInv));
      return { count: codes.length, stickers: codes, inv: newInv };
    },
    [dispatch],
  );

  const addStickers = useCallback(
    (text: string) => {
      const codes = parseText(text);
      dispatch(mergeOwn(codes));
      return { count: codes.length, stickers: codes };
    },
    [dispatch],
  );

  const removeStickers = useCallback(
    (text: string) => {
      const codes = parseText(text);
      dispatch(removeOwn(codes));
      return { count: codes.length, stickers: codes };
    },
    [dispatch],
  );

  return {
    inv,
    updateOwn,
    addStickers,
    removeStickers,
    stickers: Object.keys(inv).sort(),
    extras: computeExtras(inv),
    totalExtras: totalExtras(inv),
  };
}

export function useSurplusStickers() {
  const dispatch = useAppDispatch();

  const addSurplusText = useCallback(
    (text: string) => {
      const result = parseSurplusText(text);
      dispatch(addSurplus(result.surplus));
      return result;
    },
    [dispatch],
  );

  const overwriteSurplus = useCallback(
    (text: string) => {
      const result = parseSurplusText(text);
      dispatch(setSurplus(result.surplus));
      return result;
    },
    [dispatch],
  );

  return { addSurplusText, overwriteSurplus };
}

export function useTrade() {
  const trades = useAppSelector((s) => s.trade.trades);
  const dispatch = useAppDispatch();

  const saveTrade = useCallback(
    (name: string, tradesData: TradeBy[], isLock: boolean) => {
      const trade: Trade = {
        name,
        trades: tradesData,
        savedAt: Date.now(),
        isLock,
      };
      dispatch(setTrade(trade));
    },
    [dispatch],
  );

  const removeTrade = useCallback(
    (name: string) => {
      dispatch(deleteTrade(name));
    },
    [dispatch],
  );

  return { trades, saveTrade, removeTrade };
}

export function useCompareHistory() {
  const entries = useAppSelector((s) => s.compare?.entries ?? {});
  const dispatch = useAppDispatch();

  const saveEntry = useCallback(
    (entry: CompareEntry) => {
      dispatch(upsertEntry(entry));
    },
    [dispatch],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      dispatch(removeEntry(id));
    },
    [dispatch],
  );

  return { entries, saveEntry, deleteEntry };
}
