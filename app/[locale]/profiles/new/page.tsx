import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'
import ProfileForm from './ProfileForm'

export default async function NewProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  return <ProfileForm locale={locale} />
}
