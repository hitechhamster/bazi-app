'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import UpgradeModal from '@/components/UpgradeModal'
import type { MockData, MockSubject } from './mock-data'
import type { Tier } from '@/lib/subscription/tier'

export default function Sidebar({
  data,
  tier,
  locale,
}: {
  data: MockData
  tier: Tier
  locale: string
}) {
  const t = useTranslations('profileReport.sidebar')
  const pathname = usePathname()
  const profileBase = pathname.replace(/\/(almanac|ask|premium-report|chat(\/[^/]+)?)$/, '')
  const [showChatModal, setShowChatModal]       = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const chatLocked    = tier === 'free'
  const premiumLocked = tier === 'free'

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ ...labelStyle, marginTop: '-26px' }}>{t('subjects')}</div>

      {data.subjects.map(s => (
        <SubjectCard key={s.id} subject={s} />
      ))}

      <div style={{
        border: '1px dashed var(--zen-border)',
        borderRadius: '0',
        padding: '10px',
        textAlign: 'center',
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--zen-text-muted)',
        cursor: 'default',
      }}>
        {t('addSubject')}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--zen-border)', margin: 0 }} />

      <div style={labelStyle}>{t('view')}</div>

      <NavButton active={pathname === profileBase} href={profileBase} label={t('basicReport')} labelSub={t('basicReportZh')} />
      <NavButton active={pathname === `${profileBase}/almanac`} href={`${profileBase}/almanac`} label={t('todaysAlmanac')} labelSub={t('todaysAlmanacZh')} />
      <NavButton active={pathname === `${profileBase}/ask`} href={`${profileBase}/ask`} label={t('askQuestion')} labelSub={t('askQuestionZh')} />

      {chatLocked ? (
        <LockedNavButton
          label={t('conversation')}
          labelSub={t('conversationZh')}
          onLockedClick={() => setShowChatModal(true)}
        />
      ) : (
        <NavButton
          active={pathname.includes('/chat')}
          href={`${profileBase}/chat`}
          label={t('conversation')}
          labelSub={t('conversationZh')}
        />
      )}

      {premiumLocked ? (
        <LockedNavButton
          label={t('premiumReport')}
          labelSub={t('premiumReportSub')}
          onLockedClick={() => setShowPremiumModal(true)}
        />
      ) : (
        <NavButton
          active={pathname.includes('/premium-report')}
          href={`${profileBase}/premium-report`}
          label={t('premiumReport')}
          labelSub={t('premiumReportSub')}
        />
      )}

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
    </aside>
  )
}

function SubjectCard({ subject: s }: { subject: MockSubject }) {
  return (
    <Link
      href={`/profiles/${s.id}`}
      style={{
        padding: '8px',
        borderRadius: '0',
        background: s.active ? 'var(--zen-gold-pale)' : 'var(--zen-paper)',
        border: s.active ? '1px solid var(--zen-gold)' : '0.5px solid var(--zen-border)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '8px',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        cursor: s.active ? 'default' : 'pointer',
      }}
    >
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: s.active ? 'var(--zen-red)' : 'transparent',
        border: s.active ? 'none' : '0.5px solid var(--zen-text-muted)',
        fontFamily: 'var(--font-seal)',
        fontSize: '14px',
        color: s.active ? 'white' : 'var(--zen-text-muted)',
      }}>
        {s.dayMaster}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {s.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: s.active ? '#854F0B' : 'var(--zen-ink)',
          marginTop: '1px',
        }}>
          {s.age}岁 · {s.dayMasterType}
        </div>
      </div>
    </Link>
  )
}

function NavButton({ active, href, label, labelSub }: { active: boolean; href: string; label: string; labelSub: string }) {
  if (active) {
    return (
      <div style={{
        background: 'var(--zen-gold-pale)',
        padding: '9px 8px',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'default',
      }}>
        <div style={{
          width: '3px',
          height: '20px',
          background: 'var(--zen-gold)',
          borderRadius: '0',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: '#854F0B' }}>
            {label}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#854F0B', opacity: 0.7 }}>
            {labelSub}
          </div>
        </div>
      </div>
    )
  }
  return (
    <Link
      href={href}
      style={{
        border: '0.5px dashed var(--zen-border)',
        borderRadius: '0',
        padding: '9px 8px',
        cursor: 'pointer',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-ink)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
        {labelSub}
      </div>
    </Link>
  )
}

function LockedNavButton({
  label,
  labelSub,
  onLockedClick,
}: {
  label: string
  labelSub: string
  onLockedClick: () => void
}) {
  return (
    <button
      onClick={onLockedClick}
      style={{
        border: '0.5px dashed var(--zen-border)',
        borderRadius: '0',
        padding: '9px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-ink)' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
          {labelSub}
        </div>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--zen-text-muted)', flexShrink: 0, marginLeft: '4px' }}>
        🔒
      </span>
    </button>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--zen-ink)',
  fontWeight: 500,
  textTransform: 'uppercase',
}
