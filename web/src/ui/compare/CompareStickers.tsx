import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import type { CompareEntry } from "../../type/compare.js";
import CompareResult from "./CompareResult.js";
import CompareHistory from "./CompareHistory.js";
import { useCompareHistory } from "../../hooks/useCompareHistory.js";
import { countExtrasFromInventory } from "../../application/stickerTools.js";

export default function CompareStickers() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { inventory, extraInventory } = useStickers();
  const { entries, saveEntry, deleteEntry } = useCompareHistory();
  const [mode, setMode] = useState<"receive" | "give">("receive");
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<{
    missing: string[];
    offer: string[];
    count: number;
  } | null>(null);

  const myExtrasCount = useMemo(
    () => countExtrasFromInventory(inventory),
    [inventory],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // if (!text.trim()) return;
    // if (mode === "receive") {
    //   const r = compareWith(text, inv);
    //   setResult({ missing: r.missing, offer: [], count: r.count });
    //   saveEntry({
    //     name: label || t("historyUnnamed"),
    //     text,
    //     savedAt: Date.now(),
    //     stickers: r.missing,
    //     mode: "receive",
    //   });
    // } else {
    //   const r = canGive(text, extras);
    //   setResult({ missing: [], offer: r.offer, count: r.count });
    //   saveEntry({
    //     name: label || t("historyUnnamed"),
    //     text,
    //     savedAt: Date.now(),
    //     stickers: r.offer,
    //     mode: "give",
    //   });
    // }
  }

  function handleReopen(entry: CompareEntry) {
    setMode(entry.mode);
    setLabel(entry.name);
    setText(entry.text);
    // if (entry.mode === "receive") {
    //   const r = compareWith(entry.text, inv);
    //   setResult({ missing: r.missing, offer: [], count: r.count });
    // } else {
    //   const r = canGive(entry.text, extras);
    //   setResult({ missing: [], offer: r.offer, count: r.count });
    // }
  }

  function toggleMode(m: "receive" | "give") {
    setMode(m);
    setResult(null);
  }

  const displayItems =
    mode === "receive" ? (result?.missing ?? null) : (result?.offer ?? null);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => toggleMode("receive")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              mode === "receive"
                ? "bg-gold text-bg"
                : "bg-surface text-muted hover:bg-surface-2"
            }`}
          >
            {t("compareReceiveTab")}
          </button>
          <button
            type="button"
            onClick={() => toggleMode("give")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              mode === "give"
                ? "bg-gold text-bg"
                : "bg-surface text-muted hover:bg-surface-2"
            }`}
          >
            {t("compareGiveTab")}
          </button>
        </div>

        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t("historyLabelPlaceholder")}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("comparePlaceholder")}
          rows={3}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gold hover:bg-gold-bright disabled:bg-surface-2 text-bg text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {t("compareBtn")}
        </button>
      </form>

      {result &&
        displayItems &&
        (displayItems.length === 0 ? (
          <p className="text-sm text-green-700 font-medium">
            {t("compareAllOwned")}
          </p>
        ) : (
          <CompareResult
            items={displayItems}
            mode={mode}
            extras={extraInventory}
          />
        ))}

      <hr className="border-border" />

      <CompareHistory
        entries={Object.values(entries)}
        onTradeNavigate={(label) => navigate(`/compare/${label}`)}
        onReopen={handleReopen}
        onDelete={deleteEntry}
      />
    </div>
  );
}
