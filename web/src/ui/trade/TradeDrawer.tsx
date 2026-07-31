import { useParams, useNavigate } from "react-router-dom";
import { useLocale } from "../../i18n/index.js";
import TradeResult from "../trade/TradeResult.js";
import {
  applyManualTradeSide,
  getAllGiveTrades,
  getAllReceiveTrades,
  trader,
} from "../../application/traderTool.js";
import { useMemo, useCallback, useState, useEffect } from "react";
import type { TradeBy } from "../../type/trade.js";
import type { CompareMode } from "../../type/compare.js";
import Drawer from "../common/Drawer.js";
import { useCompareHistory } from "../../hooks/useCompareHistory.js";
import { useAppDispatch, useAppSelector } from "../../storage/hooks.js";
import { deleteTrade, setTrade, renameTrade } from "../../storage/tradeSlice.js";
import { renamePerson } from "../../storage/compareSlice.js";

export default function TradeDrawer() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const { entries, updateEntryStickers } = useCompareHistory();
  const locked = useAppSelector((s) => {
    if (!name) return undefined;
    const stored = s.trade.trades[name];
    return stored?.isLock ? stored.trades : undefined;
  });
  const takenNames = useAppSelector((s) => {
    const names = new Set<string>();
    for (const e of Object.values(s.compare?.entries ?? {})) names.add(e.name);
    for (const n of Object.keys(s.trade.trades)) names.add(n);
    return names;
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");

  useEffect(() => {
    if (!editing) setDraft(name ?? "");
  }, [name, editing]);

  const offerEntry = name ? entries[`offer-${name}`] : undefined;
  const receiveEntry = name ? entries[`receive-${name}`] : undefined;
  const offer = offerEntry?.stickers ?? [];
  const receive = receiveEntry?.stickers ?? [];

  const trades = useMemo(() => {
    if (locked) return locked;
    return offer.length || receive.length ? trader(offer, receive) : [];
  }, [locked, offer, receive]);

  const handleChangeSticker = useCallback(
    (from: TradeBy, to: string[], mode: CompareMode) => {
      if (!name) return;
      dispatch(
        setTrade({
          name,
          trades: applyManualTradeSide(trades, from.key, to, mode),
          savedAt: Date.now(),
          isLock: true,
        }),
      );
    },
    [name, trades, dispatch],
  );

  const handleCompleteTrade = useCallback(
    (complete: TradeBy[]) => {
      if (!name) return;
      updateEntryStickers(offerEntry, getAllGiveTrades(complete));
      updateEntryStickers(receiveEntry, getAllReceiveTrades(complete));
      dispatch(deleteTrade(name));
      navigate("/compare");
    },
    [name, offerEntry, receiveEntry, updateEntryStickers, dispatch, navigate],
  );

  const handleRename = (value: string) => {
    setDraft(value);
    if (!name) return;
    const next = value.trim();
    if (!next || next === name) return;
    if (takenNames.has(next)) return;
    dispatch(renamePerson({ from: name, to: next }));
    dispatch(renameTrade({ from: name, to: next }));
    navigate(`/compare/${next}`, { replace: true });
  };

  const title = !name ? (
    ""
  ) : editing ? (
    <input
      value={draft}
      onChange={(e) => handleRename(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setEditing(false);
        if (e.key === "Escape") {
          setDraft(name);
          setEditing(false);
        }
      }}
      autoFocus
      className="w-full min-w-0 border border-border bg-surface-2 rounded px-2 py-1 text-base font-semibold text-fg focus:outline-none focus:ring-2 focus:ring-gold"
    />
  ) : (
    <span className="flex items-center gap-2 min-w-0">
      <span className="truncate">{t("tradeWith", { name })}</span>
      <button
        type="button"
        onClick={() => {
          setDraft(name);
          setEditing(true);
        }}
        className="shrink-0 p-0.5 text-muted hover:text-gold"
        title={t("tradeRename")}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>
    </span>
  );

  return (
    <Drawer open onClose={() => navigate("/compare")} title={title}>
      {name && (
        <TradeResult
          name={name}
          trades={trades}
          onChangeSticker={handleChangeSticker}
          onCompleteTrade={handleCompleteTrade}
        />
      )}
    </Drawer>
  );
}
