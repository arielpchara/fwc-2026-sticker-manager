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

  const updateEntryStickers = useCallback(
    (entry: CompareEntry | undefined, remove: Iterable<string>) => {
      if (!entry) return;
      const drop = new Set(remove);
      dispatch(
        upsertEntry({
          ...entry,
          stickers: entry.stickers.filter((s) => !drop.has(s)),
          savedAt: Date.now(),
        }),
      );
    },
    [dispatch],
  );

  return { entries, saveEntry, deleteEntry, updateEntryStickers };
}
