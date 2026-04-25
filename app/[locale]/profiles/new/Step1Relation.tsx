'use client'

import { useTranslations } from 'next-intl'
import { StepTitle } from './StepShared'

// Internal values stored in DB — do not change
// Display labels come from translations
const OPTION_KEYS = [
  { value: 'self',   tKey: 'self'    },
  { value: 'family', tKey: 'family'  },
  { value: 'friend', tKey: 'partner' }, // value 'friend' preserved for existing data; label = 'partner'
  { value: 'other',  tKey: 'other'   },
] as const

export default function Step1Relation({
  value,
  onSelect,
}: {
  value: string
  onSelect: (v: string) => void
}) {
  const t = useTranslations('newProfile')

  return (
    <div>
      <StepTitle>{t('step1.title')}</StepTitle>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '44px',
      }}>
        {OPTION_KEYS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`wizard-card${value === opt.value ? ' wizard-card-selected' : ''}`}
          >
            <div className="wizard-card-title">{t(`step1.options.${opt.tKey}`)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
