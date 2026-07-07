import { useState, useMemo, useEffect } from 'react'
import { useOwnStickers, useCompareHistory, useTradeHistory } from '../../application/useStickers.js'
import { compareWith, canGive } from '../../application/stickerService.js'
import { useLocale } from '../../i18n/index.js'
import type { CompareEntry } from '../../storage/compareSlice.js'
import CompareResult from './CompareResult.js'
import CompareHistory from './CompareHistory.js'
import TradeResult from '../trade/TradeResult.js'

export default function CompareStickers() {
  const { t } = useLocale()
  const { inv, extras } = useOwnStickers()
  const { entries, saveEntry, deleteEntry } = useCompareHistory()
  const [mode, setMode] = useState<'receive' | 'give'>('receive')
  const [text, setText] = useState('')
  const [label, setLabel] = useState('')
  const [result, setResult] = useState<{ missing: string[]; offer: string[]; count: number } | null>(null)
  const [tradeLabel, setTradeLabel] = useState<string | null>(null)

  const matchingLabels = useMemo(() => {
    const giveLabels = new Set(entries.filter(e => e.mode === 'give').map(e => e.label))
    const receiveLabels = new Set(entries.filter(e => e.mode === 'receive').map(e => e.label))
    return [...giveLabels].filter(l => receiveLabels.has(l))
  }, [entries])

  const tradeGiveItems = useMemo(() => {
    if (!tradeLabel) return []
    return entries.find(e => e.mode === 'give' && e.label === tradeLabel)?.missing ?? []
  }, [tradeLabel, entries])

  const tradeReceiveItems = useMemo(() => {
    if (!tradeLabel) return []
    return entries.find(e => e.mode === 'receive' && e.label === tradeLabel)?.missing ?? []
  }, [tradeLabel, entries])

  const { saveTrade } = useTradeHistory()

  useEffect(() => {
    if (tradeLabel && tradeGiveItems.length > 0 && tradeReceiveItems.length > 0) {
      saveTrade({ label: tradeLabel, giveItems: tradeGiveItems, receiveItems: tradeReceiveItems, savedAt: Date.now() })
    }
  }, [tradeLabel, tradeGiveItems, tradeReceiveItems, saveTrade])

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

      {tradeLabel && (
        <TradeResult
          label={tradeLabel}
          giveItems={tradeGiveItems}
          receiveItems={tradeReceiveItems}
        />
      )}

      {matchingLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matchingLabels.map(name => (
            <button
              key={name}
              onClick={() => setTradeLabel(tradeLabel === name ? null : name)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                tradeLabel === name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t('tradeWith', { name })}
            </button>
          ))}
        </div>
      )}

      <CompareHistory
        entries={entries}
        matchingLabels={matchingLabels}
        onTrade={setTradeLabel}
        onReopen={handleReopen}
        onDelete={deleteEntry}
      />
    </div>
  )
}
