import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import FindMissingOverlay from "../common/FindMissingOverlay.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";
import StickerActionDialog from "../common/StickerActionDialog.js";
import { TOTAL_STICKERS } from "../../constants/stickers.js";

export default function MainPage() {
  const { inventory } = useStickers();
  const { t } = useLocale();

  const [filters, setFilters] = useState<InventoryFilters>({
    query: "",
    missing: false,
    extras: false,
    emblem: false,
    groups: [],
    teams: [],
  });
  const [layout, setLayout] = useState<LayoutMode>("group");
  const [compact, setCompact] = useState(false);
  const [sort, setSort] = useState<TeamSort>(null);
  const [searchStuck, setSearchStuck] = useState(false);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const searchSentinelRef = useRef<HTMLDivElement>(null);

  const openStickerAction = useCallback((code: string) => {
    setActionCode(code);
  }, []);

  useEffect(() => {
    const el = searchSentinelRef.current;
    if (!el) return;
    let root: Element | null = el.parentElement;
    while (root) {
      const { overflowY } = getComputedStyle(root);
      if (overflowY === "auto" || overflowY === "scroll") break;
      root = root.parentElement;
    }
    const io = new IntersectionObserver(
      ([entry]) => setSearchStuck(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      <Body className="!pt-2 !pb-8 !space-y-4">
        <div>
          <div ref={searchSentinelRef} className="h-px w-full" aria-hidden />
          <div
            className={`sticky top-0 z-30 -mx-4 px-4 py-2 bg-bg/95 backdrop-blur-sm border-b border-border transition-shadow ${
              searchStuck ? "shadow-md shadow-black/40" : "border-transparent"
            }`}
          >
            <AlbumSearch
              filters={filters}
              onChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              totalInv={TOTAL_STICKERS}
              filteredCount={filteredCount}
              hideCount={searchStuck}
            />
          </div>
        </div>
        <CopyButton text={copyText} />

        <div>
          <DisplayMode
            layout={layout}
            onLayout={setLayout}
            compact={compact}
            onCompact={setCompact}
            onFind={() => setFindOpen(true)}
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
              onStickerClick={openStickerAction}
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
                onStickerClick={openStickerAction}
              />
            </section>
          ))
        )}

        <StickerActionDialog
          code={actionCode}
          open={actionCode !== null}
          onClose={() => setActionCode(null)}
        />

        <FindMissingOverlay
          open={findOpen}
          onClose={() => setFindOpen(false)}
          inventory={inventory}
          filters={filters}
        />
      </Body>
    </MainLayout>
  );
}
