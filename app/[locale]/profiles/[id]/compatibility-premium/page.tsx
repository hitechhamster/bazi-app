import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'
import { getCompatibilityQuotaStatus } from '@/lib/subscription/tier'
import type { CompatibilityScores } from '@/lib/bazi/compatibility'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  completed:  'Completed',
  generating: 'Generating…',
  pending:    'Pending',
  failed:     'Failed',
}

const STATUS_COLOR: Record<string, string> = {
  completed:  '#3a7d44',
  generating: '#854F0B',
  pending:    '#9ca3af',
  failed:     '#BC2D2D',
}

const LEVEL_LABEL: Record<string, string> = {
  excellent: 'Excellent',
  good:      'Good',
  average:   'Moderate',
  needWork:  'Needs Work',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PremiumCompatibilityListPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id: profileId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single()
  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  const admin = createAdminClient()
  // Only premium-tier reports on this page
  const { data: reports } = await admin
    .from('compatibility_reports')
    .select('id, partner_a_data, partner_b_data, scores, premium_status, created_at')
    .eq('user_id', user.id)
    .eq('tier', 'premium')
    .order('created_at', { ascending: false })

  const quota = await getCompatibilityQuotaStatus(user.id)
  const rows  = reports ?? []

  const newHref = localePath(locale, `/profiles/${profileId}/compatibility-premium/new`)

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', marginBottom: '4px' }}>
            付费合婚 / Premium Compatibility
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
            本月深度报告剩余 {quota.premium.remaining} / {quota.premium.cap}
          </div>
        </div>
        <Link
          href={newHref}
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'white',
            background: '#854F0B',
            padding: '9px 20px',
            textDecoration: 'none',
          }}
        >
          新建深度报告
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="zen-result-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-text-muted)', marginBottom: '20px' }}>
            尚无付费合婚记录
          </p>
          <Link
            href={newHref}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'white',
              background: '#854F0B',
              padding: '9px 20px',
              textDecoration: 'none',
            }}
          >
            新建深度报告
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map(r => {
            const nameA       = (r.partner_a_data as { name?: string })?.name ?? 'Partner A'
            const nameB       = (r.partner_b_data as { name?: string })?.name ?? 'Partner B'
            const scores      = r.scores as CompatibilityScores | null
            const premStatus  = (r.premium_status as string) ?? 'pending'

            return (
              <Link
                key={r.id as string}
                href={localePath(locale, `/profiles/${profileId}/compatibility-premium/${r.id}`)}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  border: '1px solid var(--zen-border)',
                  background: 'var(--zen-paper)',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  cursor: 'pointer',
                }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500, color: 'var(--zen-ink)', marginBottom: '4px' }}>
                      {nameA} ↔ {nameB}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#854F0B', border: '1px solid #854F0B', padding: '1px 6px',
                      }}>
                        Premium
                      </span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
                        {formatDate(r.created_at as string)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    {scores && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--font-main)', fontSize: '20px', fontWeight: 500, color: '#854F0B' }}>
                          {scores.total}
                        </span>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', marginLeft: '2px' }}>/99</span>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', marginTop: '1px' }}>
                          {LEVEL_LABEL[scores.level?.key] ?? scores.level?.key}
                        </div>
                      </div>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.08em',
                      color: STATUS_COLOR[premStatus] ?? 'var(--zen-text-muted)',
                    }}>
                      {STATUS_LABEL[premStatus] ?? premStatus}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
