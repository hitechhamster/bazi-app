import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /auth routes
  // - /_next (Next.js internals)
  // - /favicon.ico, /sitemap.xml, etc.
  matcher: [
    '/((?!api|auth|_next|_vercel|.*\\..*).*)',
  ],
}
