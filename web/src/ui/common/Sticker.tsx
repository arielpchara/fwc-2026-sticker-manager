import React from "react";
import {
  isChroma,
  numberOf,
  prefixOf,
} from "../../application/stickerTools.js";
import { flagOf, colorOf, secondaryColorOf } from "../../constants/flags.js";

export type StickerSize = "sm" | "md" | "lg";

interface StickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string | null;
  displayFlag?: boolean;
  qty?: number;
  compact?: boolean;
  full?: boolean;
  size?: StickerSize;
}

function numberLabel(code: string | null): string {
  if (!code) return "--";
  const n = numberOf(code);
  return Number.isFinite(n) ? String(n) : "--";
}

const SIZE = {
  sm: {
    shell: "gap-0 px-1 py-1 md:gap-0.5 md:px-2 md:py-1",
    flag: "text-[10px] md:text-xs",
    team: "text-[8px]",
    num: "text-xs",
    code: "text-xs",
    badge: "text-[8px] px-1 py-px -top-1 -right-0.5",
  },
  md: {
    shell: "gap-0.5 px-1.5 py-1.5 md:gap-1 md:px-4 md:py-2",
    flag: "text-xs md:text-base",
    team: "text-[10px]",
    num: "text-sm",
    code: "text-sm",
    badge: "text-[9px] px-1.5 py-px -top-1.5 -right-1",
  },
  lg: {
    shell: "gap-1 px-2 py-2 md:gap-1.5 md:px-5 md:py-2.5",
    flag: "text-base md:text-lg",
    team: "text-xs",
    num: "text-lg",
    code: "text-base",
    badge: "text-[10px] px-1.5 py-0.5 -top-1.5 -right-1",
  },
} as const;

export default function Sticker({
  code,
  displayFlag = true,
  qty,
  compact,
  full,
  size = "md",
  className = "",
  ...rest
}: StickerProps) {
  const prefix = code ? prefixOf(code) : "00";
  const chroma = code ? isChroma(code) : false;
  const isMissing = qty === 0;
  const team = (prefix || "??").toUpperCase();
  const num = numberLabel(code);
  const displayCode = (code || "----").toUpperCase();
  const isZeroZero = displayCode === "00";
  const s = SIZE[size];

  const baseColor = isMissing
    ? "#8a8580"
    : prefix
      ? colorOf(prefix)
      : "#b4b4b4";

  const glassClass = chroma ? "sticker-glass chroma" : "sticker-glass";
  const clickableClass = rest.onClick
    ? "cursor-pointer active:scale-95 transition-transform"
    : "";

  if (compact) {
    return (
      <span
        {...rest}
        className={`${clickableClass} ${className}`.trim()}
        style={{
          borderColor: baseColor,
          borderBottomWidth: 1,
          borderStyle: "solid",
        }}
      >
        {displayCode}
      </span>
    );
  }

  return (
    <span
      {...rest}
      className={`inline-flex rounded-md text-fg uppercase leading-none select-none overflow-visible ${isMissing ? "missing" : ""} ${glassClass} ${
        full ? "w-full h-full justify-center" : ""
      } flex-col items-center justify-center md:flex-row ${s.shell} ${clickableClass} ${className}`.trim()}
      style={{
        background: isMissing
          ? "linear-gradient(145deg, #4e4a49 0%, #8b8681 100%)"
          : `linear-gradient(145deg, ${baseColor} 33%, ${secondaryColorOf(prefix)} 95%)`,
      }}
    >
      {displayFlag && (
        <span className={`leading-none opacity-90 font-semibold ${s.flag}`}>
          {flagOf(prefix)}
        </span>
      )}

      <span className="relative z-10 flex flex-col items-center md:hidden">
        {!isZeroZero && (
          <span
            className={`font-semibold tracking-[0.12em] opacity-90 ${s.team}`}
          >
            {team}
          </span>
        )}
        <span className={`font-black tracking-wide ${s.num}`} style={{ fontWeight: 700 }}>
          {isZeroZero ? "00" : num}
        </span>
      </span>

      <span
        className={`relative z-10 hidden md:inline tracking-[0.08em] font-black ${s.code}`}
        style={{ fontWeight: 500 }}
      >
        {displayCode}
      </span>

      {qty !== undefined && qty > 1 && (
        <span
          className={`absolute z-20 bg-gold text-bg font-black uppercase rounded-full border border-gold-bright shadow ${s.badge}`}
        >
          +{qty - 1}
        </span>
      )}
    </span>
  );
}
