'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuestion } from '@/lib/actions/submit-question'
import type { QuestionRow } from '@/lib/actions/get-questions'
import QuestionInput from './QuestionInput'
import PresetButtons from './PresetButtons'
import QuestionItem from './QuestionItem'
import EmptyState from './EmptyState'

export default function AskSection({
  profileId,
  initialQuestions,
}: {
  profileId: string
  initialQuestions: QuestionRow[]
}) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref for auto-scroll to history list after new question is submitted
  const historyRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(initialQuestions.length)

  // Scroll to history list top when a new question appears (after router.refresh)
  useEffect(() => {
    if (initialQuestions.length > prevCountRef.current && historyRef.current) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    prevCountRef.current = initialQuestions.length
  }, [initialQuestions.length])

  async function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitQuestion(profileId, trimmed)
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

  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          Ask a Question · 问命
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-ink)',
          marginTop: '6px',
          marginBottom: 0,
        }}>
          Pose a question about your destiny chart.
        </p>
      </div>

      <div className="zen-result-card">
        {/* Input area */}
        <QuestionInput
          profileId={profileId}
          text={text}
          setText={setText}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />

        {/* Preset buttons */}
        <div style={{ marginTop: '12px' }}>
          <PresetButtons onPick={(t) => setText(t)} />
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid var(--zen-gold-pale)',
          margin: '24px 0',
        }} />

        {/* History — ref anchors scroll target */}
        <div ref={historyRef}>
          {initialQuestions.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {initialQuestions.map((q, i) => (
                <QuestionItem key={q.id} question={q} isFirst={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
