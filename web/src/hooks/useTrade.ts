import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../storage/hooks.js";
import { deleteTrade, setTrade } from "../storage/tradeSlice.js";
import type { Trade, TradeBy } from "../type/trade.js";

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
