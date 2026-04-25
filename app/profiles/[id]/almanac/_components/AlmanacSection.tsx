'use client'

import { useState, useEffect } from 'react'
import { renderBaziMarkdown } from '@/lib/markdown/renderer'
import { getDailyReadingStatus, triggerDailyReading, type DailyReading, type DailyStatus } from '../../actions'

export default function AlmanacSection({
  profileId,
  initialStatus,
  initialReading,
}: {
  profileId: string
  initialStatus: DailyStatus
  initialReading: DailyReading | null
}) {
  const [status, setStatus] = useState<DailyStatus>(initialStatus)
  const [reading, setReading] = useState<DailyReading | null>(initialReading)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const isPolling = status === 'pending' || status === 'generating'
    if (!isPolling) return

    const timerId = setInterval(async () => {
      try {
        const result = await getDailyReadingStatus(profileId)
        setStatus(result.status)
        setReading(result.reading)
        setError(result.error)
      } catch {
        // non-fatal: retry on next tick
      }
    }, 3000)

    return () => clearInterval(timerId)
  }, [status, profileId])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const result = await triggerDailyReading(profileId)
      if (result.ok) {
        setStatus('pending')
        setError(null)
        setReading(null)
      }
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          Today&apos;s Almanac · 今日黄历
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-ink)',
          marginTop: '6px',
          marginBottom: 0,
        }}>
          Personalized daily reading based on your Four Pillars
        </p>
      </div>

      <div className="zen-result-card">
        {(status === 'pending' || status === 'generating') && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="reading-spinner" style={{ margin: '0 auto 20px' }} />
            <p className="reading-loading-text">Consulting the almanac...</p>
            <p className="reading-loading-sub">
              Generating your personalized daily reading. This takes about 15–30 seconds.
            </p>
          </div>
        )}

        {status === 'done' && reading && (
          <div>
            {/* Poem block */}
            <div style={{
              textAlign: 'center',
              padding: '32px 40px',
              borderBottom: '1px solid var(--zen-border)',
              marginBottom: '24px',
            }}>
              {reading.poem.map((line, i) => (
                <div key={i} className="text-[17px] lg:text-[20px]" style={{
                  fontFamily: 'var(--font-seal)',
                  color: '#854F0B',
                  lineHeight: 2.4,
                  letterSpacing: '0.3em',
                }}>
                  {line}
                </div>
              ))}
            </div>

            {/* Prose reading */}
            <div
              className="ai-content-box"
              dangerouslySetInnerHTML={{ __html: renderBaziMarkdown(reading.content) }}
            />
          </div>
        )}

        {status === 'failed' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--zen-ink)',
              marginBottom: '8px',
            }}>
              Could not generate today&apos;s reading.
            </p>
            {error && (
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--zen-text-muted)',
                marginBottom: '16px',
              }}>
                {error}
              </p>
            )}
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                padding: '8px 20px',
                background: 'var(--zen-gold-pale)',
                border: '1px solid var(--zen-gold)',
                borderRadius: '0',
                color: '#854F0B',
                cursor: retrying ? 'default' : 'pointer',
                opacity: retrying ? 0.6 : 1,
              }}
            >
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
