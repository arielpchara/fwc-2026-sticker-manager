import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CompareEntry, CompareState } from "../type/compare";

function entryKey(e: CompareEntry): string {
  return e.mode + "-" + e.name;
}

const compareSlice = createSlice({
  name: "compare",
  initialState: { entries: {} } as CompareState,
  reducers: {
    upsertEntry(state, action: PayloadAction<CompareEntry>) {
      const newEntry = action.payload;
      state.entries[entryKey(newEntry)] = newEntry;
    },
    removeEntry(state, action: PayloadAction<string>) {
      state.entries = Object.fromEntries(
        Object.entries(state.entries).filter(([key]) => key !== action.payload),
      );
    },
    setEntries(state, action: PayloadAction<Record<string, CompareEntry>>) {
      state.entries = action.payload;
    },
  },
});

export const { upsertEntry, removeEntry, setEntries } = compareSlice.actions;
export default compareSlice.reducer;
