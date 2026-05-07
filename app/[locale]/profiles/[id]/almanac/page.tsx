import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { after } from 'next/server'
import AlmanacSection from './_components/AlmanacSection'
import { type DailyReading, type DailyStatus } from '../actions'
import { generateDailyReading } from '@/lib/ai/generate-daily'
import { createAdminClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'

export default async function AlmanacPage({
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
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()
  if ((profile.user_id as string) !== user.id) notFound()

  // Cache check: only skip trigger if today's reading is already done
  const todayStr = new Date().toISOString().slice(0, 10)
  const cached = profile.daily_reading as { date?: string } | null
  const alreadyDone =
    cached?.date === todayStr &&
    (profile.daily_reading_status as string) === 'done'

  if (!alreadyDone && profile.daily_reading_status !== 'generating') {
    // Pre-mark generating BEFORE after() — within request context where DB write is fine.
    // after() then runs the AI call without needing cookies/auth.
    const admin = createAdminClient()
    await admin.from('profiles')
      .update({ daily_reading_status: 'pending', daily_reading_error: null })
      .eq('id', id)

    // Capture locale before after() — getLocale() reads request context, unavailable in after()
    const locale = await getLocale()
    after(async () => {
      try {
        await generateDailyReading(id, locale)
      } catch (err) {
        console.error('[almanac/page] generateDailyReading failed:', err)
      }
    })
  }

  const initialStatus = ((profile.daily_reading_status as string) ?? 'pending') as DailyStatus
  const initialReading = alreadyDone ? (profile.daily_reading as DailyReading) : null

  return (
    <AlmanacSection
      profileId={id}
      initialStatus={initialStatus}
      initialReading={initialReading}
    />
  )
}
