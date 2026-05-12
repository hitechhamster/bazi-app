import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildChapter1Prompt } from './premium-prompts/chapter-1-core'
import { buildChapter2Prompt } from './premium-prompts/chapter-2-career'
import { buildChapter3Prompt } from './premium-prompts/chapter-3-love'
import { buildChapter4Prompt } from './premium-prompts/chapter-4-forecast'
import type { PremiumContext } from './premium-prompts/_shared'
import { buildPromptContext } from './generate-report'
import { buildStructuredPrompt } from './structured-prompt'
import type { StructuredResult } from './reading-prompt'
import type { BaziLanguage } from './structured-prompt'
import { buildForecastForChart } from '@/lib/bazi/forecast-timeline'
import { createAdminClient } from '@/lib/supabase/server'

const PRO_MODEL   = 'gemini-3.1-pro-preview'
const FLASH_MODEL = 'gemini-3.1-flash-lite-preview'

const MAX_OUTPUT_STRUCTURED = 4096

// ── Validation helpers ────────────────────────────────────────────────────────

const VALID_STRENGTH = ['身强', '身弱', '中和', '从强', '从弱'] as const
const VALID_ELEMENTS = ['木', '火', '土', '金', '水'] as const

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

const STRUCTURED_SCHEMA = {
  type: 'OBJECT',
  properties: {
    strength:    { type: 'STRING', nullable: true, enum: [...VALID_STRENGTH] },
    pattern:     { type: 'STRING', nullable: true },
    favorable:   { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
    unfavorable: { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
  },
  required: ['favorable', 'unfavorable'],
}

// ── Stage runners ─────────────────────────────────────────────────────────────

async function runStructuredStage(prompt: string): Promise<StructuredResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: FLASH_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_STRUCTURED,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: STRUCTURED_SCHEMA,
        },
      })
      const text = result.text ?? ''
      if (!text) throw new Error('Empty response (structured stage)')
      const parsed = JSON.parse(text) as Record<string, unknown>
      return validateStructured(parsed)
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

/**
 * Run a single chapter against Gemini Pro.
 * System and user prompts are combined into one contents string
 * (consistent with the existing codebase pattern).
 */
async function runChapterStage(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fullPrompt = systemPrompt + '\n\n' + userPrompt
      const result = await gemini.models.generateContent({
        model: PRO_MODEL,
        contents: fullPrompt,
        config: {
          maxOutputTokens: maxTokens,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      })
      const text = result.text?.trim() ?? ''
      if (text.length < 500) throw new Error('Chapter response too short or empty')
      return text
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generates the premium report via 4 sequential chapter calls to Gemini Pro.
 * Each chapter is persisted immediately after generation (fault-tolerant).
 *
 * Strategy:
 * 1. Reuse profile.report_structured if present (base report already ran)
 * 2. Otherwise run the Flash-Lite structured stage first
 * 3. Build 24-month forecast timeline from profile pillars
 * 4. Call Gemini Pro 4× (one per chapter), persisting partial report after each
 */
export async function generateAndSavePremiumReport(
  profileId: string,
  locale = 'en',
): Promise<void> {
  const db = createAdminClient()

  const { data: profile, error: fetchErr } = await db
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (fetchErr || !profile) {
    console.error('[premium-report] Failed to fetch profile:', fetchErr)
    return
  }

  // Mark as generating
  await db.from('profiles')
    .update({ premium_report_status: 'generating' })
    .eq('id', profileId)

  const context = buildPromptContext(profile as Record<string, unknown>)
  context.language = locale as BaziLanguage

  // ── Structural analysis ───────────────────────────────────────────────────
  let structured: StructuredResult

  const existing = profile.report_structured as {
    strength?:    string | null
    pattern?:     string | null
    favorable?:   string[] | null
    unfavorable?: string[] | null
  } | null

  if (existing && Array.isArray(existing.favorable) && Array.isArray(existing.unfavorable)) {
    // Reuse analysis from the base report to save API cost and time
    structured = {
      strength:    existing.strength ?? null,
      pattern:     existing.pattern  ?? null,
      favorable:   (existing.favorable  ?? []).filter(
        (e): e is string => typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e as typeof VALID_ELEMENTS[number])
      ),
      unfavorable: (existing.unfavorable ?? []).filter(
        (e): e is string => typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e as typeof VALID_ELEMENTS[number])
      ),
    }
    console.log('[premium-report] Reusing existing structured analysis')
  } else {
    console.log('[premium-report] Running fresh structured stage')
    try {
      const structuredPrompt = buildStructuredPrompt(context)
      structured = await runStructuredStage(structuredPrompt)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[premium-report] Structured stage failed:', message)
      await db.from('profiles').update({ premium_report_status: 'failed' }).eq('id', profileId)
      return
    }
  }

  // ── Build premium context ─────────────────────────────────────────────────
  const premiumCtx: PremiumContext = {
    ...context,
    gender:       (profile.gender as string) ?? 'male',
    structured,
    forecastData: buildForecastForChart(context.pillars),
  }

  // ── 4-chapter generation loop ─────────────────────────────────────────────
  const chapters = [
    { name: 'Chapter 1 (Core)',     build: buildChapter1Prompt },
    { name: 'Chapter 2 (Career)',   build: buildChapter2Prompt },
    { name: 'Chapter 3 (Love)',     build: buildChapter3Prompt },
    { name: 'Chapter 4 (Forecast)', build: buildChapter4Prompt },
  ] as const

  let report = ''
  for (let i = 0; i < chapters.length; i++) {
    const { name, build } = chapters[i]
    const { systemPrompt, userPrompt, maxTokens } = build(premiumCtx, locale)

    try {
      const section = await runChapterStage(systemPrompt, userPrompt, maxTokens)
      report += (i === 0 ? '' : '\n\n') + section

      // Persist partial report after every chapter — fault-tolerant
      await db.from('profiles')
        .update({ premium_report: report })
        .eq('id', profileId)

      console.log(`[premium-report] ${name} complete for profile ${profileId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[premium-report] ${name} failed:`, message)
      await db.from('profiles').update({ premium_report_status: 'failed' }).eq('id', profileId)
      return
    }
  }

  // ── Final status ──────────────────────────────────────────────────────────
  await db.from('profiles').update({
    premium_report_status:       'done',
    premium_report_locale:       locale,
    premium_report_generated_at: new Date().toISOString(),
  }).eq('id', profileId)

  console.log('[premium-report] All 4 chapters complete for profile', profileId)
}
