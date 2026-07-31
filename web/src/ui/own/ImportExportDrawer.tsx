import { useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../storage/hooks.js";
import { stickerActions } from "../../storage/stickerSlice.js";
import { setEntries } from "../../storage/compareSlice.js";
import { replaceTrades } from "../../storage/tradeSlice.js";
import {
  serializeState,
  deserializeState,
  type ExportableState,
} from "../../application/exportImport.js";
import { useLocale } from "../../i18n/index.js";
import CopyButton from "../common/CopyButton.js";

const btnPrimary =
  "btn-glow inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg";
const btnSuccess =
  "btn-glow btn-glow-success inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg";

export default function ImportExportDrawer() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const root = useAppSelector((s) => s);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  const state: ExportableState = {
    sticker: root.sticker,
    compare: root.compare,
    trade: root.trade,
  };

  const handleCopyText = useCallback(async () => {
    setExporting(true);
    try {
      return await serializeState(state);
    } catch {
      setMessage({ type: "error", text: "Failed to export" });
      return "";
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
      dispatch(stickerActions.overwrite(restored.sticker.inventory));
      dispatch(setEntries(restored.compare.entries));
      dispatch(replaceTrades(restored.trade.trades));
      setImportText("");
      setMessage({ type: "ok", text: t("importSuccess") });
    } catch {
      setMessage({ type: "error", text: t("importError") });
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-medium text-fg">Export</p>
        <div className="flex gap-2">
          <CopyButton
            text={handleCopyText}
            disabled={exporting}
            label={exporting ? "..." : t("copyBtn")}
            className={btnPrimary}
          />
          <button
            onClick={handleDownload}
            disabled={exporting}
            className={btnPrimary}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? "..." : t("downloadBtn")}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-fg">Import</p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={t("importPlaceholder")}
          rows={4}
          className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className={btnSuccess}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t("importBtnRestore")}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-surface-2 rounded-lg p-3 space-y-1">
          <p
            className={`text-xs ${message.type === "ok" ? "text-gold" : "text-red-400"}`}
          >
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
