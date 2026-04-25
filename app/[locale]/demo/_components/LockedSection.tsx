import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

interface Props {
  title: string
  description: string
}

export default async function LockedSection({ title, description }: Props) {
  const t = await getTranslations('demo')

  return (
    <div style={{
      paddingTop: '48px',
      paddingBottom: '48px',
      borderTop: '1px solid var(--zen-gold-pale)',
    }}>
      {/* Section heading — mirrors home page section style */}
      <h2 style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '24px',
        fontWeight: 500,
        color: '#1a1a1a',
        margin: '0 0 8px',
        letterSpacing: '0.05em',
      }}>
        {title}
      </h2>
      <div style={{
        width: '60px',
        height: '1px',
        background: 'var(--zen-red)',
        marginBottom: '24px',
      }} />

      {/* Lock card */}
      <div style={{
        background: 'var(--zen-paper-deep)',
        border: '1px dashed var(--zen-gold-pale)',
        padding: '48px',
        textAlign: 'center',
      }}>
        {/* Understated "locked" indicator — three dots with letter spacing */}
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '16px',
          color: '#854F0B',
          letterSpacing: '0.4em',
          marginBottom: '20px',
          opacity: 0.6,
        }}>
          · · ·
        </div>

        {/* Lock message */}
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          color: '#1a1a1a',
          fontWeight: 500,
          margin: '0 0 12px',
        }}>
          {title}
        </p>

        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '13px',
          color: 'var(--zen-text-muted)',
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto 24px',
        }}>
          {description}
        </p>

        <Link
          href="/login"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
            background: 'var(--zen-red)',
            color: 'white',
            padding: '12px 28px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {t('unlockCTA')}
        </Link>
      </div>
    </div>
  )
}
