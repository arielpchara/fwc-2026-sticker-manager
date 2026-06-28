/**
 * Collection operations — pure logic, zero IO.
 */

/**
 * Deduplicate and sort an array of sticker codes.
 */
export function dedupe(codes: string[]): string[] {
  return [...new Set(codes)].sort()
}

/**
 * Return stickers that are in `theirs` but NOT in `mine`.
 * This is the list of stickers you can receive from the other person.
 */
export function missing(mine: string[], theirs: string[]): string[] {
  const owned = new Set(mine)
  return dedupe(theirs.filter((code) => !owned.has(code)))
}
