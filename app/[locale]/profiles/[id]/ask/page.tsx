import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import Sidebar from '../_dashboard/Sidebar'
import MobileTopNav from '../_dashboard/MobileTopNav'
import AskSection from './_components/AskSection'
import {
  buildDashboardData,
  type BaziReportRaw,
  type ProfileRow,
  type SubjectRow,
} from '../_dashboard/build-dashboard-data'
import { getQuestionsForProfile } from '@/lib/actions/get-questions'

export default async function AskPage({
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

  const { questions } = await getQuestionsForProfile(id)

  const t = await getTranslations('profileReport')

  return (
    <div className="min-h-screen relative overflow-visible">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div
        className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Back link — desktop only; mobile uses MobileTopNav */}
        <div className="hidden lg:block" style={{ marginBottom: '16px' }}>
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
            {t('backToDashboard')}
          </Link>
        </div>

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

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
            {/* Mobile nav — hidden on desktop */}
            <div className="lg:hidden">
              <MobileTopNav profileId={id} />
            </div>
            <AskSection
              profileId={id}
              initialQuestions={questions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
