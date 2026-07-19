import { useParams, useNavigate } from "react-router-dom";
import { useLocale } from "../../i18n/index.js";
import TradeResult from "../trade/TradeResult.js";
import { trader, updateTrade } from "../../application/traderTool.js";
import { useMemo, useCallback } from "react";
import type { TradeBy } from "../../type/trade.js";
import type { CompareMode } from "../../type/compare.js";
import Drawer from "../common/Drawer.js";
import { useCompareHistory } from "../../hooks/useCompareHistory.js";
import { useTrade } from "../../hooks/useTrade.js";

export default function TradeDrawer() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { entries, deleteEntry } = useCompareHistory();
  const { trades: storedTrades, saveTrade } = useTrade();

  const offerEntry = name ? entries[`offer-${name}`] : undefined;
  const receiveEntry = name ? entries[`receive-${name}`] : undefined;
  const offer = offerEntry?.stickers ?? [];
  const receive = receiveEntry?.stickers ?? [];
  const stored = name ? storedTrades[name] : undefined;

  const trades = useMemo(() => {
    if (stored?.isLock) return stored.trades;
    return offer.length || receive.length ? trader(offer, receive) : [];
  }, [stored, offer, receive]);

  const handleChangeSticker = useCallback(
    (from: TradeBy, to: string[], mode: CompareMode) => {
      if (!name) return;
      const idx = trades.findIndex((t) => t.key === from.key);
      if (idx === -1) return;
      const updated: TradeBy = {
        ...from,
        ...(mode === "offer" ? { offer: to } : { receive: to }),
      };
      const newTrades = updateTrade(trades, idx, updated);
      saveTrade(name, newTrades, true);
    },
    [name, trades, saveTrade],
  );

  return (
    <Drawer
      open
      onClose={() => navigate("/compare")}
      title={name ? t("tradeWith", { name }) : ""}
    >
      {name && (
        <TradeResult
          name={name}
          trades={trades}
          onChangeSticker={handleChangeSticker}
          onCompleteTrade={() => {
            deleteEntry(`give-${name}`);
            deleteEntry(`receive-${name}`);
            navigate("/compare");
          }}
        />
      )}
    </Drawer>
  );
}
