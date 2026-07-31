import { useCallback, useMemo, useState } from "react";
import { messageMissing } from "../../application/copyTools.js";
import {
  countFiltered,
  filterInventory,
  filterOnlyOwnedFromInventory,
  filterStickersForCopy,
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
import CopyButton from "../common/CopyButton.js";
import type { LayoutMode } from "../common/DisplayMode.js";
import DisplayMode from "../common/DisplayMode.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";
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
  const filteredCount = countFiltered(filterOnlyOwnedFromInventory(displayInv));
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
        group: sortTeams(g.teams, sort, !hideMissing),
      })),
    [groups.byGroup, sort, hideMissing],
  );

  const copyText = useCallback(() => {
    const includeZero = filters.missing;
    const teams =
      layout === "list" ? sortedByTeam : sortedByGroup.flatMap((g) => g.group);
    const count = teams.reduce(
      (n, { stickers }) =>
        n + Object.keys(filterStickersForCopy(stickers, includeZero)).length,
      0,
    );
    const title = t(includeZero ? "copyWantTitle" : "copyHaveTitle");
    return messageMissing(teams, `${title} (${count})`, "", includeZero);
  }, [layout, sortedByTeam, sortedByGroup, filters.missing, t]);

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
        <CopyButton text={copyText} />

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
              group={sortedByTeam}
              mode={stickerMode}
              showMissing={!hideMissing}
              includeZero={filters.missing}
            />
          )
        ) : sortedByGroup.length === 0 ? (
          <p className="text-xs text-muted text-center">{t("noMatch")}</p>
        ) : (
          sortedByGroup.map(({ labelKey, group }) => (
            <section key={t(labelKey as never)} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t(labelKey as never)}
              </h2>
              <GroupSticker
                group={group}
                showMissing={!hideMissing}
                mode={stickerMode}
                includeZero={filters.missing}
              />
            </section>
          ))
        )}
      </Body>
    </MainLayout>
  );
}
