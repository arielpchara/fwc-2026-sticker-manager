import { useCallback, useMemo, Fragment } from 'react'
import { groupOf } from '../data/groups.js'
import { useLocale } from '../../i18n/index.js'
import Sticker from '../common/Sticker.js'

function prefixOf(code: string) {
  return code === '00' ? '00' : code.slice(0, 3)
}

function suffixNum(code: string) {
  return code === '00' ? 0 : parseInt(code.slice(3), 10)
}

function isChroma(code: string) {
  const n = suffixNum(code)
  return n === 1 || prefixOf(code) === 'FWC'
}

interface TradeRow {
  give: string
  receive: string
}

export default function TradeResult({
  label,
  giveItems,
  receiveItems,
}: {
  label: string
  giveItems: string[]
  receiveItems: string[]
}) {
  const { t } = useLocale()
  const { chromaRows, regularRows } = useMemo(() => {
    function buildRows(give: string[], receive: string[]): TradeRow[] {
      const map = new Map<number, { give: string[]; receive: string[] }>()

      for (const code of give) {
        const n = suffixNum(code)
        if (!map.has(n)) map.set(n, { give: [], receive: [] })
        map.get(n)!.give.push(code)
      }
      for (const code of receive) {
        const n = suffixNum(code)
        if (!map.has(n)) map.set(n, { give: [], receive: [] })
        map.get(n)!.receive.push(code)
      }

      const rows: TradeRow[] = []
      const nums = [...map.keys()].sort((a, b) => a - b)

      for (const n of nums) {
        const { give: gList, receive: rList } = map.get(n)!
        const sortFn = (a: string, b: string) => {
          const ga = groupOf(prefixOf(a)).order
          const gb = groupOf(prefixOf(b)).order
          if (ga !== gb) return ga - gb
          return suffixNum(a) - suffixNum(b)
        }
        gList.sort(sortFn)
        rList.sort(sortFn)

        const maxLen = Math.max(gList.length, rList.length)
        for (let i = 0; i < maxLen; i++) {
          rows.push({
            give: gList[i] ?? null,
            receive: rList[i] ?? null,
          })
        }
      }

      rows.sort((a, b) => {
        const codeA = a.give ?? a.receive!
        const codeB = b.give ?? b.receive!
        const ga = groupOf(prefixOf(codeA)).order
        const gb = groupOf(prefixOf(codeB)).order
        if (ga !== gb) return ga - gb
        return suffixNum(codeA) - suffixNum(codeB)
      })

      return rows.filter((r): r is TradeRow => r.give !== null && r.receive !== null)
    }

    const chromaGive = giveItems.filter(isChroma)
    const chromaReceive = receiveItems.filter(isChroma)
    const regularGive = giveItems.filter(c => !isChroma(c))
    const regularReceive = receiveItems.filter(c => !isChroma(c))

    return {
      chromaRows: buildRows(chromaGive, chromaReceive),
      regularRows: buildRows(regularGive, regularReceive),
    }
  }, [giveItems, receiveItems])

  const handleCopy = useCallback(() => {
    function sectionLines(rows: TradeRow[], header: string): string[] {
      if (rows.length === 0) return []
      return [header, ...rows.map(r => `${r.give} > ${r.receive}`)]
    }

    const lines: string[] = [`${t('tradeWith', { name: label })}`]
    lines.push(...sectionLines(chromaRows, t('tradeChroma')))
    lines.push(...sectionLines(regularRows, t('tradeRegular')))
    navigator.clipboard.writeText(lines.join('\n'))
  }, [label, chromaRows, regularRows, t])

  const totalRows = chromaRows.length + regularRows.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">
          {t('tradeWith', { name: label })} <span className="text-gray-400 font-normal">({totalRows})</span>
        </p>
        <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {t('copyBtn')}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('tradeMy')}</span>
        <span />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('tradeYours')}</span>

        {chromaRows.length > 0 && (
          <>
            <span className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 -mb-0.5">{t('tradeChroma')}</span>
            {chromaRows.map((row, i) => (
              <Fragment key={i}>
                <Sticker code={row.give} displayFlag />
                <span className="text-gray-300 text-center">→</span>
                <Sticker code={row.receive} displayFlag />
              </Fragment>
            ))}
          </>
        )}

        {regularRows.length > 0 && (
          <>
            <span className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 -mb-0.5">{t('tradeRegular')}</span>
            {regularRows.map((row, i) => (
              <Fragment key={i}>
                <Sticker code={row.give} displayFlag />
                <span className="text-gray-300 text-center">→</span>
                <Sticker code={row.receive} displayFlag />
              </Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
