import type { MockData, MockPillar, ElementKey } from './mock-data'

const elementColor: Record<ElementKey, string> = {
  wood:  'var(--element-wood)',
  fire:  'var(--element-fire)',
  earth: 'var(--element-earth)',
  metal: 'var(--element-metal)',
  water: 'var(--element-water)',
}

function PillarCard({ p }: { p: MockPillar }) {
  return (
    <div style={{
      background: p.isDay ? 'var(--zen-gold-pale)' : 'var(--zen-paper-deep)',
      border: p.isDay ? '1px solid var(--zen-gold)' : '1px solid var(--zen-border)',
      borderRadius: '0',
      padding: '6px 2px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', letterSpacing: '0.06em' }}>
        {p.labelZh} {p.label}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '26px', color: elementColor[p.ganElement], lineHeight: 1, marginTop: '4px' }}>
        {p.gan}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
        {p.ganShiShen}
      </div>
      <div style={{ borderTop: '1px solid var(--zen-border)', margin: '2px 0' }} />
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '26px', color: elementColor[p.zhiElement], lineHeight: 1 }}>
        {p.zhi}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
        {p.zhiShiShen}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
        藏：{p.zhiHideGan}
      </div>
      <div style={{ borderTop: '1px solid var(--zen-border)', margin: '2px 0' }} />
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)' }}>
        {p.naYin}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: elementColor[p.diShiElement] }}>
        {p.diShi}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
        空：{p.xunKong}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '13px', color: 'var(--zen-ink)', marginTop: '4px' }}>
        {p.zodiac} {p.zodiacEn}
      </div>
    </div>
  )
}

export default function FourPillarsPanel({ data }: { data: MockData }) {
  return (
    <div className="zen-result-card" style={{ padding: '10px', borderRadius: '0' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-ink)',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        四柱 · Four Pillars
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {data.pillars.map(p => <PillarCard key={p.label} p={p} />)}
      </div>
    </div>
  )
}
