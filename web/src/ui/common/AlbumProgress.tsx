import { useOwnStickers } from "../../application/useStickers.js";
import { TOTAL_STICKERS } from "../../constants/stickers.js";
import { useLocale } from "../../i18n/index.js";
import ProgressBar from "./ProgressBar.js";

export default function AlbumProgress() {
  const { t } = useLocale();
  const { inv, totalExtras } = useOwnStickers();
  const owned = Object.keys(inv).length;
  const missing = TOTAL_STICKERS - owned;
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <span className="text-xs font-medium tabular-nums text-center">
        {t("albumProgress", {
          owned,
          total: TOTAL_STICKERS,
          extras: totalExtras,
          missing,
        })}
      </span>
      <ProgressBar value={owned} max={TOTAL_STICKERS} size="md" />
    </div>
  );
}
