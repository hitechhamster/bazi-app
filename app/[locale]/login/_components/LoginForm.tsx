'use client'

// Visual constraints (enforced below):
// - Every <input> and <button> must have style={{ borderRadius: 0 }}
// - Every button that initiates an async operation must have disabled={isPending}
//   including the Google button (prevents double-click during OAuth redirect)

import { useState, useTransition, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signInWithPassword, signUpWithPassword, sendMagicLink } from '../actions'
import { localePath } from '@/lib/i18n/path'

type Mode = 'signIn' | 'signUp'

/** Map a Supabase error message to an i18n key in the 'login' namespace. */
function mapAuthError(msg: string, isSignUp: boolean): string {
  if (msg.includes('Invalid login credentials')) return 'signInError'
  if (msg.includes('User already registered')) return 'emailAlreadyRegistered'
  if (isSignUp) return 'signUpError'
  return 'signInError'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  fontFamily: 'var(--font-ui)',
  fontSize: '13px',
  color: 'var(--zen-ink)',
  background: 'white',
  border: '1px solid var(--zen-gold-pale)',
  borderRadius: 0,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--zen-ink)',
  fontWeight: 500,
  display: 'block',
  marginBottom: '8px',
}

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('login')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const emailRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // auth error/success
  const [authErrorKey, setAuthErrorKey] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false) // sign-up email confirmation sent

  // magic link error (shown below magic link button)
  const [magicErrorKey, setMagicErrorKey] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  // ── Success states ──────────────────────────────────────────────────────────

  // Magic link sent → replace whole form
  if (magicSent) {
    return (
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: 'var(--zen-ink)',
        textAlign: 'center',
        padding: '16px',
        border: '1px solid var(--zen-gold-pale)',
        lineHeight: 1.6,
      }}>
        {t('successMessage')}
      </div>
    )
  }

  // Sign-up email confirmation → replace whole form
  if (authSuccess) {
    return (
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: 'var(--zen-ink)',
        textAlign: 'center',
        padding: '16px',
        border: '1px solid var(--zen-gold-pale)',
        lineHeight: 1.6,
      }}>
        {t('signUpSuccess')}
      </div>
    )
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleModeToggle() {
    setMode(m => (m === 'signIn' ? 'signUp' : 'signIn'))
    setAuthErrorKey(null)
    setMagicErrorKey(null)
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${localePath(locale, '/dashboard')}`,
      },
    })
  }

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthErrorKey(null)

    startTransition(async () => {
      if (mode === 'signIn') {
        const result = await signInWithPassword(email, password)
        if (result.error) {
          setAuthErrorKey(mapAuthError(result.error, false))
        } else {
          router.push(localePath(locale, '/dashboard'))
        }
      } else {
        const result = await signUpWithPassword(email, password, locale)
        if (result.error) {
          setAuthErrorKey(mapAuthError(result.error, true))
        } else {
          setAuthSuccess(true)
        }
      }
    })
  }

  function handleMagicLink() {
    setMagicErrorKey(null)
    if (!email.trim()) {
      emailRef.current?.focus()
      setMagicErrorKey('emailRequired')
      return
    }

    startTransition(async () => {
      const result = await sendMagicLink(email.trim(), locale)
      if (result.error) {
        setMagicErrorKey('errorMessage')
      } else {
        setMagicSent(true)
      }
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        style={{
          width: '100%',
          padding: '12px',
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          background: isPending ? 'var(--zen-gold-pale)' : 'white',
          color: isPending ? '#999' : 'var(--zen-ink)',
          border: '1px solid var(--zen-gold-pale)',
          borderRadius: 0,
          cursor: isPending ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isPending) e.currentTarget.style.borderColor = '#854F0B'
        }}
        onMouseLeave={(e) => {
          if (!isPending) e.currentTarget.style.borderColor = 'var(--zen-gold-pale)'
        }}
      >
        {/* Google "G" mark */}
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('continueWithGoogle')}
      </button>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--zen-gold-pale)' }} />
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-text-muted)',
          letterSpacing: '0.05em',
        }}>
          {t('or')}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--zen-gold-pale)' }} />
      </div>

      {/* Email + Password form */}
      <form
        onSubmit={handleAuthSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {/* Email */}
        <div>
          <label htmlFor="login-email" style={labelStyle}>
            {t('emailLabel')}
          </label>
          <input
            ref={emailRef}
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#854F0B' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--zen-gold-pale)' }}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" style={labelStyle}>
            {t('passwordLabel')}
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#854F0B' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--zen-gold-pale)' }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '14px',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: isPending ? 'var(--zen-gold-pale)' : 'var(--zen-red)',
            color: isPending ? '#999' : 'white',
            border: 'none',
            borderRadius: 0,
            cursor: isPending ? 'default' : 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isPending) e.currentTarget.style.background = '#a02020'
          }}
          onMouseLeave={(e) => {
            if (!isPending) e.currentTarget.style.background = 'var(--zen-red)'
          }}
        >
          {isPending
            ? t(mode === 'signIn' ? 'signingIn' : 'signingUp')
            : t(mode === 'signIn' ? 'signIn' : 'signUp')}
        </button>

        {/* Auth error */}
        {authErrorKey && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            margin: 0,
            textAlign: 'center',
          }}>
            {t(authErrorKey as Parameters<typeof t>[0])}
          </p>
        )}
      </form>

      {/* Mode toggle */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleModeToggle}
          disabled={isPending}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: isPending ? 'var(--zen-text-muted)' : '#854F0B',
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: 0,
            cursor: isPending ? 'default' : 'pointer',
            textDecoration: isPending ? 'none' : 'underline',
          }}
        >
          {t(mode === 'signIn' ? 'switchToSignUp' : 'switchToSignIn')}
        </button>
      </div>

      {/* Divider before magic link */}
      <div style={{ borderTop: '1px solid var(--zen-gold-pale)' }} />

      {/* Magic link toggle */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={isPending}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: isPending ? 'var(--zen-text-muted)' : 'var(--zen-text-muted)',
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: 0,
            cursor: isPending ? 'default' : 'pointer',
            textDecoration: isPending ? 'none' : 'underline',
          }}
        >
          {t('magicLinkToggle')}
        </button>

        {/* Magic link error (empty email or send failure) */}
        {magicErrorKey && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--zen-red)',
            margin: '6px 0 0',
          }}>
            {t(magicErrorKey as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

    </div>
  )
}
