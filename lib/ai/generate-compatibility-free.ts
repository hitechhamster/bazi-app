import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildFreeCompatibilityPrompt } from '@/lib/bazi/compatibility-prompt-free'
import { createAdminClient } from '@/lib/supabase/server'
import type { BaziPartnerData, CompatibilityScores } from '@/lib/bazi/compatibility'

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_TOKENS = 16384

export async function generateAndSaveFreeCompatibilityReport(
  reportId: string,
): Promise<void> {
  const db = createAdminClient()

  const { data: report, error } = await db
    .from('compatibility_reports')
    .select('id, free_report_status, bazi_a, bazi_b, scores, locale, partner_a_data, partner_b_data')
    .eq('id', reportId)
    .single()

  if (error || !report) {
    console.error('[compat-free] Failed to fetch report:', error)
    return
  }

  // Guard: already completed
  if (report.free_report_status === 'completed') {
    console.log('[compat-free] Already completed, skipping:', reportId)
    return
  }

  // Mark generating
  await db.from('compatibility_reports')
    .update({ free_report_status: 'generating' })
    .eq('id', reportId)

  const baziA  = report.bazi_a  as BaziPartnerData
  const baziB  = report.bazi_b  as BaziPartnerData
  const scores = report.scores  as CompatibilityScores
  const locale = (report.locale as string) ?? 'en'
  const nameA  = (report.partner_a_data as { name?: string })?.name ?? 'Partner A'
  const nameB  = (report.partner_b_data as { name?: string })?.name ?? 'Partner B'

  const prompt = buildFreeCompatibilityPrompt(baziA, baziB, scores, locale, nameA, nameB)

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await gemini.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: {
            maxOutputTokens: MAX_TOKENS,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          },
        })
        const text = result.text?.trim() ?? ''
        if (text.length < 1000) throw new Error('Response too short: ' + text.length)

        await db.from('compatibility_reports').update({
          free_report_text:   text,
          free_report_status: 'completed',
        }).eq('id', reportId)

        console.log('[compat-free] Done for', reportId, 'chars:', text.length)
        return
      } catch (err) {
        if (attempt === 1) throw err
        console.warn('[compat-free] Attempt 1 failed, retrying:', err)
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[compat-free] Generation failed:', message)
    await db.from('compatibility_reports').update({
      free_report_status: 'failed',
    }).eq('id', reportId)
  }
}
