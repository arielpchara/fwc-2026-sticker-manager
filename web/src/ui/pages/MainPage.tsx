import { useState, useMemo } from "react";
import { useStickerGroup } from "../../application/useStickerGroup.js";
import { useOwnStickers } from "../../application/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import {
  filterInventory,
  hasActiveFilters,
  countFiltered,
  type InventoryFilters,
  hasActiveFiltersHideMissing,
} from "../../application/filterInventory.js";
import { sortTeams, type TeamSort } from "../../application/sortTeams.js";
import Body from "../common/Body.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";
import AlbumSearch from "../common/AlbumSearch.js";
import DisplayMode from "../common/DisplayMode.js";
import type { LayoutMode } from "../common/DisplayMode.js";

export default function MainPage() {
  const { inv } = useOwnStickers();
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
  const [sort, setSort] = useState<TeamSort>("code");

  const active = hasActiveFilters(filters);
  const hideMissing = hasActiveFiltersHideMissing(filters);
  const displayInv = useMemo(
    () => (active ? filterInventory(inv, filters) : inv),
    [inv, filters, active],
  );
  const groups = useStickerGroup(displayInv);
  const filteredCount = countFiltered(displayInv);
  const totalInv = Object.keys(inv).length;
  const stickerMode = compact ? "compact" as const : "regular" as const;

  const sortedByTeam = useMemo(
    () => sortTeams(groups.byTeam.filter((t): t is NonNullable<typeof t> => t != null), sort, !hideMissing),
    [groups.byTeam, sort, hideMissing],
  );
  const sortedByGroup = useMemo(
    () => groups.byGroup.map((g) => ({ ...g, teams: sortTeams(g.teams, sort, !hideMissing) })),
    [groups.byGroup, sort, hideMissing],
  );

  return (
    <MainLayout>
      <Body>
        <AlbumSearch
          filters={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          totalInv={totalInv}
          filteredCount={filteredCount}
        />

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
            <GroupSticker groups={sortedByTeam} mode={stickerMode} showMissing={!hideMissing} />
          )
        ) : sortedByGroup.length === 0 ? (
          <p className="text-xs text-muted text-center">{t("noMatch")}</p>
        ) : (
          sortedByGroup.map(({ labelKey, teams }) => (
            <section key={t(labelKey as never)} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t(labelKey as never)}
              </h2>
              <GroupSticker groups={teams} showMissing={!hideMissing} mode={stickerMode} />
            </section>
          ))
        )}
      </Body>
    </MainLayout>
  );
}
