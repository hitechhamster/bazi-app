export interface BaziPillar {
  ganZhi: string
  gan: string
  zhi: string
  wuXing: string
  naYin: string
  shiShenGan: string
  shiShenZhi: string
  diShi: string
  xunKong: string
  hideGan: string[]
}

export interface FiveElements {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export interface LuckCycle {
  ganZhi: string
  gan: string
  zhi: string
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  isCurrent?: boolean
  notStarted?: boolean
}

export interface BaziReport {
  dayMaster: string
  dayMasterElement: string
  dayMasterYinYang: string
  dayMasterFull: string
  pillars: {
    year: BaziPillar
    month: BaziPillar
    day: BaziPillar
    hour: BaziPillar
  }
  fiveElements: FiveElements
  zodiac: {
    year: string
    month: string
    day: string
    hour: string
  }
  currentDayun: (LuckCycle & {
    index: number
    isCurrent: boolean
    notStarted?: boolean
  }) | null
  currentLiuNian: {
    year: number
    ganZhi: string
    gan: string
    zhi: string
  } | null
  luckCycles: LuckCycle[]
  lunarDate: string
  solarDate: string
  meta: {
    generatedAt: string
    version: string
    gender: string
  }
}

export function generateBaziReport(tst: Date, gender: string): BaziReport
export function getFiveElementsCount(eightChar: unknown): FiveElements
export function getGanElement(gan: string): string
export function getGanYinYang(gan: string): string
