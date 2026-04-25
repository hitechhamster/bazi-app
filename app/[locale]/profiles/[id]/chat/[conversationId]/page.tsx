import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import Sidebar from '../../_dashboard/Sidebar'
import MobileTopNav from '../../_dashboard/MobileTopNav'
import ChatSection from '../_components/ChatSection'
import {
  buildDashboardData,
  type BaziReportRaw,
  type ProfileRow,
  type SubjectRow,
} from '../../_dashboard/build-dashboard-data'
import { getConversation, getConversationsForProfile } from '@/lib/actions/conversations'

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>
}) {
  const { id, conversationId } = await params

  // Auth + ownership check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  // Sibling profiles for sidebar
  const { data: siblings } = await supabase
    .from('profiles')
    .select('id, name, day_master, day_master_element, birth_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const subjects: SubjectRow[] = (siblings ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    day_master: s.day_master as string,
    day_master_element: s.day_master_element as string,
    birth_date: s.birth_date as string,
  }))

  // Reconstruct TST for sidebar chart data
  let tst: Date
  if (profile.true_solar_time) {
    tst = new Date(profile.true_solar_time as string)
  } else {
    const birthDate = profile.birth_date as string
    const birthTime = (profile.birth_time as string | null) ?? null
    const isTimeUnknown = (profile.is_time_unknown as boolean) ?? false
    const [yr, mo, dy] = birthDate.split('-').map(Number)
    let hr = 12
    let mn = 0
    if (!isTimeUnknown && birthTime) {
      const [h, m] = birthTime.split(':').map(Number)
      hr = h
      mn = m
    }
    tst = new Date(Date.UTC(yr, mo - 1, dy, hr, mn))
  }

  const gender = (profile.gender as string) ?? 'male'
  const report = generateBaziReport(tst, gender) as unknown as BaziReportRaw
  const dashboardData = buildDashboardData(profile as unknown as ProfileRow, subjects, report)

  // Fetch conversation + messages + sibling conversation list (for history panel)
  const [convoResult, listResult] = await Promise.all([
    getConversation(conversationId),
    getConversationsForProfile(id),
  ])
  const allConversations = 'conversations' in listResult ? listResult.conversations : []

  const t = await getTranslations('profileReport')
  const tChat = await getTranslations('chat')

  // Conversation not found or not owned (RLS will return nothing if not owned)
  if ('error' in convoResult) {
    return (
      <div className="min-h-screen relative overflow-visible">
        <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />
        <div
          className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6"
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingTop: '80px' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-text-muted)', marginBottom: '16px' }}>
            {tChat('notFound')}
          </p>
          <Link
            href="/dashboard"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#854F0B', textDecoration: 'underline' }}
          >
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  const { conversation, messages } = convoResult

  return (
    <div className="min-h-screen relative overflow-visible">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div
        className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Back link — desktop only */}
        <div className="hidden lg:block" style={{ marginBottom: '16px' }}>
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
            {t('backToDashboard')}
          </Link>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-[220px_1fr]"
          style={{ gap: '16px', alignItems: 'start' }}
        >
          {/* Sticky sidebar — desktop only */}
          <div
            className="hidden lg:block"
            style={{ position: 'sticky', top: '16px', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
          >
            <Sidebar data={dashboardData} />
          </div>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
            {/* Mobile nav — hidden on desktop */}
            <div className="lg:hidden">
              <MobileTopNav profileId={id} />
            </div>

            <ChatSection
              conversation={conversation}
              allConversations={allConversations}
              messages={messages}
              profileId={id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
