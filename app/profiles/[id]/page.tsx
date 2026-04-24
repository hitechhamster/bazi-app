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
    <div className="min-h-screen relative overflow-visible">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        {/* Back link */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--zen-ink)',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Two-column: sticky sidebar + scrolling main */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '16px',
          alignItems: 'start',
        }}>
          {/* Sticky sidebar */}
          <div style={{
            position: 'sticky',
            top: '16px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
          }}>
            <Sidebar data={MOCK_DATA} />
          </div>

          {/* Main content column — dashboard + AI report stacked, same width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
            <DashboardGrid data={MOCK_DATA} />

            {/* AI Destiny Reading section */}
            <div style={{
              borderTop: '1px solid var(--zen-border)',
              paddingTop: '24px',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '17px',
                  fontWeight: 500,
                  color: 'var(--zen-ink)',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}>
                  Your Destiny Reading · 解读
                </h2>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--zen-ink)',
                  marginTop: '6px',
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
      </div>
    </div>
  )
}
