'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { after } from 'next/server'
import { getLocale } from 'next-intl/server'
import { canGeneratePremiumReport } from '@/lib/subscription/tier'

export type PremiumReportStatus = 'pending' | 'generating' | 'done' | 'failed'

// ── Trigger (first generate or regenerate) ────────────────────────────────────

export async function triggerPremiumReport(
  profileId: string
): Promise<{ ok: boolean; error?: string }> {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  // Tier gate
  const allowed = await canGeneratePremiumReport(user.id)
  if (!allowed) return { ok: false, error: 'tier_required' }

  // Verify ownership
  const { data: profile } = await userClient
    .from('profiles')
    .select('user_id, premium_report_status')
    .eq('id', profileId)
    .single()
  if (!profile) return { ok: false, error: 'Profile not found' }
  if ((profile.user_id as string) !== user.id) return { ok: false, error: 'Forbidden' }

  // Already done — do not allow re-generation
  if (profile.premium_report_status === 'done') {
    return { ok: false, error: 'already_generated' }
  }

  // Anti-double-trigger: if already generating, do nothing
  if (profile.premium_report_status === 'generating') {
    return { ok: true }
  }

  const admin = createAdminClient()
  await admin.from('profiles')
    .update({ premium_report_status: 'pending' })
    .eq('id', profileId)

  // Capture locale before after() — getLocale() reads request context (unavailable in after())
  const locale = await getLocale()

  after(async () => {
    const { generateAndSavePremiumReport } = await import('@/lib/ai/generate-premium-report')
    await generateAndSavePremiumReport(profileId, locale)
  })

  return { ok: true }
}

// ── Poll ──────────────────────────────────────────────────────────────────────

export async function getPremiumReportStatus(profileId: string): Promise<{
  status: PremiumReportStatus | null
  report: string | null
  locale: string | null
  generatedAt: string | null
}> {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { status: 'failed', report: null, locale: null, generatedAt: null }

  const { data } = await userClient
    .from('profiles')
    .select('premium_report_status, premium_report, premium_report_locale, premium_report_generated_at, user_id')
    .eq('id', profileId)
    .single()

  if (!data || (data.user_id as string) !== user.id) {
    return { status: 'failed', report: null, locale: null, generatedAt: null }
  }

  return {
    status: (data.premium_report_status as PremiumReportStatus | null) ?? null,
    report: (data.premium_report as string | null) ?? null,
    locale: (data.premium_report_locale as string | null) ?? null,
    generatedAt: (data.premium_report_generated_at as string | null) ?? null,
  }
}
