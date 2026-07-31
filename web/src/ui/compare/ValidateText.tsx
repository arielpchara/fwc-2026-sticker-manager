import { useMemo, useState } from "react";
import { extractStickerFromText } from "../../application/stickerService.js";
import { useLocale } from "../../i18n/index.js";

export default function ValidateText() {
  const { t } = useLocale();
  const [text, setText] = useState("");

  const stickers = useMemo(
    () => (text.trim() ? extractStickerFromText(text) : null),
    [text],
  );
  const codes = stickers ? Object.keys(stickers).sort() : [];
  const count = codes.reduce((n, c) => n + (stickers?.[c] ?? 0), 0);

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("comparePlaceholder")}
        rows={6}
        className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />

      {stickers && (
        <div className="bg-surface-2 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gold">
            {codes.length === 0
              ? t("validateEmpty")
              : t("validateResult", { n: count, unique: codes.length })}
          </p>
          <div className="max-h-64 overflow-y-auto flex flex-wrap gap-1">
            {codes.map((code) => (
              <span
                key={code}
                className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded"
              >
                {code}
                {(stickers[code] ?? 0) > 1 ? ` ×${stickers[code]}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
