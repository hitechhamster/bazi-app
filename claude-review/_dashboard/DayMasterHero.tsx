// Dashboard 模块：day master hero panel with strength, pattern, favorable elements — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

const ELEMENT_COLOR: Record<string, string> = {
  '木': 'var(--element-wood)',
  '火': 'var(--element-fire)',
  '土': 'var(--element-earth)',
  '金': 'var(--element-metal)',
  '水': 'var(--element-water)',
}

export default function DayMasterHero({ data }: { data: MockData }) {
  return (
    <div style={{
      background: 'var(--zen-gold-pale)',
      border: '1px solid var(--zen-border)',
      padding: '32px 36px',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '32px',
      alignItems: 'center',
    }}>
      {/* Day master character */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '5rem',
          fontWeight: 700,
          color: 'var(--zen-red)',
          lineHeight: 1,
          letterSpacing: '2px',
        }}>
          {data.dayMaster}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--zen-text-muted)',
          marginTop: '8px',
        }}>
          Day Master
        </div>
      </div>

      {/* Center info */}
      <div>
        <div style={{
          fontFamily: 'var(--font-main)',
          fontSize: '1.3rem',
          color: 'var(--zen-ink)',
          marginBottom: '6px',
        }}>
          {data.dayMasterYinYang} {data.dayMasterElement}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <TagBadge label="Strength" value={data.strength} color="var(--zen-red)" />
          <TagBadge label="Pattern" value={data.pattern} color="var(--zen-gold)" />
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ElementGroup label="Favorable 喜用" elements={data.favorable} />
          <ElementGroup label="Unfavorable 忌" elements={data.unfavorable} muted />
        </div>
      </div>

      {/* Age + cycle summary */}
      <div style={{
        textAlign: 'right',
        borderLeft: '1px solid var(--zen-border)',
        paddingLeft: '32px',
      }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--zen-text-muted)',
          marginBottom: '4px',
        }}>
          Approximate Age
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '2.4rem',
          fontWeight: 700,
          color: 'var(--zen-ink)',
          lineHeight: 1,
          marginBottom: '12px',
        }}>
          {data.approxAge}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--zen-text-muted)',
          marginBottom: '4px',
        }}>
          Current 大运
        </div>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '1.6rem',
          color: 'var(--zen-gold)',
          fontWeight: 700,
          letterSpacing: '4px',
        }}>
          {data.currentDayun.ganZhi}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          marginTop: '2px',
        }}>
          {data.currentDayun.startYear}–{data.currentDayun.endYear}
        </div>
      </div>
    </div>
  )
}

function TagBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      border: `1px solid ${color}`,
      padding: '4px 10px',
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '1px',
    }}>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--zen-text-muted)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-seal)',
        fontSize: '0.9rem',
        color,
        fontWeight: 700,
      }}>
        {value}
      </span>
    </div>
  )
}

function ElementGroup({ label, elements, muted }: { label: string; elements: string[]; muted?: boolean }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--zen-text-muted)',
        marginBottom: '6px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {elements.map((el) => (
          <span key={el} style={{
            fontFamily: 'var(--font-seal)',
            fontSize: '1rem',
            fontWeight: 700,
            color: muted ? 'var(--zen-text-muted)' : ELEMENT_COLOR[el] ?? 'var(--zen-ink)',
            border: `1px solid ${muted ? 'var(--zen-border)' : (ELEMENT_COLOR[el] ?? 'var(--zen-border)')}`,
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: muted ? 0.6 : 1,
          }}>
            {el}
          </span>
        ))}
      </div>
    </div>
  )
}
