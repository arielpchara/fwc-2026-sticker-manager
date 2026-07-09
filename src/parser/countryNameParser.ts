import { parseCode } from '../domain/sticker.js'
import type { Inventory } from '../domain/inventory.js'
import { resolveTeamPrefix } from './teamAliases.js'

const ITEM_RE = /^(\d{1,2})(?:\s*[xX]\s*(\d+)|\(\s*(\d+)\s*[xX]\s*\))?$/

function stripLeadingEmojiAndNoise(s: string): string {
  // remove any leading non-letter characters (emojis, flags, bullets, symbols)
  return s.replace(/^[^\p{L}\p{N}]+/gu, '').trim()
}

export function parseCountryNamed(text: string): Inventory {
  const inv: Inventory = {}
  if (!text) return inv

  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    if (!line.includes(':')) continue
    const idx = line.indexOf(':')
    const rawName = stripLeadingEmojiAndNoise(line.slice(0, idx))
    const payload = line.slice(idx + 1).trim()
    if (!payload) continue

    // skip if the name side is already a bare 3-letter prefix (grouped parser handles it)
    if (/^[A-Z]{3}$/.test(rawName.toUpperCase())) continue

    const prefix = resolveTeamPrefix(rawName)
    if (!prefix) continue

    const items = payload.split(/[\s,;]+/).filter(Boolean)
    for (const item of items) {
      const m = item.match(ITEM_RE)
      if (!m) continue

      const numStr = m[1]
      const code = numStr === '00' ? '00' : `${prefix}${numStr}`
      if (parseCode(code) === null) continue

      const qty = m[2] !== undefined ? parseInt(m[2], 10)
        : m[3] !== undefined ? parseInt(m[3], 10)
        : 1
      if (qty < 1) continue

      inv[code] = (inv[code] ?? 0) + qty
    }
  }

  return inv
}
