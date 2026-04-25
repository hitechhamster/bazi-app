'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { StepTitle, NavRow, BackButton, NextButton } from './StepShared'
import type { Fields } from './ProfileForm'

const today = new Date().toISOString().split('T')[0]

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--zen-text-muted)',
  marginBottom: '8px',
}

export default function Step4Birth({
  fields,
  setField,
  onNext,
  onBack,
  relation,
}: {
  fields: Fields
  setField: (key: keyof Fields, value: string | boolean) => void
  onNext: () => void
  onBack: () => void
  relation: string
}) {
  const t = useTranslations('newProfile')
  const dateRef = useRef<HTMLInputElement>(null)
  const isSelf = relation.toLowerCase() === 'self'

  useEffect(() => {
    dateRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && fields.birth_date) {
        e.preventDefault()
        onNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onBack()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fields.birth_date, onNext, onBack])

  return (
    <div>
      <StepTitle>{isSelf ? 'When were you born?' : 'When were they born?'}</StepTitle>
      <div style={{ marginTop: '48px', maxWidth: '340px', margin: '48px auto 0' }}>
        <label style={labelStyle}>{t('fields.birthDate')}</label>
        <input
          ref={dateRef}
          type="date"
          className="zen-input"
          min="1900-01-01"
          max={today}
          value={fields.birth_date}
          onChange={e => setField('birth_date', e.target.value)}
        />

        <div style={{ marginTop: '36px' }}>
          <label style={labelStyle}>
            {t('fields.birthTime')}{' '}
            <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="time"
            className="zen-input"
            disabled={fields.is_time_unknown}
            value={fields.birth_time}
            onChange={e => setField('birth_time', e.target.value)}
            style={{ opacity: fields.is_time_unknown ? 0.35 : 1 }}
          />
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--zen-text-muted)',
          }}>
            <input
              type="checkbox"
              checked={fields.is_time_unknown}
              onChange={e => setField('is_time_unknown', e.target.checked)}
              style={{ accentColor: 'var(--zen-red)', width: '14px', height: '14px' }}
            />
            {t('fields.timeUnknown')}
          </label>
        </div>
      </div>
      <NavRow>
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={!fields.birth_date} />
      </NavRow>
    </div>
  )
}
