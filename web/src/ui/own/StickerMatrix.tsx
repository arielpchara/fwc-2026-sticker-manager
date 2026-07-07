import { useMemo } from 'react'
import { useOwnStickers } from '../../application/useStickers.js'
import { flagOf, colorOf } from '../data/flags.js'
import { GROUPS } from '../data/groups.js'
import { maxStickers } from '../data/stickers.js'

export default function StickerMatrix() {
  const { inv } = useOwnStickers()

  const rows = useMemo(() => {
    const prefixes: string[] = []
    for (const g of GROUPS) {
      for (const p of g.prefixes) {
        prefixes.push(p)
      }
    }
    prefixes.push('FWC', '00')

    return prefixes.map((prefix) => {
      const max = maxStickers(prefix)
      const cells: { code: string; owned: boolean }[] = []
      for (let i = 1; i <= max; i++) {
        const code = prefix === '00' ? '00' : prefix + i
        cells.push({ code, owned: (inv[code] ?? 0) > 0 })
      }
      return { prefix, cells }
    })
  }, [inv])

  return (
    <div className="flex justify-center overflow-x-auto">
      <div className="inline-flex flex-col gap-0">
        {rows.map(({ prefix, cells }) => (
          <div key={prefix} className="flex items-center gap-0">
            <div className="w-8 h-[45px] flex items-center justify-center text-sm leading-none shrink-0">
              {prefix === '00' ? '⭐' : flagOf(prefix)}
            </div>
            {cells.map(({ code, owned }, i) => (
              <div
                key={i}
                className="w-[45px] h-[45px] border border-gray-200 flex items-center justify-center text-[10px] font-bold leading-none"
                style={{
                  backgroundColor: owned ? colorOf(prefix) : 'transparent',
                  color: owned ? '#fff' : '#9ca3af',
                }}
              >
                {code}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
