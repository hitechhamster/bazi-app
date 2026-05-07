import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { localePath } from '@/lib/i18n/path'

/**
 * Parse the locale from a locale-aware `next` path.
 * e.g. '/zh-CN/dashboard' → 'zh-CN', '/zh-TW/...' → 'zh-TW', anything else → 'en'
 */
function parseLocaleFromNext(next: string): string {
  if (next.startsWith('/zh-CN')) return 'zh-CN'
  if (next.startsWith('/zh-TW')) return 'zh-TW'
  return 'en'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? localePath('en', '/dashboard')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Failure: redirect to the locale-aware login page
  const locale = parseLocaleFromNext(next)
  return NextResponse.redirect(
    `${origin}${localePath(locale, '/login?error=auth')}`
  )
}
