// Dashboard 模块：luck cycle horizontal timeline with current cycle highlight — Stage 2 Batch 2A (mock data)
import type { MockData, MockLuckCycle } from './mock-data'

export default function LuckCycleTimeline({ data }: { data: MockData }) {
  const currentYear = data.currentLiuNian.year
  const currentCycleGanZhi = data.currentDayun.ganZhi

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '24px',
    }}>
      <div style={sectionLabelStyle}>Luck Cycles · 大运</div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {data.luckCycles.map((cycle) => {
          const isCurrent = cycle.ganZhi === currentCycleGanZhi
          const isPast = cycle.endYear < currentYear
          return (
            <CycleCell
              key={`${cycle.startAge}-${cycle.endAge}`}
              cycle={cycle}
              isCurrent={isCurrent}
              isPast={isPast}
            />
          )
        })}
      </div>
    </div>
  )
}

function CycleCell({
  cycle,
  isCurrent,
  isPast,
}: {
  cycle: MockLuckCycle
  isCurrent: boolean
  isPast: boolean
}) {
  const isChildhood = !cycle.ganZhi

  return (
    <div style={{
      flexShrink: 0,
      minWidth: '80px',
      textAlign: 'center',
      padding: '14px 10px',
      border: isCurrent
        ? '2px solid var(--zen-gold)'
        : '1px solid var(--zen-border)',
      background: isCurrent
        ? 'var(--zen-gold-pale)'
        : isChildhood
          ? 'var(--zen-paper-deep)'
          : isPast
            ? 'rgba(0,0,0,0.02)'
            : 'var(--zen-paper)',
      position: 'relative',
    }}>
      {isCurrent && (
        <div style={{
          position: 'absolute',
          top: '-9px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-ui)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          background: 'var(--zen-gold)',
          color: 'white',
          padding: '1px 6px',
          whiteSpace: 'nowrap',
        }}>
          Now
        </div>
      )}

      {/* GanZhi or 童运 */}
      <div style={{
        fontFamily: 'var(--font-seal)',
        fontSize: isChildhood ? '0.75rem' : '1.3rem',
        fontWeight: 700,
        color: isCurrent
          ? 'var(--zen-gold)'
          : isPast || isChildhood
            ? 'var(--zen-text-muted)'
            : 'var(--zen-ink)',
        letterSpacing: isChildhood ? '1px' : '3px',
        marginBottom: '8px',
        lineHeight: 1,
      }}>
        {isChildhood ? '童运' : cycle.ganZhi}
      </div>

      {/* Age range */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '10px',
        color: 'var(--zen-text-muted)',
        marginBottom: '3px',
      }}>
        {cycle.startAge}–{cycle.endAge}
      </div>

      {/* Year range */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '9px',
        color: 'var(--zen-text-muted)',
      }}>
        {cycle.startYear}
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  color: 'var(--zen-ink)',
  borderBottom: '2px solid var(--zen-gold)',
  paddingBottom: '6px',
  display: 'inline-block',
}
