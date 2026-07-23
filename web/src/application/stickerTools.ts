import { GROUPS, groupOf } from "../constants/groups.js";
import { StickerGroupByTeam, StickerGroupByGroup } from "../type/group";
import { Inventory, StickerType } from "../type/sticker";

export function prefixOf(code: string) {
  return code === "00" ? "00" : code.slice(0, 3);
}

export function suffixNum(code: string) {
  return code === "00" ? 0 : parseInt(code.slice(3), 10);
}

export function isChroma(code: string) {
  const n = suffixNum(code);
  return n === 1 || n === 0 || prefixOf(code) === "FWC";
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
  const teamIndex: Record<string, number> = Object.fromEntries([
    ["00", 0],
    ["FWC", 1],
    ...teamsOrder.map((t, i) => [t, i + 2]),
  ]);
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
  const specials = byTeam.filter((sg) => {
    const info = groupOf(sg.team);
    return info.order < 0;
  });
  if (specials.length > 0) {
    teamGroup.unshift({ labelKey: "specialLabel", teams: specials });
  }
  return teamGroup;
}

export function countExtrasFromInventory(inventory: Inventory): number {
  return Object.entries(inventory).reduce(
    (count, [, quantity]) => count + quantity,
    0,
  );
}
