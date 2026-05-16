'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const POLL_INTERVAL_MS = 10_000

export default function CompatibilityReportPending({
  reportId,
  locale,
}: {
  reportId: string
  locale:   string
}) {
  const router = useRouter()
  const t      = useTranslations('compatibility')
  const [dots, setDots] = useState('.')

  // Animate dots
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 700)
    return () => clearInterval(id)
  }, [])

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/compatibility/${reportId}/status`)
      if (!res.ok) return
      const data = await res.json()
      if (data.status === 'completed' || data.status === 'failed') {
        router.refresh()
      }
    } catch {
      // non-fatal
    }
  }, [reportId, router])

  useEffect(() => {
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [poll])

  return (
    <div className="zen-result-card" style={{ textAlign: 'center', padding: '72px 24px' }}>
      <div className="reading-spinner" style={{ margin: '0 auto 20px' }} />
      <p style={{
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        color: 'var(--zen-ink)',
        letterSpacing: '0.03em',
        margin: '0 0 8px',
      }}>
        {t('generating')}{dots}
      </p>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--zen-text-muted)',
        margin: 0,
      }}>
        {t('generatingHint')}
      </p>
    </div>
  )
}
