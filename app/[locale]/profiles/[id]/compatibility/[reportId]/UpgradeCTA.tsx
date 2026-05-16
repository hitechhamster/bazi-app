'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'
import UpgradeModal from '@/components/UpgradeModal'

export default function UpgradeCTA({
  tier,
  locale,
  reportId,
  profileId,
}: {
  tier:      string
  locale:    string
  reportId:  string
  profileId: string
}) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  if (tier === 'free') {
    return (
      <>
        <div className="zen-result-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--zen-ink)',
            marginBottom: '8px',
            letterSpacing: '0.03em',
          }}>
            Unlock the Full Picture
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--zen-text-muted)',
            margin: '0 auto 20px',
            lineHeight: 1.6,
            maxWidth: '400px',
          }}>
            Upgrade to Pro to generate a 15,000+ word Premium Compatibility Report
            with 6 deep chapters — Partner Portraits, Compatibility Analysis,
            Communication &amp; Conflict, Wealth &amp; Career, Love &amp; Marriage,
            and a 24-Month Relationship Forecast.
          </p>
          <Link
            href={localePath(locale, '/pricing')}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'white',
              background: '#854F0B',
              padding: '11px 28px',
              textDecoration: 'none',
            }}
          >
            View Plans
          </Link>
        </div>

        <UpgradeModal
          open={showModal}
          onClose={() => setShowModal(false)}
          reason="compatibility_premium_required"
          locale={locale}
        />
      </>
    )
  }

  // Paid tier — generate premium report for this pair
  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      // Create a NEW premium report for the same pair by triggering generate-premium-section
      // on the existing report (which was created as free)
      const res = await fetch(`/api/compatibility/${reportId}/generate-premium-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'overview' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong.')
        setLoading(false)
        return
      }
      // Redirect to refresh page — premium section will appear
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="zen-result-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
      <div style={{
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--zen-ink)',
        marginBottom: '8px',
        letterSpacing: '0.03em',
      }}>
        Generate Premium Report for This Pair
      </div>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--zen-text-muted)',
        marginBottom: '20px',
        lineHeight: 1.6,
      }}>
        15,000+ word in-depth analysis across 6 chapters.
        Generation takes 3–6 minutes.
      </p>
      {error && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#BC2D2D', marginBottom: '12px' }}>
          {error}
        </p>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'white',
          background: '#854F0B',
          padding: '11px 28px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {loading && <span className="wizard-spinner" />}
        {loading ? 'Starting…' : 'Generate Premium Report'}
      </button>
    </div>
  )
}
