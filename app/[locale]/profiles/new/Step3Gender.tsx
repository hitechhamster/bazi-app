import { StepTitle, NavRow, BackButton } from './StepShared'

const OPTIONS = [
  { value: 'male',   label: 'Male',   accent: 'var(--zen-ink)' },
  { value: 'female', label: 'Female', accent: 'var(--zen-red)' },
]

export default function Step3Gender({
  value,
  onSelect,
  onBack,
  relation,
}: {
  value: string
  onSelect: (v: string) => void
  onBack: () => void
  relation: string
}) {
  const isSelf = relation.toLowerCase() === 'self'

  return (
    <div>
      <StepTitle>{isSelf ? "What's your gender?" : "What's their gender?"}</StepTitle>
      <div style={{
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        marginTop: '44px',
      }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`wizard-card wizard-gender-card${value === opt.value ? ' wizard-card-selected' : ''}`}
            style={value === opt.value ? { borderColor: opt.accent } : undefined}
          >
            <div
              className="wizard-card-title"
              style={value === opt.value ? { color: opt.accent } : undefined}
            >
              {opt.label}
            </div>
          </button>
        ))}
      </div>
      <NavRow>
        <BackButton onClick={onBack} />
      </NavRow>
    </div>
  )
}
