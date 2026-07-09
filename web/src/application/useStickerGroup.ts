import { useMemo } from "react";
import { StickerGroupByGroup, StickerGroupByTeam } from "../type/group.js";
import { Stickers } from "../type/sticker.js";
import { groupByGroup, groupByTeam } from "./stickerTools.js";

interface StateStickerGroup {
  byTeam: StickerGroupByTeam[];
  byGroup: StickerGroupByGroup[];
}

export function useStickerGroup(stickers: Stickers): StateStickerGroup {
  return useMemo(() => {
    const byTeam = groupByTeam(stickers);
    const byGroup = groupByGroup(byTeam);
    return {
      byTeam,
      byGroup,
    };
  }, [stickers]);
}
