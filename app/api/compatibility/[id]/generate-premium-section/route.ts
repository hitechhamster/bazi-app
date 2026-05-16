export const maxDuration = 800

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/subscription/tier'
import {
  generatePremiumSection,
  nextSection,
  SECTION_COL,
  type CompatibilitySection,
} from '@/lib/ai/generate-compatibility-premium'

// ── Base URL for chained fetch calls ──────────────────────────────────────────

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// ── Route handler ─────────────────────────────────────────────────────────────

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

  let userId: string

  if (isInternal) {
    // Internal chained call — bypass user auth, just need report existence
    const { data: row, error } = await admin
      .from('compatibility_reports')
      .select('user_id')
      .eq('id', reportId)
      .single()
    if (error || !row) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    userId = row.user_id as string
  } else {
    // Client call — verify user session + ownership + tier
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
    userId = user.id
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({})) as { section?: CompatibilitySection }
  const section: CompatibilitySection = body.section ?? 'overview'

  // ── Already-generated guard ──────────────────────────────────────────────────
  const col = SECTION_COL[section]
  const { data: colCheck } = await admin
    .from('compatibility_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (colCheck && (colCheck as Record<string, unknown>)[col]) {
    console.log(`[compat-premium] Section "${section}" already exists for ${reportId}, skipping`)
    const next = nextSection(section)
    if (next) {
      // Chain to next section that may be missing
      chainNextSection(reportId, next)
    } else {
      // All done — mark completed
      await admin
        .from('compatibility_reports')
        .update({ premium_status: 'completed' })
        .eq('id', reportId)
    }
    return NextResponse.json({ ok: true, skipped: section })
  }

  // ── Set status to 'generating' (only on first section) ───────────────────────
  if (section === 'overview') {
    await admin
      .from('compatibility_reports')
      .update({ premium_status: 'generating' })
      .eq('id', reportId)
  }

  // Respond immediately so the client gets a fast 200
  // Generation happens after response is sent (Vercel awaits the handler to finish,
  // but the chain is fire-and-forget for the NEXT section)
  const responsePromise = generateAndChain(admin, reportId, section)

  await responsePromise

  return NextResponse.json({ ok: true, section })
}

// ── Core: generate one section, then chain next ───────────────────────────────

async function generateAndChain(
  admin: ReturnType<typeof createAdminClient>,
  reportId: string,
  section: CompatibilitySection,
) {
  try {
    await generatePremiumSection(reportId, section)

    const next = nextSection(section)
    if (next) {
      // Fire-and-forget — creates a NEW Vercel invocation with its own 800s budget
      chainNextSection(reportId, next)
    } else {
      // forecast completed — mark whole report done
      await admin
        .from('compatibility_reports')
        .update({ premium_status: 'completed' })
        .eq('id', reportId)
      console.log(`[compat-premium] All sections complete for report ${reportId}`)
    }
  } catch (err) {
    console.error(`[compat-premium] Section "${section}" failed for ${reportId}:`, err)
    try {
      await admin
        .from('compatibility_reports')
        .update({ premium_status: 'failed' })
        .eq('id', reportId)
    } catch (e) {
      console.error('[compat-premium] Failed to set status=failed:', e)
    }
  }
}

// ── Fire-and-forget chain trigger ─────────────────────────────────────────────

function chainNextSection(reportId: string, section: CompatibilitySection) {
  const url = `${getBaseUrl()}/api/compatibility/${reportId}/generate-premium-section`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_GENERATE_SECRET ?? '',
    },
    body: JSON.stringify({ section }),
  }).catch(err => console.error(`[compat-premium] Chain trigger for "${section}" failed:`, err))
}
