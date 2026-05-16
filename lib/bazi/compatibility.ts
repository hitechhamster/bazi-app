/**
 * Bazi marriage compatibility algorithm.
 *
 * Six weighted dimensions:
 *   dayMaster 25 · zodiac 20 · elements 20 · naYin 15 · ganZhi 10 · spousePalace 10
 *
 * Raw total → finalScore normalised to 60–99.
 *
 * Run smoke test: npx tsx lib/bazi/compatibility.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateBaziReport } = require('./bazi-calculator-logic') as {
  generateBaziReport: (tst: Date, gender: string) => import('./bazi-calculator-logic').BaziReport
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BaziPartnerInput {
  name: string
  gender: 'male' | 'female' | 'non-binary'
  birthDate: string           // 'YYYY-MM-DD'
  birthTime?: string          // 'HH:MM'
  isTimeUnknown: boolean
  longitude?: number
  timezoneOffsetSec?: number
  locationName?: string
}

export interface BaziPartnerData {
  input: BaziPartnerInput
  // 四柱
  yearPillar:  string
  monthPillar: string
  dayPillar:   string
  hourPillar:  string | null
  // 拆开的天干地支
  yearGan:  string;  yearZhi:  string
  monthGan: string;  monthZhi: string
  dayGan:   string;  dayZhi:   string
  hourGan:  string | null
  hourZhi:  string | null
  // 派生
  dayMaster:        string
  dayMasterElement: '木' | '火' | '土' | '金' | '水'
  zodiac:           string
  naYin:            string   // year naYin
  // 五行
  elements:         Record<'木'|'火'|'土'|'金'|'水', number>
  effectiveElements:Record<'木'|'火'|'土'|'金'|'水', number>
  // 四柱完整性
  isThreePillar: boolean
  // 季节 + 日主强弱
  season:             'spring' | 'summer' | 'autumn' | 'winter' | 'lateSummer'
  seasonScore:        number
  dayMasterStrength:  'strong' | 'weak' | 'balanced'
  totalStrengthScore: number
  // 喜忌神
  favorableElements:   string[]
  unfavorableElements: string[]
  tiaohouNeeds:        string | null
  // 十神
  shishenCount:    Record<'bijie'|'shishang'|'caicai'|'guansha'|'yinxing', number>
  dominantShishen: 'bijie'|'shishang'|'caicai'|'guansha'|'yinxing'
  shishenProfile: {
    en:     string
    traits: string[]
    shadow: string
  }
}

export interface CompatibilityScores {
  total: number   // 60–99
  level: {
    key:   'excellent' | 'good' | 'average' | 'needWork'
    stars: number   // 2-5
  }
  breakdown: {
    dayMaster:    { score: number; maxScore: 25; description: string }
    zodiac:       { score: number; maxScore: 20; description: string }
    elements:     { score: number; maxScore: 20; description: string; notes?: string[] }
    naYin:        { score: number; maxScore: 15; description: string }
    ganZhi:       { score: number; maxScore: 10; description: string }
    spousePalace: { score: number; maxScore: 10; description: string }
  }
}

// ── Module constants ──────────────────────────────────────────────────────────

const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const DI_ZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const WUXING   = ['木','火','土','金','水'] as const
type WuXing = typeof WUXING[number]

// EN→ZH element mapping
const ELEMENT_EN_ZH: Record<string, WuXing> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
  Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水',
}

// 天干所属五行
const TIANGAN_ELEMENT: WuXing[] = ['木','木','火','火','土','土','金','金','水','水']

// 天干五合 (heMap): 甲己·乙庚·丙辛·丁壬·戊癸 → result element
const heMap: Record<string, { pair: [string,string]; result: WuXing }> = {
  '甲己': { pair: ['甲','己'], result: '土' },
  '乙庚': { pair: ['乙','庚'], result: '金' },
  '丙辛': { pair: ['丙','辛'], result: '水' },
  '丁壬': { pair: ['丁','壬'], result: '木' },
  '戊癸': { pair: ['戊','癸'], result: '火' },
}

function tianGanHe(a: string, b: string): { result: WuXing; key: string } | null {
  for (const [key, { pair, result }] of Object.entries(heMap)) {
    if ((pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)) {
      return { result, key }
    }
  }
  return null
}

// 地支六合 (liuHe): 子丑·寅亥·卯戌·辰酉·巳申·午未
const liuHe: [number,number][] = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]]

function diZhiLiuHe(a: string, b: string): boolean {
  const ai = DI_ZHI.indexOf(a), bi = DI_ZHI.indexOf(b)
  return liuHe.some(([x,y]) => (x===ai&&y===bi)||(x===bi&&y===ai))
}

// 地支三合 (sanHeGroups): 申子辰·寅午戌·亥卯未·巳酉丑
const sanHeGroups: number[][] = [[8,0,4],[2,6,10],[11,3,7],[5,9,1]]

function diZhiSanHe(a: string, b: string): boolean {
  const ai = DI_ZHI.indexOf(a), bi = DI_ZHI.indexOf(b)
  return sanHeGroups.some(g => g.includes(ai) && g.includes(bi))
}

// 地支六冲 (liuChong): 子午·丑未·寅申·卯酉·辰戌·巳亥
const liuChong: [number,number][] = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]]

function diZhiLiuChong(a: string, b: string): boolean {
  const ai = DI_ZHI.indexOf(a), bi = DI_ZHI.indexOf(b)
  return liuChong.some(([x,y]) => (x===ai&&y===bi)||(x===bi&&y===ai))
}

// 地支六害 (liuHai): 子未·丑午·寅巳·卯辰·申亥·酉戌
const liuHai: [number,number][] = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]]

function diZhiLiuHai(a: string, b: string): boolean {
  const ai = DI_ZHI.indexOf(a), bi = DI_ZHI.indexOf(b)
  return liuHai.some(([x,y]) => (x===ai&&y===bi)||(x===bi&&y===ai))
}

// 地支所属季节
const zhiSeasonMap: Record<string, BaziPartnerData['season']> = {
  寅: 'spring', 卯: 'spring', 辰: 'lateSummer',
  巳: 'summer', 午: 'summer', 未: 'lateSummer',
  申: 'autumn', 酉: 'autumn', 戌: 'lateSummer',
  亥: 'winter', 子: 'winter', 丑: 'lateSummer',
}

// 季节对各五行的助力分 (seasonalStrength[season][element] = score 0-5)
const seasonalStrength: Record<string, Record<WuXing, number>> = {
  spring:     { 木:5, 火:3, 土:1, 金:1, 水:2 },
  summer:     { 木:2, 火:5, 土:3, 金:1, 水:1 },
  lateSummer: { 木:1, 火:2, 土:5, 金:2, 水:1 },
  autumn:     { 木:1, 火:1, 土:2, 金:5, 水:3 },
  winter:     { 木:2, 火:1, 土:1, 金:2, 水:5 },
}

// 五行相生
const generateMap: Record<WuXing, WuXing> = { 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' }
// 五行相克
const restrainMap: Record<WuXing, WuXing> = { 木:'土', 火:'金', 土:'水', 金:'木', 水:'火' }
// 被谁生
const generatedByMap: Record<WuXing, WuXing> = { 火:'木', 土:'火', 金:'土', 水:'金', 木:'水' }
// 被谁克
const restrainedByMap: Record<WuXing, WuXing> = { 土:'木', 金:'火', 水:'土', 木:'金', 火:'水' }

// 地支藏干 (主气, 中气, 余气)
const zhiCangGanMap: Record<string, string[]> = {
  子: ['壬'],
  丑: ['己','癸','辛'],
  寅: ['甲','丙','戊'],
  卯: ['乙'],
  辰: ['戊','乙','癸'],
  巳: ['丙','庚','戊'],
  午: ['丁','己'],
  未: ['己','丁','乙'],
  申: ['庚','壬','戊'],
  酉: ['辛'],
  戌: ['戊','辛','丁'],
  亥: ['壬','甲'],
}
const cangGanWeights = [1.0, 0.5, 0.3]

// 十神原型
type ShishenKey = 'bijie'|'shishang'|'caicai'|'guansha'|'yinxing'

const shishenProfiles: Record<ShishenKey, { en: string; traits: string[]; shadow: string }> = {
  bijie: {
    en: 'Companion Star',
    traits: ['loyal','supportive','team-oriented','independent','stubborn'],
    shadow: 'can be overly competitive or resistant to compromise',
  },
  shishang: {
    en: 'Expression Star',
    traits: ['creative','expressive','romantic','playful','idealistic'],
    shadow: 'may over-idealize partners or struggle with emotional boundaries',
  },
  caicai: {
    en: 'Wealth Star',
    traits: ['practical','ambitious','resourceful','charming','action-oriented'],
    shadow: 'can be materialistic or treat relationships transactionally',
  },
  guansha: {
    en: 'Authority Star',
    traits: ['disciplined','responsible','structured','goal-driven','protective'],
    shadow: 'may be controlling or struggle to relinquish power in relationships',
  },
  yinxing: {
    en: 'Resource Star',
    traits: ['nurturing','wise','intuitive','cautious','spiritually inclined'],
    shadow: 'can be overly protective or emotionally withholding',
  },
}

// 天干→五行
function ganElement(gan: string): WuXing {
  const i = TIAN_GAN.indexOf(gan)
  return i >= 0 ? TIANGAN_ELEMENT[i] : '土'
}

// 五行相生: a generates b
function generates(a: WuXing, b: WuXing): boolean { return generateMap[a] === b }
// 五行相克: a restrains b
function restrains(a: WuXing, b: WuXing): boolean { return restrainMap[a] === b }

// ── getEquationOfTime (same formula as profiles/new/actions.ts) ───────────────

function getEquationOfTime(d: Date): number {
  const n = Math.floor((d.getTime() - new Date(d.getUTCFullYear(), 0, 0).getTime()) / 86400000)
  const b = (2 * Math.PI / 365) * (n - 81)
  return 9.87 * Math.sin(2*b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

// ── calculateBaziPartnerData ──────────────────────────────────────────────────

export function calculateBaziPartnerData(input: BaziPartnerInput): BaziPartnerData {
  const { birthDate, birthTime, isTimeUnknown, longitude, timezoneOffsetSec, gender } = input

  const [yr, mo, dy] = birthDate.split('-').map(Number)
  let hr = 12, mn = 0
  if (!isTimeUnknown && birthTime) {
    const [h, m] = birthTime.split(':').map(Number)
    hr = h; mn = m
  }

  let tst: Date
  if (longitude != null && timezoneOffsetSec != null) {
    const originMs = Date.UTC(yr, mo-1, dy, hr, mn)
    const stdLon   = (timezoneOffsetSec / 3600) * 15
    const lonCorr  = (longitude - stdLon) * 4 * 60 * 1000
    const eqTime   = getEquationOfTime(new Date(originMs)) * 60 * 1000
    tst = new Date(originMs + lonCorr + eqTime)
  } else {
    tst = new Date(Date.UTC(yr, mo-1, dy, hr, mn))
  }

  // non-binary: generateBaziReport doesn't support it; pass 'male' as placeholder
  const reportGender = gender === 'non-binary' ? 'male' : gender
  const report = generateBaziReport(tst, reportGender)

  // ── 四柱 ─────────────────────────────────────────────────────────────────
  const yearPillar  = report.pillars.year.ganZhi
  const monthPillar = report.pillars.month.ganZhi
  const dayPillar   = report.pillars.day.ganZhi
  const hourPillar  = isTimeUnknown ? null : report.pillars.hour.ganZhi

  const yearGan  = report.pillars.year.gan;   const yearZhi  = report.pillars.year.zhi
  const monthGan = report.pillars.month.gan;  const monthZhi = report.pillars.month.zhi
  const dayGan   = report.pillars.day.gan;    const dayZhi   = report.pillars.day.zhi
  const hourGan  = isTimeUnknown ? null : report.pillars.hour.gan
  const hourZhi  = isTimeUnknown ? null : report.pillars.hour.zhi

  // ── 派生 ─────────────────────────────────────────────────────────────────
  const dayMaster = dayGan
  const rawEl     = report.dayMasterElement ?? ''
  const dayMasterElement: WuXing = ELEMENT_EN_ZH[rawEl] ?? ganElement(dayGan)
  const zodiac    = report.zodiac.year
  const naYin     = report.pillars.year.naYin

  // ── 五行 (EN→ZH keys) ──────────────────────────────────────────────────
  const fe = report.fiveElements
  const elements: Record<WuXing, number> = {
    木: fe.wood  ?? 0,
    火: fe.fire  ?? 0,
    土: fe.earth ?? 0,
    金: fe.metal ?? 0,
    水: fe.water ?? 0,
  }

  // ── 季节 ─────────────────────────────────────────────────────────────────
  const season: BaziPartnerData['season'] = zhiSeasonMap[monthZhi] ?? 'lateSummer'
  const sStrength = seasonalStrength[season]
  const seasonScore = sStrength[dayMasterElement] ?? 1

  // ── 有效五行 (季节加成) ───────────────────────────────────────────────────
  const boost = seasonScore >= 4 ? 2 : seasonScore >= 3 ? 1 : 0
  const effectiveElements: Record<WuXing, number> = { ...elements }
  effectiveElements[dayMasterElement] = (effectiveElements[dayMasterElement] ?? 0) + boost

  // ── 日主强弱 ─────────────────────────────────────────────────────────────
  // supportScore: 同元素 + 生日主的元素 (via 藏干)
  // drainScore: 克日主的元素 + 日主所生的元素 (泄)
  let supportScore = 0
  let drainScore   = 0
  const generatedBy = generatedByMap[dayMasterElement]
  const restrainedBy = restrainedByMap[dayMasterElement]
  const generates_el = generateMap[dayMasterElement]  // 日主所生 (泄气)
  const restrains_el = restrainMap[dayMasterElement]  // 日主所克 (耗气)

  // scan all stems & branch main-qi
  const allGan: string[] = [yearGan, monthGan, dayGan]
  if (hourGan) allGan.push(hourGan)
  const allZhi: string[] = [yearZhi, monthZhi, dayZhi]
  if (hourZhi) allZhi.push(hourZhi)

  for (const g of allGan) {
    if (g === dayGan) continue  // skip self
    const el = ganElement(g)
    if (el === dayMasterElement || el === generatedBy) supportScore += 1
    if (el === restrainedBy || el === generates_el || el === restrains_el) drainScore += 0.5
  }
  // branch main qi (weight 1.0)
  for (const z of allZhi) {
    const cangGan = zhiCangGanMap[z] ?? []
    cangGan.forEach((g, idx) => {
      const w  = cangGanWeights[idx] ?? 0.2
      const el = ganElement(g)
      if (el === dayMasterElement || el === generatedBy) supportScore += w
      if (el === restrainedBy || el === generates_el) drainScore += w * 0.5
    })
  }

  const totalStrengthScore = seasonScore * 2 + supportScore - drainScore
  const dayMasterStrength: BaziPartnerData['dayMasterStrength'] =
    totalStrengthScore >= 6 ? 'strong' :
    totalStrengthScore <= 2 ? 'weak' : 'balanced'

  // ── 喜忌神 ────────────────────────────────────────────────────────────────
  let favorableElements: WuXing[]
  let unfavorableElements: WuXing[]

  if (dayMasterStrength === 'strong') {
    // 强：喜 食伤财官 (泄克) 忌 比印
    favorableElements   = [generates_el, restrains_el, restrainedBy].filter((e): e is WuXing => !!e)
    unfavorableElements = [dayMasterElement, generatedBy].filter((e): e is WuXing => !!e)
  } else if (dayMasterStrength === 'weak') {
    // 弱：喜 印比 忌 食伤财官
    favorableElements   = [generatedBy, dayMasterElement].filter((e): e is WuXing => !!e)
    unfavorableElements = [generates_el, restrains_el, restrainedBy].filter((e): e is WuXing => !!e)
  } else {
    // 中和：喜 生扶 (generatedBy) + 适当泄 (generates_el)
    favorableElements   = [generatedBy, generates_el].filter((e): e is WuXing => !!e)
    unfavorableElements = [restrainedBy].filter((e): e is WuXing => !!e)
  }

  // ── 调候 (tiaohou) ────────────────────────────────────────────────────────
  let tiaohouNeeds: string | null = null
  if (season === 'winter' && (
    ['木','金','土'].includes(dayMasterElement)
  )) {
    tiaohouNeeds = '火'
  } else if (season === 'summer' && (
    ['金','木'].includes(dayMasterElement)
  )) {
    tiaohouNeeds = '水'
  }

  // ── 十神统计 (含藏干) ──────────────────────────────────────────────────────
  const shishenCount: Record<ShishenKey, number> = {
    bijie: 0, shishang: 0, caicai: 0, guansha: 0, yinxing: 0
  }

  function classifyShishen(el: WuXing): ShishenKey {
    if (el === dayMasterElement)               return 'bijie'
    if (generates(dayMasterElement, el))       return 'shishang'  // 日主生 = 食伤
    if (restrains(dayMasterElement, el))       return 'caicai'    // 日主克 = 财
    if (restrains(el, dayMasterElement))       return 'guansha'   // 克日主 = 官杀
    if (generates(el, dayMasterElement))       return 'yinxing'   // 生日主 = 印
    return 'bijie'
  }

  const ganList: string[] = [yearGan, monthGan]  // skip dayGan itself
  if (hourGan) ganList.push(hourGan)
  for (const g of ganList) {
    const k = classifyShishen(ganElement(g))
    shishenCount[k] += 1
  }
  for (const z of allZhi) {
    const cangGan = zhiCangGanMap[z] ?? []
    cangGan.forEach((g, idx) => {
      const w = cangGanWeights[idx] ?? 0.2
      const k = classifyShishen(ganElement(g))
      shishenCount[k] += w
    })
  }

  // 主导十神 = 最高分
  const dominantShishen = (Object.entries(shishenCount) as [ShishenKey, number][])
    .reduce((a, b) => b[1] > a[1] ? b : a)[0]

  const shishenProfile = shishenProfiles[dominantShishen]

  return {
    input,
    yearPillar, monthPillar, dayPillar, hourPillar,
    yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi,
    dayMaster, dayMasterElement, zodiac, naYin,
    elements, effectiveElements,
    isThreePillar: isTimeUnknown,
    season, seasonScore, dayMasterStrength, totalStrengthScore,
    favorableElements, unfavorableElements, tiaohouNeeds,
    shishenCount, dominantShishen, shishenProfile,
  }
}

// ── Six-dimension scorers ─────────────────────────────────────────────────────

// Score 1 — dayMaster (max 25, base 12)
function scoreDayMaster(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string } {
  const ganA = a.dayMaster, ganB = b.dayMaster
  const elA  = a.dayMasterElement, elB = b.dayMasterElement

  const he = tianGanHe(ganA, ganB)
  if (he) {
    return {
      score: Math.min(25, 12 + 10),
      description: `Day Masters ${ganA}${ganB} form a Heavenly Combination → ${he.result}`,
    }
  }
  if (elA === elB) {
    return {
      score: Math.min(25, 12 + 5),
      description: `Both share the same element ${elA} — steady mutual understanding`,
    }
  }
  if (generates(elA, elB) || generates(elB, elA)) {
    const desc = generates(elA, elB)
      ? `${elA} generates ${elB} — one nurtures the other`
      : `${elB} generates ${elA} — one nurtures the other`
    return { score: Math.min(25, 12 + 7), description: desc }
  }
  if (restrains(elA, elB) || restrains(elB, elA)) {
    // Check strength complement (weak + strong with controlling element = +3)
    const complement =
      (a.dayMasterStrength === 'weak' && b.dayMasterStrength === 'strong') ||
      (a.dayMasterStrength === 'strong' && b.dayMasterStrength === 'weak')
    const bonus = complement ? 3 : 0
    const desc = `${restrains(elA,elB) ? elA : elB} restrains ${restrains(elA,elB) ? elB : elA}${complement ? '; strength imbalance creates dynamic tension' : ''}`
    return { score: Math.min(25, 12 + 2 + bonus), description: desc }
  }
  return { score: 12, description: `${ganA}(${elA}) and ${ganB}(${elB}) — neutral interaction` }
}

// Score 2 — zodiac year branch (max 20, base 10)
function scoreZodiac(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string } {
  const zA = a.yearZhi, zB = b.yearZhi
  if (diZhiLiuHe(zA, zB))   return { score: Math.min(20, 10+10), description: `Year branches ${zA}${zB} form a Six Harmony` }
  if (diZhiSanHe(zA, zB))   return { score: Math.min(20, 10+7),  description: `Year branches ${zA}${zB} form a Three Harmony` }
  if (diZhiLiuChong(zA, zB)) return { score: Math.min(20, 10-2), description: `Year branches ${zA}${zB} clash (六冲) — opposing energies` }
  if (diZhiLiuHai(zA, zB))  return { score: Math.min(20, 10-1), description: `Year branches ${zA}${zB} form a Six Harm — subtle friction` }
  return { score: Math.min(20, 10+3), description: `Year branches ${zA}${zB} — neutral compatibility` }
}

// Score 3 — elements mutual support (max 20, base 10)
function scoreElements(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string; notes: string[] } {
  let score = 10
  const notes: string[] = []

  // Each favorable element that the partner's dayMaster provides → +2.5
  if (a.favorableElements.includes(b.dayMasterElement)) {
    score += 2.5
    notes.push(`B's ${b.dayMasterElement} supports A's chart`)
  }
  if (b.favorableElements.includes(a.dayMasterElement)) {
    score += 2.5
    notes.push(`A's ${a.dayMasterElement} supports B's chart`)
  }

  // Shared elemental gaps (both lack the same element) → -1.5 each
  const allEls: WuXing[] = ['木','火','土','金','水']
  for (const el of allEls) {
    if (a.elements[el] === 0 && b.elements[el] === 0) {
      score -= 1.5
      notes.push(`Both lack ${el} — shared blind spot`)
    }
  }

  // Tiaohou supplement: if one partner provides what the other's tiaohou needs → +1
  if (a.tiaohouNeeds && b.dayMasterElement === a.tiaohouNeeds) {
    score += 1
    notes.push(`B's ${b.dayMasterElement} satisfies A's seasonal regulation need`)
  }
  if (b.tiaohouNeeds && a.dayMasterElement === b.tiaohouNeeds) {
    score += 1
    notes.push(`A's ${a.dayMasterElement} satisfies B's seasonal regulation need`)
  }

  score = Math.max(8, Math.min(20, score))
  return {
    score,
    description: score >= 16 ? 'Strong elemental complementarity' :
                 score >= 12 ? 'Moderate elemental balance' : 'Elemental tension present',
    notes,
  }
}

// Score 4 — naYin year pillar (max 15, base 9)
function naYinEl(naYin: string): WuXing | null {
  const last = naYin?.slice(-1)
  return (WUXING as readonly string[]).includes(last) ? last as WuXing : null
}

function scoreNaYin(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string } {
  const elA = naYinEl(a.naYin), elB = naYinEl(b.naYin)
  if (!elA || !elB) return { score: 9, description: 'NaYin element undetermined — neutral' }
  if (elA === elB)   return { score: Math.min(15, 9+3),  description: `NaYin elements both ${elA} — harmonious resonance` }
  if (generates(elA, elB) || generates(elB, elA)) {
    const desc = generates(elA,elB) ? `NaYin ${elA}→${elB} nurturing flow` : `NaYin ${elB}→${elA} nurturing flow`
    return { score: Math.min(15, 9+5), description: desc }
  }
  if (restrains(elA, elB) || restrains(elB, elA)) {
    return { score: Math.min(15, 9-1), description: `NaYin ${elA} vs ${elB} — controlling tension` }
  }
  return { score: Math.min(15, 9+1), description: `NaYin ${elA} and ${elB} — indirect connection` }
}

// Score 5 — day pillar ganzhi (max 10, base 5)
function scoreGanZhi(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string } {
  let score = 5
  const parts: string[] = []

  // Each 天干五合 between all stems
  const stemsA = [a.yearGan, a.monthGan, a.dayGan]
  const stemsB = [b.yearGan, b.monthGan, b.dayGan]
  for (const sA of stemsA) {
    for (const sB of stemsB) {
      const he = tianGanHe(sA, sB)
      if (he) {
        score += 0.8
        parts.push(`${sA}${sB}合`)
      }
    }
  }

  // Each 地支六合 between all branches
  const zhiA = [a.yearZhi, a.monthZhi, a.dayZhi]
  const zhiB = [b.yearZhi, b.monthZhi, b.dayZhi]
  for (const zA of zhiA) {
    for (const zB of zhiB) {
      if (diZhiLiuHe(zA, zB)) {
        score += 0.6
        parts.push(`${zA}${zB}六合`)
      }
    }
  }

  score = Math.min(10, score)
  return {
    score,
    description: parts.length > 0 ? `Stem-branch interactions: ${parts.join(', ')}` : 'No notable stem-branch combinations',
  }
}

// Score 6 — spouse palace = day branches (max 10, base 6)
function scoreSpousePalace(a: BaziPartnerData, b: BaziPartnerData): { score: number; description: string } {
  const zA = a.dayZhi, zB = b.dayZhi
  if (diZhiLiuHe(zA, zB))    return { score: Math.min(10, 6+4), description: `Spouse palace ${zA}${zB} Six Harmony — natural attraction` }
  if (diZhiSanHe(zA, zB))    return { score: Math.min(10, 6+3), description: `Spouse palace ${zA}${zB} Three Harmony — complementary energies` }
  if (diZhiLiuChong(zA, zB)) return { score: Math.max(5, 6-1),  description: `Spouse palace ${zA}${zB} clash — friction in intimate space` }
  return { score: Math.min(10, 6+1), description: `Spouse palace ${zA}${zB} — stable neutral connection` }
}

// ── calculateCompatibilityScores ──────────────────────────────────────────────

export function calculateCompatibilityScores(
  a: BaziPartnerData,
  b: BaziPartnerData,
): CompatibilityScores {
  const dm = scoreDayMaster(a, b)
  const zo = scoreZodiac(a, b)
  const el = scoreElements(a, b)
  const ny = scoreNaYin(a, b)
  const gz = scoreGanZhi(a, b)
  const sp = scoreSpousePalace(a, b)

  const rawTotal = dm.score + zo.score + el.score + ny.score + gz.score + sp.score
  const finalScore = Math.max(60, Math.min(99, Math.round(60 + (rawTotal - 40) * 39 / 60)))

  const level: CompatibilityScores['level'] =
    finalScore >= 90 ? { key: 'excellent', stars: 5 } :
    finalScore >= 80 ? { key: 'good',      stars: 4 } :
    finalScore >= 70 ? { key: 'average',   stars: 3 } :
                       { key: 'needWork',  stars: 2 }

  return {
    total: finalScore,
    level,
    breakdown: {
      dayMaster:    { score: dm.score, maxScore: 25, description: dm.description },
      zodiac:       { score: zo.score, maxScore: 20, description: zo.description },
      elements:     { score: el.score, maxScore: 20, description: el.description, notes: el.notes },
      naYin:        { score: ny.score, maxScore: 15, description: ny.description },
      ganZhi:       { score: gz.score, maxScore: 10, description: gz.description },
      spousePalace: { score: sp.score, maxScore: 10, description: sp.description },
    },
  }
}

// ── Smoke test ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const a = calculateBaziPartnerData({
    name: 'Alice', gender: 'male',
    birthDate: '1990-06-15', birthTime: '12:00',
    isTimeUnknown: false,
    longitude: 116.4, timezoneOffsetSec: 28800,
    locationName: 'Beijing',
  })
  const b = calculateBaziPartnerData({
    name: 'Bob', gender: 'female',
    birthDate: '1992-09-20', birthTime: '08:30',
    isTimeUnknown: false,
    longitude: 116.4, timezoneOffsetSec: 28800,
    locationName: 'Beijing',
  })
  const scores = calculateCompatibilityScores(a, b)
  console.log(JSON.stringify({
    a: {
      yearPillar:        a.yearPillar,
      dayMaster:         a.dayMaster,
      dayMasterStrength: a.dayMasterStrength,
      dominantShishen:   a.dominantShishen,
      favorableElements: a.favorableElements,
    },
    b: {
      yearPillar:        b.yearPillar,
      dayMaster:         b.dayMaster,
      dayMasterStrength: b.dayMasterStrength,
      dominantShishen:   b.dominantShishen,
      favorableElements: b.favorableElements,
    },
    scores,
  }, null, 2))
}
