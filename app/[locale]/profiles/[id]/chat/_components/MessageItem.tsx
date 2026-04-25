'use client'

import { useState, useEffect } from 'react'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getMessageStatus } from '@/lib/actions/conversations'
import type { Message } from '@/lib/actions/conversations'

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#854F0B',
  marginBottom: '6px',
}

export default function MessageItem({ message }: { message: Message }) {
  const [localMsg, setLocalMsg] = useState<Message>(message)

  // Poll for status updates on pending/generating assistant messages
  useEffect(() => {
    const isPolling =
      localMsg.role === 'assistant' &&
      (localMsg.status === 'pending' || localMsg.status === 'generating')
    if (!isPolling) return

    const id = setInterval(async () => {
      try {
        const result = await getMessageStatus(localMsg.id)
        if ('message' in result) {
          setLocalMsg(result.message)
        }
      } catch {
        // non-fatal: will retry on next tick
      }
    }, 3000)

    return () => clearInterval(id)
  }, [localMsg.status, localMsg.id, localMsg.role])

  if (localMsg.role === 'user') {
    return (
      <div>
        <div style={labelStyle}>You</div>
        <div style={{
          background: 'var(--zen-paper-deep)',
          border: '1px solid var(--zen-gold-pale)',
          padding: '12px 16px',
        }}>
          <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#1a1a1a',
            margin: 0,
          }}>
            {localMsg.content}
          </p>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div>
      <div style={labelStyle}>Assistant</div>

      {(localMsg.status === 'pending' || localMsg.status === 'generating') && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className="reading-spinner" style={{ margin: '0 auto 12px' }} />
          <p className="reading-loading-text">Generating reply…</p>
        </div>
      )}

      {localMsg.status === 'done' && localMsg.content && (
        <div
          className="ai-content-box"
          dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(localMsg.content) }}
        />
      )}

      {localMsg.status === 'failed' && (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-red)',
          margin: 0,
        }}>
          Generation failed.{localMsg.error ? ` ${localMsg.error}` : ''}
        </p>
      )}
    </div>
  )
}
