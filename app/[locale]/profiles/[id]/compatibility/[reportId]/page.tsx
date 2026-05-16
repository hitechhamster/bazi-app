import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'
import { getUserTier } from '@/lib/subscription/tier'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getTranslations } from 'next-intl/server'
import CompatibilityReportPending from './CompatibilityReportPending'
import UpgradeCTA from './UpgradeCTA'
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

export default async function CompatibilityReportPage({
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
    .select('id, user_id, tier, free_report_status, free_report_text, scores, bazi_a, bazi_b, partner_a_data, partner_b_data, locale')
    .eq('id', reportId)
    .single()

  if (!report) notFound()
  if ((report.user_id as string) !== user.id) notFound()

  // If this is a premium report, redirect to the premium route
  if ((report.tier as string) === 'premium') {
    redirect(localePath(locale, `/profiles/${profileId}/compatibility-premium/${reportId}`))
  }

  const [userTier, tCompat] = await Promise.all([
    getUserTier(user.id),
    getTranslations({ locale, namespace: 'compatibility' }),
  ])
  const status     = report.free_report_status as string
  const baziA      = report.bazi_a   as BaziPartnerData
  const baziB      = report.bazi_b   as BaziPartnerData
  const scores     = report.scores   as CompatibilityScores
  const nameA      = (report.partner_a_data as { name?: string })?.name ?? 'Partner A'
  const nameB      = (report.partner_b_data as { name?: string })?.name ?? 'Partner B'
  const reportText = (report.free_report_text as string | null) ?? null

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
          {nameA} &amp; {nameB}
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
          Compatibility Analysis · 合婚分析
        </p>
      </div>

      {(status === 'pending' || status === 'generating') && (
        <CompatibilityReportPending reportId={reportId} locale={locale} />
      )}

      {status === 'failed' && (
        <div className="zen-result-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-text-muted)', marginBottom: '20px' }}>
            {tCompat('failed')}
          </p>
          <form action={`/api/compatibility/${reportId}/generate-free`} method="POST">
            <button type="submit" style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', border: 'none', cursor: 'pointer', background: '#854F0B', color: 'white' }}>
              {tCompat('retry')}
            </button>
          </form>
        </div>
      )}

      {status === 'completed' && (
        <>
          <div className="zen-result-card">
            <span style={labelStyle}>Compatibility Score · 合婚评分</span>
            <ScoreCircle total={scores.total} level={scores.level} locale={locale} />
            <ScoreBreakdown scores={scores} locale={locale} />
          </div>

          <div className="zen-result-card">
            <span style={labelStyle}>Bazi Charts · 双人命盘</span>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <BaziCard bazi={baziA} name={nameA} locale={locale} />
              <BaziCard bazi={baziB} name={nameB} locale={locale} />
            </div>
          </div>

          {reportText && (
            <div className="zen-result-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 8px', borderBottom: '1px solid var(--zen-border)' }}>
                <span style={labelStyle}>Compatibility Reading · AI 解读</span>
              </div>
              <div
                className="ai-content-box"
                style={{ border: 'none', padding: '28px 36px' }}
                dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(reportText) }}
              />
            </div>
          )}

          <UpgradeCTA tier={userTier} locale={locale} />
        </>
      )}
    </div>
  )
}
