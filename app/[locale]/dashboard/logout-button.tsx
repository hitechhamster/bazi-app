'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const t = useTranslations('dashboard')

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        color: loading || hover ? 'var(--zen-ink)' : 'var(--zen-text-muted)',
        background: 'transparent',
        border: 'none',
        padding: '8px 12px',
        letterSpacing: '0.1em',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.5 : 1,
        transition: 'color 0.15s ease',
      }}
    >
      {t('logout')}
    </button>
  )
}
