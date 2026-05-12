/**
 * Ganzhi month/year calculations and 24-month forecast timeline builder.
 * Ported from reference Python implementation v6.0 dynamic-24-month-forecast.
 *
 * Standalone module — do NOT import from lunar.js or bazi-calculator-logic.js.
 */

// ── Ganzhi constants ──────────────────────────────────────────────────────────

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const DI_ZHI   = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

// Earthly branches for lunar months 0–11 (寅月 to 丑月)
const LUNAR_MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const

// 五虎遁元: year heavenly stem → starting stem of 寅月 (month index 0)
const WU_HU_DUN: Record<string, string> = {
  '甲': '丙', '己': '丙',
  '乙': '戊', '庚': '戊',
  '丙': '庚', '辛': '庚',
  '丁': '壬', '壬': '壬',
  '戊': '甲', '癸': '甲',
}

// 地支相冲 (earthly branch clash pairs)
const CHONG_PAIRS: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
}

// 六合 (six harmony combinations)
const LIU_HE: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
}

// Solar term approximate start dates: [calendarMonth, calendarDay, termName]
// Index 0 = 立春 (寅月 start, ~Feb 4) — marks new Chinese year in solar reckoning
// Index 11 = 小寒 (丑月 start, ~Jan 6) — lives in calendar year (lunarYear + 1)
const SOLAR_TERMS: Array<[number, number, string]> = [
  [2,  4,  '立春'], [3,  6,  '惊蛰'], [4,  5,  '清明'], [5,  6,  '立夏'],
  [6,  6,  '芒种'], [7,  7,  '小暑'], [8,  8,  '立秋'], [9,  8,  '白露'],
  [10, 8,  '寒露'], [11, 7,  '立冬'], [12, 7,  '大雪'], [1,  6,  '小寒'],
]

// ── Public types ──────────────────────────────────────────────────────────────

export interface ForecastMonth {
  index:       number   // 1-based position in the 24-month window
  lunarYear:   number   // Chinese year (立春-based, not lunar calendar)
  monthIdx:    number   // 0 = 寅月 … 11 = 丑月
  ganZhi:      string   // full ganzhi, e.g. 甲寅
  yearGanZhi:  string   // year's ganzhi, e.g. 甲辰
  zhi:         string   // earthly branch only
  termName:    string   // solar term name, e.g. 立春
  startApprox: string   // ISO date (YYYY-MM-DD) of solar term start
  endApprox:   string   // ISO date (YYYY-MM-DD) of last day before next term
}

export interface Interaction {
  month:        ForecastMonth
  monthZhi:     string
  targetZhi:    string
  type:         'chong' | 'he'
  pillarLabels: string[]  // e.g. ['日支', '时支']
}

export interface ForecastResult {
  timeline:             ForecastMonth[]
  interactions:         { chong: Interaction[]; he: Interaction[] }
  timelineMarkdown:     string
  interactionsMarkdown: string
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** 1984 = 甲子. Handles years before 1984 via modulo normalisation. */
function ganZhiYear(lunarYear: number): string {
  const offset = lunarYear - 1984
  const g = ((offset % 10) + 10) % 10
  const z = ((offset % 12) + 12) % 12
  return TIAN_GAN[g] + DI_ZHI[z]
}

/** Ganzhi of a solar month. monthIdx 0 = 寅月. Uses 五虎遁元. */
function ganZhiMonth(lunarYear: number, monthIdx: number): string {
  const yearGan = ganZhiYear(lunarYear)[0]
  const firstGan = WU_HU_DUN[yearGan]
  if (!firstGan) throw new Error(`[forecast-timeline] Unknown year stem: ${yearGan}`)
  const firstGanIdx = (TIAN_GAN as readonly string[]).indexOf(firstGan)
  const ganIdx  = (firstGanIdx + monthIdx) % 10
  const zhiIdx  = (2 + monthIdx) % 12     // 寅 is index 2 in DI_ZHI
  return TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx]
}

/**
 * Calendar date of a solar term.
 * For monthIdx 0–10: calYear = lunarYear.
 * For monthIdx 11 (小寒 ≈ Jan 6): calYear = lunarYear + 1.
 */
function solarTermDate(lunarYear: number, monthIdx: number): Date {
  const [m, d] = SOLAR_TERMS[monthIdx]
  const calYear = monthIdx === 11 ? lunarYear + 1 : lunarYear
  return new Date(calYear, m - 1, d)
}

/**
 * Map a Gregorian date to (lunarYear, monthIdx).
 * lunarYear is the Chinese year in 立春-reckoning (starts ~Feb 4).
 * monthIdx 0 = 寅月, …, 11 = 丑月.
 */
function locateLunarMonth(date: Date): { lunarYear: number; monthIdx: number } {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  // 立春 ≈ Feb 4 marks the new Chinese year
  const afterSpring = m > 2 || (m === 2 && d >= 4)
  const lunarYear   = afterSpring ? y : y - 1

  // Scan solar terms in reverse chronological order for this lunarYear:
  //   idx 11 (Jan of lunarYear+1) → idx 10 (Dec) → … → idx 0 (Feb)
  for (let i = 11; i >= 0; i--) {
    if (date >= solarTermDate(lunarYear, i)) {
      return { lunarYear, monthIdx: i }
    }
  }

  // Fallback: treat as 寅月 of lunarYear (should not normally reach here)
  return { lunarYear, monthIdx: 0 }
}

