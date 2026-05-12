import 'server-only'
import type { PromptContext } from '../structured-prompt'
import type { StructuredResult } from '../reading-prompt'
import type { ForecastResult } from '../../bazi/forecast-timeline'

// ── Premium context type ──────────────────────────────────────────────────────

export interface PremiumContext extends PromptContext {
  gender:       string          // 'male' | 'female'
  structured:   StructuredResult
  forecastData: ForecastResult
}

export interface ChapterPrompt {
  systemPrompt: string
  userPrompt:   string
  maxTokens:    number
}

// ── Language tone ─────────────────────────────────────────────────────────────

export const LANG_TONE: Record<string, string> = {
  'en':
    'Write in authoritative, soulful English. Use Chinese metaphysical terms with English explanation on first use. Blend classical Bazi logic with modern psychological language. Be direct, specific, and predictive — name exact year ranges, ages, and elemental interactions.',
  'zh-CN':
    '用权威、深刻的简体中文撰写。融合传统命理术语与现代心理学语言。直接而具体——点明年份区间、干支、格局。语气如顶级命理师与知己深谈，专业有力，绝不套话。避免"可能""也许"等模糊词，改用"历史上如此""运势显示""命局呈现"等有依据的表述。',
  'zh-TW':
    '用權威、深刻的繁體中文撰寫，採用台灣命理界慣用語（喜用神、大運、流年、格局、透干、通根、刑沖合害、財星、官殺、夫宮、命局、用神）。語氣如頂級命理師與知己深談，直接、有力、溫暖。避免模糊表述，改用有依據的預測性語言。',
}

// ── Gender instruction ────────────────────────────────────────────────────────

export function genderInstruction(gender: string, locale: string): string {
  const isTW = locale === 'zh-TW'
  const isCN = locale === 'zh-CN'

  if (gender === 'female') {
    if (isTW) return '**命主為女性**：官殺星 = 丈夫／伴侶緣份；財星 = 財務能力／父親緣份。婚姻章節以官殺為主軸，用女性視角解讀夫宮（日支）與桃花星。'
    if (isCN) return '**命主为女性**：官杀星 = 丈夫/伴侣缘分；财星 = 财务能力/父亲缘分。婚姻章节以官杀为主轴，用女性视角解读夫宫（日支）与桃花星。'
    return '**Subject is FEMALE**: Officer/Killings stars = husband/partner energy. Wealth stars = financial capacity / father archetype. Center relationship analysis on Officer/Killings as the spouse indicator. Day Branch is the Spouse Palace. Use female perspective throughout.'
  }

  if (gender === 'male') {
    if (isTW) return '**命主為男性**：財星 = 妻子／伴侶緣份；官殺星 = 事業壓力／權威關係。婚姻章節以財星為主軸，用男性視角解讀妻宮（日支）。'
    if (isCN) return '**命主为男性**：财星 = 妻子/伴侣缘分；官杀星 = 事业压力/权威关系。婚姻章节以财星为主轴，用男性视角解读妻宫（日支）。'
    return '**Subject is MALE**: Wealth stars = wife/partner energy. Officer/Killings stars = career pressure, authority figures. Center relationship analysis on Wealth stars as the spouse indicator. Day Branch is the Spouse Palace. Use male perspective throughout.'
  }

  // neutral / unknown
  if (isTW || isCN) return '**性別未確定**：財星與官殺均從雙重視角分析，提供配偶緣份與財務能力兩種詮釋。使用中性表述。'
  return '**Gender unspecified**: Analyze Wealth and Officer/Killings from both perspectives (spouse energy + authority/career energy). Use neutral pronouns throughout.'
}

// ── Shared chart data block ───────────────────────────────────────────────────

