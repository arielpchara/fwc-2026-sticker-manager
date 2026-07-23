import { useMemo, useState } from "react";
import { copy, messageMissing } from "../../application/copyTools.js";
import {
  countFiltered,
  filterInventory,
  hasActiveFilters,
  hasActiveFiltersHideMissing,
  type InventoryFilters,
} from "../../application/filterInventory.js";
import { sortTeams, type TeamSort } from "../../application/sortTeams.js";
import { useStickerGroup } from "../../hooks/useStickerGroup.js";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import AlbumSearch from "../common/AlbumSearch.js";
import Body from "../common/Body.js";
import type { LayoutMode } from "../common/DisplayMode.js";
import DisplayMode from "../common/DisplayMode.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";
import { Outlet } from "react-router-dom";
import { TOTAL_STICKERS } from "../../constants/stickers.js";

export default function MainPage() {
  const { inventory } = useStickers();
  const { t } = useLocale();

  const [filters, setFilters] = useState<InventoryFilters>({
    query: "",
    missing: false,
    extras: false,
    groups: [],
    teams: [],
  });
  const [layout, setLayout] = useState<LayoutMode>("group");
  const [compact, setCompact] = useState(false);
  const [sort, setSort] = useState<TeamSort>(null);

  const active = hasActiveFilters(filters);
  const hideMissing = hasActiveFiltersHideMissing(filters);
  const displayInv = useMemo(
    () => (active ? filterInventory(inventory, filters) : inventory),
    [inventory, filters, active],
  );
  const groups = useStickerGroup(displayInv);
  const filteredCount = countFiltered(displayInv);
  const stickerMode = compact ? ("compact" as const) : ("regular" as const);

  const sortedByTeam = useMemo(
    () =>
      sortTeams(
        groups.byTeam.filter((t): t is NonNullable<typeof t> => t != null),
        sort,
        !hideMissing,
      ),
    [groups.byTeam, sort, hideMissing],
  );
  const sortedByGroup = useMemo(
    () =>
      groups.byGroup.map((g) => ({
        ...g,
        teams: sortTeams(g.teams, sort, !hideMissing),
      })),
    [groups.byGroup, sort, hideMissing],
  );

  const handleCopyTrade = () => {
    copy(messageMissing(sortedByTeam));
  };

  return (
    <MainLayout>
      <Body>
        <AlbumSearch
          filters={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          totalInv={TOTAL_STICKERS}
          filteredCount={filteredCount}
        />
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

        <div className="mb-6">
          <DisplayMode
            layout={layout}
            onLayout={setLayout}
            compact={compact}
            onCompact={setCompact}
          />
        </div>

        {layout === "list" ? (
          sortedByTeam.length === 0 ? (
            <p className="text-xs text-muted text-center">{t("noMatch")}</p>
          ) : (
            <GroupSticker
              groups={sortedByTeam}
              mode={stickerMode}
              showMissing={!hideMissing}
            />
          )
        ) : sortedByGroup.length === 0 ? (
          <p className="text-xs text-muted text-center">{t("noMatch")}</p>
        ) : (
          sortedByGroup.map(({ labelKey, teams }) => (
            <section key={t(labelKey as never)} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t(labelKey as never)}
              </h2>
              <GroupSticker
                groups={teams}
                showMissing={!hideMissing}
                mode={stickerMode}
              />
            </section>
          ))
        )}
      </Body>
      <Outlet />
    </MainLayout>
  );
}
