import { useLocale } from '../../i18n/index.js'
import Filter from '../common/Filter.js'
import { GroupMultiSelect, TeamMultiSelect } from './MultiSelectChip.js'
import type { InventoryFilters } from '../../application/filterInventory.js'

export default function AlbumSearch({
  filters,
  onChange,
  totalInv,
  filteredCount,
}: {
  filters: InventoryFilters
  onChange: (next: InventoryFilters) => void
  totalInv: number
  filteredCount: number
}) {
  const { t } = useLocale()
  const { query, missing, extras, groups, teams } = filters

  const chips: { key: string; label: string }[] = []
  if (query.trim()) chips.push({ key: 'query', label: query.trim() })
  if (missing) chips.push({ key: 'missing', label: t('missingFilter') })
  if (extras) chips.push({ key: 'extras', label: t('extrasFilter') })
  for (const g of groups) {
    const groupLabel = t(g as never) || g
    const filterLabel = t('filterGroup') || 'Group'
    chips.push({ key: `group:${g}`, label: `${filterLabel}: ${groupLabel}` })
  }
  for (const p of teams) {
    const teamLabel = t('filterTeam') || 'Team'
    chips.push({ key: `team:${p}`, label: `${teamLabel}: ${p}` })
  }

  const removeChip = (key: string) => {
    if (key === 'query') onChange({ ...filters, query: '' })
    if (key === 'missing') onChange({ ...filters, missing: false })
    if (key === 'extras') onChange({ ...filters, extras: false })
    if (key.startsWith('group:')) {
      const g = key.slice(6)
      onChange({ ...filters, groups: groups.filter((x) => x !== g) })
    }
    if (key.startsWith('team:')) {
      const p = key.slice(5)
      onChange({ ...filters, teams: teams.filter((x) => x !== p) })
    }
  }

  return (
    <div className="space-y-2 mb-6">
      <Filter
        value={query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange({ ...filters, missing: !missing, extras: false })}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
            missing
              ? 'bg-gold text-bg border-gold'
              : 'bg-surface text-muted border-border hover:border-gold'
          }`}
        >
          {t('missingFilter')}
        </button>
        <button
          onClick={() => onChange({ ...filters, extras: !extras, missing: false })}
          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
            extras
              ? 'bg-copper text-white border-copper'
              : 'bg-surface text-muted border-border hover:border-gold'
          }`}
        >
          {t('extrasFilter')}
        </button>

        <GroupMultiSelect
          selected={groups}
          onChange={(g) => onChange({ ...filters, groups: g })}
        />
        <TeamMultiSelect
          selected={teams}
          onChange={(t) => onChange({ ...filters, teams: t })}
        />
      </div>

      <div className="text-xs text-muted flex flex-wrap items-center gap-2">
        <span>
          {t('searchStatus', { total: totalInv, filtered: filteredCount })}
        </span>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-1 bg-gold-soft text-gold px-2 py-0.5 rounded-full text-[10px]"
              >
                {c.label}
                <button
                  onClick={() => removeChip(c.key)}
                  className="hover:text-fg"
                  aria-label="remove filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
