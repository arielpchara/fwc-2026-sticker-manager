export const TOTAL_STICKERS = 980

export function maxStickers(prefix: string): number {
  if (prefix === '00') return 1
  if (prefix === 'FWC') return 19
  return 20
}
