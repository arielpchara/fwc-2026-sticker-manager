const FLAGS: Record<string, string> = {
  ALG: '🇩🇿',
  ANG: '🇦🇴',
  ARG: '🇦🇷',
  AUS: '🇦🇺',
  AUT: '🇦🇹',
  BEL: '🇧🇪',
  BIH: '🇧🇦',
  BRA: '🇧🇷',
  CAN: '🇨🇦',
  CIV: '🇨🇮',
  CMR: '🇨🇲',
  COD: '🇨🇩',
  COL: '🇨🇴',
  CPV: '🇨🇻',
  CRO: '🇭🇷',
  CUW: '🇨🇼',
  CZE: '🇨🇿',
  DEN: '🇩🇰',
  ECU: '🇪🇨',
  EGY: '🇪🇬',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ESP: '🇪🇸',
  FRA: '🇫🇷',
  GER: '🇩🇪',
  GHA: '🇬🇭',
  HAI: '🇭🇹',
  IRN: '🇮🇷',
  IRQ: '🇮🇶',
  JOR: '🇯🇴',
  JPN: '🇯🇵',
  KOR: '🇰🇷',
  KSA: '🇸🇦',
  MAR: '🇲🇦',
  MEX: '🇲🇽',
  NED: '🇳🇱',
  NOR: '🇳🇴',
  NZL: '🇳🇿',
  PAN: '🇵🇦',
  PAR: '🇵🇾',
  POR: '🇵🇹',
  QAT: '🇶🇦',
  RSA: '🇿🇦',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  SEN: '🇸🇳',
  SUI: '🇨🇭',
  SWE: '🇸🇪',
  TUN: '🇹🇳',
  TUR: '🇹🇷',
  URU: '🇺🇾',
  USA: '🇺🇸',
  UZB: '🇺🇿',
}

const COLORS: Record<string, string> = {
  ALG: '#006633', ANG: '#CC092F', ARG: '#75AADB', AUS: '#00008B',
  AUT: '#ED2939', BEL: '#000000', BIH: '#002395', BRA: '#009739',
  CAN: '#FF0000', CIV: '#F77F00', CMR: '#007A5E', COD: '#007FFF',
  COL: '#FCD116', CPV: '#003893', CRO: '#FF0000', CUW: '#002B7F',
  CZE: '#11457E', DEN: '#C8102E', ECU: '#FFD100', EGY: '#C8102E',
  ENG: '#CF142B', ESP: '#C60B1E', FRA: '#0055A4', GER: '#000000',
  GHA: '#006B3F', HAI: '#00209F', IRN: '#239F40', IRQ: '#CE1126',
  JOR: '#CE1126', JPN: '#BC002D', KOR: '#003478', KSA: '#006C35',
  MAR: '#C1272D', MEX: '#006341', NED: '#FF6600', NOR: '#BA0C2F',
  NZL: '#00247D', PAN: '#005293', PAR: '#003F87', POR: '#006600',
  QAT: '#8D1B3D', RSA: '#007A4D', SCO: '#005EB8', SEN: '#00853F',
  SUI: '#FF0000', SWE: '#005B99', TUN: '#E70013', TUR: '#E30A17',
  URU: '#0038A8', USA: '#B22234', UZB: '#0099B5',
}

const SECONDARY_COLORS: Record<string, string> = {
  ALG: '#FFFFFF', ANG: '#FFCC00', ARG: '#FFFFFF', AUS: '#FFCD00',
  AUT: '#FFFFFF', BEL: '#FDDA25', BIH: '#FECB00', BRA: '#FEDD00',
  CAN: '#FFFFFF', CIV: '#009E60', CMR: '#CE1126', COD: '#CE1021',
  COL: '#003893', CPV: '#CF2027', CRO: '#171796', CUW: '#F9E814',
  CZE: '#D7141A', DEN: '#FFFFFF', ECU: '#034EA2', EGY: '#000000',
  ENG: '#FFFFFF', ESP: '#FFC400', FRA: '#EF4135', GER: '#DD0000',
  GHA: '#FCD116', HAI: '#D21034', IRN: '#DA0000', IRQ: '#FFFFFF',
  JOR: '#007A3D', JPN: '#FFFFFF', KOR: '#C60C30', KSA: '#FFFFFF',
  MAR: '#006233', MEX: '#CE1126', NED: '#FFFFFF', NOR: '#00205B',
  NZL: '#CC142B', PAN: '#D21034', PAR: '#D52B1E', POR: '#FF0000',
  QAT: '#FFFFFF', RSA: '#FFB81C', SCO: '#FFFFFF', SEN: '#FDEF42',
  SUI: '#FFFFFF', SWE: '#FECC00', TUN: '#FFFFFF', TUR: '#FFFFFF',
  URU: '#FFFFFF', USA: '#3C3B6E', UZB: '#1EB53A',
}

const SPECIAL: Record<string, string> = {
  FWC: '🏆',
}

export function flagOf(prefix: string): string {
  return SPECIAL[prefix] ?? FLAGS[prefix] ?? '🏳️'
}

export function colorOf(prefix: string): string {
  return COLORS[prefix] ?? '#6b7280'
}

export function secondaryColorOf(prefix: string): string {
  return SECONDARY_COLORS[prefix] ?? '#44403c'
}
