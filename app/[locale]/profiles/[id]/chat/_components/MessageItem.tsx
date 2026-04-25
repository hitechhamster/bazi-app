'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getMessageStatus, retryMessage } from '@/lib/actions/conversations'
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
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')
  const [localMsg, setLocalMsg] = useState<Message>(message)
  const [retrying, setRetrying] = useState(false)

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

  async function handleRetry() {
    if (retrying) return
    setRetrying(true)
    try {
      const result = await retryMessage(localMsg.id)
      if ('ok' in result) {
        setLocalMsg((prev) => ({ ...prev, status: 'pending', content: '', error: null }))
      }
    } catch {
      // non-fatal
    } finally {
      setRetrying(false)
    }
  }

  if (localMsg.role === 'user') {
    return (
      <div>
        <div style={labelStyle}>{t('messageItem.userLabel')}</div>
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
      <div style={labelStyle}>{t('messageItem.assistantLabel')}</div>

      {(localMsg.status === 'pending' || localMsg.status === 'generating') && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className="reading-spinner" style={{ margin: '0 auto 12px' }} />
          <p className="reading-loading-text">{t('messageItem.generating')}</p>
        </div>
      )}

      {localMsg.status === 'done' && localMsg.content && (
        <div
          className="ai-content-box"
          dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(localMsg.content) }}
        />
      )}

      {localMsg.status === 'failed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            margin: 0,
          }}>
            {t('messageItem.generationFailed')}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: retrying ? 'var(--zen-text-muted)' : '#854F0B',
              textDecoration: retrying ? 'none' : 'underline',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: retrying ? 'default' : 'pointer',
            }}
          >
            {retrying ? tCommon('tryAgain') + '…' : tCommon('tryAgain')}
          </button>
        </div>
      )}
    </div>
  )
}
