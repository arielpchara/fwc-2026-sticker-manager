import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface TradeEntry {
  label: string
  giveItems: string[]
  receiveItems: string[]
  savedAt: number
}

export interface TradeState {
  entries: TradeEntry[]
}

const MAX_ENTRIES = 10

const tradeSlice = createSlice({
  name: 'trade',
  initialState: { entries: [] } as TradeState,
  reducers: {
    upsertTrade(state, action: PayloadAction<TradeEntry>) {
      const idx = state.entries.findIndex(e => e.label === action.payload.label)
      if (idx !== -1) {
        state.entries[idx] = action.payload
      } else {
        state.entries.push(action.payload)
      }
      if (state.entries.length > MAX_ENTRIES) {
        state.entries = [...state.entries]
          .sort((a, b) => b.savedAt - a.savedAt)
          .slice(0, MAX_ENTRIES)
      }
    },
    removeTrade(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.label !== action.payload)
    },
  },
})

export const { upsertTrade, removeTrade } = tradeSlice.actions
export default tradeSlice.reducer
