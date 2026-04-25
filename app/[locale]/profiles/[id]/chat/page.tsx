import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getConversationsForProfile, createConversation } from '@/lib/actions/conversations'

export default async function ChatIndexPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const localePrefix = locale === 'en' ? '' : `/${locale}`

  // Auth + ownership check
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

  // Try to redirect to most recent conversation
  const result = await getConversationsForProfile(id)
  if ('conversations' in result && result.conversations.length > 0) {
    // Already sorted by updated_at desc — first is most recent
    redirect(`${localePrefix}/profiles/${id}/chat/${result.conversations[0].id}`)
  }

  // No conversations yet — create one and redirect to it
  const created = await createConversation(id)
  if ('error' in created) {
    return (
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: 'var(--zen-red)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        Failed to create conversation: {created.error}
      </div>
    )
  }

  redirect(`${localePrefix}/profiles/${id}/chat/${created.conversationId}`)
}
