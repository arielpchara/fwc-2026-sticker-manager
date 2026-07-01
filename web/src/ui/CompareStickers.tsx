import { useState, useCallback } from 'react'
import { useOwnStickers } from '../application/useStickers.js'
import { compareWith } from '../application/stickerService.js'
import { flagOf, colorOf } from './flags.js'
import { groupOf } from './groups.js'
import { useLocale } from '../i18n/index.js'

function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

export default function CompareStickers() {
  const { t } = useLocale()
  const { inv } = useOwnStickers()
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ missing: string[]; count: number } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setResult(compareWith(text, inv))
  }

  const handleCopy = useCallback(() => {
    if (!result) return
    const grouped = groupMissing(result.missing)
    const lines = grouped.map(({ prefix, codes }) => {
      const icon = prefix === '00' ? '⭐' : flagOf(prefix) || prefix
      const label = prefix === '00' ? t('specialGroupLabel') : prefix
      const list = codes.sort().join(', ')
      return `${icon} ${label} (${codes.length}): ${list}`
    })
    navigator.clipboard.writeText(lines.join('\n'))
  }, [result, t])

  const grouped = result
    ? groupMissing(result.missing)
    : null

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('comparePlaceholder')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {t('compareBtn')}
        </button>
      </form>

      {grouped && (
        <div>
          {result!.count === 0 ? (
            <p className="text-sm text-green-700 font-medium">{t('compareAllOwned')}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {t('compareCanReceive', { n: result!.count })}
                </p>
                <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  {t('copyBtn')}
                </button>
              </div>
              {grouped.map(({ prefix, codes }) => (
                <div key={prefix}>
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500">
                    <span>{prefix === '00' ? '⭐' : flagOf(prefix)}</span>
                    <span className="font-medium">{prefix === '00' ? t('specialGroupLabel') : prefix}</span>
                    <span>({codes.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {codes.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-bold text-xs text-white leading-tight"
                        style={{ backgroundColor: prefix === '00' ? '#6b7280' : colorOf(prefix) }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function groupMissing(missing: string[]): { prefix: string; codes: string[] }[] {
  const map = new Map<string, string[]>()
  const order = new Map<string, number>()

  for (const code of missing) {
    const prefix = prefixOf(code)
    if (!map.has(prefix)) {
      map.set(prefix, [])
      order.set(prefix, prefix === '00' ? -1 : groupOf(prefix).order)
    }
    map.get(prefix)!.push(code)
  }

  return [...map.entries()]
    .sort(([a], [b]) => (order.get(a) ?? -1) - (order.get(b) ?? -1))
    .map(([prefix, codes]) => ({ prefix, codes }))
}
