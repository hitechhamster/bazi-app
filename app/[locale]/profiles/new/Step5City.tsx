'use client'

import { useState, useRef, useCallback } from 'react'
import { StepTitle, NavRow, BackButton, NextButton } from './StepShared'
import type { Fields } from './ProfileForm'

type GeoResult = { label: string; lat: number; lng: number; tzOffsetSec: number }

export default function Step5City({
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
      <StepTitle>{isSelf ? 'Where were you born?' : 'Where were they born?'}</StepTitle>
      <div style={{ marginTop: '48px', maxWidth: '400px', margin: '48px auto 0', position: 'relative' }}>
        <input
          type="text"
          className="zen-input"
          placeholder="Type to search city…"
          value={cityQuery}
          onChange={e => handleCityInput(e.target.value)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          autoComplete="off"
          autoFocus
        />

        {isSelected ? (
          <p style={{ fontSize: '12px', color: 'var(--element-wood)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            ✓ Coordinates loaded — solar time will be calibrated
          </p>
        ) : cityQuery.length > 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            Select from suggestions for true solar time calibration
          </p>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '8px', fontFamily: 'var(--font-ui)' }}>
            Optional — skip if unknown
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
        <NextButton onClick={onNext} />
      </NavRow>
    </div>
  )
}
