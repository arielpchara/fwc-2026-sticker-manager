import { useMemo, type ReactNode } from "react";
import { useLocale } from "../../i18n/index.js";
import { useAppSelector } from "../../storage/hooks.js";
import type { CompareEntry } from "../../type/compare.js";

const iconBtn =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface-2 text-muted hover:text-gold hover:border-gold shrink-0 transition";

function IconBtn({
  onClick,
  title,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`${iconBtn} ${danger ? "hover:text-red-400 hover:border-red-500/50" : ""}`}
    >
      {children}
    </button>
  );
}

function CompareName({
  index,
  name,
  entries,
  canTrade,
  hasNote,
  onTradeNavigate,
  onReopen,
  onDelete,
}: {
  index: number;
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
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border min-w-0">
        <span className="text-[10px] text-muted tabular-nums shrink-0 w-4">
          {index}
        </span>
        <span className="font-medium text-fg text-sm truncate min-w-0 flex-1">
          {name}
        </span>
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
        <div className="flex items-center gap-1.5 shrink-0">
          {canTrade && onTradeNavigate ? (
            <IconBtn
              onClick={() => onTradeNavigate(name)}
              title={t("tradeWith", { name })}
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </IconBtn>
          ) : null}
        </div>
      </div>
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <div
            key={entry.mode}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted min-w-0"
          >
            <span
              className={`font-bold shrink-0 w-4 text-center ${entry.mode === "receive" ? "text-gold" : "text-copper"}`}
            >
              {entry.mode === "receive" ? "↓" : "↑"}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {entry.mode === "receive"
                ? t("compareReceiveTab")
                : t("compareOfferTab")}
              {" · "}
              {t("historyMissing", { n: entry.stickers.length })}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <IconBtn
                onClick={() => onReopen(entry)}
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
              </IconBtn>
              <IconBtn
                onClick={() => onDelete(entry.mode + "-" + entry.name)}
                title={t("historyDelete")}
                danger
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
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareHistory({
  entries = [],
  onTradeNavigate,
  onReopen,
  onRefreshAll,
  onDelete,
}: {
  entries: CompareEntry[];
  onTradeNavigate?: (label: string) => void;
  onReopen: (entry: CompareEntry) => void;
  onRefreshAll?: () => void;
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
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
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
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted flex-1">
          {t("historyTitle")}
        </p>
        {onRefreshAll && (
          <IconBtn onClick={onRefreshAll} title={t("historyRefreshAll")}>
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
          </IconBtn>
        )}
      </div>
      {groups.map((g, i) => (
        <CompareName
          key={g.name}
          index={i + 1}
          name={g.name}
          entries={g.entries}
          canTrade={
            g.entries.some((e) => e.mode === "offer") &&
            g.entries.some((e) => e.mode === "receive")
          }
          hasNote={!!(trades[g.name]?.note ?? "").trim()}
          onTradeNavigate={onTradeNavigate}
          onReopen={onReopen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
