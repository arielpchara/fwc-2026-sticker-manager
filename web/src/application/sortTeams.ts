import type { StickerGroupByTeam } from "../type/group.js";
import { getMaxStickerPerTeam } from "./teamsTools.js";

export type TeamSort = "completion" | "code" | null;

function missingCount(team: StickerGroupByTeam, showMissing: boolean): number {
  if (showMissing) {
    const max = getMaxStickerPerTeam(team.team);
    const owned = Object.values(team.stickers).filter((q) => q > 0).length;
    return max - owned;
  }
  const max = getMaxStickerPerTeam(team.team);
  return max - Object.keys(team.stickers).length;
}

export function sortTeams(
  teams: StickerGroupByTeam[],
  sort: TeamSort,
  showMissing: boolean,
): StickerGroupByTeam[] {
  if (sort === null) return teams;
  return [...teams].sort((a, b) => {
    if (sort === "code") return a.team.localeCompare(b.team);
    const mA = missingCount(a, showMissing);
    const mB = missingCount(b, showMissing);
    if (mA !== mB) return mA - mB;
    return a.team.localeCompare(b.team);
  });
}
