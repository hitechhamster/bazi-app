import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Bazi Master</h1>
        <p className="text-gray-600 mb-8">
          Precision BaZi analysis powered by AI
        </p>

        {user ? (
          <Link
            href="/dashboard"
            className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800"
          >
            Log in to get started
          </Link>
        )}
      </div>
    </div>
  )
}