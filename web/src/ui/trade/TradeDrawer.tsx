import { useParams, useNavigate } from 'react-router-dom'
import { useCompareHistory, useOwnStickers, useTrade } from '../../application/useStickers.js'
import { useLocale } from '../../i18n/index.js'
import TradeResult from '../trade/TradeResult.js'
import { trader, updateTrade } from '../../application/traderTool.js'
import { useMemo, useCallback } from 'react'
import type { TradeBy } from '../../type/trade.js'
import type { CompareMode } from '../../type/compare.js'
import Drawer from '../common/Drawer.js'

export default function TradeDrawer() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { entries } = useCompareHistory()
  const { trades: storedTrades, saveTrade } = useTrade()

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
    <Drawer open onClose={() => navigate('/compare')} title={name ? t('tradeWith', { name }) : ''}>
      {name && (
        <TradeResult name={name} trade={trade} onChangeSticker={handleChangeSticker} />
      )}
    </Drawer>
  )
}
