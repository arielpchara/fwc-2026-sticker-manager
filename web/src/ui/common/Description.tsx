import { useLocale } from '../../i18n/index.js'

export default function Description() {
  const { t } = useLocale()
  return (
    <div className="w-full bg-gold-soft border-b border-border px-4 py-2 text-center">
      <p className="text-gold text-xs font-medium">{t('description')}</p>
    </div>
  )
}
