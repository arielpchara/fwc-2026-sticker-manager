import { useState, useRef, useEffect } from 'react'
import { useLocale } from '../../i18n/index.js'
import { GROUPS } from '../../constants/groups.js'
import { flagOf } from '../../constants/flags.js'

export function MultiSelectChip({
  label,
  options,
  selected,
  onChange,
  clearLabel,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  clearLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter((x) => x !== v))
    } else {
      onChange([...selected, v])
    }
  }

  const displayLabel = label || 'Filter'
  const display = selected.length ? `${displayLabel} (${selected.length})` : displayLabel

  const clearAll = () => onChange([])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
          selected.length
            ? 'bg-gold text-bg border-gold'
            : 'bg-surface text-muted border-border hover:border-gold'
        }`}
      >
        {display} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg w-56 max-h-72 overflow-auto py-1">
          {selected.length > 0 && clearLabel && (
            <button
              onClick={clearAll}
              className="w-full text-left px-3 py-1 text-xs text-muted hover:text-fg border-b border-border"
            >
              {clearLabel}
            </button>
          )}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-gold"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function GroupMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const { t } = useLocale()
  const opts = GROUPS.map((g) => ({ value: g.labelKey, label: t(g.labelKey as never) }))
  // add special group for FWC/00
  opts.push({ value: 'specialLabel', label: t('specialLabel') })
  return (
    <MultiSelectChip
      label={t('filterGroup')}
      options={opts}
      selected={selected}
      onChange={onChange}
      clearLabel={t('clearAll')}
    />
  )
}

export function TeamMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const { t } = useLocale()
  const opts = GROUPS.flatMap((g) =>
    g.prefixes.map((p) => ({
      value: p,
      label: `${flagOf(p)} ${p}`,
    })),
  )
  opts.push({ value: 'FWC', label: `🏆 FWC` })
  opts.push({ value: '00', label: `⭐ 00` })
  return (
    <MultiSelectChip
      label={t('filterTeam')}
      options={opts}
      selected={selected}
      onChange={onChange}
      clearLabel={t('clearAll')}
    />
  )
}
