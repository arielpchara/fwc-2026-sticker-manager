import { useLocale } from '../../i18n/index.js'

export default function Description() {
  const { t } = useLocale()
  return (
    <section className="text-center max-w-xl mx-auto">
      <p className="text-gray-600 text-lg">{t('description')}</p>
    </section>
  )
}
