import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import ProfileListCard, { type ProfileListCardData } from './_components/ProfileListCard'
import LocaleSwitcher from '../_components/LocaleSwitcher'

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

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        color: 'var(--zen-text-muted)',
        marginBottom: '24px',
      }}>
        No profiles yet · 还没有档案
      </p>
      <Link
        href="/profiles/new"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--zen-gold)',
          border: '1px solid var(--zen-gold)',
          padding: '8px 16px',
          borderRadius: '0',
          letterSpacing: '0.1em',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        + New profile
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select(SELECT_FIELDS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = (profiles ?? []) as unknown as ProfileListCardData[]

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
          alignItems: 'baseline',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-main)',
            fontSize: '20px',
            fontWeight: 500,
            color: 'var(--zen-ink)',
            margin: 0,
            letterSpacing: '0.05em',
          }}>
            My Profiles · 我的档案
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LocaleSwitcher />
            <Link
              href="/profiles/new"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                color: 'var(--zen-gold)',
                border: '1px solid var(--zen-gold)',
                padding: '8px 16px',
                borderRadius: '0',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              + New profile
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Grid or empty */}
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div style={{ ...labelStyle, marginBottom: '12px' }}>
              {list.length} PROFILE{list.length !== 1 ? 'S' : ''} · 共 {list.length} 位
            </div>
            <div
              className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
              style={{ gap: '12px' }}
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
