import { useState, useCallback, useMemo } from 'react'
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
  return n === 1 || n === 0 || prefixOf(code) === 'FWC'
}

interface TradeRow {
  give: string
  receive: string
}

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

  const chromaGive = useMemo(() => giveItems.filter(isChroma), [giveItems])
  const chromaReceive = useMemo(() => receiveItems.filter(isChroma), [receiveItems])
  const regularGive = useMemo(() => giveItems.filter(c => !isChroma(c)), [giveItems])
  const regularReceive = useMemo(() => receiveItems.filter(c => !isChroma(c)), [receiveItems])

  const initialChroma = useMemo(() => buildRows(chromaGive, chromaReceive), [chromaGive, chromaReceive])
  const initialRegular = useMemo(() => buildRows(regularGive, regularReceive), [regularGive, regularReceive])

  const [chromaRows, setChromaRows] = useState<TradeRow[]>(initialChroma)
  const [regularRows, setRegularRows] = useState<TradeRow[]>(initialRegular)
  const [editingSection, setEditingSection] = useState<'chroma' | 'regular' | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const allRows = useMemo(() => [...chromaRows, ...regularRows], [chromaRows, regularRows])

  const assignedGive = useMemo(() => new Set(allRows.map(r => r.give)), [allRows])
  const assignedReceive = useMemo(() => new Set(allRows.map(r => r.receive)), [allRows])

  const unpairedGive = useMemo(() => giveItems.filter(c => !assignedGive.has(c)), [giveItems, assignedGive])
  const unpairedReceive = useMemo(() => receiveItems.filter(c => !assignedReceive.has(c)), [receiveItems, assignedReceive])

  function toggleEdit(section: 'chroma' | 'regular', index: number) {
    if (editingSection === section && editingIndex === index) {
      setEditingSection(null)
      setEditingIndex(null)
    } else {
      setEditingSection(section)
      setEditingIndex(index)
    }
  }

  function handleChange(section: 'chroma' | 'regular', index: number, side: 'give' | 'receive', value: string) {
    const setter = section === 'chroma' ? setChromaRows : setRegularRows
    setter(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [side]: value }
      return next
    })
    setEditingSection(null)
    setEditingIndex(null)
  }

  function getAvailable(items: string[], rows: TradeRow[], rowIndex: number, side: 'give' | 'receive'): string[] {
    const used = new Set(rows.filter((_, i) => i !== rowIndex).map(r => r[side]))
    return items.filter(c => c !== rows[rowIndex][side] && !used.has(c))
  }

  function renderRowCells(row: TradeRow, i: number, section: 'chroma' | 'regular') {
    const isEditing = editingSection === section && editingIndex === i
    const items = section === 'chroma' ? { give: chromaGive, receive: chromaReceive } : { give: regularGive, receive: regularReceive }
    const rows = section === 'chroma' ? chromaRows : regularRows
    const availGive = getAvailable(items.give, rows, i, 'give')
    const availReceive = getAvailable(items.receive, rows, i, 'receive')

    return (
      <tr key={i} className="border-b border-gray-50">
        <td className="py-1 whitespace-nowrap">
          {isEditing ? (
            <select
              value={row.give}
              onChange={e => handleChange(section, i, 'give', e.target.value)}
              className="text-xs border border-gray-300 rounded px-1 py-0.5"
            >
              <option value={row.give}>{row.give}</option>
              {availGive.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <Sticker code={row.give} displayFlag />
          )}
        </td>
        <td className="text-gray-300 px-2 text-center">→</td>
        <td className="py-1 whitespace-nowrap">
          {isEditing ? (
            <select
              value={row.receive}
              onChange={e => handleChange(section, i, 'receive', e.target.value)}
              className="text-xs border border-gray-300 rounded px-1 py-0.5"
            >
              <option value={row.receive}>{row.receive}</option>
              {availReceive.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <Sticker code={row.receive} displayFlag />
          )}
        </td>
        <td className="py-1 pl-2">
          <button
            onClick={() => toggleEdit(section, i)}
            className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
          >
            {isEditing ? t('doneBtn') : t('editBtn')}
          </button>
        </td>
      </tr>
    )
  }

  function renderSection(rows: TradeRow[], section: 'chroma' | 'regular') {
    if (rows.length === 0) return null
    const label = section === 'chroma' ? t('tradeChroma') : t('tradeRegular')
    return (
      <>
        <tr className="border-b border-gray-100">
          <td colSpan={4} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pt-3 pb-1">{label}</td>
        </tr>
        {rows.map((row, i) => renderRowCells(row, i, section))}
      </>
    )
  }

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

      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-400 uppercase tracking-wider">
            <th className="font-medium pb-1">{t('tradeMy')}</th>
            <th className="font-medium pb-1" />
            <th className="font-medium pb-1">{t('tradeYours')}</th>
            <th className="font-medium pb-1" />
          </tr>
        </thead>
        <tbody>
          {renderSection(chromaRows, 'chroma')}
          {renderSection(regularRows, 'regular')}
        </tbody>
      </table>

      {(unpairedGive.length > 0 || unpairedReceive.length > 0) && (
        <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
          {unpairedGive.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400 font-medium shrink-0">{t('tradeMy')}:</span>
              {unpairedGive.map(c => <Sticker key={c} code={c} displayFlag compact />)}
            </div>
          )}
          {unpairedReceive.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400 font-medium shrink-0">{t('tradeYours')}:</span>
              {unpairedReceive.map(c => <Sticker key={c} code={c} displayFlag compact />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
