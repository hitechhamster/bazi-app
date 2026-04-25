import { getTranslations } from 'next-intl/server'
import BrandMark from '@/components/BrandMark'

export default async function HomeFooter() {
  const t = await getTranslations('home.footer')

  return (
    <footer style={{
      borderTop: '1px solid var(--zen-gold-pale)',
      padding: '48px 32px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Brand + disclaimer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <BrandMark variant="full" size="small" />
          <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: '13px',
            color: 'var(--zen-text-muted)',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: 0,
          }}>
            {t('disclaimer')}
          </p>
        </div>

        {/* Bottom row: links left, copyright right */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: '#854F0B',
                textDecoration: 'underline',
              }}
            >
              {t('privacy')}
            </a>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
              {' '}·{' '}
            </span>
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: '#854F0B',
                textDecoration: 'underline',
              }}
            >
              {t('terms')}
            </a>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
              {' '}·{' '}
            </span>
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: '#854F0B',
                textDecoration: 'underline',
              }}
            >
              {t('contact')}
            </a>
          </div>

          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-text-muted)',
          }}>
            {t('copyright')}
          </span>
        </div>
      </div>
    </footer>
  )
}
