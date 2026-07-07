import { useLocale } from '../../i18n/index.js'

export default function LangSelector() {
  const { locale, setLocale } = useLocale()
  return (
    <div className="flex items-center gap-0.5 text-xs font-medium">
      <button
        onClick={() => setLocale('pt')}
        className={`px-1.5 py-0.5 rounded transition ${locale === 'pt' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'}`}
      >
        PT
      </button>
      <span className="text-white/30">|</span>
      <button
        onClick={() => setLocale('en')}
        className={`px-1.5 py-0.5 rounded transition ${locale === 'en' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'}`}
      >
        EN
      </button>
    </div>
  )
}
