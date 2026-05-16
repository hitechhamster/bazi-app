export const maxDuration = 800

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateAndSaveFreeCompatibilityReport } from '@/lib/ai/generate-compatibility-free'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Ownership check
    const admin = createAdminClient()
    const { data: report } = await admin
      .from('compatibility_reports')
      .select('id, user_id, free_report_status')
      .eq('id', id)
      .single()

    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((report.user_id as string) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Already completed guard
    if (report.free_report_status === 'completed') {
      return NextResponse.json({ ok: true, already_generated: true })
    }

    await generateAndSaveFreeCompatibilityReport(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[compat/generate-free] Error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
