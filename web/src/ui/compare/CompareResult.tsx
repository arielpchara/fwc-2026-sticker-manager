import { useCallback } from 'react'
import { flagOf } from '../data/flags.js'
import { groupOf } from '../data/groups.js'
import { useLocale } from '../../i18n/index.js'
import GroupSticker from '../common/GroupSticker.js'
import { useStickerGroup } from '../../application/useStickerGroup.js'
import type { ExtraItem } from '../../../../src/domain/inventory.js'

function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

function groupCodes(codes: string[]): { prefix: string; codes: string[] }[] {
  const map = new Map<string, string[]>()
  const order = new Map<string, number>()
  for (const code of codes) {
    const p = prefixOf(code)
    if (!map.has(p)) {
      map.set(p, [])
      order.set(p, p === '00' ? -1 : groupOf(p).order)
    }
    map.get(p)!.push(code)
  }
  return [...map.entries()]
    .sort(([a], [b]) => (order.get(a) ?? -1) - (order.get(b) ?? -1))
    .map(([prefix, codes]) => ({ prefix, codes }))
}

export default function CompareResult({
  items,
  mode,
  extras,
}: {
  items: string[]
  mode: 'receive' | 'give'
  extras: ExtraItem[]
}) {
  const { t } = useLocale()
  const { groups } = useStickerGroup(items)

  const handleCopy = useCallback(() => {
    const header = mode === 'receive'
      ? `${t('copyWantTitle')} (${items.length})`
      : `${t('copyGiveTitle')} (${items.length})`
    const want = groups.map(({ prefix, codes }) => {
      const icon = prefix === '00' ? '⭐' : flagOf(prefix) || prefix
      return `${icon} ${codes.sort().join(', ')}`
    })
    const lines: string[] = [header, ...want, '']
    if (mode === 'receive' && extras.length > 0) {
      const extGrouped = groupCodes(extras.map((e) => e.code)).filter(
        (g) => g.prefix === '00' || groupOf(g.prefix).order >= 0,
      )
      const haveTotal = extGrouped.reduce((sum, g) => sum + g.codes.length, 0)
      const have = extGrouped.map(({ prefix, codes }) => {
        const list = codes.sort().join(', ')
        return `${flagOf(prefix)} ${list}`
      })
      lines.push(`${t('copyHaveTitle')} (${haveTotal})`, ...have)
    }
    navigator.clipboard.writeText(lines.join('\n'))
  }, [items, groups, mode, extras, t])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {mode === 'receive'
            ? t('compareCanReceive', { n: items.length })
            : t('compareCanGive', { n: items.length })}
        </p>
        <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {t('copyBtn')}
        </button>
      </div>
      <GroupSticker groups={groups} mode='compact' />
    </div>
  )
}
