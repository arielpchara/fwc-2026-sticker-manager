import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface StickerState {
  inv: Record<string, number>
}

const initialState: StickerState = {
  inv: {},
}

const stickerSlice = createSlice({
  name: 'sticker',
  initialState,
  reducers: {
    setOwn(state, action: PayloadAction<Record<string, number>>) {
      state.inv = action.payload
    },
    addSurplus(state, action: PayloadAction<Record<string, number>>) {
      for (const [code, surplusQty] of Object.entries(action.payload)) {
        state.inv[code] = 1 + surplusQty
      }
    },
    clearOwn(state) {
      state.inv = {}
    },
  },
})

export const { setOwn, addSurplus, clearOwn } = stickerSlice.actions
export default stickerSlice.reducer
