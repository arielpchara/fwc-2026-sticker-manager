import { useCallback, useMemo, useState } from "react";
import { useLocale } from "../../i18n/index.js";
import { flagOf } from "../../constants/flags.js";
import Sticker from "../common/Sticker.js";
import type { TradeBy } from "../../type/trade.js";
import {
  collectShared,
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
  messageCompleteTrade,
  messageAllTrades,
} from "../../application/copyTools.js";
import { StickerType } from "../../type/sticker.js";
import { useStickers } from "../../hooks/useStickers.js";
import {
  useAppDispatch,
  useAppSelector,
} from "../../storage/hooks.js";
import { deleteTrade, setNote } from "../../storage/tradeSlice.js";
import CopyButton from "../common/CopyButton.js";
import type { ReactNode } from "react";

const CHROMA: StickerType = "chroma";

interface TradeResultProps {
  name: string;
  trades: TradeBy[];
  onChangeSticker?: (from: TradeBy, to: string[], mode: CompareMode) => void;
  onCompleteTrade?: (complete: TradeBy[]) => void;
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
      const offers = entry.offer.filter((c): c is string => c != null);
      const receives = entry.receive.filter((c): c is string => c != null);
      if (offers.length === 0 && receives.length > 0) {
        acc.receive.push(...receives);
      } else if (receives.length === 0 && offers.length > 0) {
        acc.offer.push(...offers);
      }
      return acc;
    },
    { offer: [], receive: [] } as IncompleteTrade,
  );
}

function TradeNote({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.trade.trades[name]?.note ?? "");
  const [open, setOpen] = useState(false);
  const [note, setNoteLocal] = useState(saved);
  const hasNote = note.trim().length > 0;

  return (
    <>
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`p-0.5 ${hasNote ? "text-gold" : "text-muted hover:text-gold"}`}
          title={t("tradeNote")}
          aria-expanded={open}
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        {children}
      </div>
      {open && (
        <textarea
          value={note}
          onChange={(e) => {
            const v = e.target.value;
            setNoteLocal(v);
            dispatch(setNote({ name, note: v }));
          }}
          placeholder={t("tradeNotePlaceholder")}
          rows={3}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-y"
        />
      )}
    </>
  );
}

function SharedSticker({
  code,
  sharedWith,
  title,
  onDoubleClick,
}: {
  code: string | null;
  sharedWith?: string[];
  title?: string;
  onDoubleClick: (e: React.MouseEvent) => void;
}) {
  const shared = sharedWith && sharedWith.length > 0;
  return (
    <div
      className={`relative ${shared ? "ring-2 ring-copper rounded-md" : ""}`}
      title={title}
    >
      <Sticker code={code} full onDoubleClick={onDoubleClick} />
      {shared && (
        <span className="absolute -top-1.5 -left-1.5 z-20 bg-copper text-bg text-[9px] font-black px-1 py-px rounded-full border border-gold shadow">
          {sharedWith.length}
        </span>
      )}
    </div>
  );
}

export default function TradeResult({
  name,
  trades,
  onChangeSticker,
  onCompleteTrade,
}: TradeResultProps) {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const { increaseInventory, subtractInventory } = useStickers();
  const compareEntries = useAppSelector((s) => s.compare?.entries ?? {});
  const allTrades = useAppSelector((s) => s.trade.trades);

  const shared = useMemo(
    () => collectShared(name, compareEntries, allTrades),
    [name, compareEntries, allTrades],
  );

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

  const handleCompleteTrade = () => {
    const completeTrades = filterCompleteTrades(trades);
    if (completeTrades.length === 0) return;
    subtractInventory(getAllGiveTrades(completeTrades).join(", "));
    increaseInventory(getAllReceiveTrades(completeTrades).join(", "));
    onCompleteTrade?.(completeTrades);
  };

  const handleOpenChangeStickerDialog =
    (trade: TradeBy, mode: CompareMode) => (event: React.MouseEvent) => {
      event.preventDefault();
      const current = (
        mode === "offer" ? trade.offer : trade.receive
      ).filter((c): c is string => c != null);
      const incomplete =
        mode === "offer" ? incompleteTrade.offer : incompleteTrade.receive;
      const availableStickers = [...new Set([...current, ...incomplete])];
      if (availableStickers.length === 0) return;
      setChangeStickerDialog({
        availableStickers,
        trade,
        sticker: current[0] ?? null,
        mode,
      });
    };

  function sharedTitle(names: string[] | undefined) {
    if (!names?.length) return undefined;
    return t("tradeSharedWith", { names: names.join(", ") });
  }

  function row(tradeBy: TradeBy, i: number) {
    const { offer, receive } = tradeBy;
    return (
      <tr className="border-b border-border" key={i}>
        <td>{i + 1}</td>
        <td className="py-1 w-50">
          <div className="flex flex-col gap-2">
            {offer.map((code, j) => (
              <SharedSticker
                key={j}
                code={code}
                sharedWith={code ? shared.offer.get(code) : undefined}
                title={sharedTitle(code ? shared.offer.get(code) : undefined)}
                onDoubleClick={handleOpenChangeStickerDialog(tradeBy, "offer")}
              />
            ))}
            {offer.length === 0 && (
              <SharedSticker
                code={null}
                onDoubleClick={handleOpenChangeStickerDialog(tradeBy, "offer")}
              />
            )}
          </div>
        </td>
        <td className="text-muted px-2 text-center">→</td>
        <td className="py-1 w-50">
          <div className="flex flex-col gap-2">
            {receive.map((code, j) => (
              <SharedSticker
                key={j}
                code={code}
                sharedWith={code ? shared.receive.get(code) : undefined}
                title={sharedTitle(code ? shared.receive.get(code) : undefined)}
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
                  "receive",
                )}
              />
            ))}
            {receive.length === 0 && (
              <SharedSticker
                code={null}
                onDoubleClick={handleOpenChangeStickerDialog(
                  tradeBy,
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
      <TradeNote name={name}>
        <button
          onClick={() => name && dispatch(deleteTrade(name))}
          className="text-xs text-muted hover:text-fg"
        >
          ↻ {t("tradeRecreate")}
        </button>
        <CopyButton
          text={() =>
            messageCompleteTrade(
              sorted,
              [
                t("tradeWith", { name }),
                `${t("tradeMy")} <-> ${t("tradeYours")}`,
              ].join("\n"),
            )
          }
        />
        <CopyButton
          label={t("copyBtnAllTrades")}
          text={() => messageAllTrades(sorted, t("tradeWith", { name }))}
        />
      </TradeNote>

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
        className="btn-glow w-full font-bold py-3 rounded-lg"
      >
        {t("tradeComplete")} ({validCount})
      </button>
      {changeStickerDialog && (
        <TradeChangeSticker
          sticker={changeStickerDialog.availableStickers}
          initialSelected={(
            changeStickerDialog.mode === "offer"
              ? changeStickerDialog.trade.offer
              : changeStickerDialog.trade.receive
          ).filter((c): c is string => c != null)}
          onClose={() => setChangeStickerDialog(null)}
          onSubmit={(selected) => {
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
