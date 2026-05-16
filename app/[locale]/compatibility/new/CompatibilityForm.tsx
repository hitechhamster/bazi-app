'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { localePath } from '@/lib/i18n/path'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProfileOption {
  id: string
  name: string
  dayMaster: string
  birthDate: string
}

export interface QuotaInfo {
  free: { used: number; cap: number; remaining: number }
}

type PartnerSource = 'profile' | 'manual'
type Gender = 'male' | 'female' | 'non-binary'

interface PartnerState {
  source:           PartnerSource
  profileId:        string
  name:             string
  gender:           Gender
  birthDate:        string
  birthTime:        string
  isTimeUnknown:    boolean
  longitude:        string
  timezoneOffsetSec: string
  locationName:     string
  cityQuery:        string
}

function emptyPartner(source: PartnerSource = 'manual'): PartnerState {
  return {
    source,
    profileId:        '',
    name:             '',
    gender:           'male',
    birthDate:        '',
    birthTime:        '',
    isTimeUnknown:    false,
    longitude:        '',
    timezoneOffsetSec: '',
    locationName:     '',
    cityQuery:        '',
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--zen-text-muted)',
  marginBottom: '6px',
}

const fieldWrap: React.CSSProperties = { marginBottom: '16px' }

// ── City search sub-component ─────────────────────────────────────────────────

type GeoResult = { label: string; lat: number; lng: number; tzOffsetSec: number }

