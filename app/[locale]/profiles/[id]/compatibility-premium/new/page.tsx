import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'
import { getCompatibilityQuotaStatus, getUserTier } from '@/lib/subscription/tier'
import CompatibilityForm, { type ProfileOption } from '../../_components/compat/CompatibilityForm'

export default async function NewPremiumCompatibilityPage({
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

  // Free users cannot access premium compat — redirect to pricing
  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    redirect(localePath(locale, '/pricing'))
  }

  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, name, day_master, birth_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const profiles: ProfileOption[] = (profileRows ?? []).map(p => ({
    id:        p.id as string,
    name:      p.name as string,
    dayMaster: p.day_master as string,
    birthDate: p.birth_date as string,
  }))

  const quotaStatus = await getCompatibilityQuotaStatus(user.id)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', marginBottom: '4px' }}>
          新建付费合婚 / New Premium Compatibility Report
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
          15,000+ word · 6 chapters · Gemini Pro · Six-dimension scoring
        </p>
      </div>

      <CompatibilityForm
        profiles={profiles}
        quota={quotaStatus.premium}
        locale={locale}
        profileId={profileId}
        fixedTier="premium"
      />
    </div>
  )
}
