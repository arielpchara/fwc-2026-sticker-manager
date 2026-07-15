import { useMemo, useState, useRef, useEffect } from "react";
import { allAlbumCodes } from "../../application/filterInventory.js";
import { GROUPS } from "../../constants/groups.js";
import { useLocale } from "../../i18n/index.js";

const ALL_CODES = allAlbumCodes();
const TEAM_PREFIXES = GROUPS.flatMap((g) => g.prefixes).concat(["FWC", "00"]);

export default function StickerSuggestInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}) {
  const { t } = useLocale();
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = value.toUpperCase().trim();
    if (!q) return [];

    if (q.length < 3)
      return TEAM_PREFIXES.filter((p) => p.startsWith(q)).slice(0, 5);

    if (TEAM_PREFIXES.includes(q))
      return ALL_CODES.filter((c) => c.startsWith(q)).slice(0, 5);

    return ALL_CODES.filter((c) => c.startsWith(q)).slice(0, 5);
  }, [value]);

  useEffect(() => {
    if (!focused) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [focused]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ target: { value: e.target.value.toUpperCase() } });
  }

  function handleSelect(code: string) {
    onChange({ target: { value: code } });
    setFocused(false);
  }

  function handleClear() {
    onChange({ target: { value: "" } });
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => setFocused(true)}
        placeholder={t("filterPlaceholder")}
        className="w-full border border-border bg-surface rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-0.5"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-auto">
          {suggestions.map((code) => (
            <button
              key={code}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(code);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 font-mono"
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
