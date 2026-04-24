// Dashboard 模块：ten gods distribution bar chart — Stage 2 Batch 2A (mock data)
import type { MockData, MockTenGod } from './mock-data'

export default function TenGodsDistribution({ data }: { data: MockData }) {
  const total = data.tenGods.reduce((sum, g) => sum + g.count, 0)
  const maxCount = Math.max(...data.tenGods.map((g) => g.count))

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '24px',
    }}>
      <div style={sectionLabelStyle}>Ten Gods · 十神</div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.tenGods.map((god) => (
          <GodRow key={god.name} god={god} total={total} maxCount={maxCount} />
        ))}
      </div>
    </div>
  )
}

function GodRow({
  god,
  total,
  maxCount,
}: {
  god: MockTenGod
  total: number
  maxCount: number
}) {
  const pct = maxCount > 0 ? (god.count / maxCount) * 100 : 0
  const share = total > 0 ? Math.round((god.count / total) * 100) : 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: god.color,
        width: '40px',
        flexShrink: 0,
        textAlign: 'right',
      }}>
        {god.name}
      </div>
      <div style={{
        flex: 1,
        height: '8px',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: god.color,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        width: '48px',
        flexShrink: 0,
        textAlign: 'right',
      }}>
        ×{god.count} · {share}%
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
