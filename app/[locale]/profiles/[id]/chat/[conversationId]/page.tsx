import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import ChatSection from '../_components/ChatSection'
import { getConversation, getConversationsForProfile } from '@/lib/actions/conversations'

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>
}) {
  const { id, conversationId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  const [convoResult, listResult] = await Promise.all([
    getConversation(conversationId),
    getConversationsForProfile(id),
  ])
  const allConversations = 'conversations' in listResult ? listResult.conversations : []

  const t = await getTranslations('profileReport')
  const tChat = await getTranslations('chat')

  if ('error' in convoResult) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
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
    )
  }

  const { conversation, messages } = convoResult

  return (
    <ChatSection
      conversation={conversation}
      allConversations={allConversations}
      messages={messages}
      profileId={id}
    />
  )
}
