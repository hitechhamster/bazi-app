import { createAdminClient } from '@/lib/supabase/server'

export type Tier = 'free' | 'paid'

export const TIER_LIMITS = {
  free: {
    maxProfiles:                      1,
    askDailyLimit:                    5,
    chatAllowed:                      false,
    premiumReportAllowed:             false,
    // 合婚配额：两条独立轨道
    compatibilityFreeDailyLimit:      1,   // 免费版报告 / UTC 自然日
    compatibilityPremiumMonthlyLimit: 0,   // 付费版报告 / 滚动 30 天（free tier 不能创建）
  },
  paid: {
    maxProfiles:                      5,
    askDailyLimit:                    Infinity,
    chatAllowed:                      true,
    premiumReportAllowed:             true,
    compatibilityFreeDailyLimit:      5,
    compatibilityPremiumMonthlyLimit: 1,
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

// ── Compatibility reports ─────────────────────────────────────────────────────

/**
 * 检查能否创建一份合婚报告
 *
 * - requestedTier='free'   : 免费版报告，看 UTC 自然日已用 < compatibilityFreeDailyLimit
 * - requestedTier='premium': 付费版报告
 *     · free tier 用户直接拒绝（reason='tier_required'）
 *     · paid tier 用户看滚动 30 天已用 < compatibilityPremiumMonthlyLimit
 */
export async function canCreateCompatibility(
  userId: string,
  requestedTier: 'free' | 'premium',
): Promise<{
  ok: boolean
  reason?: 'tier_required' | 'free_daily_cap' | 'premium_monthly_cap'
}> {
  const userTier = await getUserTier(userId)
  if (requestedTier === 'premium' && userTier === 'free') {
    return { ok: false, reason: 'tier_required' }
  }
  const limits = TIER_LIMITS[userTier]
  if (requestedTier === 'free') {
    const dayStart = new Date()
    dayStart.setUTCHours(0, 0, 0, 0)
    const used = await countCompatibilityReports(userId, 'free', dayStart)
    return used < limits.compatibilityFreeDailyLimit
      ? { ok: true }
      : { ok: false, reason: 'free_daily_cap' }
  }
  // requestedTier === 'premium', userTier === 'paid'
  const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const used = await countCompatibilityReports(userId, 'premium', monthStart)
  return used < limits.compatibilityPremiumMonthlyLimit
    ? { ok: true }
    : { ok: false, reason: 'premium_monthly_cap' }
}

/**
 * 配额状态（用于 dashboard / quota chip / UpgradeModal）
 */
export async function getCompatibilityQuotaStatus(userId: string): Promise<{
  tier: Tier
  free: {
    used:      number
    cap:       number
    remaining: number
  }
  premium: {
    used:        number
    cap:         number
    remaining:   number
    nextSlotAt:  Date | null  // 最早一份 premium 报告的 created_at + 30 天；null 表示无历史
  }
}> {
  const tier   = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]

  const dayStart   = new Date()
  dayStart.setUTCHours(0, 0, 0, 0)
  const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [usedFreeToday, usedPremiumMonth, oldestPremiumInWindow] = await Promise.all([
    countCompatibilityReports(userId, 'free', dayStart),
    countCompatibilityReports(userId, 'premium', monthStart),
    getOldestPremiumReportInWindow(userId, monthStart),
  ])

  const premiumNextSlotAt = oldestPremiumInWindow
    ? new Date(oldestPremiumInWindow.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null

  return {
    tier,
    free: {
      used:      usedFreeToday,
      cap:       limits.compatibilityFreeDailyLimit,
      remaining: Math.max(0, limits.compatibilityFreeDailyLimit - usedFreeToday),
    },
    premium: {
      used:       usedPremiumMonth,
      cap:        limits.compatibilityPremiumMonthlyLimit,
      remaining:  Math.max(0, limits.compatibilityPremiumMonthlyLimit - usedPremiumMonth),
      nextSlotAt: premiumNextSlotAt,
    },
  }
}

/** internal */
async function countCompatibilityReports(
  userId: string,
  tier: 'free' | 'premium',
  since: Date,
): Promise<number> {
  const admin = createAdminClient()
  const { count } = await admin
    .from('compatibility_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tier', tier)
    .gte('created_at', since.toISOString())
  return count ?? 0
}

/** internal: returns the earliest premium report created_at within the window, or null */
async function getOldestPremiumReportInWindow(
  userId: string,
  since: Date,
): Promise<Date | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('compatibility_reports')
    .select('created_at')
    .eq('user_id', userId)
    .eq('tier', 'premium')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data ? new Date(data.created_at) : null
}
