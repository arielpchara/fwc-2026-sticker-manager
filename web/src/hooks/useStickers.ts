import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../storage/hooks.js";
import { stickerActions as stickerActions } from "../storage/stickerSlice.js";
import { Inventory } from "../type/sticker.js";
import { generateEmptyInventory } from "../application/inventory.js";
import { extractStickerFromText } from "../application/stickerService.js";
import { filterOnlyExtrasFromInventory } from "../application/filterInventory.js";

export function useStickers() {
  const inventory = useAppSelector((s) => s.sticker.inventory);
  const dispatch = useAppDispatch();

  const extraInventory = useMemo(
    () => filterOnlyExtrasFromInventory(inventory),
    [inventory],
  );

  const overwriteInventory = useCallback(
    (text: string) => {
      const stickers = extractStickerFromText(text);
      const newInventory: Inventory = generateEmptyInventory();
      for (const [sticker, quantity] of Object.entries(stickers))
        newInventory[sticker] = quantity;
      dispatch(stickerActions.overwrite(newInventory));
      return { count: stickers.length, stickers, inventory: newInventory };
    },
    [dispatch],
  );

  const increaseInventory = useCallback(
    (text: string) => {
      const stickers = extractStickerFromText(text);
      dispatch(stickerActions.increment(stickers));
      return { count: stickers.length, stickers };
    },
    [dispatch],
  );

  const subtractInventory = useCallback(
    (text: string) => {
      const stickers = extractStickerFromText(text);
      dispatch(stickerActions.decrement(stickers));
      return { count: stickers.length, stickers };
    },
    [dispatch],
  );

  return {
    inventory,
    extraInventory,
    overwriteInventory,
    increaseInventory,
    subtractInventory,
    stickers: Object.keys(inventory).sort(),
  };
}
