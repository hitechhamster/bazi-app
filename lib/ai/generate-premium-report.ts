import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildPremiumPrompt } from './premium-prompt'
import { buildPromptContext } from './generate-report'
import { buildStructuredPrompt } from './structured-prompt'
import type { StructuredResult } from './reading-prompt'
import { createAdminClient } from '@/lib/supabase/server'

const PRO_MODEL    = 'gemini-3.1-pro-preview'
const FLASH_MODEL  = 'gemini-3.1-flash-lite-preview'

const MAX_OUTPUT_STRUCTURED = 4096
const MAX_OUTPUT_PREMIUM    = 16384

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    strength:   { type: 'STRING', nullable: true, enum: [...VALID_STRENGTH] },
    pattern:    { type: 'STRING', nullable: true },
    favorable:   { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
    unfavorable: { type: 'ARRAY', items: { type: 'STRING', enum: [...VALID_ELEMENTS] } },
  },
  required: ['favorable', 'unfavorable'],
}

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

async function runPremiumStage(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_PREMIUM,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      })
      const text = result.text?.trim() ?? ''
      if (text.length < 500) throw new Error('Premium report response missing or too short')
      return text
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generates and saves the premium report to profiles.premium_report*.
 *
 * Strategy:
 * 1. Reuse profile.report_structured if present (base report already ran)
 * 2. Otherwise run the structured stage first (Flash-Lite, fast + cheap)
 * 3. Then call Gemini Pro for the full 10k-word reading
 */
export async function generateAndSavePremiumReport(
  profileId: string,
  locale = 'en'
): Promise<void> {
  const db = createAdminClient()

  // Fetch full profile
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
  context.language = locale as import('./structured-prompt').BaziLanguage

  // ── Get structural analysis ───────────────────────────────────────────────
  let structured: StructuredResult

  const existing = profile.report_structured as {
    strength?: string | null
    pattern?: string | null
    favorable?: string[] | null
    unfavorable?: string[] | null
  } | null

  if (
    existing &&
    Array.isArray(existing.favorable) &&
    Array.isArray(existing.unfavorable)
  ) {
    // Reuse analysis from base report
    structured = {
      strength: existing.strength ?? null,
      pattern: existing.pattern ?? null,
      favorable: (existing.favorable ?? []).filter(
        (e): e is string => typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e as typeof VALID_ELEMENTS[number])
      ),
      unfavorable: (existing.unfavorable ?? []).filter(
        (e): e is string => typeof e === 'string' && (VALID_ELEMENTS as readonly string[]).includes(e as typeof VALID_ELEMENTS[number])
      ),
    }
    console.log('[premium-report] Reusing existing structured analysis')
  } else {
    // Run structured stage with Flash-Lite
    console.log('[premium-report] Running fresh structured stage')
    try {
      const structuredPrompt = buildStructuredPrompt(context)
      structured = await runStructuredStage(structuredPrompt)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[premium-report] Structured stage failed:', message)
      await db.from('profiles').update({
        premium_report_status: 'failed',
      }).eq('id', profileId)
      return
    }
  }

  // ── Premium reading stage (Gemini Pro) ────────────────────────────────────
  let reading: string
  try {
    const prompt = buildPremiumPrompt(context, structured)
    reading = await runPremiumStage(prompt)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[premium-report] Pro generation failed:', message)
    await db.from('profiles').update({
      premium_report_status: 'failed',
    }).eq('id', profileId)
    return
  }

  // ── Final write ───────────────────────────────────────────────────────────
  await db.from('profiles').update({
    premium_report: reading,
    premium_report_status: 'done',
    premium_report_locale: locale,
    premium_report_generated_at: new Date().toISOString(),
  }).eq('id', profileId)

  console.log('[premium-report] Done for profile', profileId)
}
