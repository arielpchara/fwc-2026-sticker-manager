import { useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../storage/hooks.js";
import { setOwn } from "../../storage/stickerSlice.js";
import { setEntries } from "../../storage/compareSlice.js";
import { replaceTrades } from "../../storage/tradeSlice.js";
import {
  serializeState,
  deserializeState,
  type ExportableState,
} from "../../application/exportImport.js";
import { copy } from "../../application/copyTools.js";
import { useLocale } from "../../i18n/index.js";

export default function ImportExportDrawer() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const root = useAppSelector((s) => s);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const state: ExportableState = {
    sticker: root.sticker,
    compare: root.compare,
    trade: root.trade,
  };

  const handleCopy = useCallback(async () => {
    setExporting(true);
    try {
      const out = await serializeState(state);
      copy(out);
      setMessage({ type: "ok", text: "Copied to clipboard" });
    } catch {
      setMessage({ type: "error", text: "Failed to export" });
    } finally {
      setExporting(false);
    }
  }, [state]);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    try {
      const out = await serializeState(state);
      const blob = new Blob([out], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sticker-trade-backup.txt";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: "error", text: "Failed to export" });
    } finally {
      setExporting(false);
    }
  }, [state]);

  async function handleImport() {
    try {
      const restored = await deserializeState(importText);
      dispatch(setOwn(restored.sticker.inv));
      dispatch(setEntries(restored.compare.entries));
      dispatch(replaceTrades(restored.trade.trades));
      setImportText("");
      setMessage({ type: "ok", text: t("importSuccess") });
    } catch {
      setMessage({ type: "error", text: t("importError") });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-muted mb-1">Export</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={exporting}
            className="px-3 py-1 text-sm bg-gold text-black rounded hover:opacity-80 disabled:opacity-50"
          >
            {exporting ? "..." : t("copyBtn")}
          </button>
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="px-3 py-1 text-sm bg-surface-2 text-fg rounded hover:opacity-80 disabled:opacity-50"
          >
            {exporting ? "..." : t("downloadBtn")}
          </button>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-semibold text-muted mb-1">Import</h3>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={t("importPlaceholder")}
          rows={4}
          className="w-full text-xs font-mono bg-surface-2 text-fg rounded p-2 resize-none"
        />
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className="mt-2 px-3 py-1 text-sm bg-gold text-black rounded hover:opacity-80 disabled:opacity-50"
        >
          {t("importBtnRestore")}
        </button>
      </div>

      {message && (
        <div
          className={`text-sm p-2 rounded ${
            message.type === "ok"
              ? "bg-green-900 text-green-200"
              : "bg-red-900 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
