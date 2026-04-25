import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { after } from 'next/server'
import Link from 'next/link'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import Sidebar from '../_dashboard/Sidebar'
import AlmanacSection from './_components/AlmanacSection'
import {
  buildDashboardData,
  type BaziReportRaw,
  type ProfileRow,
  type SubjectRow,
} from '../_dashboard/build-dashboard-data'
import { type DailyReading, type DailyStatus } from '../actions'
import { generateDailyReading } from '@/lib/ai/generate-daily'
import { createAdminClient } from '@/lib/supabase/server'

export default async function AlmanacPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  const { data: siblings } = await supabase
    .from('profiles')
    .select('id, name, day_master, day_master_element, birth_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const subjects: SubjectRow[] = (siblings ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    day_master: s.day_master as string,
    day_master_element: s.day_master_element as string,
    birth_date: s.birth_date as string,
  }))

  let tst: Date
  if (profile.true_solar_time) {
    tst = new Date(profile.true_solar_time as string)
  } else {
    const birthDate = profile.birth_date as string
    const birthTime = (profile.birth_time as string | null) ?? null
    const isTimeUnknown = (profile.is_time_unknown as boolean) ?? false
    const [yr, mo, dy] = birthDate.split('-').map(Number)
    let hr = 12
    let mn = 0
    if (!isTimeUnknown && birthTime) {
      const [h, m] = birthTime.split(':').map(Number)
      hr = h
      mn = m
    }
    tst = new Date(Date.UTC(yr, mo - 1, dy, hr, mn))
  }

  const gender = (profile.gender as string) ?? 'male'
  const report = generateBaziReport(tst, gender) as unknown as BaziReportRaw
  const dashboardData = buildDashboardData(profile as unknown as ProfileRow, subjects, report)

  // Cache check: only skip trigger if today's reading is already done
  const todayStr = new Date().toISOString().slice(0, 10)
  const cached = profile.daily_reading as { date?: string } | null
  const alreadyDone =
    cached?.date === todayStr &&
    (profile.daily_reading_status as string) === 'done'

  if (!alreadyDone && profile.daily_reading_status !== 'generating') {
    // Pre-mark generating BEFORE after() — within request context where DB write is fine.
    // after() then runs the AI call without needing cookies/auth.
    const admin = createAdminClient()
    await admin.from('profiles')
      .update({ daily_reading_status: 'pending', daily_reading_error: null })
      .eq('id', id)

    after(async () => {
      try {
        await generateDailyReading(id)
      } catch (err) {
        console.error('[almanac/page] generateDailyReading failed:', err)
      }
    })
  }

  const initialStatus = ((profile.daily_reading_status as string) ?? 'pending') as DailyStatus
  const initialReading = alreadyDone ? (profile.daily_reading as DailyReading) : null

  return (
    <div className="min-h-screen relative overflow-visible">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--zen-ink)',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ← Dashboard
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '16px',
          alignItems: 'start',
        }}>
          <div style={{
            position: 'sticky',
            top: '16px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
          }}>
            <Sidebar data={dashboardData} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
            <AlmanacSection
              profileId={id}
              initialStatus={initialStatus}
              initialReading={initialReading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
