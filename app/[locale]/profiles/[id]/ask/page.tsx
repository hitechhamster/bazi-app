import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import AskSection from './_components/AskSection'
import { getQuestionsForProfile } from '@/lib/actions/get-questions'

export default async function AskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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

  const { questions } = await getQuestionsForProfile(id)

  return <AskSection profileId={id} initialQuestions={questions} />
}
