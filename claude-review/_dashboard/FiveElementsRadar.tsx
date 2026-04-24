// Dashboard 模块：five elements pentagon radar chart — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'

// TODO(2B): compute polygon points dynamically from data.fiveElements
// Hardcoded for mock data: wood=2.5, fire=1.5, earth=0.5, metal=2.0, water=1.5 (max=2.5)
// Center=(120,120), max radius=90. Pentagon starts at 12 o'clock, clockwise.
// Background pentagon (100%): 120,30 206,92 173,193 67,193 34,92
// Data polygon (wood=100%, fire=60%, earth=20%, metal=80%, water=60%):
//   wood(100%): 120,30  fire(60%): 172,103  earth(20%): 131,135  metal(80%): 78,178  water(60%): 68,103

const ELEMENT_CONFIG: Array<{
  key: string
  label: string
  color: string
  labelX: number
  labelY: number
  anchor: 'middle' | 'start' | 'end'
}> = [
  { key: 'wood',  label: '木', color: 'var(--element-wood)',  labelX: 120, labelY: 12,  anchor: 'middle' },
  { key: 'fire',  label: '火', color: 'var(--element-fire)',  labelX: 218, labelY: 88,  anchor: 'start'  },
  { key: 'earth', label: '土', color: 'var(--element-earth)', labelX: 183, labelY: 210, anchor: 'start'  },
  { key: 'metal', label: '金', color: 'var(--element-metal)', labelX: 57,  labelY: 210, anchor: 'end'    },
  { key: 'water', label: '水', color: 'var(--element-water)', labelX: 22,  labelY: 88,  anchor: 'end'    },
]

export default function FiveElementsRadar({ data }: { data: MockData }) {
  const fe = data.fiveElements
  const max = Math.max(fe.wood, fe.fire, fe.earth, fe.metal, fe.water)

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '24px',
    }}>
      <div style={sectionLabelStyle}>Five Elements · 五行</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
        {/* SVG radar */}
        <svg
          viewBox="0 0 240 240"
          width="180"
          height="180"
          style={{ flexShrink: 0 }}
          aria-label="Five elements radar chart"
        >
          {/* Background grid pentagons at 25%, 50%, 75% */}
          <polygon
            points="120,98 142,113 133,138 107,138 99,113"
            fill="none"
            stroke="var(--zen-border)"
            strokeWidth="1"
          />
          <polygon
            points="120,75 163,106 147,157 94,157 77,106"
            fill="none"
            stroke="var(--zen-border)"
            strokeWidth="1"
          />
          <polygon
            points="120,53 184,99 160,175 80,175 56,99"
            fill="none"
            stroke="var(--zen-border)"
            strokeWidth="1"
          />
          {/* Full background pentagon */}
          <polygon
            points="120,30 206,92 173,193 67,193 34,92"
            fill="none"
            stroke="var(--zen-border)"
            strokeWidth="1.5"
          />
          {/* Axis lines */}
          <line x1="120" y1="120" x2="120" y2="30"  stroke="var(--zen-border)" strokeWidth="1" />
          <line x1="120" y1="120" x2="206" y2="92"  stroke="var(--zen-border)" strokeWidth="1" />
          <line x1="120" y1="120" x2="173" y2="193" stroke="var(--zen-border)" strokeWidth="1" />
          <line x1="120" y1="120" x2="67"  y2="193" stroke="var(--zen-border)" strokeWidth="1" />
          <line x1="120" y1="120" x2="34"  y2="92"  stroke="var(--zen-border)" strokeWidth="1" />
          {/* Data polygon — hardcoded for mock values, TODO(2B): compute from props */}
          <polygon
            points="120,30 172,103 131,135 78,178 68,103"
            fill="rgba(184,134,11,0.12)"
            stroke="var(--zen-gold)"
            strokeWidth="2"
          />
          {/* Data dots */}
          {[
            { cx: 120, cy: 30,  color: 'var(--element-wood)' },
            { cx: 172, cy: 103, color: 'var(--element-fire)' },
            { cx: 131, cy: 135, color: 'var(--element-earth)' },
            { cx: 78,  cy: 178, color: 'var(--element-metal)' },
            { cx: 68,  cy: 103, color: 'var(--element-water)' },
          ].map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r="4" fill={dot.color} />
          ))}
          {/* Element labels */}
          {ELEMENT_CONFIG.map((el) => (
            <text
              key={el.key}
              x={el.labelX}
              y={el.labelY}
              textAnchor={el.anchor}
              dominantBaseline="middle"
              style={{
                fontFamily: 'var(--font-seal)',
                fontSize: '14px',
                fill: el.color,
                fontWeight: 700,
              }}
            >
              {el.label}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div style={{ flex: 1 }}>
          {ELEMENT_CONFIG.map((el) => {
            const val = fe[el.key as keyof typeof fe]
            const pct = max > 0 ? (val / max) * 100 : 0
            return (
              <div key={el.key} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{
                    fontFamily: 'var(--font-seal)',
                    fontSize: '13px',
                    color: el.color,
                    fontWeight: 700,
                  }}>
                    {el.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                    color: 'var(--zen-text-muted)',
                  }}>
                    {val.toFixed(1)}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: el.color,
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
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
