import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Inventory } from "../type/sticker";
import { generateEmptyInventory } from "../application/inventory";

export interface StickerState {
  inventory: Inventory;
}

const initialState: StickerState = {
  inventory: generateEmptyInventory(),
};

const stickerSlice = createSlice({
  name: "sticker",
  initialState,
  reducers: {
    overwrite(state, action: PayloadAction<Record<string, number>>) {
      state.inventory = action.payload;
    },
    decrement(state, action: PayloadAction<Record<string, number>>) {
      for (const [sticker, count] of Object.entries(action.payload)) {
        if (state.inventory[sticker] !== undefined) {
          state.inventory[sticker] -= count;
          if (state.inventory[sticker] <= 0) {
            state.inventory[sticker] = 0;
          }
        }
      }
    },
    increment(state, action: PayloadAction<Record<string, number>>) {
      for (const [code, surplusQty] of Object.entries(action.payload)) {
        state.inventory[code] = 1 + surplusQty;
      }
    },
    clear(state) {
      state.inventory = generateEmptyInventory();
    },
  },
});

export const stickerActions = stickerSlice.actions;

export default stickerSlice.reducer;
