'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { localePath } from '@/lib/i18n/path'

// ── Types ─────────────────────────────────────────────────────────────────────

type Billing = 'monthly' | 'yearly'

interface TierData {
  name:     string
  tagline:  string
  badge?:   string
  features: string[]
  cta:      string
}

interface PriceData {
  monthly: string
  yearly:  string
}

interface FaqItem {
  q: string
  a: string
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PricingClient({
  currentTier,
  locale,
}: {
  currentTier: string | null
  locale:      string
}) {
  const t = useTranslations('pricing')

  const [billing, setBilling] = useState<Billing>('yearly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const tierFree   = t.raw('tiers.free')   as TierData
  const tierMaster = t.raw('tiers.master') as TierData
  const tierSage   = t.raw('tiers.sage')   as TierData

  const priceFree   = t.raw('prices.free')   as PriceData
  const priceMaster = t.raw('prices.master') as PriceData
  const priceSage   = t.raw('prices.sage')   as PriceData

  const trustItems = t.raw('trust') as string[]
  const faqItems   = t.raw('faq')   as FaqItem[]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>

      {/* ── Section 1: Hero + Billing Toggle ── */}
      <div style={{ textAlign: 'center', padding: '48px 0 40px' }}>
        <h1 style={{
          fontFamily:    'var(--font-main)',
          fontSize:      '22px',
          fontWeight:    500,
          color:         'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin:        '0 0 10px',
        }}>
          {t('hero.title')}
        </h1>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize:   '13px',
          color:      'var(--zen-text-muted)',
          margin:     '0 0 28px',
        }}>
          {t('hero.subtitle')}
        </p>

