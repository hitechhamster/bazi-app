export const maxDuration = 800

import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/subscription/tier'
import type { CompatibilitySection } from '@/lib/ai/generate-compatibility-premium'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reportId } = await params

    // Auth
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Tier guard
    const tier = await getUserTier(user.id)
    if (tier === 'free') {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 })
    }

    // Parse body
    const body = await req.json() as { section?: CompatibilitySection }
    const startSection: CompatibilitySection = body.section ?? 'overview'

    const admin = createAdminClient()

    // Ownership + existence check
    const { data: report, error: fetchErr } = await admin
      .from('compatibility_reports')
      .select('id, user_id, tier, premium_status')
      .eq('id', reportId)
      .single()

    if (fetchErr || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    if ((report.user_id as string) !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if ((report.tier as string) !== 'premium') {
      return NextResponse.json({ error: 'This is not a premium report' }, { status: 400 })
    }

    // Guard against already-running generation
    const premiumStatus = report.premium_status as string
    if (premiumStatus === 'generating') {
      return NextResponse.json({ error: 'Generation already in progress' }, { status: 409 })
    }
    if (premiumStatus === 'completed' && startSection === 'overview') {
      return NextResponse.json({ error: 'Report already completed' }, { status: 409 })
    }

    // Fire and forget
    after(async () => {
      const { generateAndSaveCompatibilityPremiumSections } =
        await import('@/lib/ai/generate-compatibility-premium')
      await generateAndSaveCompatibilityPremiumSections(reportId, startSection)
    })

    return NextResponse.json({ ok: true, started: startSection })
  } catch (err) {
    console.error('[compat/generate-premium-section] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
