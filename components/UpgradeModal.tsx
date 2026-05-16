'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { localePath } from '@/lib/i18n/path'

export type UpgradeReason = 'profile_cap' | 'ask_quota' | 'chat_locked' | 'premium_report' | 'compatibility_premium_required'

export default function UpgradeModal({
  open,
  onClose,
  reason,
  locale,
}: {
  open: boolean
  onClose: () => void
  reason: UpgradeReason
  locale: string
}) {
  const t = useTranslations('upgrade')

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Card — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--zen-paper, #faf9f7)',
          border: '1px solid var(--zen-border, #e5e0d8)',
          maxWidth: '380px',
          width: '100%',
          padding: '32px 28px',
          fontFamily: 'var(--font-ui)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--zen-text-muted, #78716c)',
            fontSize: '18px',
            lineHeight: 1,
            padding: '4px',
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: '0 0 12px',
        }}>
          {t('title')}
        </h2>

        {/* Reason text */}
        <p style={{
          fontSize: '13px',
          color: 'var(--zen-ink)',
          lineHeight: 1.6,
          margin: '0 0 24px',
        }}>
          {t(`reasons.${reason}`)}
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href={localePath(locale, '/pricing')}
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'white',
              background: '#854F0B',
              padding: '11px 16px',
              textDecoration: 'none',
            }}
          >
            {t('cta')}
          </Link>

          <button
            onClick={onClose}
            style={{
              fontSize: '12px',
              color: 'var(--zen-text-muted, #78716c)',
              background: 'none',
              border: '1px solid var(--zen-border, #e5e0d8)',
              padding: '10px 16px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
