'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from '../../../_components/LocaleSwitcher'
import UpgradeModal from '@/components/UpgradeModal'
import { localePath } from '@/lib/i18n/path'
import type { Tier } from '@/lib/subscription/tier'

// ── Types ─────────────────────────────────────────────────────────────────────

type NavTab =
  | { kind: 'link';   href: string; label: string; active: boolean }
  | { kind: 'locked'; label: string; active: boolean; onLockedClick: () => void }

// ── Component ─────────────────────────────────────────────────────────────────

export default function MobileTopNav({
  profileId,
  locale,
  tier,
}: {
  profileId: string
  locale: string
  tier: Tier
}) {
  const t        = useTranslations('profileReport')
  const tNav     = useTranslations('mobileNav')
  const pathname = usePathname()
  const base     = localePath(locale, `/profiles/${profileId}`)

  const chatLocked          = tier === 'free'
  const premiumLocked       = tier === 'free'
  const compatPremiumLocked = tier === 'free'

  const [showChatModal,          setShowChatModal]          = useState(false)
  const [showPremiumModal,       setShowPremiumModal]       = useState(false)
  const [showCompatPremiumModal, setShowCompatPremiumModal] = useState(false)

  // Auto-scroll active tab into view on pathname change
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const active = containerRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [pathname])

  // Active-state rules — mirror Sidebar.tsx exactly
  const isReport        = pathname === base
  const isAlmanac       = pathname.endsWith('/almanac')
  const isAsk           = pathname.endsWith('/ask')
  const isCompat        = pathname.includes('/compatibility') && !pathname.includes('/compatibility-premium')
  const isChat          = pathname.includes('/chat')
  const isPremiumReport = pathname.includes('/premium-report')
  const isCompatPremium = pathname.includes('/compatibility-premium')

  const tabs: NavTab[] = [
    { kind: 'link', href: base,                                                          label: tNav('report'),        active: isReport },
    { kind: 'link', href: `${base}/almanac`,                                             label: tNav('almanac'),       active: isAlmanac },
    { kind: 'link', href: `${base}/ask`,                                                 label: tNav('ask'),           active: isAsk },
    { kind: 'link', href: localePath(locale, `/profiles/${profileId}/compatibility`),    label: tNav('compatibility'), active: isCompat },
    ...(chatLocked
      ? [{ kind: 'locked' as const, label: tNav('chat'),         active: isChat,          onLockedClick: () => setShowChatModal(true) }]
      : [{ kind: 'link'   as const, href: `${base}/chat`,        label: tNav('chat'),     active: isChat }]),
    ...(premiumLocked
      ? [{ kind: 'locked' as const, label: tNav('premiumReport'),  active: isPremiumReport, onLockedClick: () => setShowPremiumModal(true) }]
      : [{ kind: 'link'   as const, href: `${base}/premium-report`, label: tNav('premiumReport'), active: isPremiumReport }]),
    ...(compatPremiumLocked
      ? [{ kind: 'locked' as const, label: tNav('compatPremium'),  active: isCompatPremium, onLockedClick: () => setShowCompatPremiumModal(true) }]
      : [{ kind: 'link'   as const, href: localePath(locale, `/profiles/${profileId}/compatibility-premium`), label: tNav('compatPremium'), active: isCompatPremium }]),
  ]

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Row 1: back link + locale switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}>
        <Link
          href={localePath(locale, '/profiles')}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            color: '#854F0B',
            textDecoration: 'none',
          }}
        >
          {t('backToAll')}
        </Link>
        <LocaleSwitcher />
      </div>

      {/* Row 2: horizontally-scrollable segmented tab bar */}
      <div
        ref={containerRef}
        className="mobile-tab-bar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          border: '1px solid var(--zen-gold-pale)',
          scrollbarWidth: 'none',   // Firefox
        }}
      >
        {tabs.map((tab, i) => {
          const isLast = i === tabs.length - 1
          const sharedStyle: React.CSSProperties = {
            flexShrink: 0,
            minWidth: '54px',
            textAlign: 'center',
            padding: '8px 10px',
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: tab.active ? '#854F0B' : 'var(--zen-paper)',
            color: tab.active ? 'white' : '#854F0B',
            borderRight: isLast ? 'none' : '1px solid var(--zen-gold-pale)',
          }

          if (tab.kind === 'locked') {
            return (
              <button
                key={i}
                data-active={tab.active ? 'true' : undefined}
                onClick={tab.onLockedClick}
                style={{
                  ...sharedStyle,
                  cursor: 'pointer',
                  border: 'none',
                  borderRight: isLast ? 'none' : '1px solid var(--zen-gold-pale)',
                  background: 'var(--zen-paper)',
                  color: '#854F0B',
                  opacity: 0.55,
                }}
              >
                {tab.label}
                <span style={{ fontSize: '9px' }}>🔒</span>
              </button>
            )
          }

          return (
            <Link
              key={i}
              href={tab.href}
              data-active={tab.active ? 'true' : undefined}
              style={sharedStyle}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Upgrade modals */}
      <UpgradeModal
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        reason="chat_locked"
        locale={locale}
      />
      <UpgradeModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        reason="premium_report"
        locale={locale}
      />
      <UpgradeModal
        open={showCompatPremiumModal}
        onClose={() => setShowCompatPremiumModal(false)}
        reason="compatibility_premium_required"
        locale={locale}
      />
    </div>
  )
}
