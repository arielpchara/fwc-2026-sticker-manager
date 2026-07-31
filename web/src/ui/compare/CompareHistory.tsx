import { useMemo } from "react";
import { useLocale } from "../../i18n/index.js";
import { useAppSelector } from "../../storage/hooks.js";
import type { CompareEntry } from "../../type/compare.js";

function CompareName({
  name,
  entries,
  canTrade,
  hasNote,
  onTradeNavigate,
  onReopen,
  onDelete,
}: {
  name: string;
  entries: CompareEntry[];
  canTrade: boolean;
  hasNote: boolean;
  onTradeNavigate?: (label: string) => void;
  onReopen: (entry: CompareEntry) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="rounded border border-border bg-surface py-1.5 px-2 space-y-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-medium text-fg text-xs truncate">{name}</span>
        {hasNote ? (
          <span className="text-gold shrink-0" title={t("tradeNote")}>
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
          </span>
        ) : null}
        {canTrade && onTradeNavigate ? (
          <button
            onClick={() => onTradeNavigate(name)}
            className="text-muted hover:text-gold p-0.5 ml-auto text-xs truncate"
            title="Trade"
          >
            {t("tradeWith", { name })}
          </button>
        ) : null}
      </div>
      {entries.map((entry) => (
        <div
          key={entry.mode}
          className="flex items-center gap-1.5 text-xs text-muted min-w-0"
        >
          <span
            className={`font-bold shrink-0 ${entry.mode === "receive" ? "text-gold" : "text-copper"}`}
          >
            {entry.mode === "receive" ? "↓" : "↑"}
          </span>
          <span className="shrink-0">
            {t("historyMissing", { n: entry.stickers.length })}
          </span>
          <button
            onClick={() => onReopen(entry)}
            className="text-muted hover:text-gold p-0.5 ml-auto"
            title={t("historyReopen")}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(entry.mode + "-" + entry.name)}
            className="text-muted hover:text-red-500 p-0.5"
            title={t("historyDelete")}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function CompareHistory({
  entries = [],
  onTradeNavigate,
  onReopen,
  onDelete,
}: {
  entries: CompareEntry[];
  onTradeNavigate?: (label: string) => void;
  onReopen: (entry: CompareEntry) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLocale();
  const trades = useAppSelector((s) => s.trade.trades);

  const groups = useMemo(() => {
    const byName = new Map<string, CompareEntry[]>();
    for (const entry of entries) {
      const list = byName.get(entry.name) ?? [];
      list.push(entry);
      byName.set(entry.name, list);
    }
    return [...byName.entries()]
      .map(([name, list]) => ({
        name,
        entries: list.sort((a, b) =>
          a.mode === b.mode ? 0 : a.mode === "receive" ? -1 : 1,
        ),
        savedAt: Math.max(...list.map((e) => e.savedAt)),
      }))
      .sort((a, b) => b.savedAt - a.savedAt);
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-xs text-muted text-center py-2">
        {t("historyEmpty")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted">{t("historyTitle")}</p>
      {groups.map((g) => (
        <CompareName
          key={g.name}
          name={g.name}
          entries={g.entries}
          canTrade={g.entries.some((e) => e.mode === "offer") && g.entries.some((e) => e.mode === "receive")}
          hasNote={!!(trades[g.name]?.note ?? "").trim()}
          onTradeNavigate={onTradeNavigate}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
