import { useCallback, useMemo, useState } from "react";
import { useLocale } from "../../i18n/index.js";
import { flagOf } from "../../constants/flags.js";
import Sticker from "../common/Sticker.js";
import type { TradeBy, TradeSticker } from "../../type/trade.js";
import {
  countOfferTradedStickers,
  countReceiveTradedStickers,
  filterCompleteTrades,
  getAllGiveTrades,
  getAllReceiveTrades,
  sortByGroup,
} from "../../application/traderTool.js";
import TradeChangeSticker from "./TradeChangeSticker.js";
import { CompareMode } from "../../type/compare.js";
import {
  copy,
  messageCompleteTrade,
  messageMissingTrade,
} from "../../application/copyTools.js";
import { StickerType } from "../../type/sticker.js";
import { useTrade } from "../../hooks/useTrade.js";
import { useStickers } from "../../hooks/useStickers.js";

const CHROMA: StickerType = "chroma";

interface TradeResultProps {
  name: string;
  trades: TradeBy[];
  onChangeSticker?: (from: TradeBy, to: string[], mode: CompareMode) => void;
  onCompleteTrade?: () => void;
}

interface DialogChangeTradeState {
  trade: TradeBy;
  availableStickers: string[];
  sticker: string | null;
  mode: CompareMode;
}

interface IncompleteTrade {
  offer: string[];
  receive: string[];
}

function getIncompleteTrade(trade: TradeBy[]): IncompleteTrade {
  return trade.reduce(
    (acc, entry) => {
      if (entry.offer[0] == null && entry.receive[0] != null) {
        acc.receive.push(entry.receive[0]);
      } else if (entry.offer[0] != null && entry.receive[0] == null) {
        acc.offer.push(entry.offer[0]);
      }
      return acc;
    },
    { offer: [], receive: [] } as IncompleteTrade,
  );
}

export default function TradeResult({
  name,
  trades,
  onChangeSticker,
  onCompleteTrade,
}: TradeResultProps) {
  const { t } = useLocale();
  const { removeTrade } = useTrade();
  const { increaseInventory, subtractInventory } = useStickers();

  const [changeStickerDialog, setChangeStickerDialog] =
    useState<DialogChangeTradeState | null>(null);

  const offerCount = useMemo(() => countOfferTradedStickers(trades), [trades]);
  const receiveCount = useMemo(
    () => countReceiveTradedStickers(trades),
    [trades],
  );

  const sorted = useMemo(() => {
    return sortByGroup(trades).sort((a, b) => {
      const aValid = a.offer[0] != null && a.receive[0] != null;
      const bValid = b.offer[0] != null && b.receive[0] != null;
      if (aValid !== bValid) return aValid ? -1 : 1;
      if (a.type === CHROMA && b.type !== CHROMA) return -1;
      if (a.type !== CHROMA && b.type === CHROMA) return 1;
      return 0;
    });
  }, [trades]);

  const incompleteTrade = useMemo(() => getIncompleteTrade(sorted), [sorted]);

  const validCount = sorted.filter(
    (t) => t.offer[0] != null && t.receive[0] != null,
  ).length;

  const handleCopyTrade = () => {
    copy(messageCompleteTrade(sorted, t("tradeWith", { name })));
  };

  const handleCopyMissingTrade = () => {
    copy(messageMissingTrade(sorted, t("tradeWith", { name })));
  };

  const handleCompleteTrade = () => {
    const completeTrades = filterCompleteTrades(trades);
    if (completeTrades.length === 0) return;
    increaseInventory(getAllGiveTrades(completeTrades).join(", "));
    subtractInventory(getAllReceiveTrades(completeTrades).join(", "));
    onCompleteTrade?.();
  };

  const handleOpenChangeStickerDialog =
    (
      trade: TradeBy,
      sticker: TradeSticker,
      availableStickers: string[],
      mode: CompareMode,
    ) =>
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (availableStickers.length === 0) return;
      if (trade.offer[0] == null || trade.receive[0] == null) return;
      setChangeStickerDialog({
        availableStickers,
        trade,
        sticker,
        mode,
      });
    };

  function row(tradeBy: TradeBy, i: number) {
    const { offer, receive } = tradeBy;
    return (
      <tr className="border-b border-border" key={i}>
        <td>{i + 1}</td>
        <td className="py-1 w-50">
          <div className="flex flex-col gap-2">
            {offer.map((code, i) => (
              <Sticker
                key={i}
                code={code}
                full
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
                  code,
                  incompleteTrade.offer,
                  "offer",
                )}
              />
            ))}
            {offer.length === 0 && (
              <Sticker
                key={i}
                code={null}
                full
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
                  null,
                  incompleteTrade.offer,
                  "offer",
                )}
              />
            )}
          </div>
        </td>
        <td className="text-muted px-2 text-center">→</td>
        <td className="py-1 w-50">
          <div className="flex flex-col gap-2">
            {receive.map((code, i) => (
              <Sticker
                key={i}
                code={code}
                full
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
                  code,
                  incompleteTrade.receive,
                  "receive",
                )}
              />
            ))}
            {receive.length === 0 && (
              <Sticker
                key={i}
                code={null}
                full
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
                  null,
                  incompleteTrade.receive,
                  "receive",
                )}
              />
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => name && removeTrade(name)}
          className="text-xs text-muted hover:text-fg"
        >
          ↻ {t("tradeRecreate")}
        </button>
        <button
          onClick={handleCopyTrade}
          className="text-xs text-muted hover:text-fg flex items-center gap-1"
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {t("copyBtn")}
        </button>
        <button
          onClick={handleCopyMissingTrade}
          className="text-xs text-muted hover:text-fg flex items-center gap-1"
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {t("copyBtnMissing")}
        </button>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted uppercase tracking-wider">
            <th />
            <th className="font-medium pb-1">
              {t("tradeMy")}&nbsp;({offerCount})
            </th>
            <th className="font-medium pb-1 w-6" />
            <th className="font-medium pb-1">
              {name}&nbsp;({receiveCount})
            </th>
          </tr>
        </thead>
        <tbody>{sorted.map((entry, i) => row(entry, i))}</tbody>
      </table>
      <button
        onClick={handleCompleteTrade}
        disabled={validCount === 0}
        className="w-full bg-gradient-to-r from-gold to-copper text-bg font-bold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
      >
        {t("tradeComplete")} ({validCount})
      </button>
      {changeStickerDialog && (
        <TradeChangeSticker
          sticker={changeStickerDialog.availableStickers}
          onClose={() => setChangeStickerDialog(null)}
          onSubmit={(selected) => {
            selected.length > 0 &&
              onChangeSticker?.(
                changeStickerDialog.trade,
                selected,
                changeStickerDialog.mode,
              );
            setChangeStickerDialog(null);
          }}
        />
      )}
    </div>
  );
}