function CityInput({
  value,
  locationName,
  onChange,
}: {
  value: string
  locationName: string
  onChange: (city: string, lng: number, tzSec: number, label: string) => void
}) {
  const [results, setResults] = useState<GeoResult[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const [query, setQuery] = useState(value)
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = useCallback((v: string) => {
    setQuery(v)
    if (debRef.current) clearTimeout(debRef.current)
    if (v.length < 2) { setResults([]); setShowDrop(false); return }
    debRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(v)}`)
        if (res.ok) {
          const data: GeoResult[] = await res.json()
          setResults(data)
          setShowDrop(data.length > 0)
        }
      } catch { /* noop */ }
    }, 300)
  }, [])

  const handleSelect = (r: GeoResult) => {
    setQuery(r.label)
    setShowDrop(false)
    setResults([])
    onChange('', r.lng, r.tzOffsetSec, r.label)
  }

  const isSelected = !!locationName

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className="zen-input"
        placeholder="City, Country"
        value={query}
        onChange={e => handleInput(e.target.value)}
        onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        autoComplete="off"
      />
      {isSelected && (
        <p style={{ fontSize: '11px', color: 'var(--element-wood)', marginTop: '4px', fontFamily: 'var(--font-ui)' }}>
          ✓ Coordinates loaded
        </p>
      )}
      {!isSelected && query.length > 0 && (
        <p style={{ fontSize: '11px', color: 'var(--zen-text-light)', marginTop: '4px', fontFamily: 'var(--font-ui)' }}>
          Select from suggestions…
        </p>
      )}
      {showDrop && results.length > 0 && (
        <div className="city-dropdown">
          {results.map((r, i) => (
            <div key={i} className="city-dropdown-item" onMouseDown={() => handleSelect(r)}>
              {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Locked Partner A card ─────────────────────────────────────────────────────

function LockedPartnerACard({ p }: { p: ProfileOption }) {
  return (
    <div style={{
      flex: 1,
      minWidth: '280px',
      border: '1px solid var(--zen-border)',
      padding: '20px',
      background: 'var(--zen-paper)',
    }}>
      <div style={{
        fontFamily: 'var(--font-main)',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--zen-ink)',
        marginBottom: '16px',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--zen-border)',
        paddingBottom: '8px',
      }}>
        Partner A
      </div>
      <div style={{
        background: 'var(--zen-gold-pale)',
        border: '1px solid var(--zen-border)',
        padding: '14px 16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-main)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          marginBottom: '6px',
        }}>
          {p.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span>日主 · <span style={{ color: '#854F0B', fontWeight: 500 }}>{p.dayMaster}</span></span>
          <span>{p.birthDate}</span>
        </div>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          margin: '10px 0 0',
          fontStyle: 'italic',
        }}>
          Prefilled from your profile
        </p>
      </div>
    </div>
  )
}

// ── Partner panel ─────────────────────────────────────────────────────────────

function PartnerPanel({
  label,
  state,
  profiles,
  onChange,
}: {
  label: string
  state: PartnerState
  profiles: ProfileOption[]
  onChange: (patch: Partial<PartnerState>) => void
}) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      flex: 1,
      minWidth: '280px',
      border: '1px solid var(--zen-border)',
      padding: '20px',
      background: 'var(--zen-paper)',
    }}>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: '13px', fontWeight: 500, color: 'var(--zen-ink)', marginBottom: '16px', letterSpacing: '0.05em', borderBottom: '1px solid var(--zen-border)', paddingBottom: '8px' }}>
        {label}
      </div>

      {/* Source toggle */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Source</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['manual', 'profile'] as PartnerSource[]).map(src => (
            <label key={src} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-ink)' }}>
              <input
                type="radio"
                name={`${label}-source`}
                value={src}
                checked={state.source === src}
                onChange={() => onChange({ source: src, profileId: '' })}
                style={{ accentColor: 'var(--zen-red)' }}
              />
              {src === 'manual' ? 'Fill in details' : 'From my profiles'}
            </label>
          ))}
        </div>
      </div>

      {/* Profile picker */}
      {state.source === 'profile' && (
        <div style={fieldWrap}>
          <label style={labelStyle}>Select Profile</label>
          {profiles.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)' }}>
              No profiles yet. Use &quot;Fill in details&quot; or create a profile first.
            </p>
          ) : (
            <select
              className="zen-input"
              value={state.profileId}
              onChange={e => onChange({ profileId: e.target.value })}
            >
              <option value="">— choose —</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.dayMaster} · {p.birthDate}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Manual fields */}
      {state.source === 'manual' && (
        <>
          <div style={fieldWrap}>
            <label style={labelStyle}>Name</label>
            <input className="zen-input" type="text" placeholder="Name" value={state.name} onChange={e => onChange({ name: e.target.value })} />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(['male', 'female', 'non-binary'] as Gender[]).map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-ink)' }}>
                  <input
                    type="radio"
                    name={`${label}-gender`}
                    value={g}
                    checked={state.gender === g}
                    onChange={() => onChange({ gender: g })}
                    style={{ accentColor: 'var(--zen-red)' }}
                  />
                  {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Non-binary'}
                </label>
              ))}
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Birth Date</label>
            <input className="zen-input" type="date" min="1900-01-01" max={today} value={state.birthDate} onChange={e => onChange({ birthDate: e.target.value })} />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>
              Birth Time <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              className="zen-input"
              type="time"
              disabled={state.isTimeUnknown}
              value={state.birthTime}
              onChange={e => onChange({ birthTime: e.target.value })}
              style={{ opacity: state.isTimeUnknown ? 0.35 : 1 }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)' }}>
              <input
                type="checkbox"
                checked={state.isTimeUnknown}
                onChange={e => onChange({ isTimeUnknown: e.target.checked, birthTime: '' })}
                style={{ accentColor: 'var(--zen-red)', width: '13px', height: '13px' }}
              />
              I don&apos;t know the time
            </label>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Birth Location <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <CityInput
              value={state.cityQuery}
              locationName={state.locationName}
              onChange={(_, lng, tzSec, label) => onChange({
                longitude:         String(lng),
                timezoneOffsetSec: String(tzSec),
                locationName:      label,
                cityQuery:         label,
              })}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function CompatibilityForm({
  profiles,
  quota,
  locale,
  lockedPartnerA,
}: {
  profiles:       ProfileOption[]
  quota:          QuotaInfo
  locale:         string
  lockedPartnerA?: ProfileOption
}) {
  const router = useRouter()

  const [partnerA, setPartnerA] = useState<PartnerState>(emptyPartner('manual'))
  const [partnerB, setPartnerB] = useState<PartnerState>(emptyPartner('manual'))
  const [selectedLocale, setSelectedLocale] = useState(locale)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchA = (patch: Partial<PartnerState>) => setPartnerA(s => ({ ...s, ...patch }))
  const patchB = (patch: Partial<PartnerState>) => setPartnerB(s => ({ ...s, ...patch }))

  const canSubmit = !submitting && quota.free.remaining > 0

  function validatePartner(p: PartnerState, which: 'A' | 'B'): string | null {
    if (p.source === 'profile') {
      if (!p.profileId) return `Please select a profile for Partner ${which}`
      return null
    }
    if (!p.name.trim())      return `Please enter a name for Partner ${which}`
    if (!p.birthDate)        return `Please enter a birth date for Partner ${which}`
    if (!p.isTimeUnknown && !p.birthTime) return `Please enter a birth time for Partner ${which} (or check "I don't know the time")`
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // If Partner A is locked via profile, skip free-field validation for A
    if (!lockedPartnerA) {
      const errA = validatePartner(partnerA, 'A')
      if (errA) { setError(errA); return }
    }
    const errB = validatePartner(partnerB, 'B')
    if (errB) { setError(errB); return }

    setSubmitting(true)

    function buildInput(p: PartnerState) {
      if (p.source === 'profile') {
        return { source: 'profile' as const, profileId: p.profileId }
      }
      return {
        source:           'manual' as const,
        name:             p.name.trim(),
        gender:           p.gender,
        birthDate:        p.birthDate,
        birthTime:        p.isTimeUnknown ? undefined : (p.birthTime || undefined),
        isTimeUnknown:    p.isTimeUnknown,
        longitude:        p.longitude ? Number(p.longitude) : undefined,
        timezoneOffsetSec: p.timezoneOffsetSec ? Number(p.timezoneOffsetSec) : undefined,
        locationName:     p.locationName || undefined,
      }
    }

    // Partner A: use locked profile if provided, otherwise use form state
    const partnerAInput = lockedPartnerA
      ? { source: 'profile' as const, profileId: lockedPartnerA.id }
      : buildInput(partnerA)

    try {
      const res = await fetch('/api/compatibility/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerA: partnerAInput,
          partnerB: buildInput(partnerB),
          tier:   'free',
          locale: selectedLocale,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.error === 'free_daily_cap') {
          setError("Today's free analysis limit reached. Try again tomorrow.")
        } else {
          setError(json.error ?? 'Something went wrong. Please try again.')
        }
        setSubmitting(false)
        return
      }

      router.push(localePath(selectedLocale, `/compatibility/${json.id}`))
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Partner panels */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {lockedPartnerA
          ? <LockedPartnerACard p={lockedPartnerA} />
          : <PartnerPanel label="Partner A" state={partnerA} profiles={profiles} onChange={patchA} />
        }
        <PartnerPanel label="Partner B" state={partnerB} profiles={profiles} onChange={patchB} />
      </div>

      {/* Report language */}
      <div className="zen-result-card" style={{ marginBottom: '16px', padding: '16px 20px' }}>
        <label style={labelStyle}>Report Language</label>
        <select
          className="zen-input"
          value={selectedLocale}
          onChange={e => setSelectedLocale(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="en">English</option>
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁體中文</option>
        </select>
      </div>

      {/* Quota info */}
      <div style={{ marginBottom: '20px', fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-text-muted)' }}>
        Free analysis today: {quota.free.remaining} of {quota.free.cap} remaining
        {quota.free.remaining === 0 && (
          <span style={{ color: 'var(--zen-red)', marginLeft: '8px' }}>Daily limit reached</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-red)', marginBottom: '14px' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="zen-btn-primary"
        style={{
          opacity: canSubmit ? 1 : 0.5,
          cursor:  canSubmit ? 'pointer' : 'not-allowed',
          minWidth: '220px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        {submitting ? (
          <>
            <span className="wizard-spinner" />
            Analyzing…
          </>
        ) : (
          'Analyze Compatibility'
        )}
      </button>

      {/* Upgrade nudge for free users */}
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginTop: '10px' }}>
        Want a 15,000+ word in-depth premium report?{' '}
        <a href={localePath(locale, '/pricing')} style={{ color: '#854F0B', textDecoration: 'underline' }}>
          Upgrade to Pro →
        </a>
      </p>
    </form>
  )
}
