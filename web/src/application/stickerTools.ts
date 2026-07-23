import { GROUPS, groupOf } from "../constants/groups.js";
import { StickerGroupByTeam, StickerGroupByGroup } from "../type/group";
import { Inventory, StickerType } from "../type/sticker";

export function prefixOf(sticker: string) {
  return sticker.match(/^(\D{2,3}|00)/gi)?.[0] || "NOT_FOUND";
}

export function numberOf(sticker: string) {
  const stickerNumber = sticker.match(/(\d{1,2})$/gi)?.[0] || "NOT_FOUND";
  return parseInt(stickerNumber, 10);
}

export function isChroma(code: string) {
  const number = numberOf(code);
  const prefix = prefixOf(code);
  if (prefix === "CC") {
    return false;
  }
  return prefix === "FWC" || number === 1 || number === 0;
}

export function getStickerType(code: string): StickerType {
  return isChroma(code) ? "chroma" : "normal";
}

export function stickerGroupByType(codes: string[]) {
  const chroma: string[] = [];
  const normal: string[] = [];
  for (const code of codes) {
    if (isChroma(code)) {
      chroma.push(code);
    } else {
      normal.push(code);
    }
  }
  return { chroma, normal };
}

export function groupByTeam(stickers: Inventory): StickerGroupByTeam[] {
  const teamsOrder = GROUPS.flatMap((g) => g.prefixes);
  const teamIndex: Record<string, number> = Object.fromEntries(
    teamsOrder.map((t, i) => [t, i]),
  );
  const stickerGroup: StickerGroupByTeam[] = [];
  for (const [code, qtd] of Object.entries(stickers)) {
    const team = prefixOf(code);
    let i = teamIndex[team] ?? teamIndex.length;
    stickerGroup[i] ??= { team, stickers: {} };
    stickerGroup[i].stickers[code] = qtd;
    teamIndex[team] = i;
  }
  return stickerGroup;
}

export function groupByGroup(
  byTeam: StickerGroupByTeam[],
): StickerGroupByGroup[] {
  const teamGroup: StickerGroupByGroup[] = [];
  for (const group of GROUPS) {
    const teams = byTeam.filter(({ team }) => group.prefixes.includes(team));
    if (teams.length > 0) {
      const sortedTeams = group.prefixes
        .map((p) => teams.find((t) => t.team === p))
        .filter(Boolean) as StickerGroupByTeam[];
      teamGroup.push({ labelKey: group.labelKey, teams: sortedTeams });
    }
  }
  return teamGroup;
}

export const countInventory = (inventory: Inventory): number =>
  Object.keys(inventory)?.length || 0;
