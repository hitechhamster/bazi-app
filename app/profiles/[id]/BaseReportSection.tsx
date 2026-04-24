'use client'

import { useState, useEffect } from 'react'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getReportStatus, retryReport } from './actions'

export default function BaseReportSection({
  profileId,
  initialStatus,
  initialReport,
  initialError,
}: {
  profileId: string
  initialStatus: string
  initialReport: string | null
  initialError: string | null
}) {
  const [status, setStatus] = useState(initialStatus)
  const [report, setReport] = useState<string | null>(initialReport)
  const [error, setError] = useState<string | null>(initialError)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (status !== 'pending' && status !== 'generating') return

    const id = setInterval(async () => {
      try {
        const result = await getReportStatus(profileId)
        setStatus(result.status)
        setReport(result.report)
        setError(result.error)
      } catch {
        // non-fatal: will retry on next tick
      }
    }, 3000)

    return () => clearInterval(id)
  }, [status, profileId])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const result = await retryReport(profileId)
      if (result.ok) {
        setStatus('generating')
        setError(null)
      }
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="zen-result-card">
      <h2 className="zen-heading-sm">Your Destiny Reading</h2>

      {(status === 'pending' || status === 'generating') && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="reading-spinner" style={{ margin: '0 auto 20px' }} />
          <p className="reading-loading-text">Generating your reading...</p>
          <p className="reading-loading-sub">
            This usually takes 30–60 seconds. You can leave this page; the reading will be saved to your profile.
          </p>
        </div>
      )}

      {status === 'done' && report && (
        <div
          className="ai-content-box"
          dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(report) }}
        />
      )}

      {status === 'failed' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{
            fontFamily: 'var(--font-main)',
            color: 'var(--zen-ink)',
            fontSize: '1.05rem',
            marginBottom: '12px',
          }}>
            Something went wrong while generating your reading.
          </p>
          {error && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              color: 'var(--zen-text-muted)',
              fontSize: '13px',
              marginBottom: '24px',
            }}>
              {error}
            </p>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="zen-btn-primary"
            style={{ fontSize: '0.9rem', padding: '12px 32px', letterSpacing: '0.15em' }}
          >
            {retrying ? 'Retrying...' : 'Try again'}
          </button>
        </div>
      )}
    </div>
  )
}
