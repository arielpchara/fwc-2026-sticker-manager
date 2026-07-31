import { useLocale } from '../../i18n/index.js'

export default function LangSelector() {
  const { locale, setLocale } = useLocale()
  return (
    <div className="flex items-center gap-0.5 text-xs font-medium">
      <button
        onClick={() => setLocale('pt')}
          className={`px-1.5 py-0.5 rounded transition ${
            locale === 'pt'
              ? 'bg-gold-soft text-gold'
              : 'text-muted hover:text-fg'
          }`}
      >
        PT
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => setLocale('en')}
          className={`px-1.5 py-0.5 rounded transition ${
            locale === 'en'
              ? 'bg-gold-soft text-gold'
              : 'text-muted hover:text-fg'
          }`}
      >
        EN
      </button>
    </div>
  )
}
