import { useState, useRef, useEffect } from 'react'
import { useLocale } from '../../i18n/index.js'
import type { TeamSort } from '../../application/sortTeams.js'

const OPTIONS: { value: TeamSort; labelKey: string }[] = [
  { value: 'completion', labelKey: 'sortByComplete' },
  { value: 'code', labelKey: 'sortByTeamCode' },
]

export default function TeamSortSelect({
  value,
  onChange,
}: {
  value: TeamSort
  onChange: (v: TeamSort) => void
}) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const current = OPTIONS.find((o) => o.value === value)
  const label = current ? t(current.labelKey as never) : 'Sort'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2.5 py-1 text-xs font-medium rounded-full border bg-surface text-muted border-border hover:border-gold transition"
      >
        {label} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg w-44 py-1">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 ${
                value === o.value ? 'text-gold font-semibold' : 'text-muted'
              }`}
            >
              {t(o.labelKey as never)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
