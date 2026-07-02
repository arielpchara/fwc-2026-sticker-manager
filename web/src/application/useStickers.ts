import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../storage/hooks.js'
import { setOwn, addSurplus } from '../storage/stickerSlice.js'
import { upsertEntry, removeEntry, type CompareEntry } from '../storage/compareSlice.js'
import { parseOwnText, parseSurplusText, computeExtras } from './stickerService.js'

export function useOwnStickers() {
  const inv = useAppSelector((s) => s.sticker.inv)
  const dispatch = useAppDispatch()

  const addOwn = useCallback(
    (text: string) => {
      const result = parseOwnText(text)
      dispatch(setOwn(result.inv))
      return result
    },
    [dispatch],
  )

  return { inv, addOwn, stickers: Object.keys(inv).sort(), extras: computeExtras(inv) }
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
