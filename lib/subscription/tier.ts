import { createAdminClient } from '@/lib/supabase/server'

export type Tier = 'free' | 'paid'

export const TIER_LIMITS = {
  free: {
    maxProfiles:            1,
    askDailyLimit:          5,
    chatAllowed:            false,
    premiumReportAllowed:   false,
  },
  paid: {
    maxProfiles:            5,
    askDailyLimit:          Infinity,
    chatAllowed:            true,
    premiumReportAllowed:   true,
  },
} as const

// ── Core tier lookup ──────────────────────────────────────────────────────────

/**
 * Returns the tier for a user.
 * No row in user_subscriptions → 'free' (lazy creation pattern).
 */
export async function getUserTier(userId: string): Promise<Tier> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle()
  return (data?.tier as Tier) ?? 'free'
}

// ── Profile quota ─────────────────────────────────────────────────────────────

export async function getProfileCount(userId: string): Promise<number> {
  const admin = createAdminClient()
  const { count } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

export async function canCreateProfile(userId: string): Promise<{
  allowed: boolean
  reason?: 'tier_cap'
  current: number
  cap: number
}> {
  const [tier, current] = await Promise.all([
    getUserTier(userId),
    getProfileCount(userId),
  ])
  const cap = TIER_LIMITS[tier].maxProfiles
  return {
    allowed: current < cap,
    reason: current >= cap ? 'tier_cap' : undefined,
    current,
    cap,
  }
}

// ── Ask (one-shot Q&A) quota ──────────────────────────────────────────────────

/**
 * Count questions submitted today (UTC day) across all profiles owned by userId.
 */
export async function getAskUsageToday(userId: string): Promise<number> {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', userId)

  if (!profiles || profiles.length === 0) return 0

  const profileIds = profiles.map((p) => p.id)

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)

  const { count } = await admin
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('profile_id', profileIds)
    .gte('created_at', start.toISOString())

  return count ?? 0
}

export async function canAskQuestion(userId: string): Promise<{
  allowed: boolean
  reason?: 'quota_exceeded'
  used: number
  limit: number | typeof Infinity
}> {
  const [tier, used] = await Promise.all([
    getUserTier(userId),
    getAskUsageToday(userId),
  ])
  const limit = TIER_LIMITS[tier].askDailyLimit
  return {
    allowed: used < limit,
    reason: used >= limit ? 'quota_exceeded' : undefined,
    used,
    limit,
  }
}

// ── Chat access ───────────────────────────────────────────────────────────────

export async function canAccessChat(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId)
  return TIER_LIMITS[tier].chatAllowed
}

// ── Premium report ────────────────────────────────────────────────────────────

export async function canGeneratePremiumReport(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId)
  return TIER_LIMITS[tier].premiumReportAllowed
}
