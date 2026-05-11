import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import AskSection from './_components/AskSection'
import { getQuestionsForProfile } from '@/lib/actions/get-questions'
import { canAskQuestion } from '@/lib/subscription/tier'

export default async function AskPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

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

  const [questionsResult, askStatus] = await Promise.all([
    getQuestionsForProfile(id),
    canAskQuestion(user.id),
  ])

  const { questions } = questionsResult
  // Infinity cannot be serialized SSR→client — use -1 as sentinel for "unlimited"
  const askLimit = askStatus.limit === Infinity ? -1 : (askStatus.limit as number)

  return (
    <AskSection
      profileId={id}
      initialQuestions={questions}
      askUsed={askStatus.used}
      askLimit={askLimit}
      locale={locale}
    />
  )
}
