const BOLD_BLOCK_RE = /\*[^*]+\*/g
const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}]/gu
const PAGE_REF_RE = /·?\s*pgs?\.?\s*\d+(?:\s*[-–]\s*\d+)?/gi
const DIVIDER_RE = /^[\s\-─=•_·]{3,}$/gm
const EMPTY_LINE_RE = /^\s*$/gm
const SPACES_RE = /\s{2,}/g

export function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(BOLD_BLOCK_RE, '')
    .replace(EMOJI_RE, '')
    .replace(PAGE_REF_RE, '')
    .replace(DIVIDER_RE, '')
    .replace(EMPTY_LINE_RE, '')
    .replace(SPACES_RE, ' ')
    .trim()
}
