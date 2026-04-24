// Dashboard 模块：left identity sidebar with decorative nav — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

const NAV_ITEMS = [
  { label: '命盘总览', zh: '命' },
  { label: '大运流年', zh: '运' },
  { label: '十神分布', zh: '神' },
  { label: 'AI 解读', zh: '读' },
]

export default function Sidebar({ data }: { data: MockData }) {
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Identity card */}
      <div style={{
        background: 'var(--zen-gold-pale)',
        border: '1px solid var(--zen-border)',
        padding: '24px 20px',
        textAlign: 'center',
      }}>
        {/* Zodiac character */}
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '3.2rem',
          color: 'var(--zen-red)',
          lineHeight: 1,
          marginBottom: '8px',
          letterSpacing: '2px',
        }}>
          {data.zodiac}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          Year of the {data.zodiacEn}
        </div>

        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '1.7rem',
          fontWeight: 700,
          color: 'var(--zen-ink)',
          letterSpacing: '6px',
          marginBottom: '12px',
        }}>
          {data.name}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={badgeStyle}>{data.relation}</span>
          <span style={badgeStyle}>{data.gender}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{
        background: 'var(--zen-paper)',
        border: '1px solid var(--zen-border)',
        padding: '16px 20px',
      }}>
        <StatRow label="Age" value={`~${data.approxAge}`} />
        <StatRow label="Birth City" value={data.birthCity} />
        <StatRow label="Day Master" value={`${data.dayMaster} · ${data.dayMasterElement}`} valueColor="var(--zen-red)" />
        <StatRow label="Strength" value={data.strength} />
        <StatRow label="Pattern" value={data.pattern} />
        <StatRow label="Tai Sui" value={data.taiSuiStatus} small />
      </div>

      {/* Decorative VIEW nav */}
      <div style={{
        background: 'var(--zen-paper)',
        border: '1px solid var(--zen-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--zen-text-muted)',
          padding: '10px 20px 6px',
        }}>
          Sections
        </div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              borderTop: '1px solid var(--zen-border)',
              cursor: 'default',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-seal)',
              fontSize: '1rem',
              color: 'var(--zen-red)',
              width: '20px',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {item.zh}
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-ink)',
              letterSpacing: '0.05em',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}

function StatRow({
  label,
  value,
  valueColor,
  small,
}: {
  label: string
  value: string
  valueColor?: string
  small?: boolean
}) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--zen-text-muted)',
        marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: small ? 'var(--font-ui)' : 'var(--font-main)',
        fontSize: small ? '11px' : '13px',
        color: valueColor ?? 'var(--zen-ink)',
        fontWeight: valueColor ? 700 : 400,
      }}>
        {value}
      </div>
    </div>
  )
}

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--zen-text-muted)',
  border: '1px solid var(--zen-border)',
  padding: '2px 8px',
}
