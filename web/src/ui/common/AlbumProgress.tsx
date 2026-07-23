import { useStickers } from "../../hooks/useStickers.js";
import { TOTAL_STICKERS } from "../../constants/stickers.js";
import { useLocale } from "../../i18n/index.js";
import ProgressBar from "./ProgressBar.js";
import { useMemo } from "react";
import { countExtrasFromInventory } from "../../application/stickerTools.js";

export default function AlbumProgress() {
  const { t } = useLocale();
  const { inventory } = useStickers();
  const myStickersCount = Object.keys(inventory).length;
  const missing = TOTAL_STICKERS - myStickersCount;
  const myExtrasCount = useMemo(
    () => countExtrasFromInventory(inventory),
    [inventory],
  );
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <span className="text-xs font-medium tabular-nums text-center">
        {t("albumProgress", {
          allStickers: myStickersCount,
          total: TOTAL_STICKERS,
          extras: myExtrasCount,
          missing,
        })}
      </span>
      <ProgressBar value={myStickersCount} max={TOTAL_STICKERS} size="md" />
    </div>
  );
}
