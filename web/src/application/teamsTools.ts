import { GROUPS, MAX_STICKERS_PER_TEAM } from "../constants/groups";

export function getMaxStickerPerTeam(team: string): number {
  if (team === "00") return 1;
  if (team === "FWC") return 19;
  if (team === "CC") return 14;
  const group = GROUPS.find((g) => g.prefixes.includes(team));
  if (group) return MAX_STICKERS_PER_TEAM;
  return 0;
}
