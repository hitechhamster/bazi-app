// Dashboard 模块：slim birth metadata strip — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

export default function BirthMetaStrip({ data }: { data: MockData }) {
  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '14px 24px',
      display: 'flex',
      gap: '32px',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <MetaItem label="Solar Date" value={data.birthDate} />
      <MetaItem label="Lunar Date" value={data.lunarDate} />
      <MetaItem label="Birth City" value={data.birthCity} />
      <MetaItem label="Zodiac" value={`${data.zodiac} · ${data.zodiacEn}`} />
      {data.isTimeUnknown && (
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--zen-text-muted)',
          border: '1px dashed var(--zen-border)',
          padding: '2px 8px',
        }}>
          Hour Unknown
        </span>
      )}
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: 'var(--zen-ink)',
      }}>
        {value}
      </div>
    </div>
  )
}
