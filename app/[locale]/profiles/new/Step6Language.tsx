'use client'

import { useTranslations } from 'next-intl'
import type { BaziLanguage } from '@/lib/ai/bazi-prompt'
import { StepTitle, NavRow, BackButton } from './StepShared'

const OPTIONS: { value: BaziLanguage; label: string }[] = [
  { value: 'en',    label: 'English'    },
  { value: 'zh-CN', label: '简体中文'   },
  { value: 'zh-TW', label: '繁體中文'   },
  { value: 'es',    label: 'Español'    },
  { value: 'de',    label: 'Deutsch'    },
  { value: 'fr',    label: 'Français'   },
  { value: 'it',    label: 'Italiano'   },
  { value: 'nl',    label: 'Nederlands' },
]

export default function Step6Language({
  value,
  onSelect,
  isPending,
  onBack,
}: {
  value: BaziLanguage
  onSelect: (v: BaziLanguage) => void
  isPending: boolean
  onBack: () => void
}) {
  const t = useTranslations('newProfile')

  return (
    <div>
      <StepTitle>Which language should your reading be in?</StepTitle>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '44px',
      }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`wizard-card${value === opt.value ? ' wizard-card-selected' : ''}`}
            style={value === opt.value ? { borderColor: 'var(--zen-red)' } : undefined}
          >
            <div
              className="wizard-card-title"
              style={value === opt.value ? { color: 'var(--zen-red)' } : undefined}
            >
              {opt.label}
            </div>
          </button>
        ))}
      </div>
      <NavRow>
        <BackButton onClick={onBack} />
        <button
          type="submit"
          disabled={isPending}
          className="zen-btn-primary"
          style={{
            opacity: isPending ? 0.65 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer',
            minWidth: '180px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {isPending ? (
            <>
              <span className="wizard-spinner" />
              {t('submitting')}
            </>
          ) : t('submit')}
        </button>
      </NavRow>
    </div>
  )
}
