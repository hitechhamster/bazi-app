import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' })

  return (
    <footer
      style={{
        borderTop: '1px solid #e7e5e4',
        fontFamily: 'var(--font-ui)',
        fontWeight: 400,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">

          {/* Left: legal links */}
          <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link
              href={localePath(locale, '/legal/privacy')}
              className="text-[12px] text-stone-600 hover:text-stone-900 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              {t('privacy')}
            </Link>
            <Link
              href={localePath(locale, '/legal/terms')}
              className="text-[12px] text-stone-600 hover:text-stone-900 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              {t('terms')}
            </Link>
            <Link
              href={localePath(locale, '/legal/disclaimer')}
              className="text-[12px] text-stone-600 hover:text-stone-900 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              {t('disclaimer')}
            </Link>
          </nav>

          {/* Right: copyright + contact */}
          <p style={{ fontSize: '11px', color: '#78716c', margin: 0 }}>
            © {new Date().getFullYear()} Bazi Master ·{' '}
            <a
              href="mailto:contact@bazi-master.com"
              className="hover:text-stone-700 transition-colors"
              style={{ color: '#78716c', textDecoration: 'none' }}
            >
              contact@bazi-master.com
            </a>
          </p>

        </div>
      </div>
    </footer>
  )
}
