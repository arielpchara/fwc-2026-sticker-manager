import { useCallback, useMemo, useState } from "react";
import { useLocale } from "../../i18n/index.js";
import { flagOf } from "../../constants/flags.js";
import Sticker from "../common/Sticker.js";
import type { TradeBy, TradeSticker } from "../../type/trade.js";
import {
  countGiveTradedStickers,
  countReceiveTradedStickers,
  sortByGroup,
} from "../../application/traderTool.js";
import TradeChangeSticker from "./TradeChangeSticker.js";
import { CompareMode } from "../../type/compare.js";
import {
  copy,
  messageCompleteTrade,
  messageMissingTrade,
} from "../../application/copyTools.js";
import { useTrade } from "../../application/useStickers.js";
import { StickerType } from "../../type/sticker.js";

const CHROMA: StickerType = "chroma";

interface TradeResultProps {
  name: string;
  trade: TradeBy[];
  onChangeSticker?: (from: TradeBy, to: string[], mode: CompareMode) => void;
}

interface DialogChangeTradeState {
  trade: TradeBy;
  availableStickers: string[];
  sticker: string | null;
  mode: CompareMode;
}

interface IncompleteTrade {
  give: string[];
  receive: string[];
}

function getIncompleteTrade(trade: TradeBy[]): IncompleteTrade {
  return trade.reduce(
    (acc, entry) => {
      if (entry.give[0] == null && entry.receive[0] != null) {
        acc.receive.push(entry.receive[0]);
      } else if (entry.give[0] != null && entry.receive[0] == null) {
        acc.give.push(entry.give[0]);
      }
      return acc;
    },
    { give: [], receive: [] } as IncompleteTrade,
  );
}

export default function TradeResult({
  name,
  trade,
  onChangeSticker,
}: TradeResultProps) {
  const { t } = useLocale();
  const { removeTrade } = useTrade();

  const [changeStickerDialog, setChangeStickerDialog] =
    useState<DialogChangeTradeState | null>(null);

  const giveCount = useMemo(() => countGiveTradedStickers(trade), [trade]);
  const receiveCount = useMemo(
    () => countReceiveTradedStickers(trade),
    [trade],
  );

  const sorted = useMemo(() => {
    return sortByGroup(trade).sort((a, b) => {
      const aValid = a.give[0] != null && a.receive[0] != null;
      const bValid = b.give[0] != null && b.receive[0] != null;
      if (aValid !== bValid) return aValid ? -1 : 1;
      if (a.type === CHROMA && b.type !== CHROMA) return -1;
      if (a.type !== CHROMA && b.type === CHROMA) return 1;
      return 0;
    });
  }, [trade]);

  const incompleteTrade = useMemo(() => getIncompleteTrade(sorted), [sorted]);

  const validCount = sorted.filter(
    (t) => t.give[0] != null && t.receive[0] != null,
  ).length;

  const handleCopyTrade = () => {
    copy(messageCompleteTrade(sorted, t("tradeWith", { name })));
  };

  const handleCopyMissingTrade = () => {
    copy(messageMissingTrade(sorted, t("tradeWith", { name })));
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
      setChangeStickerDialog({
        availableStickers,
        trade,
        sticker,
        mode,
      });
    };

  function row(tradeBy: TradeBy, i: number) {
    const { give, receive } = tradeBy;
    return (
      <tr className="border-b border-border" key={i}>
        <td>{i + 1}</td>
        <td className="py-1 whitespace-nowrap">
          {give.map((code, i) => (
            <Sticker
              key={i}
              code={code}
              onDoubleClick={handleOpenChangeStickerDialog(
                tradeBy,
                code,
                incompleteTrade.give,
                "give",
              )}
            />
          ))}
          {give.length === 0 && (
            <Sticker
              key={i}
              code={null}
              onDoubleClick={handleOpenChangeStickerDialog(
                tradeBy,
                null,
                incompleteTrade.give,
                "give",
              )}
            />
          )}
        </td>
        <td className="text-muted px-2 text-center">→</td>
        <td className="py-1 whitespace-nowrap">
          <div className="flex items-center gap-1">
            {receive.map((code, i) => (
              <Sticker
                key={i}
                code={code}
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
              {t("tradeMy")}&nbsp;({giveCount})
            </th>
            <th className="font-medium pb-1 w-6" />
            <th className="font-medium pb-1">
              {name}&nbsp;({receiveCount})
            </th>
          </tr>
        </thead>
        <tbody>{sorted.map((entry, i) => row(entry, i))}</tbody>
      </table>
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
