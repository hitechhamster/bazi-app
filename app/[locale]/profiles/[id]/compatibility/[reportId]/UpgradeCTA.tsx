'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import UpgradeModal from '@/components/UpgradeModal'

export default function UpgradeCTA({
  tier,
  locale,
}: {
  tier:   string
  locale: string
}) {
  const t = useTranslations('compatibility.upgradeCTA')
  const [showModal, setShowModal] = useState(false)

  // Paid users already have the "完整大师合婚" sidebar entry — no CTA needed
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
          {t('title')}
        </div>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-text-muted)',
          margin: '0 auto 20px',
          lineHeight: 1.6,
          maxWidth: '400px',
        }}>
          {t('body')}
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
          {t('cta')}
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
