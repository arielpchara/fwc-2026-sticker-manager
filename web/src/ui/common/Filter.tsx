import { type InputHTMLAttributes } from 'react'
import { useLocale } from '../../i18n/index.js'

export default function Filter(props: InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useLocale()
  return (
    <input
      type="text"
      placeholder={t('filterPlaceholder')}
      className="w-full border border-border bg-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      {...props}
    />
  )
}
