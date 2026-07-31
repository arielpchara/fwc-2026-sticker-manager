import { useState } from "react";
import { useLocale } from "../../i18n/index.js";
import Sticker from "../common/Sticker.js";

interface TradeChangeStickerProps {
  sticker: string[];
  initialSelected?: string[];
  onSubmit: (selected: string[]) => void;
  onClose: () => void;
}

export default function TradeChangeSticker({
  sticker,
  initialSelected = [],
  onSubmit,
  onClose,
}: TradeChangeStickerProps) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg p-4 w-80 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-fg mb-2">
          {t("tradeChangeTitle")}
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
          {sticker.map((code) => (
            <label
              key={code}
              className="flex items-center gap-1 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selected.has(code)}
                onChange={() => toggle(code)}
                className="accent-gold"
              />
              <Sticker code={code} displayFlag />
            </label>
          ))}
        </div>
        <button
          onClick={() => onSubmit([...selected])}
          className="btn-glow mt-3 w-full text-xs font-medium rounded-lg py-1.5"
        >
          {t("tradeChangeSubmit", { n: selected.size })}
        </button>
      </div>
    </div>
  );
}
