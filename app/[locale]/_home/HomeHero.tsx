import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function HomeHero() {
  const t = await getTranslations('home.hero')

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
    }}>
      {/* Big brand character */}
      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: 'clamp(64px, 12vw, 96px)',
        color: 'var(--zen-red)',
        letterSpacing: '0.1em',
        fontWeight: 500,
        lineHeight: 1,
      }}>
        {t('brandLine1')}
      </div>

      {/* Divider */}
      <div style={{
        width: '80px',
        height: '1px',
        background: 'var(--zen-red)',
        margin: '16px auto',
      }} />

      {/* BAZI MASTER label */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '14px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#854F0B',
        fontWeight: 500,
        marginBottom: '48px',
      }}>
        {t('brandLine2')}
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: 'var(--font-main)',
        fontSize: '16px',
        color: 'var(--zen-ink)',
        margin: '0 0 48px',
        maxWidth: '480px',
        lineHeight: 1.6,
      }}>
        {t('tagline')}
      </p>

      {/* Dual CTAs */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '64px',
      }}>
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
        <Link
          href="/demo"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
            background: 'transparent',
            color: '#854F0B',
            border: '1px solid #854F0B',
            padding: '14px 32px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {t('secondaryCTA')}
        </Link>
      </div>

      {/* Scroll hint */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.05em',
      }}>
        ↓ {t('scrollHint')}
      </div>
    </section>
  )
}
