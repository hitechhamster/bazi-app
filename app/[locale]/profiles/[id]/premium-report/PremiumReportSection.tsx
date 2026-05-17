'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ChapterCard from '../_components/reading/ChapterCard'
import { triggerPremiumReport, getPremiumReportStatus } from './actions'
import type { PremiumReportStatus } from './actions'

const POLL_INTERVAL_MS = 4000

// ── Chapter parsing ───────────────────────────────────────────────────────────

interface ParsedChapter {
  title:   string
  content: string
}

/** Strip trailing [[TEASER: ...]] blocks (free-report artifact, not shown for paid users) */
function stripTeaser(text: string): string {
  return text.replace(/\n*\[\[TEASER:[\s\S]*?\]\]\s*$/, '').trimEnd()
}

/**
 * Dynamically parse a premium_report blob into chapters by ## headings.
 *
 * Rules:
 * - Any content before the first ## heading → prepended as an "Introduction" chapter
 * - Each ## heading becomes a chapter; title is extracted from the heading line
 * - Trailing [[TEASER:...]] blocks are stripped before parsing
 * - If the blob has no ## headings at all → treat entire text as single intro chapter
 */
function parseReportChapters(text: string, introTitle: string): ParsedChapter[] {
  const cleaned = stripTeaser(text)
  if (!cleaned.trim()) return []

  // Split on every newline that is immediately followed by ##
  const parts = cleaned.split(/\n(?=## )/)
  const chapters: ParsedChapter[] = []

  for (const part of parts) {
    const trimmed = part.trimStart()
    if (!trimmed) continue

    if (trimmed.startsWith('## ')) {
      const firstNL = trimmed.indexOf('\n')
      const heading = firstNL === -1 ? trimmed : trimmed.slice(0, firstNL)
      const body    = firstNL === -1 ? '' : trimmed.slice(firstNL + 1).trimStart()
      const title   = heading.slice(3).trim() || introTitle
      chapters.push({ title, content: body })
    } else {
      // Pre-heading preamble → intro chapter
      chapters.push({ title: introTitle, content: trimmed })
    }
  }

  // Fallback: no ## headings found at all
  if (chapters.length === 0) {
    chapters.push({ title: introTitle, content: cleaned.trim() })
  }

  return chapters
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

  // ── Done: parse blob into dynamic chapter cards ───────────────────────────
  if (isDone) {
    const dateStr = generatedAt
      ? new Date(generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : null

    const chapters      = parseReportChapters(report!, t('introSectionTitle'))
    const filledCount   = chapters.filter(ch => !!ch.content).length
    const totalCount    = chapters.length

    return (
      <div>
        {/* Meta bar */}
        <div className="zen-result-card" style={{ padding: '14px 20px', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {dateStr && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--zen-text-muted)',
                letterSpacing: '0.05em',
              }}>
                {t('generated', { date: dateStr })}
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: 'var(--zen-text-muted)',
            }}>
              {tStatus('progress', { n: filledCount, total: totalCount })}
            </span>
          </div>
        </div>

        {/* Dynamic chapter cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {chapters.map((ch, idx) => (
            <ChapterCard
              key={idx}
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

const CHAPTER_ORDER = ['core', 'career', 'love', 'forecast'] as const
const VALUE_PROP_ORDER = ['words', 'chapters', 'forecast', 'permanent'] as const
const ZH_ORDINALS = ['一', '二', '三', '四']
const EN_ORDINALS  = ['I', 'II', 'III', 'IV']

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
  const locale   = useLocale()
  const ordinals = locale === 'en' ? EN_ORDINALS : ZH_ORDINALS
  const chapters   = t.raw('intro.chapters') as Record<string, { title: string; desc: string }>
  const valueProps = t.raw('intro.valueProps') as Record<string, string>

  return (
    <div className="zen-result-card" style={{ maxWidth: '560px', margin: '0 auto', padding: 0, overflow: 'hidden' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '40px 32px 28px' }}>
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
          margin: '0 0 16px',
          lineHeight: 1.6,
        }}>
          {t('intro.subtitle')}
        </p>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--zen-ink)',
          margin: 0,
          lineHeight: 1.75,
        }}>
          {t('intro.body')}
        </p>
      </div>

      {/* ── 4 Chapter Previews ── */}
      <div style={{ borderTop: '1px solid var(--zen-border)', padding: '24px 32px' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--zen-text-muted)',
          marginBottom: '14px',
        }}>
          {locale === 'en' ? 'Four Chapters' : '四大章节'}
        </div>
        {CHAPTER_ORDER.map((key, i) => {
          const ch = chapters[key]
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: i < CHAPTER_ORDER.length - 1 ? '1px solid var(--zen-border)' : 'none',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: '11px',
                color: '#854F0B',
                flexShrink: 0,
                minWidth: '20px',
                marginTop: '1px',
              }}>
                {ordinals[i]}
              </span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--zen-ink)',
                  marginBottom: '2px',
                }}>
                  {ch?.title ?? key}
                </div>
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--zen-text-muted)',
                  lineHeight: 1.5,
                }}>
                  {ch?.desc ?? ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Value Props ── */}
      <div style={{
        borderTop: '1px solid var(--zen-border)',
        padding: '20px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 24px',
      }}>
        {VALUE_PROP_ORDER.map(key => (
          <div key={key} style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--zen-ink)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ color: '#854F0B', fontSize: '10px' }}>✦</span>
            {valueProps[key] ?? ''}
          </div>
        ))}
      </div>

      {/* ── CTA + Note ── */}
      <div style={{ borderTop: '1px solid var(--zen-border)', padding: '24px 32px', textAlign: 'center' }}>
        <button
          onClick={onGenerate}
          disabled={triggering}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '14px 28px',
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
          marginBottom: 0,
          lineHeight: 1.6,
        }}>
          {t('intro.note')}
        </p>

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            marginTop: '8px',
            marginBottom: 0,
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
