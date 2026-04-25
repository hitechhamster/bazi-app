'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export type Locale = 'en' | 'zh-CN' | 'zh-TW'

const VALID_LOCALES: Locale[] = ['en', 'zh-CN', 'zh-TW']

export async function getUserLocale(): Promise<Locale> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'en'

  const { data, error } = await supabase
    .from('user_preferences')
    .select('locale')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return 'en' // no row yet = default English
  return data.locale as Locale
}

export async function setUserLocale(
  locale: Locale
): Promise<{ ok: true } | { error: string }> {
  if (!VALID_LOCALES.includes(locale)) {
    return { error: 'Invalid locale' }
  }

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        locale,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message }
  return { ok: true }
}
