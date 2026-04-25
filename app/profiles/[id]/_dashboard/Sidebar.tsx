'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MockData, MockSubject } from './mock-data'

export default function Sidebar({ data }: { data: MockData }) {
  const pathname = usePathname()
  const profileBase = pathname.replace(/\/(almanac|ask)$/, '')
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ ...labelStyle, marginTop: '-26px' }}>SUBJECTS</div>

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
        + Add subject
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--zen-border)', margin: 0 }} />

      <div style={labelStyle}>VIEW</div>

      <NavButton active={pathname === profileBase} href={profileBase} label="Basic Report" labelZh="基础报告" />
      <NavButton active={pathname === `${profileBase}/almanac`} href={`${profileBase}/almanac`} label="Today's Almanac" labelZh="今日黄历" />
      <NavButton active={pathname === `${profileBase}/ask`} href={`${profileBase}/ask`} label="Ask a Question" labelZh="一事一问" />
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

function NavButton({ active, href, label, labelZh }: { active: boolean; href: string; label: string; labelZh: string }) {
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
            {labelZh}
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
        {labelZh}
      </div>
    </Link>
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
