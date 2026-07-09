import { useLocale } from '../../i18n/index.js'

export type LayoutMode = 'group' | 'list'

export default function DisplayMode({
  layout,
  onLayout,
  compact,
  onCompact,
}: {
  layout: LayoutMode
  onLayout: (mode: LayoutMode) => void
  compact: boolean
  onCompact: (v: boolean) => void
}) {
  const { t } = useLocale()

  const layouts: { value: LayoutMode; label: string }[] = [
    { value: 'group', label: t('displayGroup') },
    { value: 'list', label: t('displayList') },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {layouts.map((l) => (
        <button
          key={l.value}
          onClick={() => onLayout(l.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
            layout === l.value
              ? 'bg-gold text-bg border-gold'
              : 'bg-surface text-muted border-border hover:border-gold'
          }`}
        >
          {l.label}
        </button>
      ))}
      <button
        onClick={() => onCompact(!compact)}
        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
          compact
            ? 'bg-gold text-bg border-gold'
            : 'bg-surface text-muted border-border hover:border-gold'
        }`}
      >
        {t('displayCompact')}
      </button>
    </div>
  )
}
