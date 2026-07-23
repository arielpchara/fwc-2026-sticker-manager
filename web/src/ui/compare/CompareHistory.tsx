import { useMemo } from "react";
import { useLocale } from "../../i18n/index.js";
import type { CompareEntry } from "../../type/compare.js";

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

  const matchingLabels = useMemo(() => {
    const offerLabels = new Set(
      entries.filter((e) => e.mode === "offer").map((e) => e.name),
    );
    const receiveLabels = new Set(
      entries.filter((e) => e.mode === "receive").map((e) => e.name),
    );
    return [...offerLabels].filter((l) => receiveLabels.has(l));
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-xs text-muted text-center py-2">
        {t("historyEmpty")}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted">{t("historyTitle")}</p>
      {[...entries].map((entry) => (
        <div
          key={entry.mode + "-" + entry.name}
          className="flex items-center justify-between text-xs text-muted py-1.5 px-2 rounded hover:bg-surface-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`font-bold shrink-0 ${entry.mode === "receive" ? "text-gold" : "text-copper"}`}
            >
              {entry.mode === "receive" ? "↓" : "↑"}
            </span>
            <span className="font-medium text-fg truncate">{entry.name}</span>
            <span className="text-muted shrink-0">
              {t("historyMissing", { n: entry.stickers.length })}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {matchingLabels.includes(entry.name) && onTradeNavigate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTradeNavigate(entry.name);
                }}
                className="text-muted hover:text-gold p-0.5"
                title="Trade"
              >
                {t("tradeWith", { name: entry.name })}
              </button>
            )}
            <button
              onClick={() => onReopen(entry)}
              className="text-muted hover:text-gold p-0.5"
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
        </div>
      ))}
    </div>
  );
}
