export default function StickerCounter({ owned, total }: { owned: number; total: number }) {
  return (
    <span className="text-xs whitespace-nowrap font-mono tabular-nums flex w-20">
      {owned === total ? <span>⭐</span> : <><span className="text-gray-400">{owned}/{total}/</span><strong className="font-bold text-gray-800">{total - owned}</strong></>}
    </span>
  )
}
