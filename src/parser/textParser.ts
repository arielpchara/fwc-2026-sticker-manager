/**
 * Free-text parser — extracts valid sticker codes from any text.
 *
 * Splits on: whitespace, commas, semicolons, newlines, pipes.
 * Unknown tokens are silently ignored.
 * Result is deduped and sorted.
 */

import { parseCode } from '../domain/sticker.js'
import { dedupe } from '../domain/collection.js'

/**
 * Parse a free-text string and return valid, unique, sorted sticker codes.
 */
export function parseText(text: string): string[] {
  if (!text || text.trim() === '') return []

  const tokens = text.split(/[\s,;|\n\r]+/)
  const codes: string[] = []

  for (const token of tokens) {
    const code = parseCode(token)
    if (code !== null) {
      codes.push(code)
    }
  }

  return dedupe(codes)
}
