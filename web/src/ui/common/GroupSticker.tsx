import { useState, useMemo, useCallback } from "react";
import { flagOf } from "../../constants/flags.js";
import { useLocale } from "../../i18n/index.js";
import Sticker from "./Sticker.js";
import { maxStickers } from "../../constants/stickers.js";
import { StickerGroupByTeam } from "../../type/group.js";
import { countInventory, prefixOf } from "../../application/stickerTools.js";
import { Inventory } from "../../type/sticker.js";
import { MAX_STICKERS_PER_TEAM } from "../../constants/groups.js";
import { getMaxStickerPerTeam } from "../../application/teamsTools.js";
import ProgressBar from "./ProgressBar.js";
import { filterOnlyOwnedFromInventory } from "../../application/filterInventory.js";

function teamName(
  prefix: string,
  t: ReturnType<typeof useLocale>["t"],
): string {
  if (prefix === "00") return t("team_FWC");
  return t(`team_${prefix}` as never);
}

interface GroupStickerProps {
  groups: StickerGroupByTeam[];
  mode?: "regular" | "compact";
  displayFlag?: boolean;
  displayCount?: boolean;
  showMissing?: boolean;
}

function createAllStickerList(
  team: string,
  max: number,
  ownedStickers: Inventory,
): Inventory {
  return Object.fromEntries(
    new Array(max).fill(0).map((_, i) => {
      const code = team === "00" ? team : `${team}${i + 1}`;
      return [code, ownedStickers[code]];
    }),
  );
}

function makeExpandedState(
  groups: StickerGroupByTeam[],
  expanded: boolean = true,
) {
  try {
    return Object.fromEntries(groups.map(({ team }) => [team, expanded]) || []);
  } catch (e) {
    return {};
  }
}

export default function GroupSticker({
  groups = [],
  displayFlag = false,
  mode = "regular",
  showMissing = false,
}: GroupStickerProps) {
  const { t } = useLocale();

  const [expandedState, setExpandedState] = useState(makeExpandedState(groups));

  const isOpen = useCallback(
    (team: string) => {
      return expandedState[team];
    },
    [expandedState],
  );

  const allExpanded = useMemo(
    () => groups.every(({ team }) => expandedState[team]),
    [groups, expandedState],
  );

  const toggle = (team: string) => {
    setExpandedState((prev) => ({ ...prev, [team]: !prev[team] }));
  };

  const expandAll = useCallback(() => {
    setExpandedState(makeExpandedState(groups));
  }, [groups]);

  const collapseAll = useCallback(() => {
    setExpandedState(makeExpandedState(groups, false));
  }, [groups]);

  const getStickerList = useCallback(
    (team: string, stickers: Inventory): [string, number][] => {
      if (showMissing) {
        const max = getMaxStickerPerTeam(team);
        return Object.entries(createAllStickerList(team, max, stickers));
      }
      return Object.entries(stickers);
    },
    [groups, showMissing],
  );

  if (mode === "compact") {
    return (
      <div className="space-y-2">
        {groups.map(({ team, stickers }) => {
          const icon = flagOf(team);
          return (
            <div
              key={team}
              className="flex items-baseline gap-2 text-xs text-fg"
            >
              <span className="font-medium shrink-0 w-5 text-right">
                {icon}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {Object.entries(filterOnlyOwnedFromInventory(stickers)).map(
                  ([code]) => (
                    <Sticker
                      key={code}
                      code={code}
                      displayFlag={false}
                      compact
                    />
                  ),
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={expandAll}
          disabled={allExpanded}
          className="text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◎ {t("expandAll")}
        </button>
        <button
          onClick={collapseAll}
          disabled={!allExpanded}
          className="text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◎ {t("collapseAll")}
        </button>
      </div>
      {groups.map(({ team, stickers }) => {
        const icon = flagOf(team);
        return (
          <details
            key={team}
            open={isOpen(team)}
            className="group border border-border rounded-lg overflow-hidden"
          >
            <summary
              onClick={(e) => {
                e.preventDefault();
                toggle(team);
              }}
              className="flex flex-col gap-2 px-3 py-2 bg-surface cursor-pointer hover:bg-surface-2 text-sm font-medium text-fg list-none [&::-webkit-details-marker]:hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{icon}</span>
                <span>{team}</span>
                <span className="text-xs text-muted">
                  {countInventory(filterOnlyOwnedFromInventory(stickers))}/
                  {getMaxStickerPerTeam(team)}
                </span>
                <span className="ml-auto">
                  <svg
                    className={`w-3.5 h-3.5 text-muted transition-transform ${expandedState ? "rotate-180" : ""}`}
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
              </div>
              <span className="grow-1">
                <ProgressBar
                  max={getMaxStickerPerTeam(team)}
                  value={countInventory(filterOnlyOwnedFromInventory(stickers))}
                />
              </span>
            </summary>
            <div className="grid grid-cols-10 p-2 border-t border-border gap-2">
              {getStickerList(team, stickers).map(([code, qdy]) => (
                <Sticker
                  key={code}
                  code={code}
                  full
                  qty={qdy ?? 0}
                  displayFlag={displayFlag}
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
