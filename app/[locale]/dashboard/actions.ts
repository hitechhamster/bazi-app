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

export async function updateProfile(
  profileId: string,
  updates: { name: string; relation: string }
): Promise<{ ok: boolean; error?: string }> {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  // 2. Ownership check
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single()
  if (!profile) return { ok: false, error: 'Profile not found' }
  if (profile.user_id !== user.id) return { ok: false, error: 'Forbidden' }

  // 3. Validate
  const name = updates.name.trim()
  const relation = updates.relation.trim()
  if (!name || name.length > 50)         return { ok: false, error: 'Name must be 1–50 characters' }
  if (!relation || relation.length > 20) return { ok: false, error: 'Relation must be 1–20 characters' }

  // 4. Update — only name + relation. gender removed because changing it would
  //    require recomputing luck cycle direction (forward/backward) and re-running
  //    AI report. Users who need to change gender should delete and recreate.
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ name, relation })
    .eq('id', profileId)
  if (error) return { ok: false, error: error.message }

  // 5. Revalidate
  revalidatePath('/dashboard')
  return { ok: true }
}
