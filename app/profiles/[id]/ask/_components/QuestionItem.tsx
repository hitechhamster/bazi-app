'use client'

import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import type { QuestionRow } from '@/lib/actions/get-questions'

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#854F0B',
  marginBottom: '6px',
}

function formatTimestamp(isoString: string): string {
  const d = new Date(isoString)
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat('en-US', {
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
  return (
    <div style={{
      borderTop: isFirst ? 'none' : '1px solid var(--zen-gold-pale)',
      paddingTop: isFirst ? '0' : '24px',
      paddingBottom: '24px',
    }}>
      {/* Question label + timestamp */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
        <span style={labelStyle}>Question</span>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          letterSpacing: '0.02em',
        }}>
          {formatTimestamp(q.created_at)}
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
      <div style={{ ...labelStyle, marginBottom: '8px' }}>Answer</div>

      {/* Answer body */}
      {(q.status === 'pending' || q.status === 'generating') && (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Generating...
        </p>
      )}

      {q.status === 'done' && q.answer && (
        <div
          className="ai-content-box"
          dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(q.answer) }}
        />
      )}

      {q.status === 'failed' && (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-red)',
          margin: 0,
        }}>
          Generation failed. {q.error ?? 'Please try again.'}
        </p>
      )}
    </div>
  )
}
