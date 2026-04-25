import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import BrandMark from '@/components/BrandMark'
import {
  buildDashboardData,
  type BaziReportRaw,
  type ProfileRow,
} from '@/app/[locale]/profiles/[id]/_dashboard/build-dashboard-data'
import DayMasterHero from '@/app/[locale]/profiles/[id]/_dashboard/DayMasterHero'
import FourPillarsPanel from '@/app/[locale]/profiles/[id]/_dashboard/FourPillarsPanel'
import FiveElementsRadar from '@/app/[locale]/profiles/[id]/_dashboard/FiveElementsRadar'
import TenGodsDistribution from '@/app/[locale]/profiles/[id]/_dashboard/TenGodsDistribution'
import SpecialPalacesStrip from '@/app/[locale]/profiles/[id]/_dashboard/SpecialPalacesStrip'
import LuckCycleTimeline from '@/app/[locale]/profiles/[id]/_dashboard/LuckCycleTimeline'
import CurrentLiuNianStrip from '@/app/[locale]/profiles/[id]/_dashboard/CurrentLiuNianStrip'
import DemoBanner from './_components/DemoBanner'
import LockedSection from './_components/LockedSection'

// Demo chart is public — no auth required, served via admin client
export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('demo')
  const tHome = await getTranslations('home')

  const demoIdByLocale: Record<string, string | undefined> = {
    'en': process.env.DEMO_PROFILE_ID_EN,
    'zh-CN': process.env.DEMO_PROFILE_ID_ZH_CN,
    'zh-TW': process.env.DEMO_PROFILE_ID_ZH_TW,
  }
  const demoId = demoIdByLocale[locale]
  const envVarName = locale === 'zh-CN'
    ? 'DEMO_PROFILE_ID_ZH_CN'
    : locale === 'zh-TW'
      ? 'DEMO_PROFILE_ID_ZH_TW'
      : 'DEMO_PROFILE_ID_EN'

  // Graceful fallback — render informative message instead of crashing
  if (!demoId) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--zen-paper)', position: 'relative' }}>
        <div className="zen-circle-bg" aria-hidden="true" />
        <div style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <BrandMark variant="full" size="default" href="/" />
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--zen-text-muted)',
            marginTop: '48px',
            maxWidth: '400px',
            lineHeight: 1.6,
          }}>
            Demo not configured for locale &lsquo;{locale}&rsquo;.
            Set <code style={{ fontFamily: 'monospace', color: '#854F0B' }}>{envVarName}</code> in{' '}
            <code style={{ fontFamily: 'monospace', color: '#854F0B' }}>.env.local</code> and restart.
          </p>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: '#854F0B',
              textDecoration: 'underline',
              marginTop: '24px',
            }}
          >
            ← Back to home
          </Link>
        </div>
      </main>
    )
  }

  // Fetch demo profile via admin client — bypasses RLS intentionally
  const supabase = createAdminClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', demoId)
    .single()

  if (error || !profile) notFound()

  // Reconstruct true solar time — exact mirror of profiles/[id]/page.tsx
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

  // Regenerate the full report (pure function, <10ms)
  const gender = (profile.gender as string) ?? 'male'
  const report = generateBaziReport(tst, gender) as unknown as BaziReportRaw

  // Override profile name before passing to buildDashboardData —
  // protects the real person's identity on a public-facing demo page
  const demoProfile: ProfileRow = {
    ...(profile as unknown as ProfileRow),
    name: t('sampleChartName'),
  }

  // Empty subjects array — sidebar not shown on demo
  const dashboardData = buildDashboardData(demoProfile, [], report)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--zen-paper)', position: 'relative' }}>
      <div className="zen-circle-bg" aria-hidden="true" />

      {/* Top nav: BrandMark left, Login right */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--zen-gold-pale)',
      }}>
        <BrandMark variant="full" size="small" href="/" />
        <Link href="/login" style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: '#854F0B',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          {tHome('topNav.login')}
        </Link>
      </header>

      {/* Sample chart banner */}
      <DemoBanner />

      {/* Chart content */}
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '24px 16px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Chart grid — mirrors DashboardGrid but omits ChartReadingPanel (AI report shown as LockedSection below) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {/* Row 1: DayMasterHero | FourPillarsPanel */}
          <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr]" style={{ gap: '6px', alignItems: 'start' }}>
            <DayMasterHero data={dashboardData} />
            <FourPillarsPanel data={dashboardData} />
          </div>

          {/* Row 2: FiveElementsRadar (full width — ChartReadingPanel replaced by LockedSection below) */}
          <FiveElementsRadar data={dashboardData} />

          {/* Row 3: TenGodsDistribution */}
          <TenGodsDistribution data={dashboardData} />

          {/* Row 4: SpecialPalacesStrip */}
          <SpecialPalacesStrip data={dashboardData} />

          {/* Row 5: LuckCycleTimeline */}
          <LuckCycleTimeline data={dashboardData} />

          {/* Row 6: CurrentLiuNianStrip */}
          <CurrentLiuNianStrip data={dashboardData} />
        </div>

        {/* Locked AI sections */}
        <LockedSection
          title={t('aiReportTitle')}
          description={t('aiReportDescription')}
        />

        <LockedSection
          title={t('almanacTitle')}
          description={t('almanacDescription')}
        />

        <LockedSection
          title={t('chatTitle')}
          description={t('chatDescription')}
        />
      </div>
    </main>
  )
}
