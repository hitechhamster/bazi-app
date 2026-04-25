import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import LocaleSwitcher from '../../_components/LocaleSwitcher'
import Sidebar from './_dashboard/Sidebar'
import MobileTopNav from './_dashboard/MobileTopNav'
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

  // Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Fetch sibling profiles (same user) for sidebar subjects switcher
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

  // Reconstruct tst (true solar time) — prefer stored value for exact fidelity
  let tst: Date
  if (profile.true_solar_time) {
    tst = new Date(profile.true_solar_time as string)
  } else {
    // Fallback: no longitude was captured, use UTC-constructed date
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

  // Regenerate the full report (pure function, <10ms)
  const gender = (profile.gender as string) ?? 'male'
  const report = generateBaziReport(tst, gender) as unknown as BaziReportRaw

  // Adapt (profile, subjects, report) → MockData-shaped object
  const dashboardData = buildDashboardData(profile as unknown as ProfileRow, subjects, report)

  return (
    <div className="min-h-screen relative overflow-visible">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div
        className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Back link — desktop only; mobile uses MobileTopNav */}
        <div className="hidden lg:flex" style={{ marginBottom: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <LocaleSwitcher />
        </div>

        {/* Two-column: sticky sidebar + scrolling main */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[220px_1fr]"
          style={{ gap: '16px', alignItems: 'start' }}
        >
          {/* Sticky sidebar — desktop only */}
          <div
            className="hidden lg:block"
            style={{ position: 'sticky', top: '16px', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
          >
            <Sidebar data={dashboardData} />
          </div>

          {/* Main column — dashboard + AI report stacked, same width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
            {/* Mobile nav — hidden on desktop */}
            <div className="lg:hidden">
              <MobileTopNav profileId={profile.id as string} />
            </div>
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
                  Your Destiny Reading · 解读
                </h2>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--zen-ink)',
                  marginTop: '6px',
                  marginBottom: 0,
                }}>
                  AI-generated reading based on your Four Pillars
                </p>
              </div>
              <BaseReportSection
                profileId={profile.id as string}
                initialStatus={(profile.base_report_status as string) ?? 'pending'}
                initialReport={profile.base_report as string | null}
                initialError={profile.base_report_error as string | null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
