import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CompareEntry {
  label: string
  theirText: string
  savedAt: number
  missing: string[]
  mode: 'receive' | 'give'
}

export interface CompareState {
  entries: CompareEntry[]
}

const MAX_ENTRIES = 10

function entryKey(e: CompareEntry): string {
  return e.mode + '-' + e.label
}

function capEntries(entries: CompareEntry[]): CompareEntry[] {
  if (entries.length <= MAX_ENTRIES) return entries
  return [...entries].sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_ENTRIES)
}

const compareSlice = createSlice({
  name: 'compare',
  initialState: { entries: [] } as CompareState,
  reducers: {
    upsertEntry(state, action: PayloadAction<CompareEntry>) {
      const key = entryKey(action.payload)
      const idx = state.entries.findIndex((e) => entryKey(e) === key)
      if (idx !== -1) {
        state.entries[idx] = action.payload
      } else {
        state.entries.push(action.payload)
      }
      state.entries = capEntries(state.entries)
    },
    removeEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((e) => entryKey(e) !== action.payload)
    },
  },
})

export const { upsertEntry, removeEntry } = compareSlice.actions
export default compareSlice.reducer
