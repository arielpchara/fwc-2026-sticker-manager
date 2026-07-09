import { useState, useMemo } from "react";
import { useStickerGroup } from "../../application/useStickerGroup.js";
import { useOwnStickers } from "../../application/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import {
  filterInventory,
  hasActiveFilters,
  countFiltered,
  type InventoryFilters,
} from "../../application/filterInventory.js";
import Body from "../common/Body.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";
import AlbumSearch from "../common/AlbumSearch.js";

export default function MainPage() {
  const { inv } = useOwnStickers();
  const { t } = useLocale();

  const [filters, setFilters] = useState<InventoryFilters>({
    query: "",
    missing: false,
    extras: false,
  });

  const active = hasActiveFilters(filters);
  const displayInv = useMemo(
    () => (active ? filterInventory(inv, filters) : inv),
    [inv, filters, active],
  );
  const groups = useStickerGroup(displayInv);
  const filteredCount = countFiltered(displayInv);
  const totalInv = Object.keys(inv).length;

  return (
    <MainLayout>
      <Body>
        <AlbumSearch
          filters={filters}
          onChange={setFilters}
          totalInv={totalInv}
          filteredCount={filteredCount}
        />

        {groups.byGroup.length === 0 ? (
          <p className="text-xs text-muted text-center">{t("noMatch")}</p>
        ) : (
          groups.byGroup.map(({ labelKey, teams }) => (
            <section key={t(labelKey as never)} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t(labelKey as never)}
              </h2>
              <GroupSticker groups={teams} showMissing={!active} />
            </section>
          ))
        )}
      </Body>
    </MainLayout>
  );
}
