import { useCallback } from "react";
import { useLocale } from "../../i18n/index.js";
import { useStickerGroup } from "../../hooks/useStickerGroup.js";
import { copy, messageStickerListByTeam } from "../../application/copyTools.js";
import GroupSticker from "../common/GroupSticker.js";

export default function CompareResult({
  items,
  mode,
}: {
  items: string[];
  mode: "receive" | "give";
}) {
  const { t } = useLocale();
  const itemMap = Object.fromEntries(items.map((c) => [c, 1]));
  const groups = useStickerGroup(itemMap);

  const handleCopy = useCallback(() => {
    const message = messageStickerListByTeam(
      groups.byTeam,
      `${t(mode === "receive" ? "copyWantTitle" : "copyGiveTitle")} (${items.length})`,
      "",
    ).trim();
    copy(message);
  }, [items, groups, mode, t]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-fg">
          {mode === "receive"
            ? t("compareCanReceive", { n: items.length })
            : t("compareCanGive", { n: items.length })}
        </p>
        <button
          onClick={handleCopy}
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
      </div>
      <GroupSticker groups={groups.byTeam} mode="compact" />
    </div>
  );
}
