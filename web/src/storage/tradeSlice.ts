import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Trade, TradeBy, TradeState } from '../type/trade'


interface UpdateTradePayload {
  key: string
  trades: TradeBy[]
}

const tradeSlice = createSlice({
  name: 'trade',
  initialState: { trades: {} } as TradeState,
  reducers: {
    updateTrade(state, action: PayloadAction<TradeBy>) {},
    setTrade(state, action: PayloadAction<Trade>) {
      const prev = state.trades[action.payload.name]
      state.trades[action.payload.name] = {
        ...action.payload,
        // keep note unless caller sets it explicitly
        note: action.payload.note !== undefined ? action.payload.note : prev?.note,
      }
    },
    setNote(state, action: PayloadAction<{ name: string; note: string }>) {
      const { name, note } = action.payload
      const existing = state.trades[name]
      if (existing) {
        existing.note = note
        return
      }
      state.trades[name] = {
        name,
        trades: [],
        isLock: false,
        savedAt: Date.now(),
        note,
      }
    },
    deleteTrade(state, action: PayloadAction<string>) {
      state.trades = Object.fromEntries(
        Object.entries(state.trades).filter(([name]) => name !== action.payload),
      )
    },
    replaceTrades(state, action: PayloadAction<Record<string, Trade>>) {
      state.trades = action.payload
    },
    renameTrade(state, action: PayloadAction<{ from: string; to: string }>) {
      const { from, to } = action.payload
      if (!to || from === to || state.trades[to]) return
      const existing = state.trades[from]
      if (!existing) return
      delete state.trades[from]
      state.trades[to] = { ...existing, name: to }
    },
  },
})

export const { setTrade, setNote, deleteTrade, replaceTrades, renameTrade } = tradeSlice.actions
export default tradeSlice.reducer
