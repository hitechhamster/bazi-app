'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { StepTitle, NavRow, BackButton } from './StepShared'
import type { Fields } from './ProfileForm'

type GeoResult = { label: string; lat: number; lng: number; tzOffsetSec: number }

export default function Step5City({
  fields,
  setField,
  onBack,
  relation,
  isPending,
}: {
  fields: Fields
  setField: (key: keyof Fields, value: string | boolean) => void
  onBack: () => void
  relation: string
  isPending: boolean
}) {
  const t = useTranslations('newProfile')
  const [cityQuery, setCityQuery] = useState(fields.birth_city)
  const [cityResults, setCityResults] = useState<GeoResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSelf = relation.toLowerCase() === 'self'

  const isSelected = !!fields.longitude

  const handleCityInput = useCallback((value: string) => {
    setCityQuery(value)
    setField('longitude', '')
    setField('timezone_offset_sec', '')
    setField('birth_city', '')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setCityResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data: GeoResult[] = await res.json()
          setCityResults(data)
          setShowDropdown(data.length > 0)
        }
      } catch { /* network error */ }
    }, 300)
  }, [setField])

  const handleSelectCity = (result: GeoResult) => {
    setCityQuery(result.label)
    setField('birth_city', result.label)
    setField('longitude', String(result.lng))
    setField('timezone_offset_sec', String(result.tzOffsetSec))
    setShowDropdown(false)
    setCityResults([])
  }

  return (
    <div>
      <StepTitle>{isSelf ? t('step5.titleSelf') : t('step5.titleOther')}</StepTitle>
      <div style={{ marginTop: '48px', maxWidth: '400px', margin: '48px auto 0', position: 'relative' }}>
        <input
          type="text"
          className="zen-input"
          placeholder={t('fields.locationPlaceholder')}
          value={cityQuery}
          onChange={e => handleCityInput(e.target.value)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          autoComplete="off"
          autoFocus
        />

        {isSelected ? (
          <p style={{ fontSize: '12px', color: 'var(--element-wood)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            {t('step5.statusSelected')}
          </p>
        ) : cityQuery.length > 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            {t('step5.statusSuggesting')}
          </p>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            {t('step5.statusOptional')}
          </p>
        )}

        {showDropdown && cityResults.length > 0 && (
          <div className="city-dropdown">
            {cityResults.map((r, i) => (
              <div key={i} className="city-dropdown-item" onMouseDown={() => handleSelectCity(r)}>
                {r.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <NavRow>
        <BackButton onClick={onBack} />
        <button
          type="submit"
          disabled={isPending}
          className="zen-btn-primary"
          style={{
            opacity: isPending ? 0.65 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer',
            minWidth: '180px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {isPending ? (
            <>
              <span className="wizard-spinner" />
              {t('submitting')}
            </>
          ) : t('submit')}
        </button>
      </NavRow>
    </div>
  )
}
