import React from "react";
import { isChroma, prefixOf } from "../../application/stickerTools.js";
import { flagOf, colorOf, secondaryColorOf } from "../../constants/flags.js";

interface StickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string | null;
  displayFlag?: boolean;
  qty?: number;
  compact?: boolean;
  full?: boolean;
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

  const baseColor = isMissing
    ? "#8a8580"
    : prefix
      ? colorOf(prefix)
      : "#b4b4b4";
  const displayCode = (code || "----").toUpperCase();

  const baseClasses = compact
    ? "px-1.5 py-0.5 text-[11px] tracking-wider"
    : "px-4 py-2 text-sm tracking-wider";

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
      className={`inline-flex items-center gap-1 rounded-md text-fg uppercase leading-none select-none overflow-visible ${isMissing && "missing"} ${baseClasses} ${full ? "w-full h-full justify-center" : ""} ${glassClass}`}
      style={{
        background: isMissing
          ? "linear-gradient(145deg, #4e4a49 0%, #8b8681 100%)"
          : `linear-gradient(145deg, ${baseColor} 33%, ${secondaryColorOf(prefix)} 95%)`,
      }}
    >
      {displayFlag && (
        <span
          className={`leading-none opacity-90 font-semibold ${compact ? "text-xs" : "text-base"}`}
        >
          {flagOf(prefix)}
        </span>
      )}
      <span
        className="relative z-10 tracking-[0.08em] font-black"
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
