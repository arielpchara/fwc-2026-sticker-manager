import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../storage/hooks.js'
import { setOwn, mergeOwn, removeOwn, addSurplus } from '../storage/stickerSlice.js'
import { upsertEntry, removeEntry, type CompareEntry } from '../storage/compareSlice.js'
import { upsertTrade, removeTrade, type TradeEntry } from '../storage/tradeSlice.js'
import { parseOwnText, parseSurplusText, computeExtras, parseText } from './stickerService.js'
import type { Inventory } from './stickerService.js'

export function useOwnStickers() {
  const inv = useAppSelector((s) => s.sticker.inv)
  const dispatch = useAppDispatch()

  const updateOwn = useCallback(
    (text: string) => {
      const codes = parseText(text)
      const newInv: Inventory = {}
      for (const c of codes) newInv[c] = 1
      dispatch(setOwn(newInv))
      return { count: codes.length, stickers: codes, inv: newInv }
    },
    [dispatch],
  )

  const addStickers = useCallback(
    (text: string) => {
      const codes = parseText(text)
      dispatch(mergeOwn(codes))
      return { count: codes.length, stickers: codes }
    },
    [dispatch],
  )

  const removeStickers = useCallback(
    (text: string) => {
      const codes = parseText(text)
      dispatch(removeOwn(codes))
      return { count: codes.length, stickers: codes }
    },
    [dispatch],
  )

  return { inv, updateOwn, addStickers, removeStickers, stickers: Object.keys(inv).sort(), extras: computeExtras(inv) }
}

export function useSurplusStickers() {
  const dispatch = useAppDispatch()

  const addSurplusText = useCallback(
    (text: string) => {
      const result = parseSurplusText(text)
      dispatch(addSurplus(result.surplus))
      return result
    },
    [dispatch],
  )

  return { addSurplusText }
}

export function useCompareHistory() {
  const entries = useAppSelector((s) => s.compare?.entries ?? [])
  const dispatch = useAppDispatch()

  const saveEntry = useCallback(
    (entry: CompareEntry) => {
      dispatch(upsertEntry(entry))
    },
    [dispatch],
  )

  const deleteEntry = useCallback(
    (id: string) => {
      dispatch(removeEntry(id))
    },
    [dispatch],
  )

  return { entries, saveEntry, deleteEntry }
}

export function useTradeHistory() {
  const entries = useAppSelector((s) => s.trade?.entries ?? [])
  const dispatch = useAppDispatch()

  const saveTrade = useCallback(
    (entry: TradeEntry) => {
      dispatch(upsertTrade(entry))
    },
    [dispatch],
  )

  const deleteTrade = useCallback(
    (label: string) => {
      dispatch(removeTrade(label))
    },
    [dispatch],
  )

  return { entries, saveTrade, deleteTrade }
}
