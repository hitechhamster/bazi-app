'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { after } from 'next/server'
import { generateAndSaveReport } from '@/lib/ai/generate-report'

/** 轮询：取最新状态和报告内容 */
export async function getReportStatus(profileId: string): Promise<{
  status: 'pending' | 'generating' | 'done' | 'failed'
  report: string | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'failed', report: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .select('base_report, base_report_status, base_report_error, user_id')
    .eq('id', profileId)
    .single()

  if (error || !data) return { status: 'failed', report: null, error: 'Profile not found' }
  if (data.user_id !== user.id) return { status: 'failed', report: null, error: 'Forbidden' }

  return {
    status: (data.base_report_status ?? 'pending') as any,
    report: data.base_report,
    error: data.base_report_error,
  }
}

/** 用户点 Try again：重置状态后后台重跑 */
export async function retryReport(profileId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: profile, error: readErr } = await admin
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()
  if (readErr || !profile) return { ok: false, error: 'Profile not found' }
  if (profile.user_id !== user.id) return { ok: false, error: 'Forbidden' }

  await admin
    .from('profiles')
    .update({ base_report_status: 'generating', base_report_error: null })
    .eq('id', profileId)

  after(async () => { await generateAndSaveReport(profileId) })
  return { ok: true }
}
