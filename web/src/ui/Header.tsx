import { useLocale } from '../i18n/index.js'
import LangSelector from './LangSelector.js'

export default function Header({ onOwnClick, onSurplusClick, onCompareClick }: { onOwnClick?: () => void; onSurplusClick?: () => void; onCompareClick?: () => void }) {
  const { t } = useLocale()
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4 shadow-md flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">{t('appTitle')}</h1>
      <div className="flex items-center gap-2">
        {onOwnClick && (
          <button onClick={onOwnClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('btnOwn')}
          </button>
        )}
        {onSurplusClick && (
          <button onClick={onSurplusClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('btnExtras')}
          </button>
        )}
        {onCompareClick && (
          <button onClick={onCompareClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            {t('btnCompare')}
          </button>
        )}
        <span className="w-px h-5 bg-white/20 mx-1" />
        <LangSelector />
      </div>
    </header>
  )
}
