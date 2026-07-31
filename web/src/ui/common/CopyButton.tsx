import { useEffect, useRef, useState } from "react";
import { copy } from "../../application/copyTools.js";
import { useLocale } from "../../i18n/index.js";

type Props = {
  text: string | (() => string | Promise<string>);
  label?: string;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
};

export default function CopyButton({
  text,
  label,
  className = "text-xs text-muted hover:text-fg flex items-center gap-1",
  disabled,
  showIcon = true,
}: Props) {
  const { t } = useLocale();
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function handleClick() {
    const msg = typeof text === "function" ? await text() : text;
    if (!msg) return;
    copy(msg);
    setTip(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative ${className}`}
    >
      {showIcon && (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
      {label ?? t("copyBtn")}
      <span
        role="status"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap rounded bg-fg px-2 py-0.5 text-[10px] text-bg transition-opacity duration-300 ${
          tip ? "opacity-100" : "opacity-0"
        }`}
      >
        {t("copiedTip")}
      </span>
    </button>
  );
}