/** Advance one solar month, wrapping year at idx 11 → 0. */
function advanceMonth(
  lunarYear: number,
  monthIdx: number,
): { lunarYear: number; monthIdx: number } {
  const nextIdx = (monthIdx + 1) % 12
  return { lunarYear: nextIdx === 0 ? lunarYear + 1 : lunarYear, monthIdx: nextIdx }
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ── Core builders ─────────────────────────────────────────────────────────────

function buildForecastTimeline(startDate: Date, numMonths: number): ForecastMonth[] {
  const result: ForecastMonth[] = []
  let { lunarYear, monthIdx } = locateLunarMonth(startDate)

  for (let i = 0; i < numMonths; i++) {
    const start                                     = solarTermDate(lunarYear, monthIdx)
    const { lunarYear: nextLY, monthIdx: nextIdx }  = advanceMonth(lunarYear, monthIdx)
    const endDate = new Date(solarTermDate(nextLY, nextIdx).getTime() - 86_400_000)

    result.push({
      index:       i + 1,
      lunarYear,
      monthIdx,
      ganZhi:      ganZhiMonth(lunarYear, monthIdx),
      yearGanZhi:  ganZhiYear(lunarYear),
      zhi:         LUNAR_MONTH_ZHI[monthIdx],
      termName:    SOLAR_TERMS[monthIdx][2],
      startApprox: isoDate(start),
      endApprox:   isoDate(endDate),
    })

    lunarYear = nextLY
    monthIdx  = nextIdx
  }

  return result
}

const PILLAR_LABELS = ['年支', '月支', '日支', '时支']

function findKeyInteractions(
  timeline: ForecastMonth[],
  userBranches: string[],
): { chong: Interaction[]; he: Interaction[] } {
  const chong: Interaction[] = []
  const he:    Interaction[] = []

  for (const month of timeline) {
    const zhi = month.zhi

    // 相冲
    const chongTarget = CHONG_PAIRS[zhi]
    if (chongTarget) {
      const labels = userBranches
        .map((b, i) => b === chongTarget ? PILLAR_LABELS[i] : null)
        .filter((l): l is string => l !== null)
      if (labels.length > 0) {
        chong.push({ month, monthZhi: zhi, targetZhi: chongTarget, type: 'chong', pillarLabels: labels })
      }
    }

    // 六合
    const heTarget = LIU_HE[zhi]
    if (heTarget) {
      const labels = userBranches
        .map((b, i) => b === heTarget ? PILLAR_LABELS[i] : null)
        .filter((l): l is string => l !== null)
      if (labels.length > 0) {
        he.push({ month, monthZhi: zhi, targetZhi: heTarget, type: 'he', pillarLabels: labels })
      }
    }
  }

  return { chong, he }
}

function formatTimelineMarkdown(timeline: ForecastMonth[]): string {
  const rows = [
    '| # | 月干支 | 年干支 | 节气 | 时间段 |',
    '|---|--------|--------|------|--------|',
    ...timeline.map(m =>
      `| ${m.index} | **${m.ganZhi}** | ${m.yearGanZhi} | ${m.termName} | ${m.startApprox} ~ ${m.endApprox} |`
    ),
  ]
  return rows.join('\n')
}

function formatInteractionsMarkdown(
  interactions: { chong: Interaction[]; he: Interaction[] },
): string {
  if (interactions.chong.length === 0 && interactions.he.length === 0) {
    return '**关键月份预警**：24个月内无显著相冲或六合。'
  }

  const lines: string[] = ['**关键月份预警（命局干支互动）**']

  if (interactions.chong.length > 0) {
    lines.push('', '相冲月份（流月冲命局）：')
    for (const i of interactions.chong) {
      lines.push(
        `- 第 ${i.month.index} 月 ${i.month.ganZhi}（${i.month.startApprox}）：` +
        `月支 ${i.monthZhi} 冲 ${i.pillarLabels.join('/')} ${i.targetZhi}`
      )
    }
  }

  if (interactions.he.length > 0) {
    lines.push('', '六合月份（流月合命局）：')
    for (const i of interactions.he) {
      lines.push(
        `- 第 ${i.month.index} 月 ${i.month.ganZhi}（${i.month.startApprox}）：` +
        `月支 ${i.monthZhi} 合 ${i.pillarLabels.join('/')} ${i.targetZhi}`
      )
    }
  }

  return lines.join('\n')
}

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Build a complete 24-month forecast dataset for a chart.
 *
 * @param pillars   - Four Pillars from the profile (year/month/day/hour ganzhi strings).
 * @param numMonths - Months to cover (default 24).
 */
export function buildForecastForChart(
  pillars: { year: string; month: string; day: string; hour: string | null },
  numMonths = 24,
): ForecastResult {
  const timeline = buildForecastTimeline(new Date(), numMonths)

  // Extract earthly branches (second character of each 2-char ganzhi string)
  const userBranches = [
    pillars.year?.[1]  ?? '',
    pillars.month?.[1] ?? '',
    pillars.day?.[1]   ?? '',
    pillars.hour?.[1]  ?? '',
  ].filter(b => b !== '')

  const interactions         = findKeyInteractions(timeline, userBranches)
  const timelineMarkdown     = formatTimelineMarkdown(timeline)
  const interactionsMarkdown = formatInteractionsMarkdown(interactions)

  return { timeline, interactions, timelineMarkdown, interactionsMarkdown }
}
