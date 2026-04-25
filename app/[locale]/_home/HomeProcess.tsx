import { getTranslations } from 'next-intl/server'

export default async function HomeProcess() {
  const t = await getTranslations('home.process')

  const steps = [
    { num: '1', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', title: t('step3Title'), desc: t('step3Desc') },
    { num: '4', title: t('step4Title'), desc: t('step4Desc') },
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

        {/* Accent divider */}
        <div style={{
          width: '60px',
          height: '1px',
          background: 'var(--zen-red)',
          marginBottom: '48px',
        }} />

        {/* 4 steps — horizontal desktop, wraps on mobile */}
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          marginBottom: '32px',
        }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                flex: '1 1 140px',
                maxWidth: '200px',
                minWidth: '120px',
              }}
            >
              {/* Step number circle — 50% radius is the single allowed exception */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--zen-red)',
                color: 'white',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {step.num}
              </div>

              {/* Step title */}
              <div style={{
                fontFamily: 'var(--font-main)',
                fontSize: '14px',
                color: '#1a1a1a',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {step.title}
              </div>

              {/* Step description */}
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--zen-text-muted)',
                textAlign: 'center',
                maxWidth: '140px',
                lineHeight: 1.5,
              }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal separator */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'var(--zen-gold-pale)',
          marginBottom: '32px',
        }} />

        {/* Footnote */}
        {/* TODO: highlight key terms (《渊海子平》, 真太阳时 / true solar time) in deep gold */}
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '14px',
          lineHeight: 1.8,
          color: 'var(--zen-ink)',
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {t('footnote')}
        </p>
      </div>
    </section>
  )
}
