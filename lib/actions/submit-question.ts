'use server'

import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateQuestionAnswer } from '@/lib/ai/generate-question'
import { getLocale } from 'next-intl/server'
import { canAskQuestion } from '@/lib/subscription/tier'

export async function submitQuestion(
  profileId: string,
  questionText: string
): Promise<{ questionId: string } | { error: string }> {
  const trimmed = questionText.trim()
  if (!trimmed) return { error: 'Question cannot be empty' }
  if (trimmed.length > 500) return { error: 'Question too long (max 500 chars)' }

  // Auth check — get user to verify ownership + enforce quota
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify the profile belongs to this user
  const { data: profile } = await userClient
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .single()
  if (!profile) return { error: 'Profile not found' }

  // Quota gate
  const quota = await canAskQuestion(user.id)
  if (!quota.allowed) return { error: 'quota_exceeded' }

  // Capture locale from URL — authoritative for current request, locked at submission time
  const locale = await getLocale()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('questions')
    .insert({
      profile_id: profileId,
      question: trimmed,
      status: 'pending',
      locale,
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

export async function retryQuestion(
  questionId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('questions')
    .update({ status: 'pending', error: null, answer: null })
    .eq('id', questionId)

  if (error) return { error: error.message }

  after(() => {
    generateQuestionAnswer(questionId)
  })

  return { success: true }
}
