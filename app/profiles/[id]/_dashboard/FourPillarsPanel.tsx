// Dashboard 模块：four pillars grid with tianGan/diZhi cards — Stage 2 Batch 2A (mock data)
import type { MockData, MockPillar } from './mock-data'

const PILLAR_LABELS = ['Year', 'Month', 'Day', 'Hour']
const PILLAR_ZH = ['年柱', '月柱', '日柱', '时柱']

export default function FourPillarsPanel({ data }: { data: MockData }) {
  const entries = [
    data.pillars.year,
    data.pillars.month,
    data.pillars.day,
    data.pillars.hour,
  ]

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '24px',
    }}>
      <div style={sectionLabelStyle}>Four Pillars · 四柱</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginTop: '16px',
      }}>
        {entries.map((pillar, i) => (
          <PillarCard
            key={PILLAR_LABELS[i]}
            pillar={data.isTimeUnknown && i === 3 ? null : pillar}
            label={PILLAR_LABELS[i]}
            labelZh={PILLAR_ZH[i]}
            isDay={i === 2}
          />
        ))}
      </div>
    </div>
  )
}

function PillarCard({
  pillar,
  label,
  labelZh,
  isDay,
}: {
  pillar: MockPillar | null
  label: string
  labelZh: string
  isDay: boolean
}) {
  if (!pillar) {
    return (
      <div style={{
        ...cardBase,
        background: '#f5f5f5',
        border: '1px dashed var(--zen-border)',
        opacity: 0.6,
      }}>
        <div style={tianGanStyle}>?</div>
        <div style={{ ...diZhiStyle, color: 'var(--zen-text-muted)' }}>?</div>
        <div style={labelStyle}>{label}</div>
        <div style={labelZhStyle}>{labelZh}</div>
      </div>
    )
  }

  return (
    <div style={{
      ...cardBase,
      background: isDay ? 'var(--zen-gold-pale)' : 'linear-gradient(135deg, #fff 0%, #faf9f7 100%)',
      border: isDay ? '1px solid var(--zen-gold)' : '1px solid rgba(188, 45, 45, 0.2)',
      boxShadow: isDay ? '0 2px 8px rgba(184,134,11,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ ...tianGanStyle, color: isDay ? 'var(--zen-gold)' : 'var(--zen-ink)' }}>
        {pillar.tianGan}
      </div>
      <div style={{ ...diZhiStyle, color: pillar.diZhiColor }}>
        {pillar.diZhi}
      </div>
      <div style={labelStyle}>{label}</div>
      <div style={labelZhStyle}>{labelZh}</div>
    </div>
  )
}

const cardBase: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px 8px',
  borderRadius: '4px',
}

const tianGanStyle: React.CSSProperties = {
  fontFamily: 'var(--font-seal)',
  fontSize: '1.8rem',
  fontWeight: 700,
  letterSpacing: '2px',
  lineHeight: 1,
  marginBottom: '8px',
}

const diZhiStyle: React.CSSProperties = {
  fontFamily: 'var(--font-seal)',
  fontSize: '1.4rem',
  fontWeight: 700,
  letterSpacing: '2px',
  lineHeight: 1,
  marginBottom: '10px',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--zen-text-muted)',
}

const labelZhStyle: React.CSSProperties = {
  fontFamily: 'var(--font-seal)',
  fontSize: '11px',
  color: 'var(--zen-text-muted)',
  marginTop: '2px',
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  color: 'var(--zen-ink)',
  borderBottom: '2px solid var(--zen-gold)',
  paddingBottom: '6px',
  display: 'inline-block',
}
