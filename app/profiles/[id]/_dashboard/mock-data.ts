// Dashboard 模块：权威 mock data 契约 — Stage 2 Batch 2A Part 3A
// 数据源：1996-05-12 04:51 UTC Shanghai male 真实生成报告
// 所有组件从这里取数。Part 3B/C 基于此 schema 重写组件。

// ========== 类型定义 ==========

export interface MockSubject {
  id: string
  name: string
  age: number
  dayMaster: string
  dayMasterType: string  // "Yin Earth" / "Yang Metal" 等
  active: boolean
}

export interface MockPillar {
  label: string           // "Year" / "Month" / "Day" / "Hour"
  labelZh: string         // "年" / "月" / "日" / "时"
  zodiac: string          // 地支对应生肖 "鼠"
  zodiacEn: string        // "Rat"
  gan: string             // 天干字 "丙"
  ganElement: ElementKey  // 天干五行 "fire"
  ganShiShen: string      // 天干十神 "正印"；日柱是 "日主"
  zhi: string             // 地支字 "子"
  zhiElement: ElementKey  // 地支主五行 "water"
  zhiShiShen: string      // 地支主气十神 "偏财"
  zhiHideGan: string      // 地支主气藏干 "癸"
  naYin: string           // 纳音 "涧下水"
  diShi: string           // 十二长生 "绝"
  diShiElement: ElementKey  // 十二长生显示色的元素归类（fire=旺盛相，metal=衰，wood=长生，etc.）
  xunKong: string         // 旬空 "申酉"
  isDay: boolean          // 日柱 true 其他 false
}

