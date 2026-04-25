import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest } from 'next/server'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. Run intl middleware first — handles locale detection, prefix redirects, rewrites
  const response = intlMiddleware(request)

  // 2. Apply Supabase session refresh on top of the intl response.
  //    Cookie setters write directly onto `response` (the intl response) instead of
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
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 刷新过期的 session
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Exclude: /api, /auth, /_next internals, static files with extensions
    '/((?!api|auth|_next|_vercel|.*\\..*).*)',
  ],
}
