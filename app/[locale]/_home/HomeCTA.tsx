import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function HomeCTA() {
  const t = await getTranslations('home.cta')

  return (
    <section style={{
      padding: 'clamp(64px, 10vw, 128px) 32px',
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      background: 'var(--zen-paper-deep)',
    }}>
      {/* Big title */}
      <h2 style={{
        fontFamily: 'var(--font-seal)',
        fontSize: 'clamp(36px, 6vw, 48px)',
        fontWeight: 500,
        color: '#1a1a1a',
        margin: '0 0 8px',
        letterSpacing: '0.05em',
      }}>
        {t('title')}
      </h2>

      {/* Accent divider */}
      <div style={{
        width: '60px',
        height: '1px',
        background: 'var(--zen-red)',
        margin: '0 auto 48px',
      }} />

      {/* Primary CTA */}
      <Link
        href="/login"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 500,
          background: 'var(--zen-red)',
          color: 'white',
          padding: '14px 32px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {t('primaryCTA')}
      </Link>

      {/* Sub text */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        marginTop: '16px',
        marginBottom: 0,
      }}>
        {t('subText')}
      </p>
    </section>
  )
}
