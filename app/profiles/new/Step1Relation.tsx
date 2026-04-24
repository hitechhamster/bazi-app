import { StepTitle } from './StepShared'

const OPTIONS = [
  { value: 'self',   label: 'Self',   sub: 'For your own reading' },
  { value: 'family', label: 'Family', sub: 'Parent, sibling, child' },
  { value: 'friend', label: 'Friend', sub: 'Someone close to you' },
  { value: 'other',  label: 'Other',  sub: 'Anyone else' },
]

export default function Step1Relation({
  value,
  onSelect,
}: {
  value: string
  onSelect: (v: string) => void
}) {
  return (
    <div>
      <StepTitle>Who are you creating this profile for?</StepTitle>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '44px',
      }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`wizard-card${value === opt.value ? ' wizard-card-selected' : ''}`}
          >
            <div className="wizard-card-title">{opt.label}</div>
            <div className="wizard-card-sub">{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
