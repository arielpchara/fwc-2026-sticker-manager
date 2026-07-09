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
        delete state.inv[code];
      }
    },
    addSurplus(state, action: PayloadAction<Record<string, number>>) {
      for (const [code, surplusQty] of Object.entries(action.payload)) {
        state.inv[code] = 1 + surplusQty;
      }
    },
    clearOwn(state) {
      state.inv = {};
    },
  },
});

export const { setOwn, mergeOwn, removeOwn, addSurplus, clearOwn } =
  stickerSlice.actions;
export default stickerSlice.reducer;
