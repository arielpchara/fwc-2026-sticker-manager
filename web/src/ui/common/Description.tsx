import { useLocale } from '../../i18n/index.js'

export default function Description() {
  const { t } = useLocale()
  return (
    <div className="w-full bg-green-50 border-b border-green-100 px-4 py-2 text-center">
      <p className="text-green-600 text-xs font-medium">{t('description')}</p>
    </div>
  )
}
