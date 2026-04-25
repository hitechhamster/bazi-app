import type { MockData } from './mock-data'

export default function TenGodsDistribution({ data }: { data: MockData }) {
  return (
    <div style={cardStyle}>
      <div style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>
        TEN GODS DISTRIBUTION · 十神分布
      </div>
      <div style={{
        display: 'flex',
        width: '100%',
        height: '22px',
        borderRadius: '0',
        overflow: 'hidden',
      }}>
        {data.tenGods.map(g => (
          <div
            key={g.key}
            style={{
              flex: g.count,
              background: g.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-seal)',
              fontSize: '11px',
            }}
          >
            {g.label} ×{g.count}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '6px',
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-ink)',
        fontWeight: 500,
      }}>
        {data.tenGods.map(g => (
          <span key={g.key}>{g.labelEn}</span>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--zen-paper)',
  border: '0.5px solid rgba(188,45,45,0.12)',
  borderRadius: '0',
  padding: '10px',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-ink)',
  fontWeight: 500,
  textTransform: 'uppercase',
}
