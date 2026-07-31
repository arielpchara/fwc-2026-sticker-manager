import { parseCode } from '../domain/sticker.js'
import type { Inventory } from '../domain/inventory.js'
import { cleanText } from './cleaner.js'

const SURPLUS_RE = /(?<![A-Za-z0-9])([A-Za-z]{3}(?:[1-9]|1[0-9]|20)|00)\s*\(x(\d+)\)/gi

export function parseSurplus(text: string): Inventory {
  text = cleanText(text)

  const inv: Inventory = {}
  if (!text || text.trim() === '') return inv

  SURPLUS_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = SURPLUS_RE.exec(text)) !== null) {
    const code = parseCode(match[1])
    if (code === null) continue

    const qty = parseInt(match[2], 10)
    if (qty < 1) continue

    inv[code] = (inv[code] ?? 0) + qty
  }

  return inv
}
