import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing)

// Locale prefixes used by this app (en is default with no prefix)
const LOCALE_PREFIX_RE = /^\/(zh-CN|zh-TW)/

// Paths that anyone can access regardless of auth state.
// Matched against the logical path (locale prefix stripped).
const PUBLIC_PATHS = new Set(['/', '/demo', '/login'])

function isPublicPath(logicalPath: string): boolean {
  return (
    PUBLIC_PATHS.has(logicalPath) ||
    logicalPath.startsWith('/auth/') ||
    logicalPath.startsWith('/api/')
  )
}

export async function proxy(request: NextRequest) {
  // 1. Run intl middleware first — handles locale detection, prefix redirects, rewrites
  const intlResponse = intlMiddleware(request)

  // 2. Apply Supabase session refresh on top of the intl response.
  //    Cookie setters write directly onto `intlResponse` (the intl response) instead of
  //    creating a fresh NextResponse.next() — this preserves intl redirects/rewrites.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 刷新过期的 session + 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  // 3. If intl middleware already issued a locale-normalization redirect, let it through.
  //    (e.g. /en/dashboard → /dashboard when en is the as-needed default locale)
  const { status } = intlResponse
  if (status === 301 || status === 302 || status === 307 || status === 308) {
    return intlResponse
  }

  // 4. Routing guard — determine logical path by stripping locale prefix
  const pathname = request.nextUrl.pathname
  const localeMatch = pathname.match(LOCALE_PREFIX_RE)
  const localePrefix = localeMatch?.[0] ?? ''          // '' | '/zh-CN' | '/zh-TW'
  const logicalPath = pathname.slice(localePrefix.length) || '/'

  if (user) {
    // Logged-in visitors: redirect / and /login straight to /dashboard
    if (logicalPath === '/' || logicalPath === '/login') {
      return NextResponse.redirect(
        new URL(`${localePrefix}/dashboard`, request.url)
      )
    }
    // All other paths: allow through
  } else {
    // Unauthenticated visitors: block protected paths, preserve locale on redirect
    if (!isPublicPath(logicalPath)) {
      return NextResponse.redirect(
        new URL(`${localePrefix}/login`, request.url)
      )
    }
    // Public paths: allow through
  }

  return intlResponse
}

export const config = {
  matcher: [
    // Exclude: /api, /auth, /_next internals, static files with extensions
    '/((?!api|auth|_next|_vercel|.*\\..*).*)',
  ],
}
