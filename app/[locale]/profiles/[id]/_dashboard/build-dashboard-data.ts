// Batch 2B Part 1 — Real data adapter for dashboard
// Input:  profile row + same-user profiles list + fresh generateBaziReport output
// Output: MockData-shaped object consumed by all dashboard components
//
// This is a pure function. generateBaziReport is called in page.tsx (SSR),
// not here, because it needs raw tst Date + gender which only page.tsx has.

import type {
  MockData,
  MockPillar,
  MockSubject,
  MockTenGodCategory,
  ElementKey,
} from './mock-data'
import { ganToWuXingEn, zodiacZhToEn } from '@/lib/bazi/chart-helpers'

// ========== Input types ==========

export interface ProfileRow {
  id: string
  name: string
  day_master: string
  day_master_element: string
  birth_date: string
  birth_city: string | null
  longitude: number | null
  lunar_date: string
  true_solar_time: string | null
  five_elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  report_structured: {
    strength?: string | null
    pattern?: string | null
    favorable?: string[]
    unfavorable?: string[]
  } | null
  is_time_unknown: boolean
}

export interface SubjectRow {
  id: string
  name: string
  day_master: string
  day_master_element: string
  birth_date: string
}

// Raw BaziReport shape (generateBaziReport return) — partial typing for fields we need
export interface BaziReportRaw {
  dayMaster: string
  dayMasterElement: string
  dayMasterYinYang: string
  pillars: {
    year: BaziPillarRaw
    month: BaziPillarRaw
    day: BaziPillarRaw
    hour: BaziPillarRaw
  }
  yunInfo: {
    startAge: number
    isForward: boolean
    description: string
  }
  currentDayun: {
    index: number
    ganZhi: string
    startAge: number
    endAge: number
    startYear: number
    endYear: number
  } | null
  luckCycles: Array<{
    ganZhi: string
    gan: string
    zhi: string
    startAge: number
    endAge: number
    startYear: number
    endYear: number
    liuNian?: Array<{
      year: number
      age: number
      ganZhi: string
      xiaoYunGanZhi: string
    }>
  }>
  specialPalaces: {
    taiYuan: string
    mingGong: string
    shenGong: string
  }
  zodiac: {
    year: string
    month: string
    day: string
    hour: string
  }
}

