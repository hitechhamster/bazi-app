export function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-main)',
      fontSize: 'clamp(26px, 5vw, 36px)',
      fontWeight: 600,
      color: 'var(--zen-ink)',
      textAlign: 'center',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      margin: 0,
    }}>
      {children}
    </h2>
  )
}

export function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      marginTop: '52px',
    }}>
      {children}
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.06em',
        padding: '8px 4px',
        textDecoration: 'none',
      }}
    >
      ← Back
    </button>
  )
}

export function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="zen-btn"
      style={{
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '120px',
        padding: '12px 36px',
        fontSize: '0.95rem',
      }}
    >
      Next →
    </button>
  )
}
