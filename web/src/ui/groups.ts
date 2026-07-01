export interface GroupInfo {
  label: string
  prefixes: string[]
  order: number
}

const GROUPS: GroupInfo[] = [
  { label: 'Grupo A', prefixes: ['MEX', 'RSA', 'KOR', 'CZE'], order: 0 },
  { label: 'Grupo B', prefixes: ['CAN', 'BIH', 'QAT', 'SUI'], order: 1 },
  { label: 'Grupo C', prefixes: ['BRA', 'MAR', 'HAI', 'SCO'], order: 2 },
  { label: 'Grupo D', prefixes: ['USA', 'PAR', 'AUS', 'TUR'], order: 3 },
  { label: 'Grupo E', prefixes: ['GER', 'CUW', 'CIV', 'ECU'], order: 4 },
  { label: 'Grupo F', prefixes: ['NED', 'JPN', 'SWE', 'TUN'], order: 5 },
  { label: 'Grupo G', prefixes: ['BEL', 'EGY', 'IRN', 'NZL'], order: 6 },
  { label: 'Grupo H', prefixes: ['ESP', 'CPV', 'KSA', 'URU'], order: 7 },
  { label: 'Grupo I', prefixes: ['FRA', 'SEN', 'IRQ', 'NOR'], order: 8 },
  { label: 'Grupo J', prefixes: ['ARG', 'ALG', 'AUT', 'JOR'], order: 9 },
  { label: 'Grupo K', prefixes: ['POR', 'COD', 'UZB', 'COL'], order: 10 },
  { label: 'Grupo L', prefixes: ['ENG', 'CRO', 'GHA', 'PAN'], order: 11 },
]

const PREFIX_TO_GROUP = new Map<string, GroupInfo>()
for (const g of GROUPS) {
  for (const p of g.prefixes) {
    PREFIX_TO_GROUP.set(p, g)
  }
}

const FALLBACK_GROUP: GroupInfo = { label: 'Especiais', prefixes: [], order: -1 }

export function groupOf(prefix: string): GroupInfo {
  return PREFIX_TO_GROUP.get(prefix) ?? FALLBACK_GROUP
}
