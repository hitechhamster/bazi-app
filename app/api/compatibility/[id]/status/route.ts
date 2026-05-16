import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const admin = createAdminClient()
    const { data: report } = await admin
      .from('compatibility_reports')
      .select('id, user_id, free_report_status, free_report_text, scores, bazi_a, bazi_b, partner_a_data, partner_b_data, locale')
      .eq('id', id)
      .single()

    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((report.user_id as string) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({
      status:          report.free_report_status,
      freeReportText:  report.free_report_text ?? null,
      scores:          report.scores ?? null,
      baziA:           report.bazi_a ?? null,
      baziB:           report.bazi_b ?? null,
      partnerAData:    report.partner_a_data ?? null,
      partnerBData:    report.partner_b_data ?? null,
      locale:          report.locale ?? 'en',
    })
  } catch (err) {
    console.error('[compat/status] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
