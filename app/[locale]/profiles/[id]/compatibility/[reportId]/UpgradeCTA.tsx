'use client'

import { useState } from 'react'
import UpgradeModal from '@/components/UpgradeModal'

export default function UpgradeCTA({
  tier,
  locale,
}: {
  tier:   string
  locale: string
}) {
  const [showModal, setShowModal] = useState(false)

  // Paid users already have the "付费合婚" sidebar entry — no CTA needed
  if (tier !== 'free') return null

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
        <button
          onClick={() => setShowModal(true)}
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
            border: 'none',
            cursor: 'pointer',
          }}
        >
          View Plans
        </button>
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
