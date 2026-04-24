import type { MockData } from './mock-data'

function Cell({ label, labelEn, zh, en, accent }: {
  label: string; labelEn: string; zh: string; en: string; accent?: boolean
}) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--zen-paper-deep)', borderRadius: '4px' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', letterSpacing: '0.06em', marginBottom: '5px' }}>
        {label} · {labelEn}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '15px', color: accent ? 'var(--zen-red)' : 'var(--zen-ink)' }}>
        {zh}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)', marginTop: '2px' }}>
        {en}
      </div>
    </div>
  )
}

export default function ChartReadingPanel({ data }: { data: MockData }) {
  const r = data.chartReading
  return (
    <div className="zen-result-card" style={{ padding: '10px' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-ink)',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        盘面要点 · Chart Reading
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
        <Cell label="身强弱" labelEn="Strength" zh={r.strength} en={r.strengthEn} />
        <Cell label="格局" labelEn="Pattern" zh={r.pattern} en={r.patternEn} />
        <Cell label="喜用神" labelEn="Favorable" zh={r.favorable.join(' ')} en={r.favorableEn} accent />
        <Cell label="忌神" labelEn="Unfavorable" zh={r.unfavorable.join(' ')} en={r.unfavorableEn} />
      </div>

    </div>
  )
}
