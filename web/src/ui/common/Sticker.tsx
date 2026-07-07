import { flagOf, colorOf } from '../data/flags.js'

function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

export default function Sticker({ code, displayFlag = true, qty, compact }: { code: string; displayFlag?: boolean; qty?: number; compact?: boolean }) {
  const prefix = prefixOf(code)
  const bg = prefix === '00' ? '#6b7280' : colorOf(prefix)
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm text-white leading-tight ${compact ? 'px-1 font-normal text-[10px]' : 'px-2 py-0.5 font-bold text-xs'}`} style={{ backgroundColor: bg }}>
      {displayFlag && <span className={`leading-none ${compact ? 'text-xs' : 'text-base'}`}>{flagOf(prefix)}</span>}
      <span>{code}</span>
      {qty !== undefined && (
        <span className="bg-white/80 text-black text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">{qty}</span>
      )}
    </span>
  )
}
