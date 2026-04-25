'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { StepTitle, NavRow, BackButton, NextButton } from './StepShared'

export default function Step2Name({
  value,
  onChange,
  onNext,
  onBack,
  relation,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
  relation: string
}) {
  const t = useTranslations('newProfile')
  const inputRef = useRef<HTMLInputElement>(null)
  const isSelf = relation.toLowerCase() === 'self'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault()
        onNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onBack()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [value, onNext, onBack])

  return (
    <div>
      <StepTitle>{isSelf ? t('step2.titleSelf') : t('step2.titleOther')}</StepTitle>
      <div style={{ marginTop: '48px', maxWidth: '400px', margin: '48px auto 0' }}>
        <input
          ref={inputRef}
          type="text"
          className="zen-input wizard-name-input"
          placeholder={isSelf ? t('step2.placeholderSelf') : t('step2.placeholderOther')}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <NavRow>
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={!value.trim()} />
      </NavRow>
    </div>
  )
}
