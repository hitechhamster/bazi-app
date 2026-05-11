import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { getUserTier } from '@/lib/subscription/tier'
import { localePath } from '@/lib/i18n/path'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pricing' })

  // Detect current tier (null if not logged in)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentTier = user?.email_confirmed_at ? await getUserTier(user.id) : null

  const freeBadge  = currentTier === 'free'
  const paidBadge  = currentTier === 'paid'

  const featuresFree = t.raw('free.features') as string[]
  const featuresPaid = t.raw('paid.features') as string[]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zen-paper, #faf9f7)' }}>
      <PageHeader locale={locale} />

      <div
        className="max-w-3xl mx-auto px-6 py-16"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-main)',
            fontSize: '22px',
            fontWeight: 500,
            color: 'var(--zen-ink)',
            letterSpacing: '0.05em',
            margin: '0 0 10px',
          }}>
            {t('title')}
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--zen-text-muted, #78716c)',
            margin: 0,
          }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: '16px', alignItems: 'stretch' }}
        >
          {/* Free card */}
          <div style={{
            border: freeBadge ? '1.5px solid var(--zen-gold, #c9a96e)' : '1px solid var(--zen-border, #e5e0d8)',
            background: 'white',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--zen-ink)', marginBottom: '6px' }}>
                  {t('free.name')}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--zen-ink)' }}>
                  {t('free.price')}
                </div>
              </div>
              {freeBadge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#854F0B',
                  border: '1px solid #854F0B',
                  padding: '3px 8px',
                }}>
                  {t('currentPlan')}
                </span>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--zen-border, #e5e0d8)', margin: '0 0 20px' }} />

            <ul style={{ listStyle: 'none', margin: '0 0 auto', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {featuresFree.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--zen-ink)' }}>
                  <span style={{ color: 'var(--zen-gold, #c9a96e)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '24px' }}>
              {freeBadge ? (
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#854F0B',
                  padding: '10px',
                  background: 'var(--zen-gold-pale, #fdf6ec)',
                  letterSpacing: '0.05em',
                }}>
                  {t('currentPlan')}
                </div>
              ) : (
                <Link
                  href={localePath(locale, '/login')}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--zen-ink)',
                    border: '1px solid var(--zen-border, #e5e0d8)',
                    padding: '10px',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {t('free.cta')}
                </Link>
              )}
            </div>
          </div>

          {/* Paid / Pro card */}
          <div style={{
            border: paidBadge ? '1.5px solid var(--zen-gold, #c9a96e)' : '1.5px solid var(--zen-ink, #2d2d2d)',
            background: 'white',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--zen-ink)', marginBottom: '6px' }}>
                  {t('paid.name')}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--zen-ink)' }}>
                  {t('paid.price')}
                </div>
              </div>
              {paidBadge ? (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#854F0B',
                  border: '1px solid #854F0B',
                  padding: '3px 8px',
                }}>
                  {t('currentPlan')}
                </span>
              ) : (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'white',
                  background: 'var(--zen-ink, #2d2d2d)',
                  padding: '3px 8px',
                }}>
                  {t('paid.badge')}
                </span>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--zen-border, #e5e0d8)', margin: '0 0 20px' }} />

            <ul style={{ listStyle: 'none', margin: '0 0 auto', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {featuresPaid.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--zen-ink)' }}>
                  <span style={{ color: 'var(--zen-gold, #c9a96e)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '24px' }}>
              {paidBadge ? (
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#854F0B',
                  padding: '10px',
                  background: 'var(--zen-gold-pale, #fdf6ec)',
                  letterSpacing: '0.05em',
                }}>
                  {t('currentPlan')}
                </div>
              ) : (
                <a
                  href={`mailto:contact@bazi-master.com?subject=${encodeURIComponent(t('paid.emailSubject'))}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'white',
                    background: '#854F0B',
                    padding: '10px',
                    textDecoration: 'none',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {t('paid.cta')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--zen-text-muted, #78716c)',
          marginTop: '32px',
        }}>
          {t('note')}
        </p>
      </div>
    </div>
  )
}
