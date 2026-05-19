import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { GEMINI_MODELS } from './models'
import { buildChapterOverviewPrompt }      from './compatibility-prompts/chapter-overview'
import { buildChapterCompatibilityPrompt } from './compatibility-prompts/chapter-compatibility'
import { buildChapterCommunicationPrompt } from './compatibility-prompts/chapter-communication'
import { buildChapterWealthCareerPrompt }  from './compatibility-prompts/chapter-wealth-career'
import { buildChapterLoveMarriagePrompt }  from './compatibility-prompts/chapter-love-marriage'
import { buildChapterForecastPrompt }      from './compatibility-prompts/chapter-forecast'
import type { CompatPremiumContext }        from './compatibility-prompts/_shared'
import type { BaziPartnerData, CompatibilityScores } from '@/lib/bazi/compatibility'
import { buildCompatibilityForecast }      from '@/lib/bazi/compatibility-forecast'
import { createAdminClient }               from '@/lib/supabase/server'

const PRO_MODEL = GEMINI_MODELS.PRO

// ── Section definitions ───────────────────────────────────────────────────────

export type CompatibilitySection =
  | 'overview'
  | 'compatibility'
  | 'communication'
  | 'wealth_career'
  | 'love_marriage'
  | 'forecast'

export const SECTION_ORDER: readonly CompatibilitySection[] = [
  'overview',
  'compatibility',
  'communication',
  'wealth_career',
  'love_marriage',
  'forecast',
]

/** DB column name for each section */
export const SECTION_COL: Record<CompatibilitySection, string> = {
  overview:      'premium_overview',
  compatibility: 'premium_compatibility',
  communication: 'premium_communication',
  wealth_career: 'premium_wealth_career',
  love_marriage: 'premium_love_marriage',
  forecast:      'premium_forecast',
}

// ── Gemini runner ─────────────────────────────────────────────────────────────

async function runChapterStage(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  section?: string,
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
      console.warn(`[compat-premium] Attempt ${attempt} failed for "${section ?? 'unknown'}", retrying:`, err)
    }
  }
  throw new Error('Unreachable')
}

// ── Build prompt context from DB row ─────────────────────────────────────────

function buildContext(report: Record<string, unknown>): CompatPremiumContext {
  const baziA  = report.bazi_a  as BaziPartnerData
  const baziB  = report.bazi_b  as BaziPartnerData
  const scores = report.scores  as CompatibilityScores
  const locale = (report.locale as string) || 'en'

  return {
    baziA,
    baziB,
    scores,
    nameA:    baziA.input.name,
    nameB:    baziB.input.name,
    locale,
    mode:     'authentic',
    forecast: buildCompatibilityForecast(baziA, baziB, 24),
  }
}

// ── Single-section export ─────────────────────────────────────────────────────

/**
 * Generates exactly ONE premium compatibility section and writes it to the DB.
 * Does NOT manage premium_status — the calling route handles that.
 * Throws on failure so the caller can set status='failed'.
 *
 * @param reportId  UUID of the compatibility_reports row
 * @param section   Which section to generate
 * @returns         The generated markdown text
 */
export async function generatePremiumSection(
  reportId: string,
  section:  CompatibilitySection,
): Promise<string> {
  const db = createAdminClient()

  const { data: report, error } = await db
    .from('compatibility_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error || !report) throw new Error(`Report not found: ${reportId}`)

  const ctx = buildContext(report as Record<string, unknown>)

  let chapterPrompt
  switch (section) {
    case 'overview':      chapterPrompt = buildChapterOverviewPrompt(ctx);      break
    case 'compatibility': chapterPrompt = buildChapterCompatibilityPrompt(ctx); break
    case 'communication': chapterPrompt = buildChapterCommunicationPrompt(ctx); break
    case 'wealth_career': chapterPrompt = buildChapterWealthCareerPrompt(ctx);  break
    case 'love_marriage': chapterPrompt = buildChapterLoveMarriagePrompt(ctx);  break
    case 'forecast':      chapterPrompt = buildChapterForecastPrompt(ctx);      break
  }

  const text = await runChapterStage(
    chapterPrompt.systemPrompt,
    chapterPrompt.userPrompt,
    chapterPrompt.maxTokens,
    section,
  )

  const col = SECTION_COL[section]
  const { error: writeErr } = await db
    .from('compatibility_reports')
    .update({ [col]: text })
    .eq('id', reportId)

  if (writeErr) throw new Error(`DB write failed for section ${section}: ${writeErr.message}`)

  console.log(`[compat-premium] Section "${section}" written for report ${reportId}`)
  return text
}
