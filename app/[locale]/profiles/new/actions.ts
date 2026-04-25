'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { generateBaziReport } from '@/lib/bazi/bazi-calculator-logic'
import { normalizeLuckCycles } from '@/lib/bazi/chart-helpers'
import { generateAndSaveReport } from '@/lib/ai/generate-report'
import type { BaziLanguage } from '@/lib/ai/bazi-prompt'

export type ActionState = { error: string } | null

const VALID_LANGUAGES: BaziLanguage[] = ['en', 'zh-CN', 'zh-TW', 'es', 'de', 'fr', 'it', 'nl']

function getEquationOfTime(d: Date): number {
  const n = Math.floor(
    (d.getTime() - new Date(d.getUTCFullYear(), 0, 0).getTime()) / 86400000
  )
  const b = (2 * Math.PI / 365) * (n - 81)
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

export async function createProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in.' }

    const name = (formData.get('name') as string)?.trim()
    const relation = formData.get('relation') as string
    const gender = formData.get('gender') as string
    const birthDate = formData.get('birth_date') as string
    const birthTime = formData.get('birth_time') as string
    const isTimeUnknown = formData.get('is_time_unknown') === 'on'
    const birthCity = (formData.get('birth_city') as string)?.trim() || null
    const longitudeRaw = formData.get('longitude') as string
    const tzOffsetRaw = formData.get('timezone_offset_sec') as string

    const raw = formData.get('language')
    const language: BaziLanguage =
      typeof raw === 'string' && (VALID_LANGUAGES as string[]).includes(raw)
        ? (raw as BaziLanguage)
        : 'en'

    if (!name || !gender || !birthDate || !relation) {
      return { error: 'Please fill in all required fields.' }
    }

    const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null
    const timezone_offset_sec = tzOffsetRaw ? parseInt(tzOffsetRaw, 10) : null

    const [yr, mo, dy] = birthDate.split('-').map(Number)
    let hr = 12, mn = 0
    if (!isTimeUnknown && birthTime) {
      const [h, m] = birthTime.split(':').map(Number)
      hr = h
      mn = m
    }

    let trueSolarTime: Date | null = null
    let tst: Date

    if (longitude !== null && timezone_offset_sec !== null) {
      const originMs = Date.UTC(yr, mo - 1, dy, hr, mn)
      const stdLon = (timezone_offset_sec / 3600) * 15
      const lonCorrection = (longitude - stdLon) * 4 * 60 * 1000
      const gDate = new Date(originMs)
      const eqTime = getEquationOfTime(gDate) * 60 * 1000
      tst = new Date(originMs + lonCorrection + eqTime)
      trueSolarTime = tst
    } else {
      tst = new Date(Date.UTC(yr, mo - 1, dy, hr, mn))
    }

    const report = generateBaziReport(tst, gender)
    const luck_cycles = normalizeLuckCycles(report.luckCycles)

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .insert({
        user_id: user.id,
        name,
        relation,
        gender,
        birth_date: birthDate,
        birth_time: isTimeUnknown ? null : (birthTime || null),
        is_time_unknown: isTimeUnknown,
        birth_city: birthCity,
        longitude,
        timezone_offset_sec,
        pillar_year: report.pillars.year.ganZhi,
        pillar_month: report.pillars.month.ganZhi,
        pillar_day: report.pillars.day.ganZhi,
        pillar_hour: isTimeUnknown ? null : report.pillars.hour.ganZhi,
        day_master: report.dayMaster,
        day_master_element: report.dayMasterElement,
        five_elements: report.fiveElements,
        lunar_date: report.lunarDate,
        true_solar_time: trueSolarTime?.toISOString() ?? null,
        zodiac: report.zodiac.year,
        base_report_language: language,
        luck_cycles,
        base_report_status: 'generating_structured',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[createProfile] Supabase error:', error)
      return { error: `Database error: ${error.message}` }
    }

    after(async () => { await generateAndSaveReport(data.id) })
    redirect(`/profiles/${data.id}`)
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e
    console.error('[createProfile] Unexpected error:', e)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
