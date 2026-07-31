import { useCallback } from "react";
import { useLocale } from "../../i18n/index.js";
import { useStickerGroup } from "../../hooks/useStickerGroup.js";
import { messageStickerListByTeam } from "../../application/copyTools.js";
import CopyButton from "../common/CopyButton.js";
import GroupSticker from "../common/GroupSticker.js";

export default function CompareResult({
  items,
  mode,
}: {
  items: string[];
  mode: "receive" | "offer";
}) {
  const { t } = useLocale();
  const itemMap = Object.fromEntries(items.map((c) => [c, 1]));
  const groups = useStickerGroup(itemMap);

  const copyText = useCallback(
    () =>
      messageStickerListByTeam(
        groups.byTeam,
        `${t(mode === "receive" ? "copyWantTitle" : "copyOfferTitle")} (${items.length})`,
        "",
      ).trim(),
    [items, groups, mode, t],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-fg">
          {mode === "receive"
            ? t("compareCanReceive", { n: items.length })
            : t("compareCanOffer", { n: items.length })}
        </p>
        <CopyButton text={copyText} />
      </div>
      <GroupSticker group={groups.byTeam} mode="compact" />
    </div>
  );
}
