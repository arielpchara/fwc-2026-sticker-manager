import { useParams, useNavigate } from 'react-router-dom'
import { useTradeHistory, useOwnStickers } from '../../application/useStickers.js'
import { useLocale } from '../../i18n/index.js'
import { TOTAL_STICKERS } from '../data/stickers.js'
import MainLayout from '../common/MainLayout.js'
import TradeResult from '../trade/TradeResult.js'

export default function TradePage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { entries } = useTradeHistory()
  const { inv } = useOwnStickers()
  const albumOwned = Object.keys(inv).length
  const trade = entries.find(e => e.label === name)

  return (
    <MainLayout albumOwned={albumOwned} albumTotal={TOTAL_STICKERS}>
      <div className="p-4 sm:p-6">
        <button
          onClick={() => navigate('/compare')}
          className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('compareBtn')}
        </button>
        {trade ? (
          <TradeResult label={trade.label} giveItems={trade.giveItems} receiveItems={trade.receiveItems} />
        ) : (
          <p className="text-sm text-gray-500 text-center">{t('historyEmpty')}</p>
        )}
      </div>
    </MainLayout>
  )
}
