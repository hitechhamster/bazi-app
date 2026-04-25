import 'server-only'
import { ThinkingLevel } from '@google/genai'
import gemini from './gemini-client'
import { buildPromptContext } from './generate-report'
import { createAdminClient } from '@/lib/supabase/server'
import type { PromptContext } from './structured-prompt'

const LANG_INSTRUCTION: Record<string, string> = {
  'en':    'Write your answer in clear, professional English.',
  'zh-CN': '请用专业且温暖的简体中文回答。',
  'zh-TW': '請用專業且溫暖的繁體中文回答。',
}

const MODEL = 'gemini-3.1-flash-lite-preview'
const MAX_OUTPUT_TOKENS = 8192

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/**
 * Checks if today's daily reading is still fresh (same calendar day, status done).
 * Mirrors the cache check in app/profiles/[id]/almanac/page.tsx.
 */
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

async function callGeminiForAnswer(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await gemini.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      })
      const text = result.text?.trim() ?? ''
      if (text.length < 20) throw new Error('Answer response missing or too short')
      return text
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error('Unreachable')
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateQuestionAnswer(questionId: string): Promise<void> {
  const db = createAdminClient()

  // 1. Mark generating
  await db
    .from('questions')
    .update({ status: 'generating' })
    .eq('id', questionId)

  try {
    // 2. Fetch the question (include locale — captured at submit time)
    const { data: question, error: qErr } = await db
      .from('questions')
      .select('id, profile_id, question, locale')
      .eq('id', questionId)
      .single()

    if (qErr || !question) throw new Error('Question not found')

    const locale = (question.locale as string | null) ?? 'en'
    const langInstruction = LANG_INSTRUCTION[locale] ?? LANG_INSTRUCTION['en']

    // 3. Fetch the profile
    const { data: profile, error: pErr } = await db
      .from('profiles')
      .select('*')
      .eq('id', question.profile_id)
      .single()

    if (pErr || !profile) throw new Error('Profile not found')

    // 4. Build prompt context (reuse exported helper from generate-report.ts)
    const ctx = buildPromptContext(profile as Record<string, unknown>)
    const chartContext = formatContextForPrompt(ctx)

    // 5. Today's daily reading, if available and fresh
    const todayDailyReading = extractTodayDailyReadingIfFresh(
      profile as Record<string, unknown>
    )

    // 6. Build the full prompt
    const prompt = `You are a 八字 (Chinese Bazi) destiny reader for the Bazi Master app.

Answer the user's question about their destiny chart. The question must relate to bazi, fate, fortune, career, marriage, health, family, timing, or related life topics. If the question is off-topic (e.g. coding help, current news, math), politely decline in 1-2 sentences and suggest the user ask something about their chart instead.

Constraints:
- 200-400 words total, in markdown
- Maximum 3 paragraphs (or 3 short ## sections if structure helps)
- Ground every claim in the user's actual chart elements (day master, four pillars, current luck pillar, year pillar). Reference specific stems/branches when relevant.
- Do NOT write poems
- Do NOT invent chart elements not present in the context
- Tone: contemplative, classical, but accessible. Measured, not flashy.
- ${langInstruction}

## User's Birth Chart

${chartContext}
${todayDailyReading ? `\n## Today's Daily Reading (for reference — do not repeat verbatim)\n\n${todayDailyReading}\n` : ''}
## User's Question

${question.question}`

    // 7. Call the model
    const answer = await callGeminiForAnswer(prompt)

    // 8. Write back
    await db
      .from('questions')
      .update({ status: 'done', answer })
      .eq('id', questionId)

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[generate-question] Failed:', errorMsg)
    await db
      .from('questions')
      .update({ status: 'failed', error: errorMsg })
      .eq('id', questionId)
  }
}
