'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BrandMark from '@/components/BrandMark'

export default function LoginPage() {
  const t = useTranslations('login')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--zen-paper)' }}
    >
      {/* Decorative circle — matches home page */}
      <div className="zen-circle-bg" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        {/* BrandMark — prominent above card */}
        <div style={{ marginBottom: '64px' }}>
          <BrandMark variant="full" size="default" href="/" />
        </div>

        {/* Login card */}
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--zen-paper)',
            border: '1px solid var(--zen-gold-pale)',
            padding: '48px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-main)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--zen-ink)',
              letterSpacing: '0.05em',
              margin: '0 0 8px',
              textAlign: 'center',
            }}
          >
            {t('title')}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--zen-text-muted)',
              margin: '0 0 32px',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {t('subtitle')}
          </p>

          {status === 'sent' ? (
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                color: 'var(--zen-ink)',
                textAlign: 'center',
                padding: '16px',
                border: '1px solid var(--zen-gold-pale)',
                lineHeight: 1.6,
              }}
            >
              {t('successMessage')}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  htmlFor="email"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--zen-ink)',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    color: 'var(--zen-ink)',
                    background: 'white',
                    border: '1px solid var(--zen-gold-pale)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#854F0B' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--zen-gold-pale)' }}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  background: status === 'sending' ? 'var(--zen-gold-pale)' : 'var(--zen-red)',
                  color: status === 'sending' ? '#999' : 'white',
                  border: 'none',
                  padding: '14px',
                  cursor: status === 'sending' ? 'default' : 'pointer',
                  width: '100%',
                  transition: 'background 0.15s ease',
                }}
              >
                {status === 'sending' ? t('sending') : t('sendMagicLink')}
              </button>

              {status === 'error' && (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--zen-red)',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {t('errorMessage')}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Back to home */}
        <div style={{ marginTop: '32px' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: '#854F0B',
              textDecoration: 'underline',
            }}
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
