import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterInventory,
  type InventoryFilters,
} from "../../application/filterInventory.js";
import { numberOf, prefixOf } from "../../application/stickerTools.js";
import { GROUPS } from "../../constants/groups.js";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import type { Inventory } from "../../type/sticker.js";
import Sticker from "./Sticker.js";

const TEAM_ORDER = GROUPS.flatMap((g) => g.prefixes);
const TEAM_INDEX: Record<string, number> = Object.fromEntries(
  TEAM_ORDER.map((t, i) => [t, i]),
);

function compareTeamNumber(a: string, b: string): number {
  const ta = prefixOf(a);
  const tb = prefixOf(b);
  const ia = TEAM_INDEX[ta] ?? 999;
  const ib = TEAM_INDEX[tb] ?? 999;
  if (ia !== ib) return ia - ib;
  if (ta !== tb) return ta.localeCompare(tb);
  return numberOf(a) - numberOf(b);
}

function ConfirmFindDialog({
  code,
  marked,
  open,
  onClose,
  onConfirm,
}: {
  code: string | null;
  marked: boolean;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLocale();
  if (!open || !code) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        className="w-full max-w-sm bg-surface border border-border rounded-xl shadow-xl p-5 space-y-4 mb-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Sticker code={code} qty={marked ? 1 : 0} displayFlag />
          <div className="min-w-0">
            <p className="text-base font-semibold text-fg tracking-wide">{code}</p>
            <p className="text-xs text-muted">
              {marked
                ? t("findMissingUnmarkHint")
                : t("findMissingConfirmHint")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-fg"
          >
            {t("findMissingCancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg ${
              marked
                ? "btn-glow btn-glow-danger"
                : "btn-glow btn-glow-success"
            }`}
          >
            {marked ? t("findMissingUnmark") : t("findMissingFound")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindMissingOverlay({
  open,
  onClose,
  inventory,
  filters,
}: {
  open: boolean;
  onClose: () => void;
  inventory: Inventory;
  filters: InventoryFilters;
}) {
  const { t } = useLocale();
  const { setStickerCount } = useStickers();
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [dialogCode, setDialogCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFound(new Set());
    setDialogCode(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const missingCodes = useMemo(() => {
    const miss = filterInventory(inventory, {
      ...filters,
      missing: true,
      extras: false,
    });
    return Object.keys(miss).sort(compareTeamNumber);
  }, [inventory, filters]);

  const openDialog = useCallback((code: string) => {
    setDialogCode(code);
  }, []);

  const confirmDialog = useCallback(() => {
    if (!dialogCode) return;
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(dialogCode)) next.delete(dialogCode);
      else next.add(dialogCode);
      return next;
    });
    setDialogCode(null);
  }, [dialogCode]);

  const applyFound = useCallback(() => {
    if (found.size === 0) return;
    for (const code of found) {
      setStickerCount(code, 1);
    }
    setFound(new Set());
    onClose();
  }, [found, setStickerCount, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-bg">
      <header className="shrink-0 flex items-center gap-3 px-3 py-2.5 border-b border-border bg-surface pt-[max(0.625rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-1 text-muted hover:text-fg rounded-lg"
          aria-label={t("findMissingClose")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-fg truncate">
            {t("findMissingTitle")}
          </h1>
          <p className="text-[11px] text-muted">
            {t("findMissingStatus", {
              missing: missingCodes.length,
              selected: found.size,
            })}
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1.5">
        {missingCodes.length === 0 ? (
          <p className="text-sm text-muted text-center py-16">
            {t("findMissingEmpty")}
          </p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-1.5">
            {missingCodes.map((code) => {
              const marked = found.has(code);
              return (
                <Sticker
                  key={code}
                  code={code}
                  size="lg"
                  full
                  qty={marked ? 1 : 0}
                  displayFlag
                  onClick={() => openDialog(code)}
                  className={
                    marked
                      ? "ring-2 ring-gold ring-offset-1 ring-offset-bg"
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t border-border bg-surface px-4 pt-3 z-[101]"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={applyFound}
          disabled={found.size === 0}
          className="btn-glow w-full text-sm font-semibold py-3 rounded-xl disabled:opacity-40"
        >
          {t("findMissingApply", { n: found.size })}
        </button>
      </div>

      <ConfirmFindDialog
        code={dialogCode}
        marked={dialogCode !== null && found.has(dialogCode)}
        open={dialogCode !== null}
        onClose={() => setDialogCode(null)}
        onConfirm={confirmDialog}
      />
    </div>
  );
}
