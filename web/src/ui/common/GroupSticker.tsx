import { useState } from 'react'
import { flagOf } from '../data/flags.js'
import { useLocale } from '../../i18n/index.js'
import Sticker from './Sticker.js'
import type { StickerGroup } from '../../application/useStickerGroup.js'

function teamName(prefix: string, t: ReturnType<typeof useLocale>['t']): string {
  if (prefix === '00') return t('team_FWC')
  return t(`team_${prefix}` as never)
}

export default function GroupSticker({
  groups,
  mode = 'regular',
}: {
  groups: StickerGroup[]
  mode?: 'regular' | 'compact'
}) {
  const { t } = useLocale()
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set(groups.map((g) => g.prefix)))

  function toggle(prefix: string) {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(prefix)) next.delete(prefix)
      else next.add(prefix)
      return next
    })
  }

  function expandAll() {
    setExpandedSet(new Set(groups.map((g) => g.prefix)))
  }

  function collapseAll() {
    setExpandedSet(new Set())
  }

  const allExpanded = groups.length > 0 && groups.every((g) => expandedSet.has(g.prefix))
  const allCollapsed = groups.every((g) => !expandedSet.has(g.prefix))

  if (mode === 'compact') {
    return (
      <div className="space-y-1">
        {groups.map(({ prefix, codes }) => {
          const icon = prefix === '00' ? '⭐' : flagOf(prefix)
          const name = teamName(prefix, t)
          return (
            <div key={prefix} className="flex items-baseline gap-1.5 text-xs text-gray-700">
              <span className="text-base leading-none shrink-0">{icon}</span>
              <span className="font-medium shrink-0">{name}</span>
              <span className="flex flex-wrap gap-0.5">
                {codes.map((code) => (
                  <Sticker key={code} code={code} displayFlag={false} compact />
                ))}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={expandAll}
          disabled={allExpanded}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◎ {t('expandAll')}
        </button>
        <button
          onClick={collapseAll}
          disabled={allCollapsed}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◎ {t('collapseAll')}
        </button>
      </div>
      {groups.map(({ prefix, codes }) => {
        const isOpen = expandedSet.has(prefix)
        const icon = prefix === '00' ? '⭐' : flagOf(prefix)
        const name = teamName(prefix, t)
        return (
          <details key={prefix} open={isOpen} className="group border border-gray-200 rounded-lg overflow-hidden">
            <summary
              onClick={(e) => { e.preventDefault(); toggle(prefix) }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-700 list-none [&::-webkit-details-marker]:hidden"
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{name}</span>
              <span className="text-xs text-gray-400">({codes.length})</span>
              <span className="ml-auto">
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="flex flex-wrap gap-1 p-3 border-t border-gray-100">
              {codes.map((code) => (
                <Sticker key={code} code={code} displayFlag={false} />
              ))}
            </div>
          </details>
        )
      })}
    </div>
  )
}
