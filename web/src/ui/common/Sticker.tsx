import React from 'react'
import { isChroma } from '../../application/stickerTools.js'
import { flagOf, colorOf } from '../../data/flags.js'

function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

interface StickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string | null
  displayFlag?: boolean
  qty?: number
  compact?: boolean
} 

export default function Sticker({ code , displayFlag = true, qty, compact, ...rest }: StickerProps) {
  const prefix = code ? prefixOf(code): '00'
  const bg = prefix ? colorOf(prefix) :'#6b7280' 
  const chroma = code ? isChroma(code) : false  
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-sm text-white leading-tight ${compact ? 'px-1 font-normal text-[10px]' : 'px-2 py-0.5 font-bold text-xs'} ${chroma ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-white' : ''}`}
      style={{ backgroundColor: bg }}
    >
      {displayFlag && <span className={`leading-none ${compact ? 'text-xs' : 'text-base'}`}>{flagOf(prefix)}</span>}
      <span>{code || '----'}</span>
      {qty !== undefined && (
        <span className="bg-white/80 text-black text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">{qty}</span>
      )}
    </span>
  )
}
