import type { MockData, MockLiuNianCell } from './mock-data'

function NianCell({ n }: { n: MockLiuNianCell }) {
  const isCurrent = n.state === 'current'
  return (
    <div style={{
      textAlign: 'center',
      padding: '8px 4px',
      borderRadius: '4px',
      background: isCurrent ? 'var(--zen-gold-pale)' : 'var(--zen-paper-deep)',
      border: isCurrent ? '1px solid var(--zen-gold)' : '1px solid transparent',
      opacity: n.state === 'past' ? 0.55 : 1,
    }}>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '14px', color: isCurrent ? 'var(--zen-red)' : 'var(--zen-ink)' }}>
        {n.ganZhi}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', marginTop: '3px' }}>
        {n.year}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)' }}>
        {n.age}岁
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '10px',
        color: 'var(--zen-text-muted)',
        borderTop: '1px solid var(--zen-border)',
        marginTop: '4px',
        paddingTop: '4px',
      }}>
        {n.xiaoYun}
      </div>
    </div>
  )
}

export default function CurrentLiuNianStrip({ data }: { data: MockData }) {
  return (
    <div className="zen-result-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          流年 · Annual Luck · {data.currentDayun.ganZhi}运
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
          {data.currentDayun.startYear}–{data.currentDayun.endYear}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
        {data.currentDayunLiuNian.map((n, i) => <NianCell key={i} n={n} />)}
      </div>
    </div>
  )
}
