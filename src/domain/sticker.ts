/**
 * Sticker code domain model — pure logic, zero IO.
 *
 * Valid formats:
 *   [A-Z]{3} + 1-20     e.g. BRA1, BRA12, BRA20, ARG1, FWC3
 *   00                  standalone special sticker
 */

const STICKER_REGEX = /^([A-Z]{3}(?:[1-9]|1[0-9]|20)|00)$/

/**
 * Normalize a raw token: trim + uppercase.
 */
export function normalize(raw: string): string {
  return raw.trim().toUpperCase()
}

/**
 * Return true if the code is a valid sticker code.
 * Input is expected to already be normalized (uppercase, trimmed).
 */
export function isValid(code: string): boolean {
  return STICKER_REGEX.test(code)
}

/**
 * Normalize then validate. Returns the normalized code if valid, null otherwise.
 */
export function parseCode(raw: string): string | null {
  const code = normalize(raw)
  return isValid(code) ? code : null
}
