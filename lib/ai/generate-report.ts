import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildBaziPrompt } from './bazi-prompt'
import { createAdminClient } from '@/lib/supabase/server'
import { zodiacZhToEn, yearToStemBranch, computeTaiSuiStatus, approxAge } from '@/lib/bazi/chart-helpers'
import type { StoredLuckCycle } from '@/lib/bazi/chart-helpers'

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_OUTPUT_TOKENS = 16384

const VALID_STRENGTH = ['身强', '身弱', '中和', '从强', '从弱'] as const
const VALID_ELEMENTS = ['木', '火', '土', '金', '水'] as const

const REPORT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    strength: {
      type: 'STRING',
      nullable: true,
      enum: [...VALID_STRENGTH],
    },
    pattern: {
      type: 'STRING',
      nullable: true,
    },
    favorable: {
      type: 'ARRAY',
      items: { type: 'STRING', enum: [...VALID_ELEMENTS] },
    },
    unfavorable: {
      type: 'ARRAY',
      items: { type: 'STRING', enum: [...VALID_ELEMENTS] },
    },
    reading: { type: 'STRING' },
  },
  required: ['favorable', 'unfavorable', 'reading'],
}

interface ParsedReport {
  strength: string | null
  pattern: string | null
  favorable: string[]
  unfavorable: string[]
  reading: string
}

function validateParsed(raw: Record<string, unknown>): ParsedReport {
  const reading = typeof raw.reading === 'string' ? raw.reading.trim() : ''
  if (reading.length < 100) throw new Error('reading field missing or too short')

  const strength =
    typeof raw.strength === 'string' &&
    (VALID_STRENGTH as readonly string[]).includes(raw.strength)
      ? raw.strength
      : null

  const pattern =
    typeof raw.pattern === 'string' && raw.pattern.trim().length > 0
      ? raw.pattern.trim()
      : null

  const favorable = (Array.isArray(raw.favorable) ? raw.favorable : []).filter(
    (e: unknown): e is string =>
      typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e)
  )
  const unfavorable = (Array.isArray(raw.unfavorable) ? raw.unfavorable : []).filter(
    (e: unknown): e is string =>
      typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e)
  )

  return { strength, pattern, favorable, unfavorable, reading }
}

async function callGeminiWithRetry(prompt: string): Promise<ParsedReport> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: REPORT_SCHEMA,
        },
      })
      const text = result.text ?? ''
      if (text.length === 0) throw new Error('Empty response from Gemini')
      const parsed = JSON.parse(text) as Record<string, unknown>
      return validateParsed(parsed)
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

export async function generateAndSaveReport(profileId: string): Promise<void> {
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

  await db
    .from('profiles')
    .update({ base_report_status: 'generating' })
    .eq('id', profileId)

  try {
    const luckCycles: StoredLuckCycle[] = Array.isArray(profile.luck_cycles)
      ? (profile.luck_cycles as StoredLuckCycle[])
      : []

    const zodiacZh: string = profile.zodiac ?? ''
    const zodiacEn = zodiacZhToEn(zodiacZh)
    const birthDate: string = profile.birth_date ?? ''
    const currentYear = new Date().getFullYear()
    const currentYearSB = yearToStemBranch(currentYear)
    const taiSuiStatus = computeTaiSuiStatus(zodiacZh, currentYear)
    const personAge = birthDate ? approxAge(birthDate, new Date()) : 0

    const forecastYearFullName = `${currentYearSB.wuXingEn} ${currentYearSB.zodiacEn}`

    // Derive currentDayun from stored luck cycles (no extra DB column needed)
    const currentDayunCycle =
      luckCycles.find(c => c.startYear <= currentYear && currentYear <= c.endYear) ?? null
    const currentDayun = currentDayunCycle
      ? {
          ganZhi: currentDayunCycle.ganZhi,
          wuXing: currentDayunCycle.wuXingEn,
          startAge: currentDayunCycle.startAge,
          endAge: currentDayunCycle.endAge,
          startYear: currentDayunCycle.startYear,
          endYear: currentDayunCycle.endYear,
        }
      : null

    // Derive currentLiuNian from current year stem-branch
    const currentLiuNian = {
      year: currentYear,
      ganZhi: currentYearSB.ganZhi,
      wuXing: currentYearSB.wuXingEn,
    }

    const prompt = buildBaziPrompt({
      dayMaster: profile.day_master ?? '',
      dayMasterElement: profile.day_master_element ?? '',
      pillars: {
        year: profile.pillar_year ?? '',
        month: profile.pillar_month ?? '',
        day: profile.pillar_day ?? '',
        hour: profile.pillar_hour ?? null,
      },
      fiveElements: profile.five_elements ?? { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
      luckCycles: luckCycles.map(c => ({
        startAge: c.startAge,
        endAge: c.endAge,
        startYear: c.startYear,
        endYear: c.endYear,
        ganZhi: c.ganZhi,
        wuXing: c.wuXingEn,
      })),
      userZodiac: { zh: zodiacZh, en: zodiacEn },
      taiSuiStatus,
      isThreePillar: profile.is_time_unknown ?? false,
      approxAge: personAge,
      forecastYear: currentYear,
      forecastNextYear: currentYear + 1,
      forecastYearFullName,
      language: profile.base_report_language ?? 'en',
      currentDayun,
      currentLiuNian,
    })

    const report = await callGeminiWithRetry(prompt)

    await db
      .from('profiles')
      .update({
        base_report: report.reading,
        base_report_status: 'done',
        base_report_generated_at: new Date().toISOString(),
        base_report_error: null,
        report_structured: {
          strength: report.strength,
          pattern: report.pattern,
          favorable: report.favorable.length > 0 ? report.favorable : null,
          unfavorable: report.unfavorable.length > 0 ? report.unfavorable : null,
        },
      })
      .eq('id', profileId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generate-report] Generation failed:', message)
    await db
      .from('profiles')
      .update({
        base_report_status: 'failed',
        base_report_error: message,
      })
      .eq('id', profileId)
  }
}
