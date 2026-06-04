// EasyPack Design System — "보딩패스 여행 테크"
// Deep navy ink + Cobalt blue + Coral accent + Signal verdicts

export const C = {
  ink:        '#0E1A33',
  ink2:       '#33405A',
  muted:      '#707C92',
  faint:      '#9AA4B8',
  line:       '#E6EAF2',
  line2:      '#EEF1F8',
  bg:         '#F3F5FB',
  surface:    '#FFFFFF',
  surface2:   '#F8FAFE',

  brand:      '#2F6BFF',
  brandInk:   '#1C49C2',
  brandDeep:  '#0E2A6E',
  brandSoft:  '#E9F0FF',
  brandSoft2: '#D6E3FF',

  accent:     '#FF6A3D',
  accentInk:  '#D8451B',
  accentSoft: '#FFEDE6',

  ok:      '#14A05A', okSoft:   '#E2F6EB', okInk:   '#0B6E3D',
  warn:    '#E8920C', warnSoft: '#FDF0D5', warnInk: '#9A5E00',
  no:      '#E23B3B', noSoft:   '#FCE4E4', noInk:   '#A81F1F',
};

export const shadow = {
  sm:    { shadowColor: '#0E1A33', shadowOpacity: 0.06, shadowRadius: 6,  shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md:    { shadowColor: '#0E1A33', shadowOpacity: 0.10, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  brand: { shadowColor: '#2F6BFF', shadowOpacity: 0.30, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
};

export const COUNTRY_DATA = {
  '일본':   { code: 'JP', city: '도쿄',   tint: '#FCE4E4', ink: '#A81F1F', bg: '#9B4060' },
  '미국':   { code: 'US', city: '뉴욕',   tint: '#E9F0FF', ink: '#1C49C2', bg: '#2B4899' },
  '베트남': { code: 'VN', city: '하노이', tint: '#FDF0D5', ink: '#9A5E00', bg: '#1A8A72' },
  '필리핀': { code: 'PH', city: '마닐라', tint: '#E2F6EB', ink: '#0B6E3D', bg: '#1E8A50' },
  '태국':   { code: 'TH', city: '방콕',   tint: '#FFEDE6', ink: '#D8451B', bg: '#C06020' },
};

export const AIRLINE_DATA = {
  '대한항공':     { code: 'KE', color: '#0F4C99' },
  '아시아나항공': { code: 'OZ', color: '#C8102E' },
  '제주항공':     { code: '7C', color: '#F36F21' },
  '티웨이항공':   { code: 'TW', color: '#E2231A' },
  '진에어항공':   { code: 'LJ', color: '#26C6B5' },
};
