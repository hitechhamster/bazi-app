import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
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

const PRO_MODEL = 'gemini-3.1-pro-preview'

// ── Section definitions ───────────────────────────────────────────────────────

export type CompatibilitySection =
  | 'overview'
  | 'compatibility'
  | 'communication'
  | 'wealth_career'
  | 'love_marriage'
  | 'forecast'

const SECTION_ORDER: CompatibilitySection[] = [
  'overview',
  'compatibility',
  'communication',
  'wealth_career',
  'love_marriage',
  'forecast',
]

// DB column name for each section
const SECTION_COL: Record<CompatibilitySection, string> = {
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
 * Generates one or more premium compatibility sections sequentially,
 * starting from `startSection`. Each section is persisted immediately after
 * generation (fault-tolerant). Designed to be called via after() from the API.
 *
 * @param reportId   UUID of the compatibility_reports row
 * @param startSection  Which section to start from (for resume-from-failure)
 */
export async function generateAndSaveCompatibilityPremiumSections(
  reportId: string,
  startSection: CompatibilitySection = 'overview',
): Promise<void> {
  const db = createAdminClient()

  // Fetch the report row
  const { data: report, error: fetchErr } = await db
    .from('compatibility_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (fetchErr || !report) {
    console.error('[compat-premium] Failed to fetch report:', fetchErr)
    return
  }

  // Mark as generating
  await db
    .from('compatibility_reports')
    .update({ premium_status: 'generating' })
    .eq('id', reportId)

  // Reconstruct context from stored data
  const baziA  = report.bazi_a  as BaziPartnerData
  const baziB  = report.bazi_b  as BaziPartnerData
  const scores = report.scores  as CompatibilityScores
  const locale = (report.locale as string) || 'en'

  // Determine reading mode — default to 'authentic' (not stored yet, can add later)
  const mode: 'authentic' | 'gentle' = 'authentic'

  // Build 24-month forecast
  const forecast = buildCompatibilityForecast(baziA, baziB, 24)

  const ctx: CompatPremiumContext = {
    baziA,
    baziB,
    scores,
    nameA:    baziA.input.name,
    nameB:    baziB.input.name,
    locale,
    mode,
    forecast,
  }

  // Determine which sections to generate (startSection and everything after)
  const startIdx = SECTION_ORDER.indexOf(startSection)
  if (startIdx === -1) {
    console.error('[compat-premium] Unknown startSection:', startSection)
    await db.from('compatibility_reports').update({ premium_status: 'failed' }).eq('id', reportId)
    return
  }
  const sectionsToRun = SECTION_ORDER.slice(startIdx)

  // Generation loop
  for (const section of sectionsToRun) {
    const col = SECTION_COL[section]

    // Skip if already generated (idempotent)
    const existing = report[col as keyof typeof report] as string | null
    if (existing && existing.length > 200) {
      console.log(`[compat-premium] Section ${section} already exists — skipping`)
      continue
    }

    let chapterPrompt
    switch (section) {
      case 'overview':      chapterPrompt = buildChapterOverviewPrompt(ctx);      break
      case 'compatibility': chapterPrompt = buildChapterCompatibilityPrompt(ctx); break
      case 'communication': chapterPrompt = buildChapterCommunicationPrompt(ctx); break
      case 'wealth_career': chapterPrompt = buildChapterWealthCareerPrompt(ctx);  break
      case 'love_marriage': chapterPrompt = buildChapterLoveMarriagePrompt(ctx);  break
      case 'forecast':      chapterPrompt = buildChapterForecastPrompt(ctx);      break
    }

    try {
      const text = await runChapterStage(
        chapterPrompt.systemPrompt,
        chapterPrompt.userPrompt,
        chapterPrompt.maxTokens,
      )

      await db
        .from('compatibility_reports')
        .update({ [col]: text })
        .eq('id', reportId)

      console.log(`[compat-premium] Section "${section}" done for report ${reportId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[compat-premium] Section "${section}" failed:`, message)
      await db.from('compatibility_reports').update({ premium_status: 'failed' }).eq('id', reportId)
      return
    }
  }

  // All sections done
  await db
    .from('compatibility_reports')
    .update({
      premium_status: 'completed',
    })
    .eq('id', reportId)

  console.log('[compat-premium] All sections complete for report', reportId)
}
