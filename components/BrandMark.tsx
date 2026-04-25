import Link from 'next/link'

type BrandMarkProps = {
  variant?: 'full' | 'short'
  href?: string
  size?: 'default' | 'small'
}

export default function BrandMark({
  variant = 'full',
  href,
  size = 'default',
}: BrandMarkProps) {
  const cnSize = size === 'small' ? '14px' : '18px'

  const content = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '8px',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-seal)',
          fontSize: cnSize,
          color: 'var(--zen-red)',
          letterSpacing: '0.1em',
          fontWeight: 500,
        }}
      >
        命主
      </span>

      {variant === 'full' && (
        <>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: '#854F0B',
              fontWeight: 400,
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: '#854F0B',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Bazi Master
          </span>
        </>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    )
  }
  return content
}
