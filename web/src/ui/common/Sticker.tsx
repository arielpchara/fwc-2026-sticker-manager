import React from "react";
import { isChroma } from "../../application/stickerTools.js";
import { flagOf, colorOf } from "../../constants/flags.js";

function prefixOf(code: string) {
  return code === "00" ? "00" : code.slice(0, 3);
}

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

  const baseColor = isMissing ? "#292524" : prefix ? colorOf(prefix) : "#44403c";
  const displayCode = (code || "----").toUpperCase();

  const baseClasses = compact
    ? "px-1.5 py-0.5 text-[10px] tracking-wider"
    : "px-3 py-1.5 text-xs tracking-wider";

  const glassClass = chroma ? "sticker-glass chroma" : "sticker-glass";

  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-md text-fg font-black uppercase leading-none select-none ${baseClasses} ${full ? "w-full h-full justify-center" : ""} ${glassClass}`}
      style={{
        background: isMissing
          ? "linear-gradient(145deg, #1c1917 0%, #292524 100%)"
          : `linear-gradient(145deg, ${baseColor} 0%, #111 100%)`,
      }}
    >
      {displayFlag && (
        <span className={`leading-none opacity-90 ${compact ? "text-xs" : "text-base"}`}>
          {flagOf(prefix)}
        </span>
      )}
      <span className="relative z-10 tracking-[0.08em]">{displayCode}</span>

      {qty !== undefined && qty > 1 && (
        <span className="absolute -top-1.5 -right-1 z-20 bg-gold text-bg text-[9px] font-black uppercase px-1.5 py-px rounded-full border border-gold-bright shadow">
          +{qty - 1}
        </span>
      )}
    </span>
  );
}
