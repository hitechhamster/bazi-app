'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import UpgradeModal from '@/components/UpgradeModal'

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAPTER_KEYS = [
  'overview', 'compatibility', 'communication', 'wealth_career', 'love_marriage', 'forecast',
] as const

const ZH_ORDINALS = ['一', '二', '三', '四', '五', '六']
const EN_ORDINALS  = ['I', 'II', 'III', 'IV', 'V', 'VI']

const VALUE_PROP_KEYS = ['words', 'chapters', 'forecast', 'permanent'] as const

// ── Main component ────────────────────────────────────────────────────────────

export default function UpgradeCTA({
  tier,
  locale,
}: {
  tier:   string
  locale: string
}) {
  const t         = useTranslations('compatibility.upgradeCTA')
  const tChapters = useTranslations('compatibility.chapters')
  const ctaLocale = useLocale()
  const [showModal, setShowModal] = useState(false)

  // Paid users already have the Master Compatibility sidebar entry — no CTA needed
  if (tier !== 'free') return null

  const ordinals = ctaLocale === 'en' ? EN_ORDINALS : ZH_ORDINALS

  return (
    <>
      <div className="zen-result-card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: '40px 32px 32px' }}>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--zen-ink)',
            letterSpacing: '0.04em',
            marginBottom: '16px',
          }}>
            {t('title')}
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--zen-text-muted)',
            margin: 0,
            lineHeight: 1.75,
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
            whiteSpace: 'pre-line',
          }}>
            {t('body')}
          </p>
        </div>

        {/* ── 6 Chapter Previews ── */}
        <div style={{ borderTop: '1px solid var(--zen-border)', padding: '24px 32px' }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--zen-text-muted)',
            marginBottom: '14px',
          }}>
            {ctaLocale === 'en' ? 'Six Chapters' : '六大章节'}
          </div>
          {CHAPTER_KEYS.map((key, i) => (
            <div
              key={key}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: i < CHAPTER_KEYS.length - 1 ? '1px solid var(--zen-border)' : 'none',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: '11px',
                color: '#854F0B',
                flexShrink: 0,
                minWidth: '20px',
                marginTop: '1px',
              }}>
                {ordinals[i]}
              </span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--zen-ink)',
                  marginBottom: '2px',
                }}>
                  {tChapters(key)}
                </div>
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--zen-text-muted)',
                  lineHeight: 1.5,
                }}>
                  {t(`chapters.${key}` as Parameters<typeof t>[0])}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Value Props ── */}
        <div style={{
          borderTop: '1px solid var(--zen-border)',
          padding: '20px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 24px',
        }}>
          {VALUE_PROP_KEYS.map(key => (
            <div key={key} style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ color: '#854F0B', fontSize: '10px' }}>✦</span>
              {t(`valueProps.${key}` as Parameters<typeof t>[0])}
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ borderTop: '1px solid var(--zen-border)', padding: '24px 32px', textAlign: 'center' }}>
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
              padding: '14px 40px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            {t('cta')}
          </button>
        </div>
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
