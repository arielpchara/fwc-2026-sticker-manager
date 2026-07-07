import { parseCode } from '../domain/sticker.js'
import type { Inventory } from '../domain/inventory.js'

export const GROUPED_LINE_RE = /^\s*([A-Z]{3})(?![A-Za-z0-9])[^:\n]*:[ \t]*.+$/gm
const LINE_RE = /^\s*([A-Z]{3})(?![A-Za-z0-9])[^:\n]*:[ \t]*(.+)$/gm

const ITEM_RE = /^(\d{1,2})(?:\s*[xX]\s*(\d+)|\(\s*(\d+)\s*[xX]\s*\))?$/


export function parseGrouped(text: string): Inventory {
  const inv: Inventory = {}

  LINE_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = LINE_RE.exec(text)) !== null) {
    const prefix = match[1]
    const payload = match[2].trim()

    if (!payload) continue

    const items = payload.split(/[\s,;]+/).filter(Boolean)
    for (const item of items) {
      const itemMatch = item.match(ITEM_RE)
      if (!itemMatch) continue

      const numStr = itemMatch[1]
      const code = numStr === '00' ? '00' : `${prefix}${numStr}`

      if (parseCode(code) === null) continue

      const qty = itemMatch[2] !== undefined ? parseInt(itemMatch[2], 10)
        : itemMatch[3] !== undefined ? parseInt(itemMatch[3], 10)
        : 1
      if (qty < 1) continue

      inv[code] = (inv[code] ?? 0) + qty
    }
  }

  return inv
}
