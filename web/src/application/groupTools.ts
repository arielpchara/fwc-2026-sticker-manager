import { GROUPS, MAX_STICKERS_PER_TEAM } from "../constants/groups";

export function getMaxStickerPerTeam(team: string): number {
  const group = GROUPS.find((g) => g.prefixes.includes(team));
  return group
    ? MAX_STICKERS_PER_TEAM
    : team === "00"
      ? 1
      : team === "FWC"
        ? 19
        : 0;
}
