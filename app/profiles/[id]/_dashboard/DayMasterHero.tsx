import type { MockData } from './mock-data'

export default function DayMasterHero({ data }: { data: MockData }) {
  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '0.5px solid rgba(188,45,45,0.12)',
      borderRadius: '0',
      padding: '14px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      textAlign: 'center',
      gap: '12px',
    }}>
      {/* Group 1: label + DM identity */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={labelStyle}>DAY MASTER</div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '64px',
          lineHeight: 1,
          color: 'var(--zen-red)',
          fontWeight: 500,
          margin: '4px 0 2px',
        }}>
          {data.dayMaster}
        </div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '14px',
          color: 'var(--zen-ink)',
          fontWeight: 500,
        }}>
          {data.dayMasterTypeFull}
        </div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '11px',
          color: 'var(--zen-ink)',
        }}>
          {data.dayMasterMeaning}
        </div>
      </div>

      {/* Group 2: cycle start info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <div style={{ width: '32px', height: '1px', background: 'var(--zen-border)', marginBottom: '6px' }} />
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
          {data.yunDirection} {data.yunDirectionEn}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
          起运 age {data.startAge}
        </div>
      </div>

      {/* Group 3: birth metadata (compact) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: 1.4 }}>
        <div style={{ width: '32px', height: '1px', background: 'var(--zen-border)', marginBottom: '6px' }} />
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
          {data.birthMeta.solarDate} · {data.birthMeta.city.replace(/ \d+\.\d+°E/, '')}
        </div>
        <div style={{ fontFamily: 'var(--font-seal)', fontSize: '11px', color: 'var(--zen-ink)' }}>
          {data.birthMeta.lunarDate}
        </div>
        <div style={{ fontFamily: 'var(--font-seal)', fontSize: '11px', color: 'var(--zen-ink)' }}>
          {data.birthMeta.zodiacsCombined}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-ink)',
  textTransform: 'uppercase',
  fontWeight: 500,
}
