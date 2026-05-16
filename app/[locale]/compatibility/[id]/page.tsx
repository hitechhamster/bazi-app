import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'
import { getUserTier } from '@/lib/subscription/tier'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import CompatibilityReportPending from './CompatibilityReportPending'
import UpgradeCTA from './UpgradeCTA'
import type { BaziPartnerData, CompatibilityScores } from '@/lib/bazi/compatibility'
import BrandMark from '@/components/BrandMark'
import LocaleSwitcher from '../../_components/LocaleSwitcher'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAR_COLORS: Record<string, string> = {
  excellent: '#854F0B',
  good:      '#854F0B',
  average:   '#9ca3af',
  needWork:  '#BC2D2D',
}

const LEVEL_LABELS: Record<string, Record<string, string>> = {
  excellent: { en: 'Excellent Match', 'zh-CN': '极佳配对', 'zh-TW': '極佳配對' },
  good:      { en: 'Good Match',      'zh-CN': '良好配对', 'zh-TW': '良好配對' },
  average:   { en: 'Moderate Match',  'zh-CN': '中等配对', 'zh-TW': '中等配對' },
  needWork:  { en: 'Needs Work',      'zh-CN': '需要努力', 'zh-TW': '需要努力' },
}

function levelLabel(key: string, locale: string): string {
  return LEVEL_LABELS[key]?.[locale] ?? LEVEL_LABELS[key]?.en ?? key
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

const DIM_LABELS: Record<string, Record<string, string>> = {
  dayMaster:    { en: 'Day Master',     'zh-CN': '日主',   'zh-TW': '日主'   },
  zodiac:       { en: 'Zodiac',         'zh-CN': '生肖',   'zh-TW': '生肖'   },
  elements:     { en: 'Five Elements',  'zh-CN': '五行',   'zh-TW': '五行'   },
  naYin:        { en: 'NaYin',          'zh-CN': '纳音',   'zh-TW': '納音'   },
  ganZhi:       { en: 'Pillars',        'zh-CN': '柱',     'zh-TW': '柱'     },
  spousePalace: { en: 'Spouse Palace',  'zh-CN': '夫妻宫', 'zh-TW': '夫妻宮' },
}

function dimLabel(key: string, locale: string): string {
  return DIM_LABELS[key]?.[locale] ?? DIM_LABELS[key]?.en ?? key
}

const EL_COLOR: Record<string, string> = {
  木: '#3a7d44', 火: '#BC2D2D', 土: '#854F0B', 金: '#9ca3af', 水: '#2563eb',
}

// ── Score circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ total, level, locale }: { total: number; level: { key: string; stars: number }; locale: string }) {
  const color = STAR_COLORS[level.key] ?? '#854F0B'
  return (
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: `4px solid ${color}`,
        marginBottom: '12px',
      }}>
        <span style={{ fontFamily: 'var(--font-main)', fontSize: '36px', fontWeight: 500, color, lineHeight: 1 }}>
          {total}
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginTop: '2px' }}>
          / 99
        </span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: '16px', fontWeight: 500, color, letterSpacing: '0.05em' }}>
          {levelLabel(level.key, locale)}
        </div>
        <div style={{ fontSize: '18px', color, marginTop: '4px', letterSpacing: '3px' }}>
          {stars(level.stars)}
        </div>
      </div>
    </div>
  )
}

// ── Score breakdown ────────────────────────────────────────────────────────────

type BreakdownKey = keyof CompatibilityScores['breakdown']