        {/* Billing toggle */}
        <div style={{
          display:        'inline-flex',
          border:         '1px solid var(--zen-border)',
          overflow:       'hidden',
          position:       'relative',
        }}>
          {(['monthly', 'yearly'] as Billing[]).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                fontFamily:      'var(--font-ui)',
                fontSize:        '11px',
                fontWeight:      500,
                letterSpacing:   '0.08em',
                textTransform:   'uppercase',
                padding:         '9px 20px',
                border:          'none',
                cursor:          'pointer',
                background:      billing === b ? '#854F0B' : 'transparent',
                color:           billing === b ? 'white' : 'var(--zen-text-muted)',
                transition:      'background 0.15s ease, color 0.15s ease',
                position:        'relative',
              }}
            >
              {t(`billingToggle.${b}` as Parameters<typeof t>[0])}
              {b === 'yearly' && (
                <span style={{
                  marginLeft:      '6px',
                  fontSize:        '9px',
                  fontWeight:      600,
                  letterSpacing:   '0.06em',
                  padding:         '2px 5px',
                  background:      billing === 'yearly' ? 'rgba(255,255,255,0.25)' : 'var(--zen-gold-pale)',
                  color:           billing === 'yearly' ? 'white' : '#854F0B',
                  borderRadius:    '2px',
                }}>
                  {t('billingToggle.saving')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 2: 3-Tier Pricing Grid ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3"
        style={{ gap: '0', alignItems: 'stretch' }}
      >
        {/* Free */}
        <TierCard
          tier={tierFree}
          price={priceFree[billing]}
          billing={billing}
          highlight={false}
          isCurrent={currentTier === 'free' || currentTier === null}
          isComingSoon={false}
          currentLabel={t('currentPlan')}
          locale={locale}
          t={t}
        />

        {/* Master — highlighted */}
        <div className="lg:-mt-2" style={{ position: 'relative', zIndex: 1 }}>
          <TierCard
            tier={tierMaster}
            price={priceMaster[billing]}
            billing={billing}
            highlight={true}
            isCurrent={currentTier === 'master'}
            isComingSoon={true}
            currentLabel={t('currentPlan')}
            locale={locale}
            t={t}
          />
        </div>

        {/* Sage */}
        <TierCard
          tier={tierSage}
          price={priceSage[billing]}
          billing={billing}
          highlight={false}
          isCurrent={currentTier === 'sage'}
          isComingSoon={true}
          currentLabel={t('currentPlan')}
          locale={locale}
          t={t}
        />
      </div>

      {/* ── Section 3: Trust Signals ── */}
      <div style={{
        marginTop:  '40px',
        padding:    '24px 28px',
        border:     '1px solid var(--zen-border)',
        background: 'white',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 32px', justifyContent: 'center' }}>
          {trustItems.map((item, i) => (
            <div key={i} style={{
              fontFamily:  'var(--font-ui)',
              fontSize:    '12px',
              color:       'var(--zen-ink)',
              display:     'flex',
              alignItems:  'center',
              gap:         '6px',
            }}>
              <span style={{ color: '#854F0B', fontSize: '10px' }}>✦</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: FAQ Accordion ── */}
      <div style={{ marginTop: '48px' }}>
        <div style={{
          fontFamily:      'var(--font-ui)',
          fontSize:        '10px',
          letterSpacing:   '0.15em',
          textTransform:   'uppercase',
          color:           'var(--zen-text-muted)',
          marginBottom:    '16px',
          textAlign:       'center',
        }}>
          FAQ
        </div>
        <div style={{ border: '1px solid var(--zen-border)', background: 'white' }}>
          {faqItems.map((item, i) => (
            <div
              key={i}
              style={{ borderBottom: i < faqItems.length - 1 ? '1px solid var(--zen-border)' : 'none' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width:           '100%',
                  display:         'flex',
                  justifyContent:  'space-between',
                  alignItems:      'center',
                  gap:             '12px',
                  padding:         '16px 20px',
                  background:      'none',
                  border:          'none',
                  cursor:          'pointer',
                  textAlign:       'left',
                  minHeight:       '44px',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize:   '13px',
                  fontWeight: 500,
                  color:      'var(--zen-ink)',
                  lineHeight: 1.4,
                }}>
                  {item.q}
                </span>
                <span style={{
                  fontFamily:  'var(--font-main)',
                  fontSize:    '14px',
                  color:       '#854F0B',
                  flexShrink:  0,
                  transition:  'transform 0.2s ease',
                  transform:   openFaq === i ? 'rotate(45deg)' : 'none',
                  display:     'inline-block',
                }}>
                  +
                </span>
              </button>
              {openFaq === i && (
                <div style={{
                  padding:    '0 20px 16px',
                  fontFamily: 'var(--font-ui)',
                  fontSize:   '13px',
                  color:      'var(--zen-text-muted)',
                  lineHeight: 1.75,
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── TierCard sub-component ────────────────────────────────────────────────────

function TierCard({
  tier,
  price,
  billing,
  highlight,
  isCurrent,
  isComingSoon,
  currentLabel,
  locale,
  t,
}: {
  tier:          TierData
  price:         string
  billing:       Billing
  highlight:     boolean
  isCurrent:     boolean
  isComingSoon:  boolean
  currentLabel:  string
  locale:        string
  t:             ReturnType<typeof useTranslations<'pricing'>>
}) {
  const borderStyle = highlight
    ? '2px solid var(--zen-gold, #c9a96e)'
    : '1px solid var(--zen-border, #e5e0d8)'

  return (
    <div style={{
      border:         borderStyle,
      background:     'white',
      padding:        highlight ? '28px 24px' : '26px 24px',
      display:        'flex',
      flexDirection:  'column',
      gap:            '0',
      height:         '100%',
    }}>
      {/* Badge row */}
      <div style={{ minHeight: '22px', marginBottom: '12px' }}>
        {tier.badge && (
          <span style={{
            fontFamily:    'var(--font-ui)',
            fontSize:      '10px',
            fontWeight:    600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'white',
            background:    '#854F0B',
            padding:       '3px 8px',
          }}>
            {tier.badge}
          </span>
        )}
      </div>

      {/* Name + tagline */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontFamily:    'var(--font-main)',
          fontSize:      '16px',
          fontWeight:    500,
          color:         'var(--zen-ink)',
          letterSpacing: '0.04em',
          marginBottom:  '4px',
        }}>
          {tier.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize:   '12px',
          color:      'var(--zen-text-muted)',
        }}>
          {tier.tagline}
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily:    'var(--font-ui)',
        fontSize:      '24px',
        fontWeight:    600,
        color:         'var(--zen-ink)',
        marginBottom:  '4px',
      }}>
        {price}
      </div>
      {billing === 'yearly' && price !== 'Free' && price !== '免费' && price !== '免費' && (
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize:   '11px',
          color:      'var(--zen-text-muted)',
          marginBottom: '16px',
        }}>
          {t('billingToggle.saving')}
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--zen-border)', margin: '16px 0' }} />

      {/* Features */}
      <ul style={{
        listStyle: 'none',
        margin:    '0 0 auto',
        padding:   0,
        display:   'flex',
        flexDirection: 'column',
        gap:       '9px',
      }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{
            display:    'flex',
            alignItems: 'flex-start',
            gap:        '8px',
            fontFamily: 'var(--font-ui)',
            fontSize:   '12px',
            color:      'var(--zen-ink)',
          }}>
            <span style={{ color: 'var(--zen-gold, #c9a96e)', flexShrink: 0, marginTop: '1px' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ marginTop: '24px' }}>
        {isCurrent ? (
          <div style={{
            textAlign:     'center',
            fontFamily:    'var(--font-ui)',
            fontSize:      '11px',
            fontWeight:    500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color:         '#854F0B',
            padding:       '12px',
            background:    'var(--zen-gold-pale, #fdf6ec)',
          }}>
            {currentLabel}
          </div>
        ) : isComingSoon ? (
          <button
            disabled
            style={{
              display:       'block',
              width:         '100%',
              fontFamily:    'var(--font-ui)',
              fontSize:      '11px',
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding:       '12px',
              border:        'none',
              background:    'var(--zen-gold-pale, #fdf6ec)',
              color:         'var(--zen-text-muted)',
              cursor:        'not-allowed',
            }}
          >
            {tier.cta}
          </button>
        ) : (
          <Link
            href={localePath(locale, '/profiles')}
            style={{
              display:       'block',
              textAlign:     'center',
              fontFamily:    'var(--font-ui)',
              fontSize:      '11px',
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'white',
              background:    '#854F0B',
              padding:       '12px',
              textDecoration: 'none',
            }}
          >
            {tier.cta}
          </Link>
        )}
      </div>
    </div>
  )
}
