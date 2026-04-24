// Dashboard 模块：special palaces (神煞) four-cell grid — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

export default function SpecialPalacesStrip({ data }: { data: MockData }) {
  const palaces = [
    data.specialPalaces.peachBlossom,
    data.specialPalaces.tianYi,
    data.specialPalaces.wenchang,
    data.specialPalaces.driveHorse,
  ]

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '24px',
    }}>
      <div style={sectionLabelStyle}>Special Stars · 神煞</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '16px',
      }}>
        {palaces.map((palace) => (
          <PalaceCell key={palace.label} label={palace.label} ganZhi={palace.ganZhi} />
        ))}
      </div>
    </div>
  )
}

function PalaceCell({ label, ganZhi }: { label: string; ganZhi: string }) {
  return (
    <div style={{
      background: 'var(--zen-paper-deep)',
      border: '1px solid var(--zen-border)',
      padding: '14px 16px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: 'var(--zen-red)',
        letterSpacing: '3px',
        marginBottom: '6px',
        lineHeight: 1,
      }}>
        {ganZhi}
      </div>
      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '12px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '2px',
      }}>
        {label}
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  color: 'var(--zen-ink)',
  borderBottom: '2px solid var(--zen-gold)',
  paddingBottom: '6px',
  display: 'inline-block',
}
