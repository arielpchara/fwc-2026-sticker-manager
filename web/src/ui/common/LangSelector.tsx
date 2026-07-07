import { useLocale } from '../../i18n/index.js'

export default function LangSelector() {
  const { locale, setLocale } = useLocale()
  return (
    <div className="flex items-center gap-0.5 text-xs font-medium">
      <button
        onClick={() => setLocale('pt')}
        className={`px-1.5 py-0.5 rounded transition ${
          locale === 'pt'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        PT
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLocale('en')}
        className={`px-1.5 py-0.5 rounded transition ${
          locale === 'en'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}
