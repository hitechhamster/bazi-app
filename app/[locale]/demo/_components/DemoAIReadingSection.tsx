import { getTranslations } from 'next-intl/server'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'

interface Props {
  report: string
}

export default async function DemoAIReadingSection({ report }: Props) {
  const t = await getTranslations('demo')

  return (
    <section style={{
      paddingTop: '48px',
      paddingBottom: '48px',
      borderTop: '1px solid var(--zen-gold-pale)',
    }}>
      {/* Section heading — mirrors LockedSection title styling */}
      <h2 style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '24px',
        fontWeight: 500,
        color: '#1a1a1a',
        margin: '0 0 8px',
        letterSpacing: '0.05em',
      }}>
        {t('aiReportTitle')}
      </h2>
      <div style={{
        width: '60px',
        height: '1px',
        background: 'var(--zen-red)',
        marginBottom: '32px',
      }} />

      {/* Sample-chart hint banner */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: '#854F0B',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '12px 16px',
        marginBottom: '24px',
        backgroundColor: 'var(--zen-paper-deep)',
        border: '1px solid var(--zen-gold-pale)',
        letterSpacing: '0.05em',
      }}>
        {t('sampleHint')}
      </div>

      {/* Rendered markdown report */}
      <div
        className="ai-content-box"
        dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(report) }}
      />
    </section>
  )
}
