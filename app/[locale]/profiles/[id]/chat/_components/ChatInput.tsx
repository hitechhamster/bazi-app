'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { submitChatMessage, createConversation } from '@/lib/actions/conversations'

const MAX_LENGTH = 2000

export default function ChatInput({
  conversationId,
  profileId,
  turnCount,
}: {
  conversationId: string
  profileId: string
  turnCount: number
}) {
  const router = useRouter()
  const t = useTranslations('chat')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)

  const disabled = submitting || text.trim().length === 0

  async function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitChatMessage(conversationId, trimmed)
      if ('error' in result) {
        setError(result.error)
      } else {
        setText('')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStartFresh() {
    if (creatingNew) return
    setCreatingNew(true)
    try {
      const result = await createConversation(profileId)
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/profiles/${profileId}/chat/${result.conversationId}`)
      }
    } catch {
      setError('Failed to create new conversation.')
    } finally {
      setCreatingNew(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 16-turn advisory — appears above textarea at ≥15 turns */}
      {turnCount >= 15 && (
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: turnCount >= 25 ? 'var(--zen-red)' : 'var(--zen-text-muted)',
          lineHeight: 1.5,
        }}>
          {t('input.warningLong')}{' '}
          <button
            type="button"
            onClick={handleStartFresh}
            disabled={creatingNew}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: creatingNew ? 'var(--zen-text-muted)' : '#854F0B',
              background: 'transparent',
              border: 'none',
              padding: 0,
              textDecoration: creatingNew ? 'none' : 'underline',
              cursor: creatingNew ? 'default' : 'pointer',
            }}
          >
            {creatingNew ? t('creating') : t('input.startFreshLink')}
          </button>
          .
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('input.placeholder')}
        rows={3}
        maxLength={MAX_LENGTH}
        style={{
          width: '100%',
          minHeight: '72px',
          background: 'white',
          border: '1px solid var(--zen-gold-pale)',
          borderRadius: '0',
          padding: '8px 12px',
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#1a1a1a',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#854F0B' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--zen-gold-pale)' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Character count */}
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
        }}>
          {text.length}/{MAX_LENGTH}
        </span>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            background: disabled ? 'var(--zen-gold-pale)' : '#854F0B',
            color: disabled ? '#999' : 'white',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.background = '#6d4009'
          }}
          onMouseLeave={(e) => {
            if (!disabled) e.currentTarget.style.background = '#854F0B'
          }}
        >
          {submitting ? t('input.sending') : t('input.send')}
        </button>
      </div>

      {error && (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-red)',
          margin: 0,
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
