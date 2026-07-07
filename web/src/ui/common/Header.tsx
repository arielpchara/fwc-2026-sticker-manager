import { useLocale } from '../../i18n/index.js'
import LangSelector from './LangSelector.js'
import AlbumProgress from './AlbumProgress.js'

export default function Header({ albumOwned, albumTotal, onOwnClick, onSurplusClick, onCompareClick, onMatrixClick }: { albumOwned: number; albumTotal: number; onOwnClick?: () => void; onSurplusClick?: () => void; onCompareClick?: () => void; onMatrixClick?: () => void }) {
  const { t } = useLocale()
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4 shadow-md">
      <div className="grid grid-cols-3 items-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('appTitle')}</h1>
        <div className="flex justify-center">
          <AlbumProgress owned={albumOwned} total={albumTotal} />
        </div>
        <div className="flex items-center justify-end gap-2">
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
          {onMatrixClick && (
            <button onClick={onMatrixClick} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" /></svg>
              {t('btnMatrix')}
            </button>
          )}
          <span className="w-px h-5 bg-white/20 mx-1" />
          <LangSelector />
        </div>
      </div>
    </header>
  )
}
