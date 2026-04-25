import { getTranslations } from 'next-intl/server'

export default async function HomeWhatIsBazi() {
  const t = await getTranslations('home.what')

  return (
    <section style={{
      padding: 'clamp(48px, 8vw, 96px) 32px',
      position: 'relative',
      zIndex: 10,
      background: 'var(--zen-paper-deep)',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Section title */}
        <h2 style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '32px',
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
          marginBottom: '48px',
        }} />

        {/* Three explanatory paragraphs */}
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--zen-ink)',
          margin: '0 0 24px',
        }}>
          {t('p1')}
        </p>
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--zen-ink)',
          margin: '0 0 24px',
        }}>
          {t('p2')}
        </p>
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--zen-ink)',
          margin: '0 0 32px',
        }}>
          {t('p3')}
        </p>

        {/* Transition arrow */}
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '24px',
          color: '#854F0B',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          ↓
        </div>

        {/* Bridge text */}
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'var(--zen-text-muted)',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {t('bridge')}
        </p>
      </div>
    </section>
  )
}
