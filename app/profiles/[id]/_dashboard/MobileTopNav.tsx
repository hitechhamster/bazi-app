'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileTopNav({ profileId }: { profileId: string }) {
  const pathname = usePathname()
  const base = `/profiles/${profileId}`

  const segments = [
    { href: base,              label: 'Basic Report',    active: pathname === base },
    { href: `${base}/almanac`, label: "Today's Almanac", active: pathname.endsWith('/almanac') },
    { href: `${base}/ask`,     label: 'Ask a Question',  active: pathname.endsWith('/ask') },
  ]

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Row 1: back link */}
      <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
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
          ← All profiles
        </Link>
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
