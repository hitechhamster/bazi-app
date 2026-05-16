'use client'

import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'

export default function UpgradeCTA({
  tier,
  locale,
}: {
  tier: string
  locale: string
}) {
  if (tier === 'free') {
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
          with 6 deep chapters — Career &amp; Wealth, Love &amp; Marriage,
          year-by-year forecast, and more.
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
    )
  }

  // Paid tier — premium generation coming in 10E-C
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
      </p>
      <button
        onClick={() => alert('Premium compatibility report coming soon.')}
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
          cursor: 'pointer',
        }}
      >
        Generate Premium Report
      </button>
    </div>
  )
}
