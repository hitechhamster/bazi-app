'use client'

import { useState, useEffect } from 'react'
import type { MockData } from './mock-data'
import { getReportStatus, type ReportStatus, type ReportStructured } from '../actions'

function Cell({ label, labelEn, zh, en, accent }: {
  label: string; labelEn: string; zh: string; en: string; accent?: boolean
}) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--zen-paper-deep)', borderRadius: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)', letterSpacing: '0.06em', marginBottom: '5px' }}>
        {label} · {labelEn}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '15px', color: accent ? 'var(--zen-red)' : 'var(--zen-ink)' }}>
        {zh}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-ink)', marginTop: '2px' }}>
        {en}
      </div>
    </div>
  )
}

const strengthEnMap: Record<string, string> = {
  身强: 'Day Master strong',
  身弱: 'Day Master weak',
  中和: 'Balanced',
  从强: 'Follower (strong)',
  从弱: 'Follower (weak)',
}

const elementZhToEn: Record<string, string> = {
  金: 'Metal', 木: 'Wood', 水: 'Water', 火: 'Fire', 土: 'Earth',
}

interface Props {
  data: MockData
  profileId: string
  initialStatus: ReportStatus
  initialStructured: ReportStructured | null
}

export default function ChartReadingPanel({ data, profileId, initialStatus, initialStructured }: Props) {
  const [status, setStatus] = useState<ReportStatus>(initialStatus)
  const [structured, setStructured] = useState<ReportStructured | null>(initialStructured)

  useEffect(() => {
    // Stop polling once structured data has arrived (Stage 1 complete — data won't change)
    if (structured && structured.strength) return
    // Also stop at terminal states
    if (status === 'done' || status === 'failed') return

    const id = setInterval(async () => {
      try {
        const result = await getReportStatus(profileId)
        setStatus(result.status)
        setStructured(result.report_structured)
      } catch {
        // non-fatal: retry on next tick
      }
    }, 3000)

    return () => clearInterval(id)
  }, [status, structured, profileId])

  const hasStructured = !!(structured != null && (structured.strength || structured.pattern || (structured.favorable?.length ?? 0) > 0))

  const isAnalyzing = status === 'pending' || status === 'generating' || status === 'generating_structured'

  let strengthZh: string, strengthEn: string
  let patternZh: string, patternEn: string
  let favorableZh: string, favorableEn: string
  let unfavorableZh: string, unfavorableEn: string

  if (hasStructured) {
    strengthZh = structured!.strength ?? '—'
    strengthEn = strengthEnMap[structured!.strength ?? ''] ?? structured!.strength ?? '—'
    patternZh = structured!.pattern ?? '—'
    patternEn = structured!.pattern ?? '—'
    favorableZh = structured!.favorable?.join(' ') ?? '—'
    favorableEn = (structured!.favorable ?? []).map(e => elementZhToEn[e] ?? e).join(', ') || '—'
    unfavorableZh = structured!.unfavorable?.join(' ') ?? '—'
    unfavorableEn = (structured!.unfavorable ?? []).map(e => elementZhToEn[e] ?? e).join(', ') || '—'
  } else if (isAnalyzing) {
    strengthZh = '—'; strengthEn = 'Analyzing...'
    patternZh = '—'; patternEn = 'Analyzing...'
    favorableZh = '—'; favorableEn = 'Analyzing...'
    unfavorableZh = '—'; unfavorableEn = 'Analyzing...'
  } else {
    strengthZh = '—'; strengthEn = 'Unavailable'
    patternZh = '—'; patternEn = 'Unavailable'
    favorableZh = '—'; favorableEn = 'Unavailable'
    unfavorableZh = '—'; unfavorableEn = 'Unavailable'
  }

  // Season always available — derived from pillars via adapter, not AI
  const seasonZh = data.chartReading.season
  const seasonEn = data.chartReading.seasonEn

  const unfavCombinedZh = (hasStructured && structured!.unfavorable && structured!.unfavorable.length > 0)
    ? `${unfavorableZh} · ${seasonZh}`
    : seasonZh
  const unfavCombinedEn = (hasStructured && structured!.unfavorable && structured!.unfavorable.length > 0)
    ? `${unfavorableEn} · ${seasonEn}`
    : seasonEn

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '0.5px solid rgba(188,45,45,0.12)',
      borderRadius: '0',
      padding: '10px',
      height: '260px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>
        盘面要点 · CHART READING
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', flex: 1 }}>
        <Cell label="身强弱" labelEn="Strength" zh={strengthZh} en={strengthEn} accent={hasStructured && !!structured!.strength} />
        <Cell label="格局" labelEn="Pattern" zh={patternZh} en={patternEn} />
        <Cell label="喜用神" labelEn="Favorable" zh={favorableZh} en={favorableEn} accent={hasStructured && (structured!.favorable?.length ?? 0) > 0} />
        <Cell label="忌神 · 月令" labelEn="Unfavorable · Season" zh={unfavCombinedZh} en={unfavCombinedEn} />
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
