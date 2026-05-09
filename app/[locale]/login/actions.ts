'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { localePath } from '@/lib/i18n/path'

/** Derive the app origin from request headers (works on Vercel + local). */
async function getAppOrigin(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  return `${proto}://${host}`
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return {}
}

export async function signUpWithPassword(
  email: string,
  password: string,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = await getAppOrigin()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${localePath(locale, '/dashboard')}`,
    },
  })
  if (error) return { error: error.message }

  // 防御：Supabase 在 Confirm email = ON 时仍可能设 session
  // 强制清掉未确认邮箱用户的 session，确保不能进 app
  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut()
  }

  return {}
}

export async function sendMagicLink(
  email: string,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = await getAppOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${localePath(locale, '/dashboard')}`,
    },
  })
  if (error) return { error: error.message }
  return {}
}
