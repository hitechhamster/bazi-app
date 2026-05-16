import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { canCreateCompatibility } from '@/lib/subscription/tier'
import {
  calculateBaziPartnerData,
  calculateCompatibilityScores,
  type BaziPartnerInput,
} from '@/lib/bazi/compatibility'

// ── Request types ─────────────────────────────────────────────────────────────

interface ProfileRef {
  source: 'profile'
  profileId: string
}

interface ManualInput {
  source: 'manual'
  name: string
  gender: 'male' | 'female' | 'non-binary'
  birthDate: string
  birthTime?: string
  isTimeUnknown: boolean
  longitude?: number
  timezoneOffsetSec?: number
  locationName?: string
}

type PartnerInput = ProfileRef | ManualInput

interface CreateBody {
  partnerA: PartnerInput
  partnerB: PartnerInput
  tier: 'free' | 'premium'
  locale: string
}

// ── Resolve partner profile → BaziPartnerInput ────────────────────────────────

async function resolvePartner(
  input: PartnerInput,
  userId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<{ baziInput: BaziPartnerInput; profileId: string | null }> {
  if (input.source === 'manual') {
    const baziInput: BaziPartnerInput = {
      name:             input.name,
      gender:           input.gender,
      birthDate:        input.birthDate,
      birthTime:        input.birthTime,
      isTimeUnknown:    input.isTimeUnknown,
      longitude:        input.longitude,
      timezoneOffsetSec: input.timezoneOffsetSec,
      locationName:     input.locationName,
    }
    return { baziInput, profileId: null }
  }

  // source === 'profile' — fetch and verify ownership
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, name, gender, birth_date, birth_time, is_time_unknown, longitude, timezone_offset_sec, birth_city, user_id')
    .eq('id', input.profileId)
    .single()

  if (error || !profile) throw new Error('Profile not found')
  if ((profile.user_id as string) !== userId) throw new Error('Forbidden')

  const baziInput: BaziPartnerInput = {
    name:             (profile.name as string) ?? 'Unknown',
    gender:           ((profile.gender as string) === 'female' ? 'female' : 'male') as 'male' | 'female',
    birthDate:        profile.birth_date as string,
    birthTime:        (profile.birth_time as string | null) ?? undefined,
    isTimeUnknown:    (profile.is_time_unknown as boolean) ?? false,
    longitude:        (profile.longitude as number | null) ?? undefined,
    timezoneOffsetSec: (profile.timezone_offset_sec as number | null) ?? undefined,
    locationName:     (profile.birth_city as string | null) ?? undefined,
  }
  return { baziInput, profileId: profile.id as string }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json() as CreateBody

    // Quota gate — uses tier from body
    const gate = await canCreateCompatibility(user.id, body.tier ?? 'free')
    if (!gate.ok) {
      return NextResponse.json({ error: gate.reason }, { status: 403 })
    }

    const admin = createAdminClient()

    // Resolve partners
    const [
      { baziInput: inputA, profileId: profileAId },
      { baziInput: inputB, profileId: profileBId },
    ] = await Promise.all([
      resolvePartner(body.partnerA, user.id, admin),
      resolvePartner(body.partnerB, user.id, admin),
    ])

    // Compute bazi data and scores
    const baziA  = calculateBaziPartnerData(inputA)
    const baziB  = calculateBaziPartnerData(inputB)
    const scores = calculateCompatibilityScores(baziA, baziB)

    const isPremium = body.tier === 'premium'

    // Insert report row
    const { data: newReport, error: insertErr } = await admin
      .from('compatibility_reports')
      .insert({
        user_id:              user.id,
        tier:                 isPremium ? 'premium' : 'free',
        partner_a_profile_id: profileAId,
        partner_b_profile_id: profileBId,
        partner_a_data:       inputA as object,
        partner_b_data:       inputB as object,
        bazi_a:               baziA  as object,
        bazi_b:               baziB  as object,
        scores:               scores as object,
        locale:               body.locale ?? 'en',
        free_report_status:   isPremium ? 'pending' : 'pending',
        premium_status:       'pending',
      })
      .select('id')
      .single()

    if (insertErr || !newReport) {
      console.error('[compat/create] Insert error:', insertErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const reportId = newReport.id as string

    if (isPremium) {
      // Kick off section-by-section chained generation via HTTP
      // Each route invocation has maxDuration=800 and chains to the next independently
      after(() => {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        fetch(`${baseUrl}/api/compatibility/${reportId}/generate-premium-section`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_GENERATE_SECRET ?? '',
          },
          body: JSON.stringify({ section: 'overview' }),
        }).catch(err => console.error('[compat/create] Premium chain trigger failed:', err))
      })
    } else {
      // Fire-and-forget free report generation
      after(async () => {
        const { generateAndSaveFreeCompatibilityReport } =
          await import('@/lib/ai/generate-compatibility-free')
        await generateAndSaveFreeCompatibilityReport(reportId)
      })
    }

    return NextResponse.json({ id: reportId })
  } catch (err) {
    console.error('[compat/create] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
