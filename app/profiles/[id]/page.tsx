import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MOCK_DATA } from './_dashboard/mock-data'
import Sidebar from './_dashboard/Sidebar'
import DashboardGrid from './_dashboard/DashboardGrid'
import BaseReportSection from './BaseReportSection'

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Back link — full-width, outside grid */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--zen-text-muted)',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '16px',
          alignItems: 'start',
        }}>
          <Sidebar data={MOCK_DATA} />
          <DashboardGrid data={MOCK_DATA} />
        </div>

        {/* Row 7: AI Destiny Reading */}
        <div style={{
          marginTop: '32px',
          borderTop: '1px solid var(--zen-border)',
          paddingTop: '32px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: 'var(--font-main)',
              fontSize: '17px',
              fontWeight: 400,
              color: 'var(--zen-ink)',
              letterSpacing: '0.05em',
              margin: 0,
            }}>
              Your Destiny Reading · 解读
            </h2>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-text-muted)',
              marginTop: '8px',
              marginBottom: 0,
            }}>
              AI-generated reading based on your Four Pillars
            </p>
          </div>
          <BaseReportSection
            profileId={profile.id as string}
            initialStatus={(profile.base_report_status as string) ?? 'pending'}
            initialReport={profile.base_report as string | null}
            initialError={profile.base_report_error as string | null}
          />
        </div>
      </div>
    </div>
  )
}
