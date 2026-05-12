export const maxDuration = 800

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUserTier } from '@/lib/subscription/tier'
import { localePath } from '@/lib/i18n/path'
import PremiumReportSection from './PremiumReportSection'
import type { PremiumReportStatus } from './actions'

export default async function PremiumReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Tier gate — premium report is a paid feature
  const tier = await getUserTier(user.id)
  if (tier !== 'paid') {
    redirect(localePath(locale, '/pricing'))
  }

  // Fetch profile with premium report columns
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id, premium_report, premium_report_status, premium_report_locale, premium_report_generated_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  const t = await getTranslations({ locale, namespace: 'premiumReport' })

  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          {t('pageTitle')}
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-ink)',
          marginTop: '6px',
          marginBottom: 0,
        }}>
          {t('pageSubtitle')}
        </p>
      </div>

      <PremiumReportSection
        profileId={id}
        initialStatus={(profile.premium_report_status as PremiumReportStatus | null) ?? null}
        initialReport={(profile.premium_report as string | null) ?? null}
        initialLocale={(profile.premium_report_locale as string | null) ?? null}
        initialGeneratedAt={(profile.premium_report_generated_at as string | null) ?? null}
      />
    </div>
  )
}
