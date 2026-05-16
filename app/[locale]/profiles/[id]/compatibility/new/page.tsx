import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'
import { getCompatibilityQuotaStatus } from '@/lib/subscription/tier'
import CompatibilityForm, { type ProfileOption } from './CompatibilityForm'

export default async function NewCompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id: profileId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  // Verify profile ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single()
  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  // Fetch user's profiles for the profile picker
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

  const quota = await getCompatibilityQuotaStatus(user.id)

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', marginBottom: '4px' }}>
          新建合婚分析 / New Compatibility Analysis
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
          Six-dimension Bazi compatibility scoring + AI reading
        </p>
      </div>

      <CompatibilityForm
        profiles={profiles}
        quota={{ free: quota.free }}
        locale={locale}
        profileId={profileId}
      />
    </div>
  )
}
