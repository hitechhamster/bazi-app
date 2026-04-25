import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { createAdminClient } from '@/lib/supabase/server'

const MODEL = 'gemini-3.1-flash-lite-preview'
const TIMEOUT_MS = 30_000

const LANG_NAME: Record<string, string> = {
  'en':    'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

export async function generateConversationTitle(conversationId: string): Promise<void> {
  const adminClient = createAdminClient()

  try {
    // Fetch conversation — verify it still has the default title (race protection)
    const { data: conversation } = await adminClient
      .from('conversations')
      .select('id, locale, title')
      .eq('id', conversationId)
      .single()
    if (!conversation) return
    if ((conversation.title as string) !== 'New conversation') return

    // Fetch first turn (turn_number === 1) — need both user + assistant messages
    const { data: firstTurnMessages } = await adminClient
      .from('messages')
      .select('role, content, status')
      .eq('conversation_id', conversationId)
      .eq('turn_number', 1)
      .order('created_at', { ascending: true })

    if (!firstTurnMessages || firstTurnMessages.length < 2) return

    const userMsg = firstTurnMessages.find((m) => m.role === 'user')?.content as string ?? ''
    const assistantMsg = firstTurnMessages.find(
      (m) => m.role === 'assistant' && m.status === 'done'
    )?.content as string ?? ''

    if (!userMsg || !assistantMsg) return

    const langName = LANG_NAME[conversation.locale as string] ?? LANG_NAME['en']

    const titlePrompt = `Read the following first exchange of a Bazi destiny conversation and generate a concise title (5-12 characters) summarizing the topic. Output ONLY the title — no quotes, no punctuation at the end, no explanation.

Output language: ${langName}.

User: ${userMsg}
Assistant: ${assistantMsg.substring(0, 500)}

Title:`

    const geminiPromise = gemini.models.generateContent({
      model: MODEL,
      contents: titlePrompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Title gen timed out after ${TIMEOUT_MS}ms`)),
        TIMEOUT_MS
      )
    )

    const result = await Promise.race([geminiPromise, timeoutPromise])
    const rawTitle = result.text?.trim() ?? ''
    if (!rawTitle) return

    // Sanitize: strip surrounding quotes/brackets, trailing punctuation, clip to 30 chars
    const cleaned = rawTitle
      .replace(/^["'「『《\[【]+|["'」』》\]】]+$/g, '')
      .replace(/[。！？.!?]+$/g, '')
      .substring(0, 30)
      .trim()

    if (!cleaned) return

    await adminClient
      .from('conversations')
      .update({ title: cleaned })
      .eq('id', conversationId)
      // Guard against racing — only update if still the default
      .eq('title', 'New conversation')
  } catch (err) {
    // Title is polish, not core — log but don't surface
    console.error('[generate-conversation-title] failed:', err)
  }
}
