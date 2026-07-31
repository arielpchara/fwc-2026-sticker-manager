import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import type { CompareEntry } from "../../type/compare.js";
import CompareResult from "./CompareResult.js";
import CompareHistory from "./CompareHistory.js";
import { useCompareHistory } from "../../hooks/useCompareHistory.js";
import { useTrade } from "../../hooks/useTrade.js";
import { findMissing, findOffer } from "../../application/compareTools.js";
import { trader } from "../../application/traderTool.js";

export default function CompareStickers() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { inventory, extraInventory } = useStickers();
  const { entries, saveEntry, deleteEntry } = useCompareHistory();
  const { trades: storedTrades, saveTrade } = useTrade();
  const [mode, setMode] = useState<"receive" | "offer">("receive");
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<{
    missing: string[];
    offer: string[];
    count: number;
  } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (mode === "receive") {
      const missing = findMissing(text, inventory);
      setResult({ missing, offer: [], count: missing.length });
      saveEntry({
        name: label || t("historyUnnamed"),
        text,
        savedAt: Date.now(),
        stickers: missing,
        mode: "receive",
      });
    } else {
      const offer = findOffer(text, extraInventory);
      setResult({ missing: [], offer, count: offer.length });
      saveEntry({
        name: label || t("historyUnnamed"),
        text,
        savedAt: Date.now(),
        stickers: offer,
        mode: "offer",
      });
    }
  }

  function handleReopen(entry: CompareEntry) {
    setMode(entry.mode);
    setLabel(entry.name);
    setText(entry.text);
    const stickers =
      entry.mode === "receive"
        ? findMissing(entry.text, inventory)
        : findOffer(entry.text, extraInventory);
    setResult(
      entry.mode === "receive"
        ? { missing: stickers, offer: [], count: stickers.length }
        : { missing: [], offer: stickers, count: stickers.length },
    );
    saveEntry({
      ...entry,
      stickers,
      savedAt: Date.now(),
    });
  }

  function toggleMode(m: "receive" | "offer") {
    if (m === mode) return;
    setMode(m);
    setResult(null);
    const name = label.trim() || t("historyUnnamed");
    setText(entries[`${m}-${name}`]?.text ?? "");
  }

  const displayItems =
    mode === "receive" ? (result?.missing ?? null) : (result?.offer ?? null);

  const history = (
    <CompareHistory
      entries={Object.values(entries)}
      onTradeNavigate={(label) => {
        if (!storedTrades[label]?.isLock) {
          const offer = entries[`offer-${label}`]?.stickers ?? [];
          const receive = entries[`receive-${label}`]?.stickers ?? [];
          saveTrade(label, trader(offer, receive), true);
        }
        navigate(`/compare/${label}`);
      }}
      onReopen={handleReopen}
      onDelete={deleteEntry}
    />
  );

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6">
      <aside className="md:w-60 shrink-0 md:border-r border-border md:pr-4 md:max-h-[calc(100dvh-12rem)] md:overflow-y-auto">
        {history}
      </aside>
      <div className="flex-1 min-w-0 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 items-center">
            <button
              type="button"
              role="switch"
              aria-checked={mode === "offer"}
              onClick={() =>
                toggleMode(mode === "receive" ? "offer" : "receive")
              }
              className="relative inline-flex items-center rounded-lg bg-surface-2 p-0.5 border border-border"
            >
              <span
                className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-transform duration-150 ${
                  mode === "offer" ? "translate-x-full" : "translate-x-0"
                } bg-gold shadow-[0_0_10px_rgba(201,162,39,0.35)]`}
              />
              <span
                className={`relative z-10 px-3 py-1.5 text-xs font-medium min-w-[4.5rem] text-center transition-colors ${
                  mode === "receive" ? "text-bg" : "text-muted"
                }`}
              >
                {t("compareReceiveTab")}
              </span>
              <span
                className={`relative z-10 px-3 py-1.5 text-xs font-medium min-w-[4.5rem] text-center transition-colors ${
                  mode === "offer" ? "text-bg" : "text-muted"
                }`}
              >
                {t("compareOfferTab")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/compare/validate")}
              className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-muted hover:bg-surface-2 transition"
            >
              {t("btnValidate")}
            </button>
          </div>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("historyLabelPlaceholder")}
            className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="text-xs text-muted leading-relaxed">{t("compareHelp")}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("comparePlaceholder")}
            rows={4}
            className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <div className="bg-surface-2 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-medium text-fg">{t("ownFormatsTitle")}</p>
            <ul className="text-[11px] text-muted space-y-1 font-mono">
              <li>{t("ownFormatCodes")}</li>
              <li>{t("ownFormatQty")}</li>
              <li>{t("ownFormatGrouped")}</li>
            </ul>
            <p className="text-[11px] text-muted">{t("ownFormatMixed")}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-glow text-sm font-medium px-4 py-2 rounded-lg"
            >
              {t("compareBtn")}
            </button>
          </div>
        </form>

        {result &&
          displayItems &&
          (displayItems.length === 0 ? (
            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-xs text-gold">{t("compareAllOwned")}</p>
            </div>
          ) : (
            <CompareResult items={displayItems} mode={mode} />
          ))}
      </div>
    </div>
  );
}
