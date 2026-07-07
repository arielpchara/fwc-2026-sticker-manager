import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOwnStickers, useCompareHistory } from '../../application/useStickers.js'
import { compareWith, canGive } from '../../application/stickerService.js'
import { useLocale } from '../../i18n/index.js'
import type { CompareEntry } from '../../storage/compareSlice.js'
import CompareResult from './CompareResult.js'
import CompareHistory from './CompareHistory.js'

export default function CompareStickers() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { inv, extras } = useOwnStickers()
  const { entries, saveEntry, deleteEntry } = useCompareHistory()
  const [mode, setMode] = useState<'receive' | 'give'>('receive')
  const [text, setText] = useState('')
  const [label, setLabel] = useState('')
  const [result, setResult] = useState<{ missing: string[]; offer: string[]; count: number } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    if (mode === 'receive') {
      const r = compareWith(text, inv)
      setResult({ missing: r.missing, offer: [], count: r.count })
      saveEntry({
        label: label || t('historyUnnamed'),
        theirText: text,
        savedAt: Date.now(),
        missing: r.missing,
        mode: 'receive',
      })
    } else {
      const r = canGive(text, extras)
      setResult({ missing: [], offer: r.offer, count: r.count })
      saveEntry({
        label: label || t('historyUnnamed'),
        theirText: text,
        savedAt: Date.now(),
        missing: r.offer,
        mode: 'give',
      })
    }
  }

  function handleReopen(entry: CompareEntry) {
    setMode(entry.mode)
    setLabel(entry.label)
    setText(entry.theirText)
    if (entry.mode === 'receive') {
      const r = compareWith(entry.theirText, inv)
      setResult({ missing: r.missing, offer: [], count: r.count })
    } else {
      const r = canGive(entry.theirText, extras)
      setResult({ missing: [], offer: r.offer, count: r.count })
    }
  }

  function toggleMode(m: 'receive' | 'give') {
    setMode(m)
    setResult(null)
  }

  const displayItems = mode === 'receive' ? (result?.missing ?? null) : (result?.offer ?? null)

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => toggleMode('receive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              mode === 'receive'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('compareReceiveTab')}
          </button>
          <button
            type="button"
            onClick={() => toggleMode('give')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              mode === 'give'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('compareGiveTab')}
          </button>
        </div>

        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('historyLabelPlaceholder')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
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

      {result && displayItems && (
        displayItems.length === 0 ? (
          <p className="text-sm text-green-700 font-medium">{t('compareAllOwned')}</p>
        ) : (
          <CompareResult items={displayItems} mode={mode} extras={extras} />
        )
      )}

      <hr className="border-gray-200" />

      <CompareHistory
        entries={entries}
        onTradeNavigate={(label) => navigate(`/compare/${label}`)}
        onReopen={handleReopen}
        onDelete={deleteEntry}
      />
    </div>
  )
}
