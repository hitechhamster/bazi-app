'use server'

import { after } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateQuestionAnswer } from '@/lib/ai/generate-question'

export async function submitQuestion(
  profileId: string,
  questionText: string
): Promise<{ questionId: string } | { error: string }> {
  const trimmed = questionText.trim()
  if (!trimmed) return { error: 'Question cannot be empty' }
  if (trimmed.length > 500) return { error: 'Question too long (max 500 chars)' }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('questions')
    .insert({
      profile_id: profileId,
      question: trimmed,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Insert failed' }

  // Fire-and-forget — do NOT call createClient() or cookies() inside after()
  after(() => {
    generateQuestionAnswer(data.id)
  })

  return { questionId: data.id }
}
