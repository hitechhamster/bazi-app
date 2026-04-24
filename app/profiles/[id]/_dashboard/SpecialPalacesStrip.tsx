import type { MockData } from './mock-data'

const PALACES = [
  { key: 'taiYuan' as const, label: '胎元', labelEn: 'Conception Palace' },
  { key: 'mingGong' as const, label: '命宫', labelEn: 'Life Palace' },
  { key: 'shenGong' as const, label: '身宫', labelEn: 'Body Palace' },
]

export default function SpecialPalacesStrip({ data }: { data: MockData }) {
  return (
    <div className="zen-result-card" style={{ padding: '16px' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        三宫 · Special Palaces
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {PALACES.map(p => (
          <div key={p.key} style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 8px',
            background: 'var(--zen-paper-deep)',
            borderRadius: '4px',
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginBottom: '6px' }}>
              {p.label}
            </div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: '22px', color: 'var(--zen-ink)' }}>
              {data.specialPalaces[p.key]}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginTop: '4px' }}>
              {p.labelEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