export interface BaziPillarRaw {
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

// ========== Helpers ==========

/** 五行中文单字 → 英文单词，用于 chart reading 的英文列 */
function wuXingZhToEn(ch: string): string {
  const map: Record<string, string> = {
    金: 'Metal',
    木: 'Wood',
    水: 'Water',
    火: 'Fire',
    土: 'Earth',
  }
  return map[ch] ?? ch
}

/**
 * 月支（Month 地支） → 季节 + 当令五行。
 * 春 (寅卯辰 wood 旺) / 夏 (巳午未 fire 旺) / 秋 (申酉戌 metal 旺) / 冬 (亥子丑 water 旺)
 */
function seasonFromMonthZhi(monthZhi: string): { zh: string; en: string } {
  const spring = ['寅', '卯', '辰']
  const summer = ['巳', '午', '未']
  const autumn = ['申', '酉', '戌']
  const winter = ['亥', '子', '丑']
  if (spring.includes(monthZhi)) return { zh: '春木当令', en: 'Spring · Wood peaks' }
  if (summer.includes(monthZhi)) return { zh: '夏火当令', en: 'Summer · Fire peaks' }
  if (autumn.includes(monthZhi)) return { zh: '秋金当令', en: 'Autumn · Metal peaks' }
  if (winter.includes(monthZhi)) return { zh: '冬水当令', en: 'Winter · Water peaks' }
  return { zh: '—', en: '—' }
}

/** Map 天干 (e.g. "甲") to ElementKey lowercase ("wood"). */
function ganToElementKey(gan: string): ElementKey {
  const en = ganToWuXingEn(gan)  // e.g. "Wood"
  return en.toLowerCase() as ElementKey
}

/** Map 地支 (e.g. "子") to ElementKey by its primary 藏干's 五行. */
function zhiToElementKey(zhi: string): ElementKey {
  const map: Record<string, ElementKey> = {
    子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood',
    辰: 'earth', 巳: 'fire',  午: 'fire',  未: 'earth',
    申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water',
  }
  return map[zhi] ?? 'earth'
}

/**
 * 十二长生 → ElementKey for display color.
 * Strategy (per product decision): strong states = fire (红), mid = earth (ink), weak = metal (灰).
 * Mapped to existing 5-element CSS vars (no new token).
 */
function diShiToElementKey(diShi: string): ElementKey {
  const strong = ['帝旺', '临官', '长生']      // 强 → fire
  const mid    = ['冠带', '沐浴', '养']         // 中 → earth
  const weak   = ['衰', '病', '死', '墓', '绝', '胎']  // 弱 → metal
  if (strong.includes(diShi)) return 'fire'
  if (mid.includes(diShi))    return 'earth'
  if (weak.includes(diShi))   return 'metal'
  return 'earth'  // unknown fallback
}

/**
 * 十神 → 5 大类 key.
 * 正印/偏印 → resource, 正财/偏财 → wealth, 比肩/劫财 → self,
 * 正官/七杀 → power, 食神/伤官 → output. 日主/日元/ null → null (skip).
 */
function classifyTenGod(
  shiShen: string | null | undefined
): 'resource' | 'wealth' | 'self' | 'power' | 'output' | null {
  if (!shiShen) return null
  if (shiShen.includes('印')) return 'resource'
  if (shiShen.includes('财')) return 'wealth'
  if (shiShen === '比肩' || shiShen === '劫财') return 'self'
  if (shiShen === '正官' || shiShen === '七杀') return 'power'
  if (shiShen === '食神' || shiShen === '伤官') return 'output'
  return null  // 日主 / 日元 / unknown
}

/** Build 4-pillar array from report.pillars. */
function buildPillars(
  report: BaziReportRaw,
  isTimeUnknown: boolean
): MockPillar[] {
  const order = [
    { key: 'year' as const,  label: 'Year',  labelZh: '年', zodiac: report.zodiac.year  },
    { key: 'month' as const, label: 'Month', labelZh: '月', zodiac: report.zodiac.month },
    { key: 'day' as const,   label: 'Day',   labelZh: '日', zodiac: report.zodiac.day   },
    { key: 'hour' as const,  label: 'Hour',  labelZh: '时', zodiac: report.zodiac.hour  },
  ]

  return order.map((o) => {
    // Hour pillar when time unknown → show placeholder values
    if (isTimeUnknown && o.key === 'hour') {
      return {
        label: o.label, labelZh: o.labelZh,
        zodiac: '?', zodiacEn: '?',
        gan: '?', ganElement: 'earth' as ElementKey, ganShiShen: '?',
        zhi: '?', zhiElement: 'earth' as ElementKey, zhiShiShen: '?', zhiHideGan: '?',
        naYin: '?', diShi: '?', diShiElement: 'earth' as ElementKey,
        xunKong: '?', isDay: false,
      }
    }

    const p = report.pillars[o.key]
    return {
      label: o.label,
      labelZh: o.labelZh,
      zodiac: o.zodiac,
      zodiacEn: zodiacZhToEn(o.zodiac),
      gan: p.gan,
      ganElement: ganToElementKey(p.gan),
      ganShiShen: o.key === 'day' ? '日主' : p.shiShenGan,
      zhi: p.zhi,
      zhiElement: zhiToElementKey(p.zhi),
      zhiShiShen: p.shiShenZhi,
      zhiHideGan: p.hideGan?.[0] ?? '',  // primary hidden stem only
      naYin: p.naYin,
      diShi: p.diShi,
      diShiElement: diShiToElementKey(p.diShi),
      xunKong: p.xunKong,
      isDay: o.key === 'day',
    }
  })
}

/** Count ten gods across all 4 pillars (both gan and zhi positions), bucket into 5 categories. */
function buildTenGods(report: BaziReportRaw): MockTenGodCategory[] {
  const buckets = { resource: 0, wealth: 0, self: 0, power: 0, output: 0 }
  const pillars = [report.pillars.year, report.pillars.month, report.pillars.day, report.pillars.hour]
  for (const p of pillars) {
    for (const sig of [p.shiShenGan, p.shiShenZhi]) {
      const k = classifyTenGod(sig)
      if (k) buckets[k]++
    }
  }
  return [
    { key: 'resource', label: '印',   labelEn: 'Resource', count: buckets.resource, color: 'var(--zen-red)' },
    { key: 'wealth',   label: '财',   labelEn: 'Wealth',   count: buckets.wealth,   color: 'var(--zen-gold)' },
    { key: 'self',     label: '比劫', labelEn: 'Self',     count: buckets.self,     color: 'var(--zen-text-muted)' },
    { key: 'power',    label: '官',   labelEn: 'Power',    count: buckets.power,    color: 'var(--element-wood)' },
    { key: 'output',   label: '食伤', labelEn: 'Output',   count: buckets.output,   color: 'var(--element-metal)' },
  ]
}

/** Build luck cycles with state (past/current/future) per 10-cell timeline. */
function buildLuckCycles(report: BaziReportRaw) {
  const currentIdx = report.currentDayun?.index ?? -1
  return report.luckCycles.slice(0, 10).map((c, idx) => ({
    ganZhi: c.ganZhi,
    startAge: c.startAge,
    endAge: c.endAge,
    startYear: c.startYear,
    endYear: c.endYear,
    state: (idx < currentIdx ? 'past' : idx === currentIdx ? 'current' : 'future') as 'past' | 'current' | 'future',
  }))
}

/** Build current dayun's 10 liu nian expansion with xiaoYun. */
function buildCurrentDayunLiuNian(report: BaziReportRaw) {
  if (!report.currentDayun) return []
  const dayun = report.luckCycles[report.currentDayun.index]
  if (!dayun?.liuNian) return []

  const currentYear = new Date().getFullYear()
  return dayun.liuNian.map((ln) => ({
    year: ln.year,
    age: ln.age,
    ganZhi: ln.ganZhi,
    xiaoYun: ln.xiaoYunGanZhi,
    state: (ln.year < currentYear ? 'past' : ln.year === currentYear ? 'current' : 'future') as 'past' | 'current' | 'future',
  }))
}

/** Zodiac labels joined across 4 pillars. */
function buildZodiacsCombined(report: BaziReportRaw, isTimeUnknown: boolean): string {
  const parts = [report.zodiac.year, report.zodiac.month, report.zodiac.day]
  if (!isTimeUnknown) parts.push(report.zodiac.hour)
  return parts.join(' · ')
}

/** Day master meaning helper. Static mapping. Fallback empty string. */
function dayMasterMeaning(dayMaster: string): string {
  const map: Record<string, string> = {
    甲: '参天大木', 乙: '花草之木', 丙: '太阳之火', 丁: '灯烛之火',
    戊: '城墙之土', 己: '田园之土', 庚: '斧钺之金', 辛: '首饰之金',
    壬: '江河之水', 癸: '雨露之水',
  }
  return map[dayMaster] ?? ''
}

// ========== Main adapter ==========

export function buildDashboardData(
  profile: ProfileRow,
  subjects: SubjectRow[],
  report: BaziReportRaw
): MockData {
  // Subjects list: current profile active, others inactive
  const subjectCards: MockSubject[] = subjects.map((s) => {
    const age = new Date().getFullYear() - new Date(s.birth_date).getFullYear()
    const yinYang = '甲丙戊庚壬'.includes(s.day_master) ? 'Yang' : 'Yin'
    return {
      id: s.id,
      name: s.name,
      age,
      dayMaster: s.day_master,
      dayMasterType: `${yinYang} ${s.day_master_element}`,
      active: s.id === profile.id,
    }
  })

  // Day master type string (Yang/Yin + Element)
  const dayMasterTypeFull = `${report.dayMasterYinYang} ${report.dayMasterElement}`

  // TST formatting: "TST HH:MM UTC (+Nmin)" — use true_solar_time if present
  const tstDisplay = profile.true_solar_time
    ? `TST ${new Date(profile.true_solar_time).toISOString().slice(11, 16)} UTC`
    : 'TST —'

  // City + longitude display
  const cityDisplay = profile.birth_city
    ? (profile.longitude != null
        ? `${profile.birth_city} ${profile.longitude.toFixed(2)}°E`
        : profile.birth_city)
    : '—'

  const approxAge = new Date().getFullYear() - new Date(profile.birth_date).getFullYear()

  // Chart reading — from report_structured; explicit fallback when missing (legacy profiles, etc)
  const rs = profile.report_structured
  const hasStructured = rs != null && (rs.strength || rs.pattern || (rs.favorable?.length ?? 0) > 0)

  // Strength: Chinese → English mapping (AI returns Chinese, no English version stored)
  const strengthEnMap: Record<string, string> = {
    身强: 'Day Master strong',
    身弱: 'Day Master weak',
    中和: 'Balanced',
    从强: 'Follower (strong)',
    从弱: 'Follower (weak)',
  }

  const season = seasonFromMonthZhi(report.pillars.month.zhi)

  const chartReading = hasStructured
    ? {
        strength: rs!.strength ?? '—',
        strengthEn: strengthEnMap[rs!.strength ?? ''] ?? rs!.strength ?? '—',
        pattern: rs!.pattern ?? '—',
        patternEn: rs!.pattern ?? '—',  // patterns are 格局 names, kept in Chinese for now
        favorable: rs!.favorable ?? [],
        favorableEn: (rs!.favorable ?? []).map(wuXingZhToEn).join(', '),
        unfavorable: rs!.unfavorable ?? [],
        unfavorableEn: (rs!.unfavorable ?? []).map(wuXingZhToEn).join(', '),
        season: season.zh,
        seasonEn: season.en,
      }
    : {
        strength: '—',
        strengthEn: 'Awaiting AI reading',
        pattern: '—',
        patternEn: 'Awaiting AI reading',
        favorable: [],
        favorableEn: '—',
        unfavorable: [],
        unfavorableEn: '—',
        season: season.zh,
        seasonEn: season.en,
      }

  return {
    subjects: subjectCards,

    dayMaster: report.dayMaster,
    dayMasterElement: report.dayMasterElement,
    dayMasterYinYang: report.dayMasterYinYang,
    dayMasterTypeFull,
    dayMasterMeaning: dayMasterMeaning(report.dayMaster),
    yunDirection: report.yunInfo.isForward ? '顺行' : '逆行',
    yunDirectionEn: report.yunInfo.isForward ? 'Forward' : 'Backward',
    startAge: report.yunInfo.startAge,
    approxAge,

    pillars: buildPillars(report, profile.is_time_unknown),
    isTimeUnknown: profile.is_time_unknown,

    fiveElements: profile.five_elements,

    chartReading,

    tenGods: buildTenGods(report),

    specialPalaces: {
      taiYuan: report.specialPalaces.taiYuan,
      mingGong: report.specialPalaces.mingGong,
      shenGong: report.specialPalaces.shenGong,
    },

    luckCycles: buildLuckCycles(report),

    currentDayun: report.currentDayun
      ? {
          ganZhi: report.currentDayun.ganZhi,
          wuXing: '',
          startAge: report.currentDayun.startAge,
          endAge: report.currentDayun.endAge,
          startYear: report.currentDayun.startYear,
          endYear: report.currentDayun.endYear,
        }
      : {
          ganZhi: '—',
          wuXing: '',
          startAge: 0, endAge: 0, startYear: 0, endYear: 0,
        },

    currentDayunLiuNian: buildCurrentDayunLiuNian(report),

    birthMeta: {
      solarDate: profile.birth_date,
      lunarDate: profile.lunar_date,
      tst: tstDisplay,
      city: cityDisplay,
      zodiacsCombined: buildZodiacsCombined(report, profile.is_time_unknown),
    },
  }
}
