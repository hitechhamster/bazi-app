/**
 * Returns a locale-aware path.
 * For the default locale ('en'), no prefix is added (matching localePrefix: 'as-needed').
 * For all other locales, a /<locale> prefix is prepended.
 *
 * Usage:
 *   localePath('en', '/dashboard')     → '/dashboard'
 *   localePath('zh-CN', '/dashboard')  → '/zh-CN/dashboard'
 */
export function localePath(locale: string, path: string): string {
  if (locale === 'en') return path
  return `/${locale}${path}`
}
