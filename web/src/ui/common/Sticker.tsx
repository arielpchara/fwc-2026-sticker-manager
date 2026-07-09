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

function numberPart(code: string) {
  return code === "00" ? "00" : code.slice(3);
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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

  const bg = qty === 0 ? "#a6abb4" : prefix ? colorOf(prefix) : "#6b7280";
  const borderBg = darken(bg, 40);

  return (
    <span
      {...rest}
      className={`relative inline-flex items-center gap-1 rounded-md text-white leading-tight ${compact ? "px-2 py-0.5 font-normal text-[10px]" : "px-4 py-2 font-bold text-xs"} ${full ? "w-full h-full flex items-center justify-center" : ""}`}
      style={{
        background: `linear-gradient(150deg, ${borderBg} 50%, ${bg} 50%)`,
        ...(chroma ? { boxShadow: `0 1px 2px 2px rgb(197, 131, 0)` } : {}),
        borderColor: borderBg,
        borderWidth: 2,
        borderStyle: "solid",
        textShadow: "0px 0px 2px rgba(0, 0, 0, 1)",
      }}
    >
      {displayFlag && (
        <span className={`leading-none ${compact ? "text-xs" : "text-base"}`}>
          {flagOf(prefix)}
        </span>
      )}
      <span>{code || "----"}</span>
      {qty !== undefined && qty > 1 && (
        <span
          className="absolute z-10 -top-3 -right-2 bg-white text-black text-[10px] w-8 h-5 flex items-center justify-center rounded-full"
          style={{
            borderColor: borderBg,
            borderWidth: 2,
            borderStyle: "solid",
          }}
        >
          +{qty - 1}
        </span>
      )}
    </span>
  );
}
