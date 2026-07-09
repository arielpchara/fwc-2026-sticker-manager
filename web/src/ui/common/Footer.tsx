import { useLocale } from '../../i18n/index.js'

export default function Footer() {
  const { t } = useLocale()
  return (
    <footer className="text-center text-xs text-muted py-4 border-t border-border">
      {t('appTitle')}
    </footer>
  )
}
