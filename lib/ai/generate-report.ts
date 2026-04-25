import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildStructuredPrompt, type PromptContext, type BaziLanguage } from './structured-prompt'
import { buildReadingPrompt, type StructuredResult } from './reading-prompt'
import { createAdminClient } from '@/lib/supabase/server'
import { zodiacZhToEn, yearToStemBranch, computeTaiSuiStatus, approxAge } from '@/lib/bazi/chart-helpers'
import type { StoredLuckCycle } from '@/lib/bazi/chart-helpers'

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_OUTPUT_TOKENS_STRUCTURED = 4096
const MAX_OUTPUT_TOKENS_READING = 16384

const VALID_STRENGTH = ['身强', '身弱', '中和', '从强', '从弱'] as const
const VALID_ELEMENTS = ['木', '火', '土', '金', '水'] as const

const STRUCTURED_SCHEMA = {
  type: 'OBJECT',
  properties: {
    strength: { type: 'STRING', nullable: true, enum: [...VALID_STRENGTH] },
    pattern:  { type: 'STRING', nullable: true },
    favorable:   { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
    unfavorable: { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
  },
  required: ['favorable', 'unfavorable'],
}

function validateStructured(raw: Record<string, unknown>): StructuredResult {
  const strength =
    typeof raw.strength === 'string' &&
    (VALID_STRENGTH as readonly string[]).includes(raw.strength)
      ? raw.strength : null

  const pattern =
    typeof raw.pattern === 'string' && raw.pattern.trim().length > 0
      ? raw.pattern.trim() : null

  const favorable = (Array.isArray(raw.favorable) ? raw.favorable : []).filter(
    (e: unknown): e is string =>
      typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e)
  )
  const unfavorable = (Array.isArray(raw.unfavorable) ? raw.unfavorable : []).filter(
    (e: unknown): e is string =>
      typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e)
  )

  return { strength, pattern, favorable, unfavorable }
}

async function callStructuredStage(prompt: string): Promise<StructuredResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_TOKENS_STRUCTURED,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: STRUCTURED_SCHEMA,
        },
      })
      const text = result.text ?? ''
      if (text.length === 0) throw new Error('Empty response from Gemini (structured stage)')
      const parsed = JSON.parse(text) as Record<string, unknown>
      return validateStructured(parsed)
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

async function callReadingStage(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_TOKENS_READING,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      })
      const text = result.text?.trim() ?? ''
      if (text.length < 100) throw new Error('Reading response missing or too short')
      return text
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

export function buildPromptContext(profile: Record<string, unknown>): PromptContext {
  const luckCycles: StoredLuckCycle[] = Array.isArray(profile.luck_cycles)
    ? (profile.luck_cycles as StoredLuckCycle[]) : []

  const zodiacZh: string = (profile.zodiac as string) ?? ''
  const zodiacEn = zodiacZhToEn(zodiacZh)
  const birthDate: string = (profile.birth_date as string) ?? ''
  const currentYear = new Date().getFullYear()
  const currentYearSB = yearToStemBranch(currentYear)
  const taiSuiStatus = computeTaiSuiStatus(zodiacZh, currentYear)
  const personAge = birthDate ? approxAge(birthDate, new Date()) : 0
  const forecastYearFullName = `${currentYearSB.wuXingEn} ${currentYearSB.zodiacEn}`

  const currentDayunCycle =
    luckCycles.find(c => c.startYear <= currentYear && currentYear <= c.endYear) ?? null
  const currentDayun = currentDayunCycle ? {
    ganZhi: currentDayunCycle.ganZhi,
    wuXing: currentDayunCycle.wuXingEn,
    startAge: currentDayunCycle.startAge,
    endAge: currentDayunCycle.endAge,
    startYear: currentDayunCycle.startYear,
    endYear: currentDayunCycle.endYear,
  } : null

  const currentLiuNian = {
    year: currentYear,
    ganZhi: currentYearSB.ganZhi,
    wuXing: currentYearSB.wuXingEn,
  }

  return {
    dayMaster: (profile.day_master as string) ?? '',
    dayMasterElement: (profile.day_master_element as string) ?? '',
    pillars: {
      year: (profile.pillar_year as string) ?? '',
      month: (profile.pillar_month as string) ?? '',
      day: (profile.pillar_day as string) ?? '',
      hour: (profile.pillar_hour as string | null) ?? null,
    },
    fiveElements: (profile.five_elements as PromptContext['fiveElements']) ?? {
      wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
    },
    luckCycles: luckCycles.map(c => ({
      startAge: c.startAge, endAge: c.endAge,
      startYear: c.startYear, endYear: c.endYear,
      ganZhi: c.ganZhi, wuXing: c.wuXingEn,
    })),
    userZodiac: { zh: zodiacZh, en: zodiacEn },
    taiSuiStatus,
    isThreePillar: (profile.is_time_unknown as boolean) ?? false,
    approxAge: personAge,
    forecastYear: currentYear,
    forecastNextYear: currentYear + 1,
    forecastYearFullName,
    language: ((profile.base_report_language as string) ?? 'en') as BaziLanguage,
    currentDayun,
    currentLiuNian,
  }
}

/**
 * Two-stage AI generation:
 * Stage 1: pending → generating_structured → writes report_structured → generating_reading
 * Stage 2: generating_reading → writes base_report → done
 * Any stage failure → failed (no fallback to single-stage)
 *
 * @param locale - The user's locale at generation time. Written to report_structured_locale
 *                 and base_report_locale so content can be re-generated in a different locale
 *                 in future without ambiguity. Defaults to 'en'.
 */
export async function generateAndSaveReport(profileId: string, locale = 'en'): Promise<void> {
  const db = createAdminClient()

  const { data: profile, error: fetchErr } = await db
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (fetchErr || !profile) {
    console.error('[generate-report] Failed to fetch profile:', fetchErr)
    return
  }

  const context = buildPromptContext(profile as Record<string, unknown>)
  // Override language with the caller-supplied locale so the prompt always reflects
  // the user's current locale, not the locale stored at profile creation time.
  context.language = locale as BaziLanguage

  // ─── Stage 1: Structured analysis ───
  await db.from('profiles')
    .update({ base_report_status: 'generating_structured' })
    .eq('id', profileId)

  let structured: StructuredResult
  try {
    const prompt = buildStructuredPrompt(context)
    structured = await callStructuredStage(prompt)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generate-report] Stage 1 (structured) failed:', message)
    await db.from('profiles').update({
      base_report_status: 'failed',
      base_report_error: `Stage 1: ${message}`,
    }).eq('id', profileId)
    return
  }

  // Write Stage 1 result and transition to Stage 2
  await db.from('profiles').update({
    report_structured: {
      strength: structured.strength,
      pattern: structured.pattern,
      favorable: structured.favorable.length > 0 ? structured.favorable : null,
      unfavorable: structured.unfavorable.length > 0 ? structured.unfavorable : null,
    },
    report_structured_locale: locale,
    base_report_status: 'generating_reading',
  }).eq('id', profileId)

  // ─── Stage 2: Reading generation ───
  let reading: string
  try {
    const prompt = buildReadingPrompt(context, structured)
    reading = await callReadingStage(prompt)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generate-report] Stage 2 (reading) failed:', message)
    await db.from('profiles').update({
      base_report_status: 'failed',
      base_report_error: `Stage 2: ${message}`,
    }).eq('id', profileId)
    return
  }

  // Final write
  await db.from('profiles').update({
    base_report: reading,
    base_report_locale: locale,
    base_report_status: 'done',
    base_report_generated_at: new Date().toISOString(),
    base_report_error: null,
  }).eq('id', profileId)
}
