'use client'

import { useEffect, useRef } from 'react'
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  const isSelf = relation.toLowerCase() === 'self'

  return (
    <div>
      <StepTitle>{isSelf ? "What's your name?" : 'What should we call them?'}</StepTitle>
      <div style={{ marginTop: '48px', maxWidth: '400px', margin: '48px auto 0' }}>
        <input
          ref={inputRef}
          type="text"
          className="zen-input wizard-name-input"
          placeholder={isSelf ? 'Your name' : 'Their name'}
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
