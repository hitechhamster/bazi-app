'use client'

import { useTranslations } from 'next-intl'

const MAX_LENGTH = 500

export default function QuestionInput({
  profileId: _profileId,
  text,
  setText,
  submitting,
  error,
  onSubmit,
}: {
  profileId: string
  text: string
  setText: (v: string) => void
  submitting: boolean
  error: string | null
  onSubmit: () => void
}) {
  const t = useTranslations('ask.input')
  const disabled = submitting || text.trim().length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('placeholder')}
        rows={4}
        maxLength={MAX_LENGTH}
        style={{
          width: '100%',
          minHeight: '96px',
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

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={disabled}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            borderRadius: '0',
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
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>

      {/* Submission error */}
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
