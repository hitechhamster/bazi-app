import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/subscription/tier'
import PageHeader from '@/components/PageHeader'
import PricingClient from './PricingClient'

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Detect current tier (null if not logged in)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentTier = user?.email_confirmed_at ? await getUserTier(user.id) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zen-paper, #faf9f7)' }}>
      <PageHeader locale={locale} />
      <PricingClient currentTier={currentTier} locale={locale} />
    </div>
  )
}
