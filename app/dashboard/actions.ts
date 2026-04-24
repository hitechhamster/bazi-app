'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProfile(profileId: string): Promise<{ ok: boolean; error?: string }> {
  // 1. Authenticate via regular client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  // 2. Verify ownership (defensive — RLS should already prevent cross-user access)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single()

  if (!profile) return { ok: false, error: 'Profile not found' }
  if (profile.user_id !== user.id) return { ok: false, error: 'Forbidden' }

  // 3. Delete via admin client (no await — createAdminClient is synchronous)
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', profileId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}
