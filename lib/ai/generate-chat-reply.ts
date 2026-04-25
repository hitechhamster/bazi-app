import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildPromptContext } from './generate-report'
import { createAdminClient } from '@/lib/supabase/server'
import type { PromptContext } from './structured-prompt'

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_OUTPUT_TOKENS = 4096
const TIMEOUT_MS = 90_000

const LANG_NAME: Record<string, string> = {
  'en':    'English',
  'zh-CN': '简体中文 (Simplified Chinese)',
  'zh-TW': '繁體中文 (Traditional Chinese)',
}

// ── Helpers (mirrors generate-question.ts — both unexported there) ─────────────

function formatContextForPrompt(ctx: PromptContext): string {
  const hourStr = ctx.isThreePillar
    ? 'unknown (3-pillar chart)'
    : (ctx.pillars.hour ?? '?')

  const dayunStr = ctx.currentDayun
    ? `${ctx.currentDayun.ganZhi} (age ${ctx.currentDayun.startAge}–${ctx.currentDayun.endAge}, ${ctx.currentDayun.startYear}–${ctx.currentDayun.endYear})`
    : 'Not yet active'

  const liuNianStr = ctx.currentLiuNian
    ? `${ctx.currentLiuNian.ganZhi} (${ctx.currentLiuNian.year})`
    : 'unknown'

  return [
    `Day Master: ${ctx.dayMaster} (${ctx.dayMasterElement})`,
    `Four Pillars: Year ${ctx.pillars.year} | Month ${ctx.pillars.month} | Day ${ctx.pillars.day} | Hour ${hourStr}`,
    `Five Elements: Wood ${ctx.fiveElements.wood} | Fire ${ctx.fiveElements.fire} | Earth ${ctx.fiveElements.earth} | Metal ${ctx.fiveElements.metal} | Water ${ctx.fiveElements.water}`,
    `Current Luck Pillar (大运): ${dayunStr}`,
    `Current Year (流年): ${liuNianStr}`,
    `Zodiac: ${ctx.userZodiac.zh} (${ctx.userZodiac.en})`,
    `Tai Sui: ${ctx.taiSuiStatus}`,
    `Age: ~${ctx.approxAge}`,
  ].join('\n')
}

function extractTodayDailyReadingIfFresh(
  profile: Record<string, unknown>
): string | null {
  const todayStr = new Date().toISOString().slice(0, 10)
  const cached = profile.daily_reading as { date?: string; content?: string } | null
  const status = profile.daily_reading_status as string | null
  if (cached?.date === todayStr && status === 'done' && typeof cached.content === 'string') {
    return cached.content
  }
  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateChatReply(assistantMessageId: string): Promise<void> {
  const adminClient = createAdminClient()

  // Mark generating immediately so the UI shows the spinner
  await adminClient
    .from('messages')
    .update({ status: 'generating' })
    .eq('id', assistantMessageId)

  try {
    // 1. Fetch the assistant message placeholder
    const { data: assistantMsg, error: aErr } = await adminClient
      .from('messages')
      .select('id, conversation_id, turn_number')
      .eq('id', assistantMessageId)
      .single()
    if (aErr || !assistantMsg) throw new Error(`Assistant message not found: ${aErr?.message ?? 'no row'}`)

    // 2. Fetch conversation (for profile_id + locale + title)
    const { data: conversation, error: cErr } = await adminClient
      .from('conversations')
      .select('id, profile_id, locale, title')
      .eq('id', assistantMsg.conversation_id)
      .single()
    if (cErr || !conversation) throw new Error(`Conversation not found: ${cErr?.message ?? 'no row'}`)

    // 3. Fetch profile for chart context
    const { data: profile, error: pErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', conversation.profile_id)
      .single()
    if (pErr || !profile) throw new Error(`Profile not found: ${pErr?.message ?? 'no row'}`)

    // 4. Fetch all messages in conversation, in display order
    const { data: allMessages, error: mErr } = await adminClient
      .from('messages')
      .select('id, role, content, turn_number, created_at, status')
      .eq('conversation_id', conversation.id)
      .order('turn_number', { ascending: true })
      .order('created_at', { ascending: true })
    if (mErr) throw new Error(`Failed to fetch messages: ${mErr.message}`)

    // Build conversation history — exclude the current pending/generating assistant row.
    // For any prior failed assistant rows (edge case), substitute placeholder text
    // so the user/model alternation pattern stays intact for the Gemini API.
    const history = (allMessages ?? [])
      .filter((m) => m.id !== assistantMessageId)
      .map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: (m.content as string) || '[no response]' }],
      }))

    // 5. Build chart context and system instruction
    const ctx = buildPromptContext(profile as Record<string, unknown>)
    const chartContext = formatContextForPrompt(ctx)
    const todayDailyReading = extractTodayDailyReadingIfFresh(profile as Record<string, unknown>)
    const langName = LANG_NAME[conversation.locale as string] ?? LANG_NAME['en']

    const systemInstruction = `You are an experienced 八字 (Chinese Bazi) destiny reader for the Bazi Master app. You are in an ongoing conversation with the user about their destiny chart. Answer the user's latest question grounded in their actual chart, while staying coherent with the prior conversation.

Constraints:
- 200-400 words per reply, in markdown
- Maximum 3 paragraphs (or 3 short ## sections if structure helps)
- Ground every claim in the user's actual chart elements (day master, four pillars, current luck pillar, year pillar). Reference specific stems/branches when relevant.
- Naturally reference earlier topics in this conversation when relevant — do not restart fresh each turn.
- Stay on topic: bazi, fate, fortune, career, marriage, health, family, timing, related life topics. If the user asks something off-topic (coding help, current news, math), politely decline in 1-2 sentences and redirect.
- Do NOT write poems
- Do NOT invent chart elements not present in the context
- Tone: contemplative, classical, but accessible. Measured, not flashy.

Output language: ${langName}.

User's birth chart:
${chartContext}
${todayDailyReading ? `\nToday's daily reading (for reference — do not repeat verbatim):\n${todayDailyReading}\n` : ''}`

    // 6. Call Gemini with multi-turn contents array + system instruction in config
    const geminiPromise = gemini.models.generateContent({
      model: MODEL,
      contents: history,
      config: {
        systemInstruction,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      },
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Gemini call timed out after ${TIMEOUT_MS}ms`)),
        TIMEOUT_MS
      )
    )

    const result = await Promise.race([geminiPromise, timeoutPromise])
    const answer = result.text?.trim() ?? ''
    if (answer.length < 10) throw new Error('Gemini response missing or too short')

    // 7. Write the reply back
    await adminClient
      .from('messages')
      .update({ status: 'done', content: answer, error: null })
      .eq('id', assistantMessageId)

    // 8. Bump conversation.updated_at
    await adminClient
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id)

    // 9. First-turn title generation — fire-and-forget, silent on failure
    const isFirstTurn = (assistantMsg.turn_number as number) === 1
    const hasDefaultTitle = (conversation.title as string) === 'New conversation'
    if (isFirstTurn && hasDefaultTitle) {
      const { generateConversationTitle } = await import('./generate-conversation-title')
      generateConversationTitle(conversation.id as string).catch(() => { /* silent */ })
    }
  } catch (err) {
    console.error('[generate-chat-reply] CAUGHT', assistantMessageId, err)
    await adminClient
      .from('messages')
      .update({
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      .eq('id', assistantMessageId)
  }
}
