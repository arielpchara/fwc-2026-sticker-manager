import { useMemo } from 'react'
import { groupOf } from '../ui/data/groups.js'

export interface StickerGroup {
  prefix: string
  codes: string[]
}

function prefixOf(code: string): string {
  return code === '00' ? '00' : code.slice(0, 3)
}

export function useStickerGroup(items: string[]): { groups: StickerGroup[] } {
  return useMemo(() => {
    const map = new Map<string, string[]>()
    const order = new Map<string, number>()
    for (const code of items) {
      const p = prefixOf(code)
      if (!map.has(p)) {
        map.set(p, [])
        order.set(p, p === '00' ? -1 : groupOf(p).order)
      }
      map.get(p)!.push(code)
    }
    const groups = [...map.entries()]
      .sort(([a], [b]) => (order.get(a) ?? -1) - (order.get(b) ?? -1))
      .map(([prefix, codes]) => ({ prefix, codes }))
    return { groups }
  }, [items])
}
