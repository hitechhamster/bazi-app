import type { MockData } from './mock-data'

export default function BirthMetaStrip({ data }: { data: MockData }) {
  const { solarDate, lunarDate, tst, city, zodiacsCombined } = data.birthMeta
  return (
    <div style={{
      fontFamily: 'var(--font-ui)',
      fontSize: '12px',
      color: 'var(--zen-text-muted)',
      letterSpacing: '0.04em',
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <span>{solarDate}</span>
      <span style={{ color: 'var(--zen-border)' }}>|</span>
      <span>{lunarDate}</span>
      <span style={{ color: 'var(--zen-border)' }}>|</span>
      <span>{tst}</span>
      <span style={{ color: 'var(--zen-border)' }}>|</span>
      <span>{city}</span>
      <span style={{ color: 'var(--zen-border)' }}>|</span>
      <span>{zodiacsCombined}</span>
    </div>
  )
}
