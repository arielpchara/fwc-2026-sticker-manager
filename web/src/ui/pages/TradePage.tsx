import { useParams, useNavigate } from 'react-router-dom'
import { useCompareHistory, useOwnStickers, useTrade } from '../../application/useStickers.js'
import { useLocale } from '../../i18n/index.js'
import { TOTAL_STICKERS } from '../../data/stickers.js'
import MainLayout from '../common/MainLayout.js'
import TradeResult from '../trade/TradeResult.js'
import { trader, updateTrade } from '../../application/traderTool.js'
import { useMemo, useCallback } from 'react'
import type { TradeBy } from '../../type/trade.js'
import type { CompareMode } from '../../type/compare.js'

export default function TradePage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { entries } = useCompareHistory()
  const { inv } = useOwnStickers()
  const { trades: storedTrades, saveTrade, removeTrade } = useTrade()
  const albumOwned = Object.keys(inv).length

  const giveEntry = name ? entries[`give-${name}`] : undefined
  const receiveEntry = name ? entries[`receive-${name}`] : undefined
  const give = giveEntry?.stickers ?? []
  const receive = receiveEntry?.stickers ?? []
  const stored = name ? storedTrades[name] : undefined

  const trade = useMemo(() => {
    if (stored?.isLock) return stored.trades
    return give.length || receive.length ? trader(give, receive) : []
  }, [stored, give, receive])

  const handleChangeSticker = useCallback((from: TradeBy, to: string[], mode: CompareMode) => {
    if (!name) return
    const idx = trade.findIndex(t => t.key === from.key)
    if (idx === -1) return
    const updated: TradeBy = {
      ...from,
      ...(mode === 'give' ? { give: to } : { receive: to }),
    }
    const newTrades = updateTrade(trade, idx, updated)
    saveTrade(name, newTrades, true)
  }, [name, trade, saveTrade])

  return (
    <MainLayout albumOwned={albumOwned} albumTotal={TOTAL_STICKERS}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/compare')}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('compareBtn')}
          </button>
          <button
            onClick={() => name && removeTrade(name)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ↻ {t('tradeRecreate')}
          </button>
        </div>
        {name && (
          <TradeResult name={name} trade={trade} onChangeSticker={handleChangeSticker} />
        )}
      </div>
    </MainLayout>
  )
}
