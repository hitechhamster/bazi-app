'use client'

import { useState, useCallback } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { createProfile } from './actions'
import ProgressDots from './ProgressDots'
import Step1Relation from './Step1Relation'
import Step2Name from './Step2Name'
import Step3Gender from './Step3Gender'
import Step4Birth from './Step4Birth'
import Step5City from './Step5City'

export type Fields = {
  relation: string
  name: string
  gender: string
  birth_date: string
  birth_time: string
  is_time_unknown: boolean
  birth_city: string
  longitude: string
  timezone_offset_sec: string
}

export default function ProfileForm() {
  const [state, formAction, isPending] = useActionState(createProfile, null)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [fields, setFields] = useState<Fields>({
    relation: '',
    name: '',
    gender: '',
    birth_date: '',
    birth_time: '',
    is_time_unknown: false,
    birth_city: '',
    longitude: '',
    timezone_offset_sec: '',
  })

  const setField = useCallback((key: keyof Fields, value: string | boolean) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }, [])

  const goNext = useCallback(() => {
    setDirection('forward')
    setStep(s => Math.min(s + 1, 5))
  }, [])

  const goBack = useCallback(() => {
    setDirection('back')
    setStep(s => Math.max(s - 1, 1))
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" />

      <div className="relative z-10 max-w-[640px] mx-auto px-6 py-12">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '56px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              className="zen-seal"
              style={{ width: '36px', height: '36px', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}
            >
              命
            </div>
          </Link>
          <ProgressDots total={5} current={step} />
          <div style={{ width: '36px', flexShrink: 0 }} />
        </div>

        {state?.error && (
          <p style={{
            color: 'var(--zen-red)',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            marginBottom: '28px',
            textAlign: 'center',
          }}>
            {state.error}
          </p>
        )}

        {/* Form wraps everything — hidden inputs carry all step data to the Server Action */}
        <form action={formAction}>
          <input type="hidden" name="relation"            value={fields.relation} />
          <input type="hidden" name="name"                value={fields.name} />
          <input type="hidden" name="gender"              value={fields.gender} />
          <input type="hidden" name="birth_date"          value={fields.birth_date} />
          <input type="hidden" name="birth_time"          value={fields.is_time_unknown ? '' : fields.birth_time} />
          <input type="hidden" name="is_time_unknown"     value={fields.is_time_unknown ? 'on' : ''} />
          <input type="hidden" name="longitude"           value={fields.longitude} />
          <input type="hidden" name="timezone_offset_sec" value={fields.timezone_offset_sec} />
          <input type="hidden" name="birth_city"          value={fields.birth_city} />

          {/* Animated step container — key change triggers CSS enter animation */}
          <div key={step} className={`step-anim-${direction}`}>
            {step === 1 && (
              <Step1Relation
                value={fields.relation}
                onSelect={(v) => { setField('relation', v); goNext() }}
              />
            )}
            {step === 2 && (
              <Step2Name
                value={fields.name}
                onChange={(v) => setField('name', v)}
                onNext={goNext}
                onBack={goBack}
                relation={fields.relation}
              />
            )}
            {step === 3 && (
              <Step3Gender
                value={fields.gender}
                onSelect={(v) => { setField('gender', v); goNext() }}
                onBack={goBack}
                relation={fields.relation}
              />
            )}
            {step === 4 && (
              <Step4Birth
                fields={fields}
                setField={setField}
                onNext={goNext}
                onBack={goBack}
                relation={fields.relation}
              />
            )}
            {step === 5 && (
              <Step5City
                fields={fields}
                setField={setField}
                onBack={goBack}
                relation={fields.relation}
                isPending={isPending}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
