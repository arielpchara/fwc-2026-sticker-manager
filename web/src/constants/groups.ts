export interface GroupInfo {
  labelKey: string;
  prefixes: string[];
  order: number;
}

export const MAX_STICKERS_PER_TEAM = 20;

export const GROUPS: GroupInfo[] = [
  { labelKey: "group_A", prefixes: ["MEX", "RSA", "KOR", "CZE"], order: 0 },
  { labelKey: "group_B", prefixes: ["CAN", "BIH", "QAT", "SUI"], order: 1 },
  { labelKey: "group_C", prefixes: ["BRA", "MAR", "HAI", "SCO"], order: 2 },
  { labelKey: "group_D", prefixes: ["USA", "PAR", "AUS", "TUR"], order: 3 },
  { labelKey: "group_E", prefixes: ["GER", "CUW", "CIV", "ECU"], order: 4 },
  { labelKey: "group_F", prefixes: ["NED", "JPN", "SWE", "TUN"], order: 5 },
  { labelKey: "group_G", prefixes: ["BEL", "EGY", "IRN", "NZL"], order: 6 },
  { labelKey: "group_H", prefixes: ["ESP", "CPV", "KSA", "URU"], order: 7 },
  { labelKey: "group_I", prefixes: ["FRA", "SEN", "IRQ", "NOR"], order: 8 },
  { labelKey: "group_J", prefixes: ["ARG", "ALG", "AUT", "JOR"], order: 9 },
  { labelKey: "group_K", prefixes: ["POR", "COD", "UZB", "COL"], order: 10 },
  { labelKey: "group_L", prefixes: ["ENG", "CRO", "GHA", "PAN"], order: 11 },
];

export const GROUPS_INDEX_PREFIX: Record<string, [number, number]> = {
  MEX: [0, 0],
  RSA: [0, 1],
  KOR: [0, 2],
  CZE: [0, 3],
  CAN: [1, 0],
  BIH: [1, 1],
  QAT: [1, 2],
  SUI: [1, 3],
  BRA: [2, 0],
  MAR: [2, 1],
  HAI: [2, 2],
  SCO: [2, 3],
  USA: [3, 0],
  PAR: [3, 1],
  AUS: [3, 2],
  TUR: [3, 3],
  GER: [4, 0],
  CUW: [4, 1],
  CIV: [4, 2],
  ECU: [4, 3],
  NED: [5, 0],
  JPN: [5, 1],
  SWE: [5, 2],
  TUN: [5, 3],
  BEL: [6, 0],
  EGY: [6, 1],
  IRN: [6, 2],
  NZL: [6, 3],
  ESP: [7, 0],
  CPV: [7, 1],
  KSA: [7, 2],
  URU: [7, 3],
  FRA: [8, 0],
  SEN: [8, 1],
  IRQ: [8, 2],
  NOR: [8, 3],
  ARG: [9, 0],
  ALG: [9, 1],
  AUT: [9, 2],
  JOR: [9, 3],
  POR: [10, 0],
  COD: [10, 1],
  UZB: [10, 2],
  COL: [10, 3],
  ENG: [11, 0],
  CRO: [11, 1],
  GHA: [11, 2],
  PAN: [11, 3],
};

export const PREFIX_TO_GROUP = new Map<string, GroupInfo>();
for (const g of GROUPS) {
  for (const p of g.prefixes) {
    PREFIX_TO_GROUP.set(p, g);
  }
}

const FALLBACK_GROUP: GroupInfo = {
  labelKey: "specialLabel",
  prefixes: [],
  order: -1,
};

export function groupOf(prefix: string): GroupInfo {
  return PREFIX_TO_GROUP.get(prefix) ?? FALLBACK_GROUP;
}
