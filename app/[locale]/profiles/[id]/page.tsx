import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import DashboardGrid from './_dashboard/DashboardGrid'
import BaseReportSection from './BaseReportSection'
import {
  buildDashboardData,
  type BaziReportRaw,
  type ProfileRow,
  type SubjectRow,
} from './_dashboard/build-dashboard-data'
import type { ReportStatus, ReportStructured } from './actions'

export default async function ProfileDetailPage({
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

  const t = await getTranslations('profileReport')

  return (
    <>
      <DashboardGrid
        data={dashboardData}
        profileId={profile.id as string}
        initialStatus={((profile.base_report_status as string) ?? 'pending') as ReportStatus}
        initialStructured={(profile.report_structured as ReportStructured | null) ?? null}
      />

      {/* AI Destiny Reading section */}
      <div style={{
        borderTop: '1px solid var(--zen-border)',
        paddingTop: '24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: 'var(--font-main)',
            fontSize: '17px',
            fontWeight: 500,
            color: 'var(--zen-ink)',
            letterSpacing: '0.05em',
            margin: 0,
          }}>
            {t('destinyReadingTitle')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--zen-ink)',
            marginTop: '6px',
            marginBottom: 0,
          }}>
            {t('destinyReadingSubtitle')}
          </p>
        </div>
        <BaseReportSection
          profileId={profile.id as string}
          initialStatus={(profile.base_report_status as string) ?? 'pending'}
          initialReport={profile.base_report as string | null}
          initialError={profile.base_report_error as string | null}
        />
      </div>
    </>
  )
}
