import { useLocale } from '../i18n/index.js'

export default function Footer() {
  const { t } = useLocale()
  return (
    <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
      {t('appTitle')}
    </footer>
  )
}
