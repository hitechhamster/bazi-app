import type { MockData, ElementKey } from './mock-data'

const ELEMENTS: { key: ElementKey; label: string; angleDeg: number }[] = [
  { key: 'wood',  label: '木', angleDeg: -90 },
  { key: 'fire',  label: '火', angleDeg: -18 },
  { key: 'earth', label: '土', angleDeg:  54 },
  { key: 'metal', label: '金', angleDeg: 126 },
  { key: 'water', label: '水', angleDeg: 198 },
]

const CX = 120, CY = 120, R = 90, MAX = 4

function pt(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function poly(points: { x: number; y: number }[]) {
  return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

export default function FiveElementsRadar({ data }: { data: MockData }) {
  const outer = ELEMENTS.map(e => pt(e.angleDeg, R))
  const data5 = ELEMENTS.map(e => pt(e.angleDeg, (data.fiveElements[e.key] / MAX) * R))
  const grids = [0.25, 0.5, 0.75].map(f => ELEMENTS.map(e => pt(e.angleDeg, R * f)))

  return (
    <div className="zen-result-card" style={{ padding: '10px', height: '245px', display: 'flex', flexDirection: 'column', borderRadius: '0' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-ink)',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        五行 · Five Elements
      </div>
      <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', display: 'block', margin: 'auto' }}>
        {grids.map((pts, i) => (
          <polygon key={i} points={poly(pts)} fill="none" stroke="var(--zen-border)" strokeWidth="0.5" />
        ))}
        {outer.map((p, i) => (
          <line key={i} x1={CX} y1={CY} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="var(--zen-border)" strokeWidth="0.5" />
        ))}
        <polygon points={poly(outer)} fill="none" stroke="var(--zen-border)" strokeWidth="1" />
        <polygon points={poly(data5)} fill="var(--zen-red)" fillOpacity="0.18" stroke="var(--zen-red)" strokeWidth="1.5" />
        {ELEMENTS.map((e, i) => {
          const lp = pt(e.angleDeg, R + 18)
          return (
            <text key={e.key} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-main)" fontSize="14" fill="var(--zen-ink)">
              {e.label}
            </text>
          )
        })}
        <text x="120" y="82" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500 }} fill="var(--element-wood)">
          {data.fiveElements.wood.toFixed(1)}
        </text>
        <text x="198" y="80" textAnchor="end" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500 }} fill="var(--element-fire)">
          {data.fiveElements.fire.toFixed(1)}
        </text>
        <text x="144" y="167" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500 }} fill="var(--element-earth)">
          {data.fiveElements.earth.toFixed(1)}
        </text>
        <text x="97" y="165" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500 }} fill="var(--element-metal)">
          {data.fiveElements.metal.toFixed(1)}
        </text>
        <text x="78" y="92" textAnchor="start" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500 }} fill="var(--element-water)">
          {data.fiveElements.water.toFixed(1)}
        </text>
      </svg>
    </div>
  )
}
