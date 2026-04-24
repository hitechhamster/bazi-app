// Dashboard 模块：AI destiny reading placeholder — Stage 2 Batch 2A (mock data)
// TODO(2B): replace placeholder with <BaseReportSection> wired to real profile data

export default function ChartReadingPanel() {
  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-border)',
      padding: '32px 36px',
    }}>
      <div style={sectionLabelStyle}>Your Destiny Reading · AI 解读</div>

      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '48px 0',
        borderTop: '1px solid var(--zen-border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-seal)',
          fontSize: '2rem',
          color: 'var(--zen-red)',
          opacity: 0.2,
          letterSpacing: '8px',
          marginBottom: '20px',
        }}>
          命
        </div>
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: '1.05rem',
          color: 'var(--zen-ink)',
          marginBottom: '8px',
        }}>
          Your personalised AI reading is being prepared.
        </p>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--zen-text-muted)',
        }}>
          This section will display your full Bazi destiny analysis once generated.
        </p>
      </div>
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  color: 'var(--zen-ink)',
  borderBottom: '2px solid var(--zen-gold)',
  paddingBottom: '6px',
  display: 'inline-block',
}
