import { useLocale } from '../../i18n/index.js'

export type SortMode = 'group' | 'completion'

export default function SortStickers({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (mode: SortMode) => void
}) {
  const { t } = useLocale()
  const sorts: { value: SortMode; label: string }[] = [
    { value: 'group', label: t('sortGroup') },
    { value: 'completion', label: t('sortCompletion') },
  ]
  return (
    <div className="flex flex-wrap gap-1.5">
      {sorts.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
            value === s.value
              ? 'bg-gold text-bg border-gold'
              : 'bg-surface text-muted border-border hover:border-gold'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
