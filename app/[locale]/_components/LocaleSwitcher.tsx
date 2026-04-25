'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LOCALE_LABELS: Record<string, string> = {
  'en': 'EN',
  'zh-CN': '简',
  'zh-TW': '繁',
}

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname() // locale-stripped path from next-intl

  function switchLocale(next: string) {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  return (
    <div style={{ display: 'flex', border: '1px solid var(--zen-gold-pale)' }}>
      {routing.locales.map((loc, i) => {
        const active = loc === locale
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            style={{
              padding: '4px 8px',
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              border: 'none',
              borderRight: i < routing.locales.length - 1 ? '1px solid var(--zen-gold-pale)' : 'none',
              background: active ? '#854F0B' : 'transparent',
              color: active ? 'white' : '#854F0B',
              cursor: active ? 'default' : 'pointer',
              transition: 'background 0.15s ease',
              lineHeight: 1,
            }}
          >
            {LOCALE_LABELS[loc]}
          </button>
        )
      })}
    </div>
  )
}
