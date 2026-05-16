'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PremiumChapters {
  overview:      string | null
  compatibility: string | null
  communication: string | null
  wealth_career: string | null
  love_marriage: string | null
  forecast:      string | null
}

interface StatusResponse {
  premiumStatus:   string
  premiumChapters: PremiumChapters
}

const CHAPTER_ORDER = [
  'overview',
  'compatibility',
  'communication',
  'wealth_career',
  'love_marriage',
  'forecast',
] as const

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

// ── Chapter card ──────────────────────────────────────────────────────────────

function ChapterCard({
  chapterKey,
  index,
  text,
  isGenerating,
  tChapters,
  tStatus,
}: {
  chapterKey:   string
  index:        number
  text:         string | null
  isGenerating: boolean
  tChapters:    (key: string) => string
  tStatus:      (key: string, values?: Record<string, string | number>) => string
}) {
  const [open, setOpen] = useState(index === 0)

  useEffect(() => {
    if (text && index === 0) setOpen(true)
  }, [text, index])

  return (
    <div className="zen-result-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          borderBottom: open ? '1px solid var(--zen-border)' : 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: text ? '#854F0B' : 'var(--zen-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {text ? (
              <span style={{ color: 'white', fontSize: '11px', fontFamily: 'var(--font-ui)' }}>✓</span>
            ) : (
              <span style={{ color: 'var(--zen-text-muted)', fontSize: '10px', fontFamily: 'var(--font-ui)' }}>{index + 1}</span>
            )}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--zen-text-muted)' }}>
              Chapter {index + 1}
            </div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500, color: 'var(--zen-ink)', letterSpacing: '0.03em' }}>
              {tChapters(chapterKey)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isGenerating && !text && (
            <span className="wizard-spinner" style={{ width: '14px', height: '14px' }} />
          )}
          {!text && !isGenerating && (
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--zen-text-muted)' }}>{tStatus('pending')}</span>
          )}
          <span style={{ color: 'var(--zen-text-muted)', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '28px 36px' }}>
          {text ? (
            <div
              className="ai-content-box"
              style={{ border: 'none', padding: 0 }}
              dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(text) }}
            />
          ) : isGenerating ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="wizard-spinner" style={{ width: '20px', height: '20px', marginBottom: '12px' }} />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', margin: 0 }}>
                {tStatus('generating')}
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)', textAlign: 'center', padding: '24px 0' }}>
              {tStatus('awaitingPrev')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PremiumCompatibilitySection({
  reportId,
  locale,
  initialStatus,
  initialChapters,
}: {
  reportId:        string
  locale:          string
  initialStatus:   string
  initialChapters: PremiumChapters
}) {
  const tStatus   = useTranslations('reading.status')
  const tChapters = useTranslations('compatibility.chapters')

  const [premiumStatus, setPremiumStatus] = useState(initialStatus)
  const [chapters, setChapters]           = useState<PremiumChapters>(initialChapters)
  const [pollCount, setPollCount]         = useState(0)

  const isActive       = premiumStatus === 'generating' || premiumStatus === 'pending'
  const completedCount = CHAPTER_ORDER.filter(k => !!chapters[k]).length

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/compatibility/${reportId}/status`)
        if (!res.ok) return
        const data: StatusResponse = await res.json()
        setPremiumStatus(data.premiumStatus)
        setChapters(data.premiumChapters)
        setPollCount(c => c + 1)
        if (data.premiumStatus === 'completed' || data.premiumStatus === 'failed') {
          clearInterval(interval)
        }
      } catch { /* noop */ }
    }, 4000)
    return () => clearInterval(interval)
  }, [reportId, isActive])

  const currentlyGeneratingIndex = isActive
    ? CHAPTER_ORDER.findIndex(k => !chapters[k])
    : -1

  return (
    <div>
      {/* Progress header */}
      <div className="zen-result-card" style={{ padding: '16px 20px', marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={labelStyle}>Premium Compatibility Report · 完整大师合婚</span>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)' }}>
              {premiumStatus === 'completed'
                ? tStatus('complete')
                : premiumStatus === 'failed'
                ? `${tStatus('failed')} (${completedCount}/6)`
                : tStatus('progress', { n: completedCount, total: 6 })}
            </div>
          </div>
          {isActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="wizard-spinner" />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
                {pollCount > 0 ? tStatus('generating') : tStatus('pending')}
              </span>
            </div>
          )}
          {premiumStatus === 'failed' && completedCount < 6 && (
            <RetryButton
              reportId={reportId}
              chapters={chapters}
              setPremiumStatus={setPremiumStatus}
              tStatus={tStatus}
            />
          )}
        </div>

        <div style={{ marginTop: '12px', height: '3px', background: 'var(--zen-border)' }}>
          <div style={{
            height: '3px',
            background: premiumStatus === 'failed' ? '#BC2D2D' : '#854F0B',
            width: `${(completedCount / 6) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Chapter cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '2px' }}>
        {CHAPTER_ORDER.map((key, idx) => (
          <ChapterCard
            key={key}
            chapterKey={key}
            index={idx}
            text={chapters[key]}
            isGenerating={isActive && idx === currentlyGeneratingIndex}
            tChapters={(k) => tChapters(k as Parameters<typeof tChapters>[0])}
            tStatus={(k, v) => tStatus(k as Parameters<typeof tStatus>[0], v)}
          />
        ))}
      </div>
    </div>
  )
}

function RetryButton({
  reportId,
  chapters,
  setPremiumStatus,
  tStatus,
}: {
  reportId:         string
  chapters:         PremiumChapters
  setPremiumStatus: (s: string) => void
  tStatus:          (key: string) => string
}) {
  const [loading, setLoading] = useState(false)

  async function handleRetry() {
    setLoading(true)
    const firstMissing = CHAPTER_ORDER.find(k => !chapters[k]) ?? 'overview'
    try {
      const res = await fetch(`/api/compatibility/${reportId}/generate-premium-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: firstMissing }),
      })
      if (res.ok) {
        setPremiumStatus('generating')
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      style={{
        fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 500,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '8px 16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: '#854F0B', color: 'white', opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '…' : tStatus('retry')}
    </button>
  )
}
