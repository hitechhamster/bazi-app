import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'
import { getCompatibilityQuotaStatus } from '@/lib/subscription/tier'
import BrandMark from '@/components/BrandMark'
import LocaleSwitcher from '../../_components/LocaleSwitcher'
import CompatibilityForm, { type ProfileOption } from './CompatibilityForm'

export default async function NewCompatibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  // Fetch user's profiles for the profile picker
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, name, day_master, birth_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const profiles: ProfileOption[] = (profileRows ?? []).map(p => ({
    id:         p.id as string,
    name:       p.name as string,
    dayMaster:  p.day_master as string,
    birthDate:  p.birth_date as string,
  }))

  // Quota status
  const quota = await getCompatibilityQuotaStatus(user.id)

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6" style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BrandMark variant="full" size="small" href="/dashboard" />
            <Link href={localePath(locale, '/dashboard')} style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-ink)', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          </div>
          <LocaleSwitcher />
        </div>

        {/* Page title */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
            New Compatibility Analysis · 合婚分析
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
            Six-dimension Bazi compatibility scoring + AI reading
          </p>
        </div>

        <CompatibilityForm
          profiles={profiles}
          quota={{ free: quota.free }}
          locale={locale}
        />

      </div>
    </div>
  )
}
