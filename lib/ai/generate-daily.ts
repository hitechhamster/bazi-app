import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildDailyPrompt, type DailyContext } from './daily-prompt'
import { buildPromptContext } from './generate-report'
import { createAdminClient } from '@/lib/supabase/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import { ganToWuXingEn } from '@/lib/bazi/chart-helpers'

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_OUTPUT_TOKENS = 4096

const DAILY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    content: { type: 'STRING' },
    poem:    { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['content', 'poem'],
}

interface DailyResult {
  content: string
  poem: string[]
}

function validateDailyResult(raw: Record<string, unknown>): DailyResult {
  const content = typeof raw.content === 'string' ? raw.content.trim() : ''
  if (content.length < 50) throw new Error('content missing or too short')

  const poem = (Array.isArray(raw.poem) ? raw.poem : []).filter(
    (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0
  )
  if (poem.length !== 4) throw new Error(`poem must have 4 lines, got ${poem.length}`)

  return { content, poem }
}

async function callGemini(prompt: string): Promise<DailyResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: DAILY_SCHEMA,
        },
      })
      const text = result.text ?? ''
      if (text.length === 0) throw new Error('Empty response from Gemini')
      const parsed = JSON.parse(text) as Record<string, unknown>
      return validateDailyResult(parsed)
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

export async function generateDailyReading(profileId: string, locale = 'en'): Promise<void> {
  const db = createAdminClient()
  const todayStr = new Date().toISOString().slice(0, 10)

  const { data: profile, error: fetchErr } = await db
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (fetchErr || !profile) {
    console.error('[generate-daily] Failed to fetch profile:', fetchErr)
    return
  }

  // Cache check — bail out if already generated today
  const cached = profile.daily_reading as { date?: string } | null
  if (cached?.date === todayStr) {
    console.log('[generate-daily] Cache hit for', profileId, todayStr)
    return
  }

  await db.from('profiles')
    .update({ daily_reading_status: 'generating', daily_reading_error: null })
    .eq('id', profileId)

  try {
    const todayReport = generateBaziReport(new Date(), 'male')
    const todayGan = todayReport.pillars.day.gan
    const todayZhi = todayReport.pillars.day.zhi
    const todayGanZhi = todayReport.pillars.day.ganZhi
    const todayWuXing = ganToWuXingEn(todayGan)
    const currentMonthGanZhi = todayReport.pillars.month.ganZhi

    const baseCtx = buildPromptContext(profile as Record<string, unknown>)

    const structured = profile.report_structured as {
      strength: string | null
      pattern: string | null
      favorable: string[] | null
      unfavorable: string[] | null
    } | null

    const dailyCtx: DailyContext = {
      ...baseCtx,
      profileName: (profile.name as string) ?? 'this person',
      todayDate: todayStr,
      todayGanZhi,
      todayGan,
      todayZhi,
      todayWuXing,
      currentMonthGanZhi,
      structured,
    }

    const prompt = buildDailyPrompt(dailyCtx)
    const result = await callGemini(prompt)

    await db.from('profiles').update({
      daily_reading: { date: todayStr, content: result.content, poem: result.poem },
      daily_reading_locale: locale,
      daily_reading_status: 'done',
      daily_reading_error: null,
    }).eq('id', profileId)

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generate-daily] Generation failed:', message)
    await db.from('profiles').update({
      daily_reading_status: 'failed',
      daily_reading_error: message,
    }).eq('id', profileId)
  }
}
