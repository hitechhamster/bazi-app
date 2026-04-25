'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from '../../../_components/LocaleSwitcher'

export default function MobileTopNav({ profileId }: { profileId: string }) {
  const t = useTranslations('profileReport')
  const tSidebar = useTranslations('profileReport.sidebar')
  const pathname = usePathname()
  const base = `/profiles/${profileId}`

  const segments = [
    { href: base,              label: tSidebar('basicReport'),    active: pathname === base },
    { href: `${base}/almanac`, label: tSidebar('todaysAlmanac'),  active: pathname.endsWith('/almanac') },
    { href: `${base}/ask`,     label: tSidebar('askQuestion'),    active: pathname.endsWith('/ask') },
  ]

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Row 1: back link + locale switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
        <Link
          href="/profiles"
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

      {/* Row 2: segmented control */}
      <div style={{ display: 'flex', border: '1px solid var(--zen-gold-pale)' }}>
        {segments.map((seg, i) => (
          <Link
            key={seg.href}
            href={seg.href}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 4px',
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 500,
              textDecoration: 'none',
              borderRadius: '0',
              borderRight: i < segments.length - 1 ? '1px solid var(--zen-gold-pale)' : 'none',
              background: seg.active ? '#854F0B' : 'var(--zen-paper)',
              color: seg.active ? 'white' : '#854F0B',
            }}
          >
            {seg.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
