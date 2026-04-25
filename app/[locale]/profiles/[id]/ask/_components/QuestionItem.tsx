'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getQuestionStatus } from '@/lib/actions/get-questions'
import { retryQuestion } from '@/lib/actions/submit-question'
import type { QuestionRow } from '@/lib/actions/get-questions'

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#854F0B',
  marginBottom: '6px',
}

function formatTimestamp(isoString: string, locale: string): string {
  const d = new Date(isoString)
  const intlLocale = locale === 'zh-CN' ? 'zh-Hans-CN' : locale === 'zh-TW' ? 'zh-Hant-TW' : 'en-US'
  const date = new Intl.DateTimeFormat(intlLocale, {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat(intlLocale, {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d)
  return `${date} · ${time}`
}

export default function QuestionItem({
  question: q,
  isFirst,
}: {
  question: QuestionRow
  isFirst: boolean
}) {
  const t = useTranslations('ask.item')
  const locale = useLocale()

  const [status, setStatus] = useState(q.status)
  const [answer, setAnswer] = useState<string | null>(q.answer)
  const [itemError, setItemError] = useState<string | null>(q.error)
  const [retrying, setRetrying] = useState(false)

  // Mirror BaseReportSection's polling pattern exactly
  useEffect(() => {
    const isPolling = status === 'pending' || status === 'generating'
    if (!isPolling) return

    const id = setInterval(async () => {
      try {
        const result = await getQuestionStatus(q.id)
        if (result.question) {
          setStatus(result.question.status)
          setAnswer(result.question.answer ?? null)
          setItemError(result.question.error ?? null)
        }
      } catch {
        // non-fatal: will retry on next tick
      }
    }, 3000)

    return () => clearInterval(id)
  }, [status, q.id])

  async function handleRetry() {
    setRetrying(true)
    try {
      const result = await retryQuestion(q.id)
      if ('success' in result && result.success) {
        // Reset to pending — triggers the polling useEffect
        setStatus('pending')
        setAnswer(null)
        setItemError(null)
      } else if ('error' in result) {
        setItemError(result.error)
      }
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div style={{
      borderTop: isFirst ? 'none' : '1px solid var(--zen-gold-pale)',
      paddingTop: isFirst ? '0' : '24px',
      paddingBottom: '24px',
    }}>
      {/* Question label + timestamp */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
        <span style={labelStyle}>{t('questionLabel')}</span>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          letterSpacing: '0.02em',
        }}>
          {formatTimestamp(q.created_at, locale)}
        </span>
      </div>

      {/* Question text */}
      <div style={{
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        color: '#1a1a1a',
        lineHeight: 1.6,
        marginBottom: '16px',
      }}>
        {q.question}
      </div>

      {/* Answer label */}
      <div style={{ ...labelStyle, marginBottom: '8px' }}>{t('answerLabel')}</div>

      {/* Answer body — mirrors BaseReportSection's generating UI */}
      {(status === 'pending' || status === 'generating') && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className="reading-spinner" style={{ margin: '0 auto 12px' }} />
          <p className="reading-loading-text">{t('generatingAnswer')}</p>
        </div>
      )}

      {status === 'done' && answer && (
        <div
          className="ai-content-box"
          dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(answer) }}
        />
      )}

      {status === 'failed' && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            margin: 0,
          }}>
            {t('generationFailed')} {itemError ?? t('pleaseRetry')}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: retrying ? 'var(--zen-text-muted)' : '#854F0B',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: retrying ? 'default' : 'pointer',
              textDecoration: retrying ? 'none' : 'underline',
              flexShrink: 0,
            }}
          >
            {retrying ? t('retrying') : t('retry')}
          </button>
        </div>
      )}
    </div>
  )
}
