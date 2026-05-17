'use client'

import { useState } from 'react'
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

// ── Sub-components ────────────────────────────────────────────────────────────

function TabCell({ tab, isLastInRow }: { tab: NavTab; isLastInRow: boolean }) {
  const cellStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '12px 8px',
    minHeight: '44px',
    fontFamily: 'var(--font-ui)',
    fontSize: '12px',
    fontWeight: 500,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: tab.active ? '#854F0B' : 'var(--zen-paper)',
    color: tab.active ? 'white' : '#854F0B',
    borderRight: isLastInRow ? 'none' : '1px solid var(--zen-gold-pale)',
  }

  if (tab.kind === 'locked') {
    return (
      <button
        data-active={tab.active ? 'true' : undefined}
        onClick={tab.onLockedClick}
        style={{
          ...cellStyle,
          cursor: 'pointer',
          border: 'none',
          borderRight: isLastInRow ? 'none' : '1px solid var(--zen-gold-pale)',
          background: 'var(--zen-paper)',
          color: '#854F0B',
          opacity: 0.55,
          minHeight: '44px',
        }}
      >
        {tab.label}
        <span style={{ fontSize: '9px' }}>🔒</span>
      </button>
    )
  }

  return (
    <Link
      href={tab.href}
      data-active={tab.active ? 'true' : undefined}
      style={cellStyle}
    >
      {tab.label}
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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

  // Active-state rules — mirror Sidebar.tsx exactly
  const isReport        = pathname === base
  const isAlmanac       = pathname.endsWith('/almanac')
  const isAsk           = pathname.endsWith('/ask')
  const isCompat        = pathname.includes('/compatibility') && !pathname.includes('/compatibility-premium')
  const isChat          = pathname.includes('/chat')
  const isPremiumReport = pathname.includes('/premium-report')
  const isCompatPremium = pathname.includes('/compatibility-premium')

  // Row 1 — free features (4 cols)
  const row1: NavTab[] = [
    { kind: 'link', href: base,                                                       label: tNav('report'),        active: isReport },
    { kind: 'link', href: `${base}/almanac`,                                          label: tNav('almanac'),       active: isAlmanac },
    { kind: 'link', href: `${base}/ask`,                                              label: tNav('ask'),           active: isAsk },
    { kind: 'link', href: localePath(locale, `/profiles/${profileId}/compatibility`), label: tNav('compatibility'), active: isCompat },
  ]

  // Row 2 — paid features (3 cols)
  const row2: NavTab[] = [
    ...(chatLocked
      ? [{ kind: 'locked' as const, label: tNav('chat'),          active: isChat,          onLockedClick: () => setShowChatModal(true) }]
      : [{ kind: 'link'   as const, href: `${base}/chat`,         label: tNav('chat'),     active: isChat }]),
    ...(premiumLocked
      ? [{ kind: 'locked' as const, label: tNav('premiumReport'), active: isPremiumReport, onLockedClick: () => setShowPremiumModal(true) }]
      : [{ kind: 'link'   as const, href: `${base}/premium-report`, label: tNav('premiumReport'), active: isPremiumReport }]),
    ...(compatPremiumLocked
      ? [{ kind: 'locked' as const, label: tNav('compatPremium'), active: isCompatPremium, onLockedClick: () => setShowCompatPremiumModal(true) }]
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

      {/* 2-row tab grid */}
      <div style={{ border: '1px solid var(--zen-gold-pale)' }}>
        {/* Row 1: free features — 4 equal columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--zen-gold-pale)',
        }}>
          {row1.map((tab, i) => (
            <TabCell key={i} tab={tab} isLastInRow={i === row1.length - 1} />
          ))}
        </div>

        {/* Row 2: paid features — 3 equal columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {row2.map((tab, i) => (
            <TabCell key={i} tab={tab} isLastInRow={i === row2.length - 1} />
          ))}
        </div>
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
