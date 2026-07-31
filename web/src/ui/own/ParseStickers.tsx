import { useState } from "react";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";

type Action = "overwrite" | "increment" | "decrement";

export function ParseStickers() {
  const { t } = useLocale();
  const { overwriteInventory, increaseInventory, subtractInventory } =
    useStickers();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    count: number;
    codes: string[];
  } | null>(null);

  function handleAction(action: Action) {
    if (!text.trim()) return;
    const fn =
      action === "overwrite"
        ? overwriteInventory
        : action === "increment"
          ? increaseInventory
          : subtractInventory;
    const res = fn(text);
    setText("");
    setResult({ count: res.count, codes: Object.keys(res.stickers) });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted leading-relaxed">{t("ownHelp")}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("ownPlaceholder")}
        rows={4}
        className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />

      <div className="flex gap-2">
        <button
          onClick={() => handleAction("overwrite")}
          disabled={!text.trim()}
          className="btn-glow inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t("overwriteBtn")}
        </button>
        <button
          onClick={() => handleAction("increment")}
          disabled={!text.trim()}
          className="btn-glow btn-glow-success inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("incrementBtn")}
        </button>
        <button
          onClick={() => handleAction("decrement")}
          disabled={!text.trim()}
          className="btn-glow btn-glow-danger inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          {t("decrementBtn")}
        </button>
      </div>

      {result && (
        <div className="bg-surface-2 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gold">
            {t("resultFeedback", { n: result.count })}
          </p>
          <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1">
            {result.codes.map((code) => (
              <span
                key={code}
                className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-2 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-medium text-fg">{t("ownFormatsTitle")}</p>
        <ul className="text-[11px] text-muted space-y-1 font-mono">
          <li>{t("ownFormatCodes")}</li>
          <li>{t("ownFormatQty")}</li>
          <li>{t("ownFormatGrouped")}</li>
        </ul>
        <p className="text-[11px] text-muted">{t("ownFormatMixed")}</p>
      </div>
    </div>
  );
}
