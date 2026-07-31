export default function StickerCounter({ owned, total }: { owned: number; total: number }) {
  return (
    <span className="text-xs whitespace-nowrap font-mono tabular-nums flex w-20">
      {owned === total ? <span>⭐</span> : <><span className="text-muted">{owned}/{total}/</span><strong className="font-bold text-fg">{total - owned}</strong></>}
    </span>
  )
}
