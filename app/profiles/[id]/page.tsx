import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import type { FiveElements } from '@/lib/bazi/bazi-calculator-logic'

const ZODIAC_EN: Record<string, string> = {
  '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit', '龙': 'Dragon',
  '蛇': 'Snake', '马': 'Horse', '羊': 'Goat', '猴': 'Monkey', '鸡': 'Rooster',
  '狗': 'Dog', '猪': 'Pig',
}

const ELEMENT_COLOR: Record<string, string> = {
  wood: 'var(--element-wood)',
  fire: 'var(--element-fire)',
  earth: 'var(--element-earth)',
  metal: 'var(--element-metal)',
  water: 'var(--element-water)',
}

const ELEMENT_ZH: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
}

const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const
type ElemKey = typeof ELEMENT_ORDER[number]

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Reconstruct TST for luck cycle calculation
  const tst = profile.true_solar_time
    ? new Date(profile.true_solar_time as string)
    : (() => {
        const [yr, mo, dy] = (profile.birth_date as string).split('-').map(Number)
        return new Date(Date.UTC(yr, mo - 1, dy, 12, 0))
      })()

  const report = generateBaziReport(tst, profile.gender as string)

  const fe = profile.five_elements as FiveElements
  const feValues = ELEMENT_ORDER.map(k => fe[k])
  const feMax = Math.max(...feValues)
  const feMin = Math.min(...feValues)

  const pillars = [
    { label: 'Year', ganZhi: profile.pillar_year as string, unknown: false },
    { label: 'Month', ganZhi: profile.pillar_month as string, unknown: false },
    { label: 'Day', ganZhi: profile.pillar_day as string, unknown: false },
    { label: 'Hour', ganZhi: profile.pillar_hour as string | null, unknown: !!profile.is_time_unknown },
  ]

  const tstDisplay = profile.true_solar_time
    ? (profile.true_solar_time as string).slice(0, 16).replace('T', ' ') + ' UTC'
    : null

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 py-12">
        {/* Back */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/dashboard"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* ── Header ── */}
        <div className="flex flex-col items-center mb-10">
          <div className="zen-seal mb-4" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
            命
          </div>
          <h1 className="zen-h1" style={{ fontSize: '2.4rem' }}>{profile.name as string}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={badgeStyle}>{profile.relation as string}</span>
            <span style={badgeStyle}>{profile.gender as string}</span>
          </div>
        </div>

        {/* ── Section 1: Basic Info ── */}
        <div className="zen-result-card">
          <h2 className="zen-heading-sm">Birth Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <InfoRow label="Solar Date" value={profile.birth_date as string} />
            <InfoRow label="Lunar Date" value={profile.lunar_date as string} />
            <InfoRow
              label="Zodiac"
              value={`${profile.zodiac as string} · ${ZODIAC_EN[profile.zodiac as string] ?? ''}`}
            />
            <InfoRow label="Birth City" value={(profile.birth_city as string) ?? '—'} />
            <InfoRow
              label="Day Master"
              value={profile.day_master as string}
              valueStyle={{ color: 'var(--zen-red)', fontFamily: 'var(--font-seal)', fontSize: '1.4rem', fontWeight: 700 }}
            />
            <InfoRow
              label="Element"
              value={`${report.dayMasterYinYang} ${profile.day_master_element as string}`}
            />
            {tstDisplay && (
              <InfoRow label="True Solar Time" value={`${tstDisplay} (calibrated)`} />
            )}
          </div>
        </div>

        {/* ── Section 2: Four Pillars ── */}
        <div className="zen-result-card">
          <h2 className="zen-heading-sm">Four Pillars · 四柱</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
            {pillars.map(p => (
              <div key={p.label} className={`bazi-pillar-card${p.unknown ? ' pillar-unknown' : ''}`}>
                <div className="bazi-pillar-chars">{p.unknown ? '?' : p.ganZhi}</div>
                <div className="bazi-pillar-label">{p.label} Pillar</div>
              </div>
            ))}
          </div>
          {profile.is_time_unknown && (
            <p style={{ textAlign: 'center', marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-light)' }}>
              Time of birth unknown — Hour Pillar excluded (Three-Pillar mode)
            </p>
          )}
        </div>

        {/* ── Section 3: Five Elements ── */}
        <div className="zen-result-card">
          <h2 className="zen-heading-sm">Five Elements · 五行</h2>
          <div style={{ marginTop: '20px' }}>
            {ELEMENT_ORDER.map((key: ElemKey) => {
              const val = fe[key]
              const pct = feMax > 0 ? (val / feMax) * 100 : 0
              const isWeakest = val === feMin
              return (
                <div key={key} className="element-item">
                  <div className="element-icon" style={{ background: ELEMENT_COLOR[key] }}>
                    {ELEMENT_ZH[key]}
                  </div>
                  <div className="element-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div className="element-bar-track">
                    <div
                      className="element-bar-fill"
                      style={{ width: `${pct}%`, background: ELEMENT_COLOR[key] }}
                    />
                  </div>
                  <div className={`element-value${isWeakest ? ' element-weak' : ''}`}>
                    {val.toFixed(1)}{isWeakest ? ' ↓' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Section 4: Current Luck Cycle ── */}
        {report.currentDayun && (
          <div className="zen-result-card">
            <h2 className="zen-heading-sm">Current Luck Cycle · 大运</h2>
            {profile.is_time_unknown && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '8px' }}>
                Approximate — time of birth unknown
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div style={luckCardStyle}>
                <div style={luckLabelStyle}>Major Luck Period</div>
                <div style={{ fontFamily: 'var(--font-seal)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--zen-red)', letterSpacing: '4px', margin: '10px 0' }}>
                  {report.currentDayun.ganZhi}
                </div>
                <div style={luckSubStyle}>
                  Age {report.currentDayun.startAge}–{report.currentDayun.endAge}
                </div>
                <div style={luckSubStyle}>
                  {report.currentDayun.startYear}–{report.currentDayun.endYear}
                </div>
              </div>

              {report.currentLiuNian && (
                <div style={luckCardStyle}>
                  <div style={luckLabelStyle}>Annual Year {report.currentLiuNian.year}</div>
                  <div style={{ fontFamily: 'var(--font-seal)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--zen-gold)', letterSpacing: '4px', margin: '10px 0' }}>
                    {report.currentLiuNian.ganZhi}
                  </div>
                  <div style={luckSubStyle}>Current Annual Pillar</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Section 5: AI Report Placeholder ── */}
        <div className="zen-result-card">
          <h2 className="zen-heading-sm">AI Destiny Reading</h2>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--zen-text-light)', fontSize: '15px', textAlign: 'center', padding: '40px 0' }}>
            Your personalised AI reading is coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────

function InfoRow({
  label,
  value,
  valueStyle,
}: {
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--zen-text-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--zen-ink)', ...valueStyle }}>
        {value}
      </div>
    </div>
  )
}

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--zen-text-muted)',
  border: '1px solid var(--zen-border)',
  padding: '3px 10px',
}

const luckCardStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px 16px',
  border: '1px solid var(--zen-border)',
}

const luckLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--zen-text-muted)',
}

const luckSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '12px',
  color: 'var(--zen-text-muted)',
  marginTop: '4px',
}
