'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type LogoutButtonProps = {
  variant?: 'primary' | 'subtle'
}

export default function LogoutButton({ variant = 'primary' }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const className = variant === 'subtle'
    ? 'text-sm text-gray-500 hover:text-gray-800 px-3 py-1 rounded-md transition-colors disabled:opacity-50'
    : 'bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50'

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  )
}
