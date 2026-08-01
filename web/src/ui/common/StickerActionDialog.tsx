import { useEffect, useState } from "react";
import { useStickers } from "../../hooks/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import BottomSheet from "./BottomSheet.js";
import Modal from "./Modal.js";
import Sticker from "./Sticker.js";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconMinus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function IconExtras({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ActionContent({
  code,
  onClose,
}: {
  code: string;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const {
    inventory,
    incrementSticker,
    decrementSticker,
    setStickerCount,
    removeExtras,
    removeAll,
  } = useStickers();
  const qty = inventory[code] ?? 0;
  const [countInput, setCountInput] = useState(String(qty));

  useEffect(() => {
    setCountInput(String(qty));
  }, [qty, code]);

  function applyCount() {
    const n = Number.parseInt(countInput, 10);
    if (Number.isNaN(n) || n < 0) return;
    setStickerCount(code, n);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Sticker code={code} qty={qty} displayFlag />
        <div className="min-w-0">
          <p className="text-base font-semibold text-fg tracking-wide">{code}</p>
          <p className="text-xs text-muted">
            {t("stickerActionQty", { n: qty })}
            {qty > 1 ? ` · ${t("stickerActionExtras", { n: qty - 1 })}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:hidden">
        <button
          type="button"
          onClick={() => incrementSticker(code)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-xs font-medium border border-green-700/50 bg-green-600/20 text-green-400"
        >
          <IconPlus className="w-6 h-6" />
          {t("stickerActionPlus")}
        </button>
        <button
          type="button"
          onClick={() => decrementSticker(code)}
          disabled={qty <= 0}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-xs font-medium border border-amber-700/50 bg-amber-600/20 text-amber-400 disabled:opacity-40"
        >
          <IconMinus className="w-6 h-6" />
          {t("stickerActionMinus")}
        </button>
        <button
          type="button"
          onClick={() => removeExtras(code)}
          disabled={qty <= 1}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-xs font-medium border border-border bg-surface-2 text-fg disabled:opacity-40"
        >
          <IconExtras className="w-6 h-6 text-muted" />
          {t("stickerActionRemoveExtras")}
        </button>
        <button
          type="button"
          onClick={() => {
            removeAll(code);
            onClose();
          }}
          disabled={qty <= 0}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-xs font-medium border border-red-800/50 bg-red-600/15 text-red-400 disabled:opacity-40"
        >
          <IconTrash className="w-6 h-6" />
          {t("stickerActionRemoveAll")}
        </button>
      </div>

      <div className="hidden md:flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => incrementSticker(code)}
          className="btn-glow btn-glow-success inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg"
        >
          <IconPlus className="w-4 h-4" />
          {t("stickerActionPlus")}
        </button>
        <button
          type="button"
          onClick={() => decrementSticker(code)}
          disabled={qty <= 0}
          className="btn-glow btn-glow-secondary inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg"
        >
          <IconMinus className="w-4 h-4" />
          {t("stickerActionMinus")}
        </button>
        <button
          type="button"
          onClick={() => removeExtras(code)}
          disabled={qty <= 1}
          className="btn-glow btn-glow-secondary inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg"
        >
          <IconExtras className="w-4 h-4" />
          {t("stickerActionRemoveExtras")}
        </button>
        <button
          type="button"
          onClick={() => {
            removeAll(code);
            onClose();
          }}
          disabled={qty <= 0}
          className="btn-glow btn-glow-danger inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg"
        >
          <IconTrash className="w-4 h-4" />
          {t("stickerActionRemoveAll")}
        </button>
      </div>

      <div className="flex items-end gap-2 pt-1 border-t border-border">
        <label className="flex-1 min-w-0 space-y-1">
          <span className="text-xs text-muted">{t("stickerActionChangeCount")}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCount();
            }}
            className="w-full border border-border bg-bg rounded-lg px-3 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>
        <button
          type="button"
          onClick={applyCount}
          className="btn-glow shrink-0 text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          {t("stickerActionApply")}
        </button>
      </div>
    </div>
  );
}

export default function StickerActionDialog({
  code,
  open,
  onClose,
}: {
  code: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const desktop = useIsDesktop();
  const [cached, setCached] = useState(code);
  useEffect(() => {
    if (code) setCached(code);
  }, [code]);

  const active = code ?? cached;
  if (!active) return null;

  const title = t("stickerActionTitle", { code: active });
  const body = <ActionContent code={active} onClose={onClose} />;

  if (desktop) {
    return (
      <Modal open={open} onClose={onClose} title={title}>
        {body}
      </Modal>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {body}
    </BottomSheet>
  );
}
