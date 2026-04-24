// Dashboard 模块：mock data for static skeleton — Stage 2 Batch 2A (mock data)

export interface MockPillar {
  tianGan: string
  diZhi: string
  diZhiColor: string
}

export interface MockLuckCycle {
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  ganZhi: string // empty string = 童运 (childhood, no stem-branch)
}

export interface MockTenGod {
  name: string
  count: number
  color: string
}

export const MOCK_DATA = {
  name: '张明',
  relation: 'Self',
  gender: 'Male',

  birthDate: '1990-03-15',
  lunarDate: '庚午年二月十九',
  zodiac: '马',
  zodiacEn: 'Horse',
  birthCity: 'Beijing',
  isTimeUnknown: false,

  dayMaster: '甲',
  dayMasterElement: 'Wood',
  dayMasterYinYang: 'Yang',
  strength: '身弱',
  pattern: '正官格',

  pillars: {
    year:  { tianGan: '庚', diZhi: '午', diZhiColor: 'var(--element-fire)' } as MockPillar,
    month: { tianGan: '丁', diZhi: '卯', diZhiColor: 'var(--element-wood)' } as MockPillar,
    day:   { tianGan: '甲', diZhi: '子', diZhiColor: 'var(--element-water)' } as MockPillar,
    hour:  { tianGan: '丙', diZhi: '寅', diZhiColor: 'var(--element-wood)' } as MockPillar,
  },

  fiveElements: {
    wood:  2.5,
    fire:  1.5,
    earth: 0.5,
    metal: 2.0,
    water: 1.5,
  },

  favorable: ['水', '木'] as string[],
  unfavorable: ['金', '土'] as string[],

  tenGods: [
    { name: '正官', count: 2, color: 'var(--zen-red)' },
    { name: '偏印', count: 1, color: 'var(--element-water)' },
    { name: '比肩', count: 1, color: 'var(--element-wood)' },
    { name: '伤官', count: 2, color: 'var(--zen-gold)' },
    { name: '偏财', count: 2, color: 'var(--zen-text-muted)' },
  ] as MockTenGod[],

  specialPalaces: {
    peachBlossom: { label: '桃花', ganZhi: '子' },
    tianYi:       { label: '天乙贵人', ganZhi: '丑·未' },
    wenchang:     { label: '文昌', ganZhi: '巳' },
    driveHorse:   { label: '驿马', ganZhi: '申' },
  },

  luckCycles: [
    { startAge: 0,  endAge: 4,  startYear: 1990, endYear: 1994, ganZhi: '' },
    { startAge: 5,  endAge: 14, startYear: 1995, endYear: 2004, ganZhi: '丁巳' },
    { startAge: 15, endAge: 24, startYear: 2005, endYear: 2014, ganZhi: '戊午' },
    { startAge: 25, endAge: 34, startYear: 2015, endYear: 2024, ganZhi: '己未' },
    { startAge: 35, endAge: 44, startYear: 2025, endYear: 2034, ganZhi: '庚申' },
    { startAge: 45, endAge: 54, startYear: 2035, endYear: 2044, ganZhi: '辛酉' },
    { startAge: 55, endAge: 64, startYear: 2045, endYear: 2054, ganZhi: '壬戌' },
    { startAge: 65, endAge: 74, startYear: 2055, endYear: 2064, ganZhi: '癸亥' },
  ] as MockLuckCycle[],

  currentDayun: {
    ganZhi: '庚申',
    startAge: 35,
    endAge: 44,
    startYear: 2025,
    endYear: 2034,
    wuXing: 'Yang Metal',
  },

  currentLiuNian: {
    year: 2026,
    ganZhi: '丙午',
    wuXing: 'Fire Horse',
  },

  taiSuiStatus: 'Fan Tai Sui · 冲太岁',
  approxAge: 36,
}

export type MockData = typeof MOCK_DATA
