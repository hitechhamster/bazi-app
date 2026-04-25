import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function DemoBanner() {
  const t = await getTranslations('demo.banner')

  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      background: 'var(--zen-paper-deep)',
      borderBottom: '1px solid var(--zen-gold-pale)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
    }}>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.05em',
      }}>
        {t('text')}
      </span>

      <Link
        href="/login"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 500,
          background: 'var(--zen-red)',
          color: 'white',
          padding: '8px 20px',
          textDecoration: 'none',
          display: 'inline-block',
          flexShrink: 0,
        }}
      >
        {t('cta')}
      </Link>
    </div>
  )
}
