import { useStickers } from "../../hooks/useStickers.js";
import { TOTAL_STICKERS } from "../../constants/stickers.js";
import { useLocale } from "../../i18n/index.js";
import ProgressBar from "./ProgressBar.js";
import { useMemo } from "react";
import {
  filterOnlyExtrasFromInventory,
  filterOnlyOwnedFromInventory,
} from "../../application/filterInventory.js";
import { countInventory } from "../../application/stickerTools.js";

export default function AlbumProgress() {
  const { t } = useLocale();
  const { inventory } = useStickers();
  const myStickersCount = useMemo(
    () => countInventory(filterOnlyOwnedFromInventory(inventory)),
    [inventory],
  );
  const missing = TOTAL_STICKERS - myStickersCount;
  const myExtrasCount = useMemo(
    () => countInventory(filterOnlyExtrasFromInventory(inventory)),
    [inventory],
  );
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <span className="text-xs font-medium tabular-nums text-center">
        {t("albumProgress", {
          owned: myStickersCount,
          total: TOTAL_STICKERS,
          extras: myExtrasCount,
          missing,
          progress:
            Math.ceil((myStickersCount / TOTAL_STICKERS) * 1000) / 10 + "%",
        })}
      </span>
      <ProgressBar value={myStickersCount} max={TOTAL_STICKERS} size="md" />
    </div>
  );
}
