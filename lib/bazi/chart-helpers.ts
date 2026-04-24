import 'server-only'

const HEAVENLY_STEMS_ZH = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const EARTHLY_BRANCHES_ZH = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const ZODIAC_ZH = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']

const ZODIAC_EN: Record<string, string> = {
  '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit', '龙': 'Dragon',
  '蛇': 'Snake', '马': 'Horse', '羊': 'Goat', '猴': 'Monkey',
  '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig',
}

const GAN_TO_WUXING_EN: Record<string, string> = {
  '甲': 'Wood', '乙': 'Wood',
  '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
}

// Six-harmony pairs (六合)
const LIU_HE_PAIRS: [number, number][] = [
  [0, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6],
]
// Three-harmony groups (三合)
const SAN_HE_GROUPS: number[][] = [
  [0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11],
]
// Six-harm pairs (六害)
const LIU_HAI_PAIRS: [number, number][] = [
  [0, 5], [1, 4], [2, 3], [6, 11], [7, 10], [8, 9],
]
// Three-penalty groups (三刑) — partial list covering main cases
const SAN_XING_PAIRS: [number, number][] = [
  [2, 11], [11, 7], [7, 2],  // 寅亥巳 group
  [1, 10], [10, 6], [6, 1],  // 丑戌未 group
  [0, 9],  // 子酉 pair
  [3, 6],  // 卯午 pair (self-harm proxies)
]

export function ganToWuXingEn(gan: string): string {
  return GAN_TO_WUXING_EN[gan] ?? 'Unknown'
}

export function zodiacZhToEn(zh: string): string {
  return ZODIAC_EN[zh] ?? zh
}

export function yearToStemBranch(year: number): {
  ganZhi: string
  gan: string
  zhi: string
  ganEn: string
  zhiEn: string
  wuXingEn: string
  zodiacZh: string
  zodiacEn: string
} {
  const ganIdx = ((year - 4) % 10 + 10) % 10
  const zhiIdx = ((year - 4) % 12 + 12) % 12
  const gan = HEAVENLY_STEMS_ZH[ganIdx]
  const zhi = EARTHLY_BRANCHES_ZH[zhiIdx]
  const zodiacZh = ZODIAC_ZH[zhiIdx]
  return {
    ganZhi: gan + zhi,
    gan,
    zhi,
    ganEn: ganToWuXingEn(gan),
    zhiEn: zhi,
    wuXingEn: ganToWuXingEn(gan),
    zodiacZh,
    zodiacEn: zodiacZhToEn(zodiacZh),
  }
}

export function computeTaiSuiStatus(
  birthZodiacZh: string,
  targetYear: number,
): string {
  const birthZhiIdx = ZODIAC_ZH.indexOf(birthZodiacZh)
  if (birthZhiIdx === -1) return 'NEUTRAL: No direct conflict with Tai Sui'
  const yearZhiIdx = ((targetYear - 4) % 12 + 12) % 12

  if (birthZhiIdx === yearZhiIdx) return 'CONFLICT: Ben Ming Nian (本命年) — same sign as Tai Sui'
  if (Math.abs(birthZhiIdx - yearZhiIdx) === 6) return 'CONFLICT: Chong Tai Sui (冲太岁) — direct opposition to Tai Sui'

  for (const [a, b] of SAN_XING_PAIRS) {
    if ((birthZhiIdx === a && yearZhiIdx === b) || (birthZhiIdx === b && yearZhiIdx === a)) {
      return 'CONFLICT: Xing Tai Sui (刑太岁) — penalty relationship with Tai Sui'
    }
  }
  for (const [a, b] of LIU_HAI_PAIRS) {
    if ((birthZhiIdx === a && yearZhiIdx === b) || (birthZhiIdx === b && yearZhiIdx === a)) {
      return 'CONFLICT: Hai Tai Sui (害太岁) — harm relationship with Tai Sui'
    }
  }
  for (const [a, b] of LIU_HE_PAIRS) {
    if ((birthZhiIdx === a && yearZhiIdx === b) || (birthZhiIdx === b && yearZhiIdx === a)) {
      return 'AUSPICIOUS: He Tai Sui (合太岁) — harmony with Tai Sui'
    }
  }
  for (const group of SAN_HE_GROUPS) {
    if (group.includes(birthZhiIdx) && group.includes(yearZhiIdx)) {
      return 'AUSPICIOUS: He Tai Sui (合太岁) — harmony with Tai Sui'
    }
  }
  return 'NEUTRAL: No direct conflict with Tai Sui'
}

export function approxAge(birthDate: string, now: Date = new Date()): number {
  const [by, bm, bd] = birthDate.split('-').map(n => parseInt(n, 10))
  if (!by || !bm || !bd) return 0
  let age = now.getFullYear() - by
  const thisYearBirthday = new Date(now.getFullYear(), bm - 1, bd)
  if (now < thisYearBirthday) age -= 1
  return age
}

export interface StoredLuckCycle {
  ganZhi: string
  gan: string
  zhi: string
  wuXingEn: string
  startAge: number
  endAge: number
  startYear: number
  endYear: number
}

export function normalizeLuckCycles(raw: any[]): StoredLuckCycle[] {
  if (!Array.isArray(raw)) return []
  return raw.map((c: any) => ({
    ganZhi: c.ganZhi ?? '',
    gan: c.gan ?? '',
    zhi: c.zhi ?? '',
    wuXingEn: ganToWuXingEn(c.gan ?? ''),
    startAge: c.startAge ?? 0,
    endAge: c.endAge ?? 0,
    startYear: c.startYear ?? 0,
    endYear: c.endYear ?? 0,
  }))
}
