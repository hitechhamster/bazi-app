import type { MockData, MockSubject } from './mock-data'

export default function Sidebar({ data }: { data: MockData }) {
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={labelStyle}>SUBJECTS</div>

      {data.subjects.map(s => (
        <SubjectCard key={s.id} subject={s} />
      ))}

      <div style={{
        border: '1px dashed var(--zen-border)',
        borderRadius: '8px',
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

      <NavButton active label="Basic Report" labelZh="基础报告" />
      <NavButton active={false} label="Today's Almanac" labelZh="今日黄历" />
      <NavButton active={false} label="Ask a Question" labelZh="一事一问" />
    </aside>
  )
}

function SubjectCard({ subject: s }: { subject: MockSubject }) {
  return (
    <div style={{
      padding: '8px',
      borderRadius: '8px',
      background: s.active ? 'var(--zen-gold-pale)' : 'var(--zen-paper)',
      border: s.active ? '1px solid var(--zen-gold)' : '0.5px solid var(--zen-border)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '8px',
      alignItems: 'center',
    }}>
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
    </div>
  )
}

function NavButton({ active, label, labelZh }: { active: boolean; label: string; labelZh: string }) {
  if (active) {
    return (
      <div style={{
        background: 'var(--zen-gold-pale)',
        padding: '9px 8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'default',
      }}>
        <div style={{
          width: '3px',
          height: '20px',
          background: 'var(--zen-gold)',
          borderRadius: '2px',
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
    <div style={{
      border: '0.5px dashed var(--zen-border)',
      borderRadius: '8px',
      padding: '9px 8px',
      cursor: 'default',
    }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--zen-ink)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
        {labelZh}
      </div>
    </div>
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
