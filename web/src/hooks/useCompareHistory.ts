import { useCallback } from "react";
import { removeEntry, upsertEntry } from "../storage/compareSlice.js";
import { useAppDispatch, useAppSelector } from "../storage/hooks.js";
import { CompareEntry } from "../type/compare.js";

export function useCompareHistory() {
  const entries = useAppSelector((s) => s.compare?.entries ?? {});
  const dispatch = useAppDispatch();

  const saveEntry = useCallback(
    (entry: CompareEntry) => {
      dispatch(upsertEntry(entry));
    },
    [dispatch],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      dispatch(removeEntry(id));
    },
    [dispatch],
  );

  return { entries, saveEntry, deleteEntry };
}
