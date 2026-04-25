'use server'

import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import { generateChatReply } from '@/lib/ai/generate-chat-reply'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConversationStatus = 'pending' | 'generating' | 'done' | 'failed'

export type Conversation = {
  id: string
  profile_id: string
  title: string
  locale: 'en' | 'zh-CN' | 'zh-TW'
  created_at: string
  updated_at: string
}

export type ConversationListItem = Conversation & {
  message_count: number
  last_user_message_preview: string | null
}

export type Message = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  status: ConversationStatus
  error: string | null
  turn_number: number
  created_at: string
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createConversation(
  profileId: string
): Promise<{ conversationId: string } | { error: string }> {
  // Verify the user is authenticated and owns the profile
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await userClient
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .single()
  if (!profile) return { error: 'Profile not found' }

  const locale = await getLocale()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('conversations')
    .insert({
      profile_id: profileId,
      locale,
      // title: DB default 'New conversation' applied automatically
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Insert failed' }
  return { conversationId: data.id }
}

export async function getConversationsForProfile(
  profileId: string
): Promise<{ conversations: ConversationListItem[] } | { error: string }> {
  const supabase = await createClient()

  const { data: conversations, error: cErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })

  if (cErr) return { error: cErr.message }
  if (!conversations || conversations.length === 0) return { conversations: [] }

  // Fetch message stats for all conversations in one query — simpler than a JOIN
  const conversationIds = conversations.map((c) => c.id)
  const { data: messageStats } = await supabase
    .from('messages')
    .select('conversation_id, role, content, turn_number')
    .in('conversation_id', conversationIds)
    .order('turn_number', { ascending: false })

  // Build a stats map: count all messages + capture most recent user message preview
  const statsMap = new Map<string, { count: number; lastUserPreview: string | null }>()
  for (const cId of conversationIds) {
    statsMap.set(cId, { count: 0, lastUserPreview: null })
  }
  if (messageStats) {
    for (const m of messageStats) {
      const stat = statsMap.get(m.conversation_id)
      if (!stat) continue
      stat.count += 1
      if (m.role === 'user' && stat.lastUserPreview === null) {
        // Rows are ordered by turn_number desc, so the first user row we see is the latest
        stat.lastUserPreview = (m.content as string).substring(0, 60)
      }
    }
  }

  const enriched: ConversationListItem[] = conversations.map((c) => ({
    ...(c as Conversation),
    message_count: statsMap.get(c.id)?.count ?? 0,
    last_user_message_preview: statsMap.get(c.id)?.lastUserPreview ?? null,
  }))

  return { conversations: enriched }
}

export async function getConversation(
  conversationId: string
): Promise<{ conversation: Conversation; messages: Message[] } | { error: string }> {
  const supabase = await createClient()

  const { data: conversation, error: cErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (cErr || !conversation) return { error: cErr?.message ?? 'Conversation not found' }

  const { data: messages, error: mErr } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('turn_number', { ascending: true })
    .order('created_at', { ascending: true })

  if (mErr) return { error: mErr.message }

  return {
    conversation: conversation as Conversation,
    messages: (messages ?? []) as Message[],
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<{ ok: true } | { error: string }> {
  // Auth + ownership check via user-scoped client (RLS SELECT policy enforces this)
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await userClient
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single()
  if (!existing) return { error: 'Conversation not found or not yours' }

  // Actual delete via admin client — RLS only has SELECT policy, no DELETE policy
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Message actions ───────────────────────────────────────────────────────────

export async function submitChatMessage(
  conversationId: string,
  text: string
): Promise<{ assistantMessageId: string } | { error: string }> {
  const trimmed = text.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }
  if (trimmed.length > 2000) return { error: 'Message too long (max 2000 chars)' }

  // Auth + conversation ownership check via user-scoped client
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: convo } = await userClient
    .from('conversations')
    .select('id, profile_id')
    .eq('id', conversationId)
    .single()
  if (!convo) return { error: 'Conversation not found' }

  const adminClient = createAdminClient()

  // Compute next turn_number — max existing + 1, or 1 if no messages yet
  const { data: lastMsg } = await adminClient
    .from('messages')
    .select('turn_number')
    .eq('conversation_id', conversationId)
    .order('turn_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextTurn = (lastMsg?.turn_number ?? 0) + 1

  // Insert user message (immediately done)
  const { error: userErr } = await adminClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: trimmed,
      status: 'done',
      turn_number: nextTurn,
    })
  if (userErr) return { error: userErr.message }

  // Insert assistant placeholder (pending until generation completes)
  const { data: assistantRow, error: aErr } = await adminClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      status: 'pending',
      turn_number: nextTurn,
    })
    .select('id')
    .single()
  if (aErr || !assistantRow) return { error: aErr?.message ?? 'Insert failed' }

  // Bump conversation updated_at so it sorts to top of list
  await adminClient
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  after(() => {
    generateChatReply(assistantRow.id)
  })

  return { assistantMessageId: assistantRow.id }
}

export async function getMessageStatus(
  messageId: string
): Promise<{ message: Message } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()
  if (error || !data) return { error: error?.message ?? 'Message not found' }
  return { message: data as Message }
}

export async function retryMessage(
  messageId: string
): Promise<{ ok: true } | { error: string }> {
  // Auth + ownership check via user-scoped client
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify the message exists and belongs to a conversation the user owns
  const { data: msg } = await userClient
    .from('messages')
    .select('id, role, status, conversation_id')
    .eq('id', messageId)
    .single()
  if (!msg) return { error: 'Message not found' }
  if ((msg.role as string) !== 'assistant') return { error: 'Only assistant messages can be retried' }
  if ((msg.status as string) !== 'failed') return { error: 'Message is not in failed state' }

  // Reset status + content via admin client
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('messages')
    .update({ status: 'pending', content: '', error: null })
    .eq('id', messageId)
  if (error) return { error: error.message }

  after(() => {
    generateChatReply(messageId)
  })

  return { ok: true }
}
