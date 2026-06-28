import { parseCode } from '../domain/sticker.js'
import type { Inventory } from '../domain/inventory.js'
import { parseGrouped, GROUPED_LINE_RE } from './groupedParser.js'
import { mergeCounts, codesOf } from '../domain/inventory.js'

const TOKEN_SCAN_RE = /(?<![A-Za-z0-9])([A-Za-z]{3}(?:[1-9]|1[0-9]|20)|00)(?:\s*[xX]\s*(\d+))?(?![A-Za-z0-9])/g

export function parseInventory(text: string): Inventory {
  if (!text || text.trim() === '') return {}

  const grouped = parseGrouped(text)

  const cleaned = text.replace(GROUPED_LINE_RE, '')

  const tokenInv: Inventory = {}
  TOKEN_SCAN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_SCAN_RE.exec(cleaned)) !== null) {
    const code = match[1].toUpperCase()
    if (parseCode(code) === null) continue

    const qty = match[2] !== undefined ? parseInt(match[2], 10) : 1
    if (qty < 1) continue

    tokenInv[code] = (tokenInv[code] ?? 0) + qty
  }

  return mergeCounts(grouped, tokenInv)
}

export function parseText(text: string): string[] {
  return codesOf(parseInventory(text))
}
