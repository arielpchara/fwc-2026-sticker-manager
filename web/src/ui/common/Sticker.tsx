import React from "react";
import {
  isChroma,
  numberOf,
  prefixOf,
} from "../../application/stickerTools.js";
import { flagOf, colorOf, secondaryColorOf } from "../../constants/flags.js";

interface StickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string | null;
  displayFlag?: boolean;
  qty?: number;
  compact?: boolean;
  full?: boolean;
}

function numberLabel(code: string | null): string {
  if (!code) return "--";
  const n = numberOf(code);
  return Number.isFinite(n) ? String(n) : "--";
}

export default function Sticker({
  code,
  displayFlag = true,
  qty,
  compact,
  full,
  ...rest
}: StickerProps) {
  const prefix = code ? prefixOf(code) : "00";
  const chroma = code ? isChroma(code) : false;
  const isMissing = qty === 0;
  const team = (prefix || "??").toUpperCase();
  const num = numberLabel(code);
  const displayCode = (code || "----").toUpperCase();
  const isZeroZero = displayCode === "00";

  const baseColor = isMissing
    ? "#8a8580"
    : prefix
      ? colorOf(prefix)
      : "#b4b4b4";

  const glassClass = chroma ? "sticker-glass chroma" : "sticker-glass";

  if (compact) {
    return (
      <span
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
      } flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 md:flex-row md:gap-1 md:px-4 md:py-2`}
      style={{
        background: isMissing
          ? "linear-gradient(145deg, #4e4a49 0%, #8b8681 100%)"
          : `linear-gradient(145deg, ${baseColor} 33%, ${secondaryColorOf(prefix)} 95%)`,
      }}
    >
      {displayFlag && (
        <span className="leading-none opacity-90 font-semibold text-xs md:text-base">
          {flagOf(prefix)}
        </span>
      )}

      {/* mobile: team over number (00 = big number only) */}
      <span className="relative z-10 flex flex-col items-center md:hidden">
        {!isZeroZero && (
          <span className="text-[10px] font-semibold tracking-[0.12em] opacity-90">
            {team}
          </span>
        )}
        <span
          className="text-sm font-black tracking-wide"
          style={{ fontWeight: 700 }}
        >
          {isZeroZero ? "00" : num}
        </span>
      </span>

      {/* desktop: full code */}
      <span
        className="relative z-10 hidden md:inline tracking-[0.08em] font-black text-sm"
        style={{ fontWeight: 500 }}
      >
        {displayCode}
      </span>

      {qty !== undefined && qty > 1 && (
        <span className="absolute -top-1.5 -right-1 z-20 bg-gold text-bg text-[9px] font-black uppercase px-1.5 py-px rounded-full border border-gold-bright shadow">
          +{qty - 1}
        </span>
      )}
    </span>
  );
}
