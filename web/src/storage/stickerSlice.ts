import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Stickers } from "../type/sticker";

export interface StickerState {
  inv: Stickers;
}

const initialState: StickerState = {
  inv: {},
};

const stickerSlice = createSlice({
  name: "sticker",
  initialState,
  reducers: {
    setOwn(state, action: PayloadAction<Record<string, number>>) {
      state.inv = action.payload;
    },
    mergeOwn(state, action: PayloadAction<string[]>) {
      for (const code of action.payload) {
        if (!state.inv[code]) state.inv[code] = 1;
      }
    },
    removeOwn(state, action: PayloadAction<string[]>) {
      for (const code of action.payload) {
        if (state.inv[code] !== undefined || state.inv[code] > 0) {
          state.inv[code] -= 1;
        }
      }
    },
    addSurplus(state, action: PayloadAction<Record<string, number>>) {
      for (const [code, surplusQty] of Object.entries(action.payload)) {
        state.inv[code] = 1 + surplusQty;
      }
    },
    setSurplus(state, action: PayloadAction<Record<string, number>>) {
      const inv: Record<string, number> = {};
      for (const [code, surplusQty] of Object.entries(action.payload)) {
        inv[code] = 1 + surplusQty;
      }
      state.inv = inv;
    },
    clearOwn(state) {
      state.inv = {};
    },
  },
});

export const { setOwn, mergeOwn, removeOwn, addSurplus, setSurplus, clearOwn } =
  stickerSlice.actions;
export default stickerSlice.reducer;
