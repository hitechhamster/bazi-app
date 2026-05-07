import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import LoginForm from './_components/LoginForm'
import { localePath } from '@/lib/i18n/path'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'login' })

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--zen-paper)' }}
    >
      {/* Decorative circle — matches home page */}
      <div className="zen-circle-bg" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        {/* BrandMark — prominent above card */}
        <div style={{ marginBottom: '64px' }}>
          <BrandMark variant="full" size="default" href={localePath(locale, '/')} />
        </div>

        {/* Login card */}
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--zen-paper)',
            border: '1px solid var(--zen-gold-pale)',
            padding: '48px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-main)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--zen-ink)',
              letterSpacing: '0.05em',
              margin: '0 0 8px',
              textAlign: 'center',
            }}
          >
            {t('title')}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-text-muted)',
              margin: '0 0 32px',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {t('subtitle')}
          </p>

          <LoginForm locale={locale} />
        </div>

        {/* Back to home */}
        <div style={{ marginTop: '32px' }}>
          <Link
            href={localePath(locale, '/')}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: '#854F0B',
              textDecoration: 'underline',
            }}
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