export function chartDataBlock(ctx: PremiumContext): string {
  const {
    dayMaster, dayMasterElement, pillars, fiveElements,
    luckCycles, userZodiac, taiSuiStatus, isThreePillar,
    approxAge, forecastYear, forecastYearFullName,
    currentDayun, currentLiuNian, structured,
  } = ctx

  const todayStr = new Date().toISOString().split('T')[0]

  const luckCyclesStr = luckCycles
    .map(c => `Age ${c.startAge}–${c.endAge} (${c.startYear}–${c.endYear}): ${c.ganZhi} (${c.wuXing})`)
    .join('\n  ')

  const pastCycles   = luckCycles.filter(c => c.endYear   < forecastYear)
  const futureCycles = luckCycles.filter(c => c.startYear > forecastYear)

  const currentDayunStr = currentDayun
    ? `${currentDayun.ganZhi} (${currentDayun.wuXing}) | Age ${currentDayun.startAge}–${currentDayun.endAge} | ${currentDayun.startYear}–${currentDayun.endYear}`
    : 'Not yet active'

  const currentLiuNianStr = currentLiuNian
    ? `${currentLiuNian.year}: ${currentLiuNian.ganZhi} (${currentLiuNian.wuXing})`
    : `${forecastYear}: computed from chart`

  return `=== CHART DATA (authoritative — build on these, do NOT re-derive) ===
Today:      ${todayStr}
Person age: ~${approxAge} | Zodiac: ${userZodiac.en} (${userZodiac.zh})
${forecastYear} — ${forecastYearFullName} | Tai Sui: ${taiSuiStatus}

Day Master: ${dayMaster} (${dayMasterElement})
Four Pillars:
  Year:  ${pillars.year}
  Month: ${pillars.month}
  Day:   ${pillars.day}
  Hour:  ${isThreePillar ? 'UNKNOWN (three-pillar chart — do not guess)' : (pillars.hour ?? 'UNKNOWN')}
${isThreePillar ? '\nANALYSIS MODE: Three Pillars — hour unknown. Weight Month Pillar 80%. Note limitation once, do not repeat.\n' : ''}
Five Elements: Wood ${fiveElements.wood} | Fire ${fiveElements.fire} | Earth ${fiveElements.earth} | Metal ${fiveElements.metal} | Water ${fiveElements.water}

Structural analysis (pre-computed — do NOT re-derive):
  Strength:    ${structured.strength ?? 'undetermined'}
  Pattern:     ${structured.pattern ?? 'no dominant pattern'}
  Favorable:   ${structured.favorable.join(', ') || 'none identified'}
  Unfavorable: ${structured.unfavorable.join(', ') || 'none identified'}

All Luck Cycles:
  ${luckCyclesStr}

Current 大运: ${currentDayunStr}
Current 流年: ${currentLiuNianStr}
Past cycles:   ${pastCycles.map(c => `${c.ganZhi}(${c.startYear}–${c.endYear})`).join(' → ') || 'none'}
Future cycles: ${futureCycles.map(c => `${c.ganZhi}(${c.startYear}–${c.endYear})`).join(' → ') || 'none'}
=======================================================================`
}

// ── Universal system prompt ───────────────────────────────────────────────────

export const SYSTEM_BASE = `You are the most insightful Bazi destiny-reading master alive. You write with authority, depth, and genuine psychological precision. Every observation must be traceable to specific chart logic — nothing generic, nothing filler.

MANDATORY OUTPUT RULES:
- Pure markdown only. Start directly with ## heading. No preamble, no JSON, no code fences.
- Use ## for main sections, ### for subsections only.
- Use [[Term]] notation for Bazi terms on first use: [[Day Master]], [[Wealth Star]], [[Seven Killings]], [[Hurting Officer]], [[Eating God]], [[Indirect Wealth]], [[Direct Officer]], [[Resource Star]], etc.
- Bold key insights with **bold**. Use - for bullet lists where appropriate.
- NO emojis | NO horizontal rules (---) | NO icons.
- ALL content including all headings in the user's selected language.
- 80% predictive/descriptive insight, 20% practical advice.
- Write like you SEE this person — name inner contradictions, past pivots, specific timing.
- DO NOT truncate. Complete the entire requested chapter.
- Every claim must be grounded in chart data. Never write generic fortune-cookie advice.`
