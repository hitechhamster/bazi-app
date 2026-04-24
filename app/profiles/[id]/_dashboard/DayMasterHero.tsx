import type { MockData } from './mock-data'

export default function DayMasterHero({ data }: { data: MockData }) {
  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '0.5px solid rgba(188,45,45,0.12)',
      borderRadius: '12px',
      padding: '12px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '180px',
    }}>
      <div style={labelStyle}>DAY MASTER</div>

      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '64px',
        lineHeight: 1,
        color: 'var(--zen-red)',
        fontWeight: 500,
        margin: '6px 0 4px',
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
        color: 'var(--zen-text-muted)',
        marginTop: '2px',
      }}>
        {data.dayMasterMeaning}
      </div>

      <div style={{
        width: '40px',
        height: '1px',
        background: 'var(--zen-border)',
        margin: '8px 0',
      }} />

      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
        {data.yunDirection} {data.yunDirectionEn}
      </div>

      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginTop: '2px' }}>
        起运 age {data.startAge}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-ink)',
  fontWeight: 500,
  textTransform: 'uppercase',
}
