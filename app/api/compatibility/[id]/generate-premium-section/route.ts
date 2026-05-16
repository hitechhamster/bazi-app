export const maxDuration = 800

import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/subscription/tier'
import {
  generatePremiumSection,
  SECTION_COL,
  SECTION_ORDER,
  type CompatibilitySection,
} from '@/lib/ai/generate-compatibility-premium'

// ── Route handler ─────────────────────────────────────────────────────────────
//
// Single invocation runs ALL remaining sections sequentially in after().
// No self-fetch chain — eliminates ECONNRESET risk entirely.
// 6 chapters × ~80s ≈ 480s; well within maxDuration=800s.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reportId } = await params
  const admin = createAdminClient()

  // ── Auth: dual-mode ──────────────────────────────────────────────────────────
  const internalSecret = req.headers.get('x-internal-secret')
  const isInternal =
    internalSecret &&
    internalSecret === process.env.INTERNAL_GENERATE_SECRET

  if (isInternal) {
    // Internal call (from create route) — verify report exists
    const { data: row, error } = await admin
      .from('compatibility_reports')
      .select('user_id')
      .eq('id', reportId)
      .single()
    if (error || !row) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
  } else {
    // Client call (retry button) — verify user session + ownership + tier
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const tier = await getUserTier(user.id)
    if (tier === 'free') {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 })
    }

    const { data: row, error } = await admin
      .from('compatibility_reports')
      .select('user_id, tier')
      .eq('id', reportId)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    if ((row.user_id as string) !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if ((row.tier as string) !== 'premium') {
      return NextResponse.json({ error: 'This is not a premium report' }, { status: 400 })
    }
  }

  // ── Parse startSection (retry resumes from first missing; create starts at overview) ──
  const body = await req.json().catch(() => ({})) as { section?: CompatibilitySection }
  const startSection: CompatibilitySection = body.section ?? 'overview'
  const startIdx = SECTION_ORDER.indexOf(startSection)
  if (startIdx < 0) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  }

  // ── Mark generating ──────────────────────────────────────────────────────────
  await admin
    .from('compatibility_reports')
    .update({ premium_status: 'generating' })
    .eq('id', reportId)

  // ── Generate all remaining sections in a single after() callback ─────────────
  // after() keeps the invocation alive until the callback completes.
  // No self-fetch chain = no ECONNRESET risk.
  after(async () => {
    try {
      for (let i = startIdx; i < SECTION_ORDER.length; i++) {
        const sec = SECTION_ORDER[i]
        const col = SECTION_COL[sec]

        // Idempotency guard — skip sections already written (retry resilience)
        const { data: row } = await admin
          .from('compatibility_reports')
          .select('*')
          .eq('id', reportId)
          .single()

        if (row && (row as Record<string, unknown>)[col]) {
          console.log(`[compat-premium] Section "${sec}" already exists, skipping`)
          continue
        }

        console.log(`[compat-premium] Generating section "${sec}" for ${reportId}`)
        await generatePremiumSection(reportId, sec)
        console.log(`[compat-premium] Section "${sec}" written for ${reportId}`)
      }

      await admin
        .from('compatibility_reports')
        .update({ premium_status: 'completed' })
        .eq('id', reportId)
      console.log(`[compat-premium] All sections complete for ${reportId}`)
    } catch (err) {
      console.error('[compat-premium] Generation failed:', err)
      try {
        await admin
          .from('compatibility_reports')
          .update({ premium_status: 'failed' })
          .eq('id', reportId)
      } catch (e) {
        console.error('[compat-premium] Failed to set status=failed:', e)
      }
    }
  })

  return NextResponse.json({ ok: true, startedFrom: startSection })
}
