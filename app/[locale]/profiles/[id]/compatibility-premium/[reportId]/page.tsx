import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'
import PremiumCompatibilitySection from '../../_components/compat/PremiumCompatibilitySection'
import { ScoreCircle, ScoreBreakdown, BaziCard } from '../../_components/compat/ScoreDisplay'
import type { BaziPartnerData, CompatibilityScores } from '@/lib/bazi/compatibility'

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-text-muted)',
  textTransform: 'uppercase',
  fontWeight: 500,
  marginBottom: '12px',
  display: 'block',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PremiumCompatibilityReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; reportId: string }>
}) {
  const { locale, id: profileId, reportId } = await params

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  const admin = createAdminClient()
  const { data: report } = await admin
    .from('compatibility_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report) notFound()
  if ((report.user_id as string) !== user.id) notFound()

  // If this is a free report, redirect to the free route
  if ((report.tier as string) !== 'premium') {
    redirect(localePath(locale, `/profiles/${profileId}/compatibility/${reportId}`))
  }

  const premiumStatus = (report.premium_status as string) ?? 'pending'
  const baziA         = report.bazi_a   as BaziPartnerData
  const baziB         = report.bazi_b   as BaziPartnerData
  const scores        = report.scores   as CompatibilityScores
  const nameA         = (report.partner_a_data as { name?: string })?.name ?? 'Partner A'
  const nameB         = (report.partner_b_data as { name?: string })?.name ?? 'Partner B'

  const premiumChapters = {
    overview:      (report.premium_overview      as string | null) ?? null,
    compatibility: (report.premium_compatibility as string | null) ?? null,
    communication: (report.premium_communication as string | null) ?? null,
    wealth_career: (report.premium_wealth_career as string | null) ?? null,
    love_marriage: (report.premium_love_marriage as string | null) ?? null,
    forecast:      (report.premium_forecast      as string | null) ?? null,
  }

  return (
    <div>
      {/* Page title */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
          {nameA} &amp; {nameB}
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
          Premium Compatibility Report · 付费合婚报告
        </p>
      </div>

      {/* Score */}
      <div className="zen-result-card">
        <span style={labelStyle}>Compatibility Score · 合婚评分</span>
        <ScoreCircle total={scores.total} level={scores.level} locale={locale} />
        <ScoreBreakdown scores={scores} locale={locale} />
      </div>

      {/* Dual bazi */}
      <div className="zen-result-card">
        <span style={labelStyle}>Bazi Charts · 双人命盘</span>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <BaziCard bazi={baziA} name={nameA} locale={locale} />
          <BaziCard bazi={baziB} name={nameB} locale={locale} />
        </div>
      </div>

      {/* 6-chapter premium content */}
      <PremiumCompatibilitySection
        reportId={reportId}
        locale={locale}
        initialStatus={premiumStatus}
        initialChapters={premiumChapters}
      />
    </div>
  )
}
