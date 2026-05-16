'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ChapterCard from '../_components/reading/ChapterCard'
import { triggerPremiumReport, getPremiumReportStatus } from './actions'
import type { PremiumReportStatus } from './actions'

const POLL_INTERVAL_MS = 4000

// ── Chapter parsing ───────────────────────────────────────────────────────────

const CHAPTER_KEYS = ['core', 'career', 'love', 'forecast'] as const
type ChapterKey = typeof CHAPTER_KEYS[number]

interface ParsedChapter {
  key:     ChapterKey
  title:   string
  content: string
}

/**
 * Split a full premium report blob into up to 4 chapters by ## headings.
 * Returns an array of up to 4 { key, title, content } objects.
 */
function parseReportChapters(text: string, fallbackTitles: Record<ChapterKey, string>): ParsedChapter[] {
  // Split on every newline that is followed by "## "
  const chunks = text.split(/\n(?=## )/)
  return CHAPTER_KEYS.map((key, i) => {
    const chunk = chunks[i] ?? ''
    const firstNewline = chunk.indexOf('\n')
    let title   = fallbackTitles[key]
    let content = chunk

    if (firstNewline !== -1) {
      const headingLine = chunk.slice(0, firstNewline).trim()
      if (headingLine.startsWith('## ')) {
        title   = headingLine.slice(3).trim() || fallbackTitles[key]
        content = chunk.slice(firstNewline + 1).trimStart()
      }
    } else if (chunk.startsWith('## ')) {
      title   = chunk.slice(3).trim() || fallbackTitles[key]
      content = ''
    }

    return { key, title, content: content || '' }
  })
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PremiumReportSection({
  profileId,
  initialStatus,
  initialReport,
  initialLocale,
  initialGeneratedAt,
}: {
  profileId:           string
  initialStatus:       PremiumReportStatus | null
  initialReport:       string | null
  initialLocale:       string | null
  initialGeneratedAt:  string | null
}) {
  const t       = useTranslations('premiumReport')
  const tStatus = useTranslations('reading.status')

  const [status, setStatus]           = useState<PremiumReportStatus | null>(initialStatus)
  const [report, setReport]           = useState<string | null>(initialReport)
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt)
  const [triggering, setTriggering]   = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)

  const isGenerating = status === 'pending' || status === 'generating'
  const isDone       = status === 'done' && !!report
  const isFailed     = status === 'failed'
  const isUnstarted  = !status

  // Poll while generating
  useEffect(() => {
    if (!isGenerating) return
    const id = setInterval(async () => {
      try {
        const result = await getPremiumReportStatus(profileId)
        setStatus(result.status)
        if (result.report)      setReport(result.report)
        if (result.generatedAt) setGeneratedAt(result.generatedAt)
      } catch {
        // non-fatal — retry on next tick
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isGenerating, profileId])

  async function handleGenerate() {
    setTriggering(true)
    setTriggerError(null)
    try {
      const result = await triggerPremiumReport(profileId)
      if (result.ok) {
        setStatus('pending')
      } else {
        setTriggerError(result.error ?? 'Unknown error')
      }
    } catch {
      setTriggerError('Unexpected error')
    } finally {
      setTriggering(false)
    }
  }

  // ── Unstarted: intro card ──────────────────────────────────────────────────
  if (isUnstarted) {
    return <IntroCard onGenerate={handleGenerate} triggering={triggering} error={triggerError} t={t} />
  }

  // ── Generating ─────────────────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="zen-result-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div className="reading-spinner" style={{ margin: '0 auto 20px' }} />
        <p className="reading-loading-text">{t('generating')}</p>
        <p className="reading-loading-sub">{t('generatingHint')}</p>
      </div>
    )
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  if (isFailed) {
    return (
      <div className="zen-result-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--zen-text-muted)',
          marginBottom: '20px',
        }}>
          {t('failed')}
        </p>
        <button
          onClick={handleGenerate}
          disabled={triggering}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '0',
            cursor: triggering ? 'default' : 'pointer',
            background: triggering ? 'var(--zen-gold-pale)' : '#854F0B',
            color: triggering ? '#999' : 'white',
          }}
        >
          {triggering ? '…' : t('retry')}
        </button>
      </div>
    )
  }

  // ── Done: parse into chapter cards ────────────────────────────────────────
  if (isDone) {
    const dateStr = generatedAt
      ? new Date(generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : null

    const fallbackTitles: Record<ChapterKey, string> = {
      core:     t('chapters.core'),
      career:   t('chapters.career'),
      love:     t('chapters.love'),
      forecast: t('chapters.forecast'),
    }

    const chapters = parseReportChapters(report!, fallbackTitles)

    return (
      <div>
        {/* Meta bar */}
        {dateStr && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: 'var(--zen-text-muted)',
              letterSpacing: '0.05em',
            }}>
              {t('generated', { date: dateStr })}
            </span>
          </div>
        )}

        {/* Chapter cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {chapters.map((ch, idx) => (
            <ChapterCard
              key={ch.key}
              index={idx}
              title={ch.title}
              content={ch.content || null}
              isGenerating={false}
              tStatus={(k, v) => tStatus(k as Parameters<typeof tStatus>[0], v)}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}

// ── Intro card ────────────────────────────────────────────────────────────────

function IntroCard({
  onGenerate,
  triggering,
  error,
  t,
}: {
  onGenerate: () => void
  triggering: boolean
  error: string | null
  t: ReturnType<typeof useTranslations<'premiumReport'>>
}) {
  const features = t.raw('intro.features') as string[]

  return (
    <div className="zen-result-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: '0 0 8px',
        }}>
          {t('intro.title')}
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-text-muted)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          {t('intro.subtitle')}
        </p>
      </div>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-ink)' }}>
            <span style={{ color: 'var(--zen-gold)', flexShrink: 0, marginTop: '1px' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onGenerate}
          disabled={triggering}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '12px 28px',
            border: 'none',
            borderRadius: '0',
            cursor: triggering ? 'default' : 'pointer',
            background: triggering ? 'var(--zen-gold-pale)' : '#854F0B',
            color: triggering ? '#999' : 'white',
            display: 'block',
            width: '100%',
          }}
        >
          {triggering ? '…' : t('intro.cta')}
        </button>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          marginTop: '10px',
        }}>
          {t('intro.note')}
        </p>

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            marginTop: '8px',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
