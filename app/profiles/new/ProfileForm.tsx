'use client'

import { useState, useRef, useCallback } from 'react'
import { useActionState } from 'react'
import { createProfile } from './actions'

type GeoResult = { label: string; lat: number; lng: number; tzOffsetSec: number }

const today = new Date().toISOString().split('T')[0]

export default function ProfileForm() {
  const [state, formAction, isPending] = useActionState(createProfile, null)
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [cityResults, setCityResults] = useState<GeoResult[]>([])
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCityInput = useCallback((value: string) => {
    setCityQuery(value)
    setSelectedCity(null)
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
      } catch { /* network error — silently ignore */ }
    }, 300)
  }, [])

  const handleSelectCity = (result: GeoResult) => {
    setSelectedCity(result)
    setCityQuery(result.label)
    setShowDropdown(false)
    setCityResults([])
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="zen-circle-bg" />

      <div className="relative z-10 max-w-[800px] mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="zen-seal mb-4">命</div>
          <h1 className="zen-h1">New Profile</h1>
          <p className="zen-subtitle">Enter birth details for your Bazi reading</p>
        </div>

        <div className="zen-card">
          {state?.error && (
            <p style={{ color: 'var(--zen-red)', fontFamily: 'var(--font-ui)', fontSize: '14px', marginBottom: '24px' }}>
              {state.error}
            </p>
          )}

          <form action={formAction}>
            {/* Hidden city fields */}
            <input type="hidden" name="longitude" value={selectedCity?.lng ?? ''} />
            <input type="hidden" name="timezone_offset_sec" value={selectedCity?.tzOffsetSec ?? ''} />
            <input type="hidden" name="birth_city" value={selectedCity?.label ?? cityQuery} />

            {/* Name */}
            <Field label="Name">
              <input
                name="name"
                type="text"
                required
                className="zen-input"
                placeholder="Full name or nickname"
              />
            </Field>

            {/* Relation */}
            <Field label="This profile is for">
              <select name="relation" required className="zen-input" style={{ cursor: 'pointer' }}>
                <option value="self">Myself</option>
                <option value="family">Family member</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </Field>

            {/* Gender */}
            <Field label="Gender">
              <div style={{ display: 'flex', gap: '32px', paddingTop: '8px' }}>
                {(['male', 'female'] as const).map(g => (
                  <label
                    key={g}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', color: 'var(--zen-ink)', fontSize: '15px' }}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      required
                      style={{ accentColor: 'var(--zen-red)', width: '16px', height: '16px' }}
                    />
                    {g === 'male' ? 'Male' : 'Female'}
                  </label>
                ))}
              </div>
            </Field>

            {/* Birth Date */}
            <Field label="Date of Birth">
              <input
                name="birth_date"
                type="date"
                required
                min="1950-01-01"
                max={today}
                className="zen-input"
              />
            </Field>

            {/* Birth Time */}
            <Field label="Time of Birth">
              <input
                name="birth_time"
                type="time"
                disabled={timeUnknown}
                className="zen-input"
              />
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--zen-text-muted)' }}
              >
                <input
                  type="checkbox"
                  name="is_time_unknown"
                  checked={timeUnknown}
                  onChange={e => setTimeUnknown(e.target.checked)}
                  style={{ accentColor: 'var(--zen-red)', width: '14px', height: '14px' }}
                />
                Time unknown — use Three-Pillar mode
              </label>
            </Field>

            {/* Birth City */}
            <div style={{ marginBottom: '40px', position: 'relative' }}>
              <label
                style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--zen-text-muted)', marginBottom: '8px' }}
              >
                Birth City
              </label>
              <input
                type="text"
                className="zen-input"
                placeholder="Type to search..."
                value={cityQuery}
                onChange={e => handleCityInput(e.target.value)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                autoComplete="off"
              />

              {selectedCity ? (
                <p style={{ fontSize: '12px', color: 'var(--element-wood)', marginTop: '6px', fontFamily: 'var(--font-ui)' }}>
                  ✓ Coordinates & timezone loaded — solar time will be calibrated
                </p>
              ) : cityQuery.length > 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--zen-text-light)', marginTop: '6px', fontFamily: 'var(--font-ui)' }}>
                  Select from suggestions for true solar time calibration
                </p>
              ) : null}

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

            {/* Submit */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isPending}
                className="zen-btn-primary"
                style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
              >
                {isPending ? 'Calculating...' : 'Reveal Destiny'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <label
        style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--zen-text-muted)', marginBottom: '8px' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
