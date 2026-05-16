import 'server-only'
import type { BaziPartnerData, CompatibilityScores } from '@/lib/bazi/compatibility'
import type { CompatibilityForecast } from '@/lib/bazi/compatibility-forecast'

// ── Context type ──────────────────────────────────────────────────────────────

export interface CompatPremiumContext {
  baziA:    BaziPartnerData
  baziB:    BaziPartnerData
  scores:   CompatibilityScores
  nameA:    string
  nameB:    string
  locale:   string
  mode:     'authentic' | 'gentle'
  forecast: CompatibilityForecast | null
}

export interface ChapterPrompt {
  systemPrompt: string
  userPrompt:   string
  maxTokens:    number
}

// ── Language tone ─────────────────────────────────────────────────────────────

const LANG_TONE_AUTHENTIC: Record<string, string> = {
  en:      'Write in authoritative, warm, soulful English. Use [[Chinese Term]] notation for Bazi terms on first use. Blend classical Bazi logic with modern psychological language. Be direct, specific, and predictive — name elemental interactions, pillar clashes, and timing windows precisely.',
  'zh-CN': '用权威、温暖、深刻的简体中文撰写。融合传统命理术语与现代心理学语言，术语用[[]]标注。直接而具体——点明干支、五行互动、格局。语气如顶级命理师深谈，专业有力，绝不套话。',
  'zh-TW': '用權威、溫暖、深刻的繁體中文撰寫。融合傳統命理術語與現代心理學語言，術語用[[]]標注。直接而具體——點明干支、五行互動、格局。語氣如頂級命理師深談，專業有力，絕不套話。',
}

const LANG_TONE_GENTLE: Record<string, string> = {
  en:      'Write in a warm, compassionate, encouraging voice. Use [[Chinese Term]] notation for Bazi terms on first use. Frame all challenges as growth opportunities. Speak as a wise, loving guide who deeply cares about both people\'s wellbeing.',
  'zh-CN': '用温暖、包容、鼓励的文风撰写，术语用[[]]标注。所有挑战都作为成长机遇来呈现。语气如智慧长者，充满关爱，引导双方走向理解与和谐。',
  'zh-TW': '用溫暖、包容、鼓勵的文風撰寫，術語用[[]]標注。所有挑戰都作為成長機遇來呈現。語氣如智慧長者，充滿關愛，引導雙方走向理解與和諧。',
}

export function langTone(locale: string, mode: 'authentic' | 'gentle'): string {
  const table = mode === 'authentic' ? LANG_TONE_AUTHENTIC : LANG_TONE_GENTLE
  return table[locale] ?? table.en
}

// ── System prompt ─────────────────────────────────────────────────────────────

export const SYSTEM_BASE = `You are the most insightful Bazi compatibility reading master alive. You write with authority, depth, and genuine psychological precision about RELATIONSHIPS between two specific people. Every observation must be traceable to specific chart logic — nothing generic, nothing filler.

MANDATORY OUTPUT RULES:
- Pure markdown only. Start directly with ## heading. No preamble, no JSON, no code fences.
- Use ## for main sections, ### for subsections only.
- Use [[Term]] notation for Bazi terms: [[日主]], [[財星]], [[官殺]], [[夫妻宮]], [[六合]], [[相沖]], [[大運]], [[流年]], etc.
- Bold key insights with **bold**. Use - for bullet lists where appropriate.
- NO emojis | NO horizontal rules (---) | NO icons.
- ALL content including headings in the user's selected language.
- 80% predictive/descriptive insight, 20% practical advice.
- Write about THIS couple specifically — their actual pillars, elements, and interactions.
- DO NOT truncate. Complete the entire requested chapter.`

// ── Gender instruction (both partners) ───────────────────────────────────────

export function genderInstruction(gA: string, gB: string, nameA: string, nameB: string, locale: string): string {
  const isTW = locale === 'zh-TW'
  const isCN = locale === 'zh-CN'

  function label(g: string, name: string): string {
    if (g === 'female') {
      if (isTW) return `${name}（女）：[[官殺星]] = 伴侶緣份；[[財星]] = 財務能力`
      if (isCN) return `${name}（女）：[[官杀星]] = 伴侣缘分；[[财星]] = 财务能力`
      return `${name} (female): [[Officer/Killings]] = partner energy; [[Wealth Star]] = finances`
    }
    if (g === 'male') {
      if (isTW) return `${name}（男）：[[財星]] = 伴侶緣份；[[官殺星]] = 事業壓力`
      if (isCN) return `${name}（男）：[[财星]] = 伴侣缘分；[[官杀星]] = 事业压力`
      return `${name} (male): [[Wealth Star]] = partner energy; [[Officer/Killings]] = career pressure`
    }
    // non-binary
    if (isTW || isCN) return `${name}（性別不限）：[[財星]]與[[官殺]]均從雙重視角分析，使用中性表述`
    return `${name} (non-binary): analyze [[Wealth Star]] and [[Officer/Killings]] from both perspectives; use neutral pronouns (they/Ta)`
  }

  const lineA = label(gA, nameA)
  const lineB = label(gB, nameB)
  const header = isTW || isCN ? '【命主性別規則】' : 'GENDER RULES'
  return `${header}\n- ${lineA}\n- ${lineB}`
}

// ── Shared chart data block ───────────────────────────────────────────────────

export function dualChartBlock(ctx: CompatPremiumContext): string {
  const { baziA, baziB, scores, nameA, nameB } = ctx

  function personLine(b: BaziPartnerData, name: string): string {
    const elStr = Object.entries(b.elements).map(([k, v]) => `${k}:${Number(v).toFixed(1)}`).join(' ')
    return `${name}: [[${b.dayMaster}]] ${b.dayMasterElement} · ${b.dayMasterStrength} · Zodiac:${b.zodiac} · NaYin:[[${b.naYin}]]
  Pillars: [[${b.yearPillar}]] [[${b.monthPillar}]] [[${b.dayPillar}]] ${b.hourPillar ? `[[${b.hourPillar}]]` : '(hour unknown)'}
  Elements: ${elStr}
  Favorable: ${b.favorableElements.join(', ') || 'balanced'} | Unfavorable: ${b.unfavorableElements.join(', ') || 'none'}
  Dominant: ${b.shishenProfile.en} (${b.shishenProfile.traits.slice(0, 3).join(', ')})`
  }

  const bd = scores.breakdown
  const scoreBlock = [
    `Overall: ${scores.total}/99 (${scores.level.key})`,
    `DayMaster: ${bd.dayMaster.score}/25 — ${bd.dayMaster.description}`,
    `Zodiac: ${bd.zodiac.score}/20 — ${bd.zodiac.description}`,
    `Elements: ${bd.elements.score}/20 — ${bd.elements.description}`,
    `NaYin: ${bd.naYin.score}/15 — ${bd.naYin.description}`,
    `Pillars: ${bd.ganZhi.score}/10 — ${bd.ganZhi.description}`,
    `SpousePalace: ${bd.spousePalace.score}/10 — ${bd.spousePalace.description}`,
  ].join('\n  ')

  return `=== DUAL CHART DATA (authoritative — build on these exactly) ===
${personLine(baziA, nameA)}

${personLine(baziB, nameB)}

=== COMPATIBILITY SCORES ===
  ${scoreBlock}
======================================================================`
}
