import { useMemo } from "react";
import { StickerGroupByGroup, StickerGroupByTeam } from "../type/group.js";
import { Inventory } from "../type/sticker.js";
import { groupByGroup, groupByTeam } from "../application/stickerTools.js";

interface StateStickerGroup {
  byTeam: StickerGroupByTeam[];
  byGroup: StickerGroupByGroup[];
}

export function useStickerGroup(stickers: Inventory): StateStickerGroup {
  return useMemo(() => {
    const byTeam = groupByTeam(stickers);
    const byGroup = groupByGroup(byTeam);
    return {
      byTeam,
      byGroup,
    };
  }, [stickers]);
}