export interface MockFiveElements {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export interface MockChartReading {
  strength: string        // "身强"
  strengthEn: string      // "Day Master strong"
  pattern: string         // "正印格"
  patternEn: string       // "Direct Resource"
  favorable: string[]     // ["金","水"]
  favorableEn: string     // "Metal, Water"
  unfavorable: string[]   // ["火","土"]
  unfavorableEn: string   // "Fire, Earth"
  season: string          // "夏火当令"
  seasonEn: string        // "Summer · Fire peaks"
}

export interface MockTenGodCategory {
  key: TenGodKey
  label: string           // "印"
  labelEn: string         // "Resource"
  count: number
  color: string           // CSS var 字符串
}

export interface MockSpecialPalaces {
  taiYuan: string         // 胎元 "甲申"
  mingGong: string        // 命宫 "戊戌"
  shenGong: string        // 身宫 "丙申"
}

export interface MockLuckCycle {
  ganZhi: string          // 空字符串代表童运
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  state: LuckCycleState   // 'past' | 'current' | 'future'
}

export interface MockLiuNianCell {
  year: number
  age: number
  ganZhi: string          // 流年干支
  xiaoYun: string         // 小运干支
  state: LuckCycleState
}

export interface MockBirthMeta {
  solarDate: string       // "1996-05-12"
  lunarDate: string       // "一九九六年三月廿五"
  tst: string             // "TST 04:51 UTC (+6min)"
  city: string            // "Shanghai 121.47°E"
  zodiacsCombined: string // "鼠 · 蛇 · 鸡 · 虎"（四柱生肖）
}

export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
export type TenGodKey = 'resource' | 'wealth' | 'self' | 'power' | 'output'
export type LuckCycleState = 'past' | 'current' | 'future'

// ========== MOCK_DATA 实例 ==========

export const MOCK_DATA = {
  // —— 档案切换器用 ——
  subjects: [
    { id: '1', name: '陈思怡', age: 29, dayMaster: '己', dayMasterType: 'Yin Earth', active: true },
    { id: '2', name: '林 Mom', age: 58, dayMaster: '庚', dayMasterType: 'Yang Metal', active: false },
    { id: '3', name: '小豆', age: 3, dayMaster: '壬', dayMasterType: 'Yang Water', active: false },
  ] as MockSubject[],

  // —— Day Master 身份 ——
  dayMaster: '己',
  dayMasterElement: 'Earth',
  dayMasterYinYang: 'Yin',
  dayMasterTypeFull: 'Yin Earth',
  dayMasterMeaning: '田园之土',
  yunDirection: '顺行',
  yunDirectionEn: 'Forward',
  startAge: 1,
  approxAge: 29,

  // —— 四柱（含完整命理密度字段）——
  pillars: [
    {
      label: 'Year', labelZh: '年',
      zodiac: '鼠', zodiacEn: 'Rat',
      gan: '丙', ganElement: 'fire' as ElementKey, ganShiShen: '正印',
      zhi: '子', zhiElement: 'water' as ElementKey, zhiShiShen: '偏财', zhiHideGan: '癸',
      naYin: '涧下水', diShi: '绝', diShiElement: 'fire' as ElementKey,
      xunKong: '申酉', isDay: false,
    },
    {
      label: 'Month', labelZh: '月',
      zodiac: '蛇', zodiacEn: 'Snake',
      gan: '癸', ganElement: 'water' as ElementKey, ganShiShen: '偏财',
      zhi: '巳', zhiElement: 'fire' as ElementKey, zhiShiShen: '正印', zhiHideGan: '丙',
      naYin: '长流水', diShi: '帝旺', diShiElement: 'fire' as ElementKey,
      xunKong: '午未', isDay: false,
    },
    {
      label: 'Day', labelZh: '日',
      zodiac: '鸡', zodiacEn: 'Rooster',
      gan: '己', ganElement: 'earth' as ElementKey, ganShiShen: '日主',
      zhi: '酉', zhiElement: 'metal' as ElementKey, zhiShiShen: '食神', zhiHideGan: '辛',
      naYin: '大驿土', diShi: '长生', diShiElement: 'wood' as ElementKey,
      xunKong: '寅卯', isDay: true,
    },
    {
      label: 'Hour', labelZh: '时',
      zodiac: '虎', zodiacEn: 'Tiger',
      gan: '丙', ganElement: 'fire' as ElementKey, ganShiShen: '正印',
      zhi: '寅', zhiElement: 'wood' as ElementKey, zhiShiShen: '正官', zhiHideGan: '甲',
      naYin: '炉中火', diShi: '死', diShiElement: 'metal' as ElementKey,
      xunKong: '戌亥', isDay: false,
    },
  ] as MockPillar[],

  isTimeUnknown: false,

  // —— 五行分布 ——
  fiveElements: {
    wood: 1.0, fire: 3.5, earth: 1.6, metal: 1.5, water: 2.0,
  } as MockFiveElements,

  // —— 盘面要点（AI 结构化输出字段）——
  chartReading: {
    strength: '身强', strengthEn: 'Day Master strong',
    pattern: '正印格', patternEn: 'Direct Resource',
    favorable: ['金', '水'], favorableEn: 'Metal, Water',
    unfavorable: ['火', '土'], unfavorableEn: 'Fire, Earth',
    season: '夏火当令', seasonEn: 'Summer · Fire peaks',
  } as MockChartReading,

  // —— 十神五大类分布（不是 10 细类，是 5 大类）——
  tenGods: [
    { key: 'resource', label: '印', labelEn: 'Resource', count: 4, color: 'var(--zen-red)' },
    { key: 'wealth',   label: '财', labelEn: 'Wealth',   count: 2, color: 'var(--zen-gold)' },
    { key: 'self',     label: '比劫', labelEn: 'Self',   count: 2, color: 'var(--zen-text-muted)' },
    { key: 'power',    label: '官', labelEn: 'Power',    count: 1, color: 'var(--element-wood)' },
    { key: 'output',   label: '食伤', labelEn: 'Output', count: 2, color: 'var(--element-metal)' },
  ] as MockTenGodCategory[],

  // —— 三宫（不是神煞！）——
  specialPalaces: {
    taiYuan: '甲申',
    mingGong: '戊戌',
    shenGong: '丙申',
  } as MockSpecialPalaces,

  // —— 大运十节 ——
  luckCycles: [
    { ganZhi: '',     startAge: 1,  endAge: 8,  startYear: 1996, endYear: 2003, state: 'past'    },
    { ganZhi: '甲午', startAge: 9,  endAge: 18, startYear: 2004, endYear: 2013, state: 'past'    },
    { ganZhi: '乙未', startAge: 19, endAge: 28, startYear: 2014, endYear: 2023, state: 'past'    },
    { ganZhi: '丙申', startAge: 29, endAge: 38, startYear: 2024, endYear: 2033, state: 'current' },
    { ganZhi: '丁酉', startAge: 39, endAge: 48, startYear: 2034, endYear: 2043, state: 'future'  },
    { ganZhi: '戊戌', startAge: 49, endAge: 58, startYear: 2044, endYear: 2053, state: 'future'  },
    { ganZhi: '己亥', startAge: 59, endAge: 68, startYear: 2054, endYear: 2063, state: 'future'  },
    { ganZhi: '庚子', startAge: 69, endAge: 78, startYear: 2064, endYear: 2073, state: 'future'  },
    { ganZhi: '辛丑', startAge: 79, endAge: 88, startYear: 2074, endYear: 2083, state: 'future'  },
    { ganZhi: '壬寅', startAge: 89, endAge: 98, startYear: 2084, endYear: 2093, state: 'future'  },
  ] as MockLuckCycle[],

  // —— 当前大运基本信息 ——
  currentDayun: {
    ganZhi: '丙申',
    wuXing: 'Yang Fire over Yang Metal',
    startAge: 29, endAge: 38,
    startYear: 2024, endYear: 2033,
  },

  // —— 当前大运 10 年流年展开 ——
  currentDayunLiuNian: [
    { year: 2024, age: 29, ganZhi: '甲辰', xiaoYun: '乙未', state: 'past'    },
    { year: 2025, age: 30, ganZhi: '乙巳', xiaoYun: '丙申', state: 'past'    },
    { year: 2026, age: 31, ganZhi: '丙午', xiaoYun: '丁酉', state: 'current' },
    { year: 2027, age: 32, ganZhi: '丁未', xiaoYun: '戊戌', state: 'future'  },
    { year: 2028, age: 33, ganZhi: '戊申', xiaoYun: '己亥', state: 'future'  },
    { year: 2029, age: 34, ganZhi: '己酉', xiaoYun: '庚子', state: 'future'  },
    { year: 2030, age: 35, ganZhi: '庚戌', xiaoYun: '辛丑', state: 'future'  },
    { year: 2031, age: 36, ganZhi: '辛亥', xiaoYun: '壬寅', state: 'future'  },
    { year: 2032, age: 37, ganZhi: '壬子', xiaoYun: '癸卯', state: 'future'  },
    { year: 2033, age: 38, ganZhi: '癸丑', xiaoYun: '甲辰', state: 'future'  },
  ] as MockLiuNianCell[],

  // —— 出生元数据条 ——
  birthMeta: {
    solarDate: '1996-05-12',
    lunarDate: '一九九六年三月廿五',
    tst: 'TST 04:51 UTC (+6min)',
    city: 'Shanghai 121.47°E',
    zodiacsCombined: '鼠 · 蛇 · 鸡 · 虎',
  } as MockBirthMeta,
}

export type MockData = typeof MOCK_DATA
