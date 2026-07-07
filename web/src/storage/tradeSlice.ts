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
      state.trades[action.payload.name] = action.payload
    },
    deleteTrade(state, action: PayloadAction<string>) {
      state.trades = Object.fromEntries(
        Object.entries(state.trades).filter(([name]) => name !== action.payload),
      )
    },
  },
})

export const { setTrade, deleteTrade } = tradeSlice.actions
export default tradeSlice.reducer
