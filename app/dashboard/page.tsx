import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome</h1>
        <p className="text-gray-600 mb-6">
          You're logged in as <strong>{user.email}</strong>
        </p>
        <LogoutButton />
      </div>
    </div>
  )
}