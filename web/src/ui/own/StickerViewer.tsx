import { useState, useMemo } from "react";
import { useOwnStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import { flagOf } from "../../constants/flags.js";
import { groupOf, type GroupInfo } from "../../constants/groups.js";
import { maxStickers } from "../../constants/stickers.js";
import Filter from "../common/Filter.js";
import Sticker from "../common/Sticker.js";
import StickerCounter from "../common/StickerCounter.js";
import ProgressBar from "../common/ProgressBar.js";
import SortStickers from "../common/SortStickers.js";
import type { SortMode } from "../common/SortStickers.js";

function prefixOf(code: string): string {
  return code === "00" ? "00" : code.slice(0, 3);
}

function suffixNum(code: string): number {
  return code === "00" ? 0 : parseInt(code.slice(3), 10);
}

function TeamAccordion({
  prefix,
  items,
}: {
  prefix: string;
  items: [string, number][];
}) {
  const { t } = useLocale();
  const total = maxStickers(prefix);
  const owned = items.length;
  return (
    <details className="group border border-border rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between gap-2 px-3 py-2 bg-surface cursor-pointer hover:bg-surface-2 text-sm font-medium text-fg list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">
            {prefix === "00" ? "⭐" : flagOf(prefix)}
          </span>
          <span>{prefix === "00" ? t("specialLabel") : prefix}</span>
        </span>
        <span className="flex items-center gap-2">
          <ProgressBar value={owned} max={total} />
          <StickerCounter owned={owned} total={total} />
          <svg
            className="w-3.5 h-3.5 text-muted transition-transform group-open:rotate-180 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </summary>
      <div className="flex flex-wrap gap-2 p-3 border-t border-border">
        {items.map(([code, qty]) => (
          <Sticker key={code} code={code} qty={qty - 1} displayFlag />
        ))}
      </div>
    </details>
  );
}

interface GroupedTeams {
  group: GroupInfo;
  teams: { prefix: string; items: [string, number][] }[];
}

export default function StickerViewer() {
  const { t } = useLocale();
  const { inv, stickers } = useOwnStickers();
  const [filter, setFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("group");
  const [extrasOnly, setExtrasOnly] = useState(false);

  const q = filter.trim().toUpperCase();

  const byPrefix = useMemo(() => {
    const map = new Map<string, [string, number][]>();
    for (const code of stickers) {
      if (q && !code.includes(q)) continue;
      if (extrasOnly && inv[code] < 2) continue;
      const key = prefixOf(code);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push([code, inv[code]]);
    }
    for (const [, items] of map) {
      items.sort(([a], [b]) => suffixNum(a) - suffixNum(b));
    }
    return map;
  }, [stickers, inv, q, extrasOnly]);

  const grouped = useMemo(() => {
    const teamEntries = [...byPrefix.entries()];
    teamEntries.sort(([a], [b]) => a.localeCompare(b));

    const groupMap = new Map<number, GroupedTeams>();
    for (const [prefix, items] of teamEntries) {
      const g = groupOf(prefix);
      if (!groupMap.has(g.order)) {
        groupMap.set(g.order, { group: g, teams: [] });
      }
      groupMap.get(g.order)!.teams.push({ prefix, items });
    }

    return [...groupMap.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
  }, [byPrefix]);

  const flatTeams = useMemo(() => {
    const entries = [...byPrefix.entries()];
    entries.sort(([aPrefix, aItems], [bPrefix, bItems]) => {
      const aTotal = maxStickers(aPrefix);
      const bTotal = maxStickers(bPrefix);
      const aMissing = aTotal - aItems.length;
      const bMissing = bTotal - bItems.length;
      const aDone = aMissing === 0 ? 1 : 0;
      const bDone = bMissing === 0 ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return aMissing - bMissing;
    });
    return entries;
  }, [byPrefix]);

  const hasAny =
    sortMode === "completion"
      ? flatTeams.length > 0
      : grouped.some((g) => g.teams.length > 0);

  if (!hasAny) {
    return (
      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Filter
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExtrasOnly((v) => !v)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
                extrasOnly
                  ? "bg-copper text-white border-copper"
                  : "bg-surface text-muted border-border hover:border-gold"
              }`}
            >
              {t("extrasFilter")}
            </button>
            <SortStickers value={sortMode} onChange={setSortMode} />
          </div>
        </div>
        <p className="text-xs text-muted text-center">{t("noMatch")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Filter value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExtrasOnly((v) => !v)}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
              extrasOnly
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {t("extrasFilter")}
          </button>
          <SortStickers value={sortMode} onChange={setSortMode} />
        </div>
      </div>

      <div className="space-y-4">
        {sortMode === "completion" ? (
          <div className="space-y-2">
            {flatTeams.map(([prefix, items]) => (
              <TeamAccordion key={prefix} prefix={prefix} items={items} />
            ))}
          </div>
        ) : (
          grouped.map(({ group, teams }) =>
            teams.length === 0 ? null : (
              <div key={group.order}>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  {t(group.labelKey as never)}
                </h3>
                <div className="space-y-2">
                  {teams.map(({ prefix, items }) => (
                    <TeamAccordion key={prefix} prefix={prefix} items={items} />
                  ))}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}
