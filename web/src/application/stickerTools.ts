export type StickerType = 'normal' | 'chroma'

export function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

export function suffixNum(code: string) {
  return code === '00' ? 0 : parseInt(code.slice(3), 10)
}

export function isChroma(code: string) {
  const n = suffixNum(code)
  return n === 1 || n === 0 || prefixOf(code) === 'FWC'
}

export function getStickerType(code: string): StickerType {
  return isChroma(code) ? 'chroma' : 'normal'
}

export function stickerGroupByType(codes: string[]) {
    const chroma: string[] = []
    const normal: string[] = []
    for (const code of codes) {
        if (isChroma(code)) {
            chroma.push(code)
        } else {
            normal.push(code)
        }
    }
    return { chroma, normal }
}