// Dashboard 模块：current dayun + liunian two-cell strip — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

export default function CurrentLiuNianStrip({ data }: { data: MockData }) {
  const { currentDayun: dayun, currentLiuNian: liuNian } = data

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0',
      border: '1px solid var(--zen-border)',
      overflow: 'hidden',
    }}>
      {/* Current 大运 */}
      <div style={{
        background: 'var(--zen-paper)',
        padding: '24px 28px',
        borderRight: '1px solid var(--zen-border)',
        textAlign: 'center',
      }}>
        <div style={stripLabelStyle}>Current Luck Cycle · 大运</div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--zen-red)',
          letterSpacing: '6px',
          margin: '12px 0 8px',
          lineHeight: 1,
        }}>
          {dayun.ganZhi}
        </div>
        <div style={metaTextStyle}>{dayun.wuXing}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <MiniStat label="Age" value={`${dayun.startAge}–${dayun.endAge}`} />
          <MiniStat label="Period" value={`${dayun.startYear}–${dayun.endYear}`} />
        </div>
      </div>

      {/* Current 流年 */}
      <div style={{
        background: 'var(--zen-gold-pale)',
        padding: '24px 28px',
        textAlign: 'center',
      }}>
        <div style={stripLabelStyle}>Annual Year · 流年 {liuNian.year}</div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--zen-gold)',
          letterSpacing: '6px',
          margin: '12px 0 8px',
          lineHeight: 1,
        }}>
          {liuNian.ganZhi}
        </div>
        <div style={metaTextStyle}>{liuNian.wuXing}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <MiniStat label="Tai Sui" value={data.taiSuiStatus} />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--zen-text-muted)',
        marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--zen-ink)',
      }}>
        {value}
      </div>
    </div>
  )
}

const stripLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--zen-text-muted)',
}

const metaTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '13px',
  color: 'var(--zen-text-muted)',
}
