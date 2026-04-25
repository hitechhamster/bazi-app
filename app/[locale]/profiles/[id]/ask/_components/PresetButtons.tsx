'use client'

import { useTranslations } from 'next-intl'

export default function PresetButtons({
  onPick,
}: {
  onPick: (text: string) => void
}) {
  const t = useTranslations('ask')
  const presets = t.raw('presets') as string[]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '8px' }}>
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onPick(preset)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--zen-gold-pale)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--zen-paper-deep)'
          }}
          style={{
            background: 'var(--zen-paper-deep)',
            border: '1px solid var(--zen-gold-pale)',
            borderRadius: '0',
            color: '#854F0B',
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 500,
            padding: '8px 12px',
            textAlign: 'center',
            cursor: 'pointer',
            lineHeight: 1.4,
          }}
        >
          {preset}
        </button>
      ))}
    </div>
  )
}
