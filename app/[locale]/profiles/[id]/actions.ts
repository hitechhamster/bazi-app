'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { after } from 'next/server'
import { generateAndSaveReport } from '@/lib/ai/generate-report'
import { getUserLocale } from '@/lib/actions/preferences'

export type ReportStatus =
  | 'pending'
  | 'generating'              // legacy single-stage — kept for back-compat with old records
  | 'generating_structured'   // Stage 1 running
  | 'generating_reading'      // Stage 2 running, Stage 1 already complete
  | 'done'
  | 'failed'

export interface ReportStructured {
  strength: string | null
  pattern: string | null
  favorable: string[] | null
  unfavorable: string[] | null
}

/** 轮询：取最新状态、结构化结果、报告内容 */
export async function getReportStatus(profileId: string): Promise<{
  status: ReportStatus
  report: string | null
  error: string | null
  report_structured: ReportStructured | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'failed', report: null, error: 'Not authenticated', report_structured: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('base_report, base_report_status, base_report_error, report_structured, user_id')
    .eq('id', profileId)
    .single()

  if (error || !data) return { status: 'failed', report: null, error: 'Profile not found', report_structured: null }
  if (data.user_id !== user.id) return { status: 'failed', report: null, error: 'Forbidden', report_structured: null }

  return {
    status: (data.base_report_status ?? 'pending') as ReportStatus,
    report: data.base_report,
    error: data.base_report_error,
    report_structured: (data.report_structured ?? null) as ReportStructured | null,
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
    .update({
      base_report_status: 'generating_structured',
      base_report_error: null,
      base_report: null,
      report_structured: null,
    })
    .eq('id', profileId)

  // Capture locale before after() — getUserLocale() uses cookies, cannot run inside after()
  const locale = await getUserLocale()
  after(async () => { await generateAndSaveReport(profileId, locale) })
  return { ok: true }
}

// ── Daily reading types ────────────────────────────────────────────────────

export interface DailyReading {
  date: string        // YYYY-MM-DD
  content: string     // markdown with 3 ## sections
  poem: string[]      // 4 items, each 4 Chinese characters
}

export type DailyStatus = 'pending' | 'generating' | 'done' | 'failed'

// ── Daily reading actions ──────────────────────────────────────────────────

/** Polling: return latest daily reading status + cached content */
export async function getDailyReadingStatus(profileId: string): Promise<{
  status: DailyStatus
  reading: DailyReading | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'failed', reading: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .select('daily_reading, daily_reading_status, daily_reading_error, user_id')
    .eq('id', profileId)
    .single()

  if (error || !data) return { status: 'failed', reading: null, error: 'Profile not found' }
  if (data.user_id !== user.id) return { status: 'failed', reading: null, error: 'Forbidden' }

  return {
    status: ((data.daily_reading_status ?? 'pending') as DailyStatus),
    reading: (data.daily_reading ?? null) as DailyReading | null,
    error: data.daily_reading_error ?? null,
  }
}

/** Fire-and-forget trigger: checks cache, queues generation if needed */
export async function triggerDailyReading(
  profileId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, daily_reading, daily_reading_status')
    .eq('id', profileId)
    .single()

  if (!profile) return { ok: false, error: 'Profile not found' }
  if (profile.user_id !== user.id) return { ok: false, error: 'Forbidden' }

  const todayStr = new Date().toISOString().slice(0, 10)
  const cached = profile.daily_reading as { date?: string } | null
  if (cached?.date === todayStr && profile.daily_reading_status === 'done') {
    return { ok: true }
  }
  if (profile.daily_reading_status === 'generating') {
    return { ok: true }
  }

  const admin = createAdminClient()
  await admin.from('profiles')
    .update({ daily_reading_status: 'pending', daily_reading_error: null })
    .eq('id', profileId)

  // Capture locale before after() — getUserLocale() uses cookies, cannot run inside after()
  const locale = await getUserLocale()
  after(async () => {
    const { generateDailyReading } = await import('@/lib/ai/generate-daily')
    await generateDailyReading(profileId, locale)
  })

  return { ok: true }
}
