import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export default async function HomeFeatures() {
  const t = await getTranslations('home.features')

  const cards = [
    {
      img: '/screenshots/chart.png',
      caption: t('card1Caption'),
      title: t('card1Title'),
      desc: t('card1Desc'),
    },
    {
      img: '/screenshots/report.png',
      caption: t('card2Caption'),
      title: t('card2Title'),
      desc: t('card2Desc'),
    },
    {
      img: '/screenshots/chat.png',
      caption: t('card3Caption'),
      title: t('card3Title'),
      desc: t('card3Desc'),
    },
  ]

  return (
    <section style={{
      padding: 'clamp(48px, 8vw, 96px) 32px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

        {/* Zen-red accent divider */}
        <div style={{
          width: '60px',
          height: '1px',
          background: 'var(--zen-red)',
          marginBottom: '48px',
        }} />

        {/* 3-column card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}>
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                border: '1px solid var(--zen-gold-pale)',
                background: 'white',
              }}
            >
              {/* Screenshot — 2:1 aspect ratio */}
              <div style={{
                aspectRatio: '2 / 1',
                position: 'relative',
                borderBottom: '1px solid var(--zen-gold-pale)',
              }}>
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Card text */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#854F0B',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}>
                  {card.caption}
                </div>
                <div style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '16px',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  marginBottom: '12px',
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  color: 'var(--zen-text-muted)',
                  lineHeight: 1.6,
                }}>
                  {card.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Also note */}
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '13px',
          fontStyle: 'italic',
          color: 'var(--zen-text-muted)',
          textAlign: 'center',
          margin: 0,
        }}>
          {t('alsoNote')}
        </p>
      </div>
    </section>
  )
}
