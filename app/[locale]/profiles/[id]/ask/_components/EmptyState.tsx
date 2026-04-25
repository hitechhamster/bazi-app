'use client'

import { useTranslations } from 'next-intl'

export default function EmptyState() {
  const t = useTranslations('ask')
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 0',
      fontFamily: 'var(--font-ui)',
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#888',
      letterSpacing: '0.05em',
    }}>
      {t('emptyState')}
    </div>
  )
}
