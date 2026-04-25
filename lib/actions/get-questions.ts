'use server'

import { createClient } from '@/lib/supabase/server'

export interface QuestionRow {
  id: string
  question: string
  answer: string | null
  status: 'pending' | 'generating' | 'done' | 'failed'
  error: string | null
  created_at: string
}

export async function getQuestionsForProfile(
  profileId: string
): Promise<{ questions: QuestionRow[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('id, question, answer, status, error, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, questions: [] }
  return { questions: (data ?? []) as QuestionRow[] }
}

export async function getQuestionStatus(
  questionId: string
): Promise<{ question?: Pick<QuestionRow, 'id' | 'status' | 'answer' | 'error'>; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('id, status, answer, error')
    .eq('id', questionId)
    .single()

  if (error) return { error: error.message }
  return { question: data as Pick<QuestionRow, 'id' | 'status' | 'answer' | 'error'> }
}
