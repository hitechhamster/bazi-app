'use client'

import { useState, useEffect, useRef } from 'react'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'

interface ChapterCardProps {
  /** 0-based index */
  index: number
  /** Display title (already resolved from i18n or parsed from content) */
  title: string
  /** Full chapter text (may include a leading ## heading — it will be rendered as-is) */
  content: string | null
  /** True only while THIS specific chapter is the one currently being generated */
  isGenerating: boolean
  tStatus: (key: string, values?: Record<string, string | number>) => string
}

export default function ChapterCard({
  index,
  title,
  content,
  isGenerating,
  tStatus,
}: ChapterCardProps) {
  const prevHadContent = useRef(content !== null)
  const [open, setOpen] = useState(index === 0)

  // Auto-open when content arrives (null → non-null transition)
  useEffect(() => {
    if (!prevHadContent.current && content !== null) {
      setOpen(true)
    }
    prevHadContent.current = content !== null
  }, [content])

  return (
    <div className="zen-result-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* ── Header / toggle ── */}
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
          {/* Status dot */}
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: content ? '#854F0B' : 'var(--zen-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {content ? (
              <span style={{ color: 'white', fontSize: '11px', fontFamily: 'var(--font-ui)' }}>✓</span>
            ) : (
              <span style={{ color: 'var(--zen-text-muted)', fontSize: '10px', fontFamily: 'var(--font-ui)' }}>
                {index + 1}
              </span>
            )}
          </div>

          {/* Label + title */}
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--zen-text-muted)',
            }}>
              Chapter {index + 1}
            </div>
            <div style={{
              fontFamily: 'var(--font-main)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--zen-ink)',
              letterSpacing: '0.03em',
            }}>
              {title}
            </div>
          </div>
        </div>

        {/* Right-side status + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isGenerating && !content && (
            <span className="wizard-spinner" style={{ width: '14px', height: '14px' }} />
          )}
          {!content && !isGenerating && (
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              color: 'var(--zen-text-muted)',
            }}>
              {tStatus('pending')}
            </span>
          )}
          <span style={{ color: 'var(--zen-text-muted)', fontSize: '12px' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* ── Body ── */}
      {open && (
        <div style={{ padding: '28px 36px' }}>
          {content ? (
            <div
              className="ai-content-box"
              style={{ border: 'none', padding: 0 }}
              dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(content) }}
            />
          ) : isGenerating ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="wizard-spinner" style={{ width: '20px', height: '20px', marginBottom: '12px' }} />
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--zen-text-muted)',
                margin: 0,
              }}>
                {tStatus('generating')}
              </p>
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-text-muted)',
              textAlign: 'center',
              padding: '24px 0',
            }}>
              {tStatus('awaitingPrev')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
