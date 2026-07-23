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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("ownPlaceholder")}
        rows={3}
        className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />

      <div className="flex gap-2">
        <button
          onClick={() => handleAction("overwrite")}
          disabled={!text.trim()}
          className="bg-gold hover:bg-gold-bright disabled:bg-surface-2 text-bg text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {t("overwriteBtn")}
        </button>
        <button
          onClick={() => handleAction("increment")}
          disabled={!text.trim()}
          className="bg-gold-dim hover:bg-gold disabled:bg-surface-2 text-fg text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {t("incrementBtn")}
        </button>
        <button
          onClick={() => handleAction("decrement")}
          disabled={!text.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:bg-surface-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
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
    </div>
  );
}
