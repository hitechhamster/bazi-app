export default function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i + 1 <= current ? 'var(--zen-red)' : 'var(--zen-border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', letterSpacing: '0.08em' }}>
        Step {current} of {total}
      </div>
    </div>
  )
}