function ScoreBreakdown({ scores, locale }: { scores: CompatibilityScores; locale: string }) {
  const dims: BreakdownKey[] = ['dayMaster','zodiac','elements','naYin','ganZhi','spousePalace']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
      {dims.map(k => {
        const d = scores.breakdown[k]
        const pct = Math.round((d.score / d.maxScore) * 100)
        return (
          <div key={k} style={{
            background: 'var(--zen-paper)',
            border: '1px solid var(--zen-border)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--zen-text-muted)' }}>
                {dimLabel(k, locale)}
              </span>
              <span style={{ fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500, color: 'var(--zen-ink)' }}>
                {d.score}<span style={{ fontSize: '10px', color: 'var(--zen-text-muted)' }}>/{d.maxScore}</span>
              </span>
            </div>
            <div className="compat-score-bar-track">
              <div className="compat-score-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {d.description}
            </p>
            {('notes' in d) && (d as { notes?: string[] }).notes?.map((n, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', margin: '2px 0 0', fontStyle: 'italic' }}>• {n}</p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Single bazi card ──────────────────────────────────────────────────────────

function BaziCard({ bazi, name }: { bazi: BaziPartnerData; name: string }) {
  const total = Object.values(bazi.elements).reduce((a, b) => a + (b as number), 0)
  return (
    <div style={{ border: '1px solid var(--zen-border)', padding: '20px', background: 'var(--zen-paper)', flex: 1, minWidth: '220px' }}>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500, color: 'var(--zen-ink)', marginBottom: '14px', borderBottom: '1px solid var(--zen-border)', paddingBottom: '8px' }}>
        {name}
      </div>

      {/* 4 pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '14px' }}>
        {[
          { label: '年', ganzhi: bazi.yearPillar },
          { label: '月', ganzhi: bazi.monthPillar },
          { label: '日', ganzhi: bazi.dayPillar },
          { label: '时', ganzhi: bazi.hourPillar ?? '？' },
        ].map(({ label, ganzhi }) => (
          <div key={label} style={{ textAlign: 'center', border: '1px solid var(--zen-border)', padding: '6px 4px' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--zen-text-muted)', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: '16px', color: 'var(--zen-ink)', lineHeight: 1.2 }}>
              {ganzhi.split('').map((c, i) => <div key={i}>{c}</div>)}
            </div>
          </div>
        ))}
      </div>

      {/* Day master + element + zodiac */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[
          { label: '日主', val: bazi.dayMaster },
          { label: '五行', val: bazi.dayMasterElement, color: EL_COLOR[bazi.dayMasterElement] },
          { label: '生肖', val: bazi.zodiac },
          { label: '纳音', val: bazi.naYin },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ fontFamily: 'var(--font-ui)', fontSize: '11px' }}>
            <span style={{ color: 'var(--zen-text-muted)' }}>{label}·</span>
            <span style={{ color: color ?? 'var(--zen-ink)', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Five elements bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(Object.entries(bazi.elements) as [string, number][]).map(([el, cnt]) => {
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0
          return (
            <div key={el} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-main)', fontSize: '12px', color: EL_COLOR[el] ?? 'var(--zen-ink)', width: '14px' }}>{el}</span>
              <div style={{ flex: 1, height: '3px', background: 'var(--zen-border)' }}>
                <div style={{ width: `${pct}%`, height: '3px', background: EL_COLOR[el] ?? '#854F0B' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', width: '26px' }}>{cnt.toFixed(1)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompatibilityReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) redirect(localePath(locale, '/login'))

  const admin = createAdminClient()
  const { data: report } = await admin
    .from('compatibility_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (!report) notFound()
  if ((report.user_id as string) !== user.id) notFound()

  const tier = await getUserTier(user.id)

  const status  = report.free_report_status as string
  const baziA   = report.bazi_a   as BaziPartnerData
  const baziB   = report.bazi_b   as BaziPartnerData
  const scores  = report.scores   as CompatibilityScores
  const nameA   = (report.partner_a_data as { name?: string })?.name ?? 'Partner A'
  const nameB   = (report.partner_b_data as { name?: string })?.name ?? 'Partner B'
  const reportText = (report.free_report_text as string | null) ?? null

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    letterSpacing: '0.2em',
    color: 'var(--zen-text-muted)',
    textTransform: 'uppercase',
    fontWeight: 500,
    marginBottom: '12px',
    display: 'block',
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" style={{ top: '-200px', right: '-200px', left: 'auto' }} />

      <div className="max-w-[1320px] mx-auto px-4 lg:px-5 py-6" style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BrandMark variant="full" size="small" href="/dashboard" />
            <Link href={localePath(locale, '/dashboard')} style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-ink)', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          </div>
          <LocaleSwitcher />
        </div>

        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '18px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
            {nameA} &amp; {nameB}
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
            Compatibility Analysis · 合婚分析
          </p>
        </div>

        {/* Pending / generating */}
        {(status === 'pending' || status === 'generating') && (
          <CompatibilityReportPending reportId={id} locale={locale} />
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="zen-result-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-text-muted)', marginBottom: '20px' }}>
              Generation failed. Please try again.
            </p>
            <form action={`/api/compatibility/${id}/generate-free`} method="POST">
              <button type="submit" style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', border: 'none', cursor: 'pointer', background: '#854F0B', color: 'white' }}>
                Try Again
              </button>
            </form>
          </div>
        )}

        {/* Completed — full report */}
        {status === 'completed' && reportText && (
          <>
            {/* 1. Score section */}
            <div className="zen-result-card">
              <span style={labelStyle}>Compatibility Score · 合婚评分</span>
              <ScoreCircle total={scores.total} level={scores.level} locale={locale} />
              <ScoreBreakdown scores={scores} locale={locale} />
            </div>

            {/* 2. Dual bazi */}
            <div className="zen-result-card">
              <span style={labelStyle}>Bazi Charts · 双人命盘</span>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <BaziCard bazi={baziA} name={nameA} />
                <BaziCard bazi={baziB} name={nameB} />
              </div>
            </div>

            {/* 3. AI report */}
            <div className="zen-result-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 8px', borderBottom: '1px solid var(--zen-border)' }}>
                <span style={labelStyle}>Compatibility Reading · AI 解读</span>
              </div>
              <div
                className="ai-content-box"
                style={{ border: 'none', padding: '28px 36px' }}
                dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(reportText) }}
              />
            </div>

            {/* 4. Upgrade CTA */}
            <UpgradeCTA tier={tier} locale={locale} />
          </>
        )}

      </div>
    </div>
  )
}
