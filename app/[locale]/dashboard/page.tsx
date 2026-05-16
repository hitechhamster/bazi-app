import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import LogoutButton from './logout-button'
import ProfileListCard, { type ProfileListCardData } from './_components/ProfileListCard'
import NewProfileButton from './_components/NewProfileButton'
import LocaleSwitcher from '../_components/LocaleSwitcher'
import BrandMark from '@/components/BrandMark'
import { localePath } from '@/lib/i18n/path'
import { canCreateProfile } from '@/lib/subscription/tier'

const SELECT_FIELDS = [
  'id', 'name', 'relation', 'gender', 'birth_date', 'birth_city',
  'day_master', 'day_master_element',
  'pillar_year', 'pillar_month', 'pillar_day', 'pillar_hour',
  'five_elements', 'luck_cycles',
  'base_report_status',
].join(', ')

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-text-muted)',
  textTransform: 'uppercase',
  fontWeight: 500,
}

function EmptyState({
  empty,
  atCap,
  locale,
}: {
  empty: string
  atCap: boolean
  locale: string
}) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        color: 'var(--zen-text-muted)',
        marginBottom: '24px',
      }}>
        {empty}
      </p>
      <NewProfileButton atCap={atCap} locale={locale} />
    </div>
  )
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email_confirmed_at) {
    redirect(localePath(locale, '/login'))
  }

  const t = await getTranslations('dashboard')

  const [{ data: profiles }, profileQuota] = await Promise.all([
    supabase
      .from('profiles')
      .select(SELECT_FIELDS)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    canCreateProfile(user!.id),
  ])

  const list = (profiles ?? []) as unknown as ProfileListCardData[]
  const atCap = !profileQuota.allowed

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div
        className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6"
        style={{ position: 'relative', zIndex: 10 }}
      >

        {/* Top bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <BrandMark variant="full" size="small" href={localePath(locale, '/dashboard')} />
            <h1 style={{
              fontFamily: 'var(--font-main)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--zen-ink)',
              margin: 0,
              letterSpacing: '0.05em',
            }}>
              {t('title')}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LocaleSwitcher />
            <NewProfileButton atCap={atCap} locale={locale} />
            <LogoutButton />
          </div>
        </header>

        {/* Profiles grid or empty */}
        {list.length === 0 ? (
          <EmptyState empty={t('empty')} atCap={atCap} locale={locale} />
        ) : (
          <>
            <div style={{ ...labelStyle, marginBottom: '12px' }}>
              {list.length} PROFILE{list.length !== 1 ? 'S' : ''} · 共 {list.length} 位
            </div>
            <div
              className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
              style={{ gap: '12px', marginBottom: '32px' }}
            >
              {list.map(p => (
                <ProfileListCard key={p.id} data={p} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
