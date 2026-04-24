import type { MockData, MockLuckCycle } from './mock-data'

function CycleCell({ c }: { c: MockLuckCycle }) {
  const isCurrent = c.state === 'current'
  const isEmpty = c.ganZhi === ''
  return (
    <div style={{
      textAlign: 'center',
      padding: '6px 4px',
      borderRadius: '4px',
      background: isCurrent ? 'var(--zen-gold-pale)' : 'var(--zen-paper-deep)',
      border: isCurrent ? '1px solid var(--zen-gold)' : '1px solid transparent',
      opacity: c.state === 'past' && !isCurrent ? 0.55 : 1,
    }}>
      <div style={{
        fontFamily: 'var(--font-main)',
        fontSize: isEmpty ? '11px' : '15px',
        color: isCurrent ? 'var(--zen-red)' : 'var(--zen-ink)',
        minHeight: '22px',
        lineHeight: '22px',
      }}>
        {isEmpty ? '童运' : c.ganZhi}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-ink)', marginTop: '4px' }}>
        {c.startAge}–{c.endAge}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-ink)' }}>
        {c.startYear}
      </div>
    </div>
  )
}

export default function LuckCycleTimeline({ data }: { data: MockData }) {
  return (
    <div className="zen-result-card" style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-ink)',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          大运 · Luck Cycle
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
          {data.yunDirection} · {data.yunDirectionEn}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
        {data.luckCycles.map((c, i) => <CycleCell key={i} c={c} />)}
      </div>
    </div>
  )
}
