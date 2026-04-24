import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'

type Profile = {
  id: string
  name: string
  relation: string
  gender: string
  birth_date: string
  base_report_status: string | null
  created_at: string
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pending',       bg: '#e5e5e5',        color: '#666' },
  generating: { label: 'Generating…',  bg: 'var(--zen-gold)', color: '#fff' },
  done:       { label: 'Ready',         bg: 'var(--zen-red)',  color: '#fff' },
  failed:     { label: 'Failed',        bg: '#555',            color: '#fff' },
}

const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-ui)',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: bg,
  color,
  padding: '3px 8px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
})

const pillStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--zen-text-muted)',
  border: '1px solid var(--zen-border)',
  padding: '2px 8px',
  display: 'inline-block',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, relation, gender, birth_date, base_report_status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list: Profile[] = profiles ?? []

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 py-12">

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '48px',
        }}>
          <div>
            <h1 className="zen-h1">Welcome back</h1>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--zen-text-muted)',
              marginTop: '6px',
            }}>
              {user.email}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/profiles/new"
              className="zen-btn-primary"
              style={{ textDecoration: 'none', padding: '12px 28px', fontSize: '0.95rem', letterSpacing: '0.15em' }}
            >
              New Profile
            </Link>
            <LogoutButton variant="subtle" />
          </div>
        </div>

        {/* ── Empty state ── */}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--zen-text-muted)',
              marginBottom: '24px',
            }}>
              No profiles yet.
            </p>
            <Link href="/profiles/new" className="zen-btn-primary" style={{ textDecoration: 'none' }}>
              Create your first profile
            </Link>
          </div>
        )}

        {/* ── Profile grid ── */}
        {list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(p => {
              const status = p.base_report_status ?? 'pending'
              const badge = STATUS_BADGE[status] ?? STATUS_BADGE.pending

              const dateStr = p.birth_date
                ? new Date(p.birth_date + 'T12:00:00Z').toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })
                : '—'

              const genderLabel = p.gender
                ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1)
                : '—'

              return (
                <Link key={p.id} href={`/profiles/${p.id}`} className="dashboard-profile-card">
                  {/* Name + status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-main)',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: 'var(--zen-ink)',
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      {p.name}
                    </h3>
                    <span style={badgeStyle(badge.bg, badge.color)}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Relation pill */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={pillStyle}>{p.relation}</span>
                  </div>

                  {/* Gender · Date */}
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    color: 'var(--zen-text-muted)',
                    margin: 0,
                  }}>
                    {genderLabel} · {dateStr}
                  </p>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
