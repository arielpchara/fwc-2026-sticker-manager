import { useMemo } from 'react'
import { useLocale } from '../../i18n/index.js'
import type { CompareEntry } from '../../storage/compareSlice.js'

export default function CompareHistory({
  entries = [],
  onTradeNavigate,
  onReopen,
  onDelete,
}: {
  entries: CompareEntry[]
  onTradeNavigate?: (label: string) => void
  onReopen: (entry: CompareEntry) => void
  onDelete: (id: string) => void
}) {
  const { t } = useLocale()

  const matchingLabels = useMemo(() => {
    const giveLabels = new Set(entries.filter(e => e.mode === 'give').map(e => e.label))
    const receiveLabels = new Set(entries.filter(e => e.mode === 'receive').map(e => e.label))
    return [...giveLabels].filter(l => receiveLabels.has(l))
  }, [entries])

  function daysAgo(savedAt: number): string {
    const diff = Date.now() - savedAt
    const days = Math.floor(diff / 86400000)
    if (days === 0) return t('historyToday')
    if (days === 1) return t('historyYesterday')
    return t('historyDaysAgo', { n: days })
  }
  if (!entries || entries.length === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-2">
        {t('historyEmpty')}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{t('historyTitle')}</p>
      {[...entries]
        .sort((a, b) => b.savedAt - a.savedAt)
        .map((entry) => (
          <div
            key={entry.mode + '-' + entry.label}
            className="flex items-center justify-between text-xs text-gray-600 py-1.5 px-2 rounded hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-bold shrink-0 ${entry.mode === 'receive' ? 'text-purple-500' : 'text-orange-500'}`}>
                {entry.mode === 'receive' ? '↓' : '↑'}
              </span>
              <span className="font-medium text-gray-800 truncate">{entry.label}</span>
              <span className="text-gray-400 shrink-0">
                {t('historyMissing', { n: entry.missing.length })}
              </span>
              <span className="text-gray-300 shrink-0">{daysAgo(entry.savedAt)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {matchingLabels.includes(entry.label) && onTradeNavigate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTradeNavigate(entry.label) }}
                  className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition"
                  title="Trade"
                >
                  ↔
                </button>
              )}
              <button
                onClick={() => onReopen(entry)}
                className="text-gray-400 hover:text-purple-600 p-0.5"
                title={t('historyReopen')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <button
                onClick={() => onDelete(entry.mode + '-' + entry.label)}
                className="text-gray-300 hover:text-red-500 p-0.5"
                title={t('historyDelete')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}
    </div>
  )
}
