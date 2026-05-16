/**
 * Dual-chart 24-month forecast for compatibility reports.
 * Derives per-person interactions then finds shared resonance months.
 */

import type { BaziPartnerData } from './compatibility'
import {
  buildForecastForChart,
  type ForecastMonth,
  type Interaction,
} from './forecast-timeline'

// ── Public types ──────────────────────────────────────────────────────────────

export type SharedResonanceMonth = {
  step:           number    // 1–24
  monthGanzhi:    string
  gregorianStart: string
  gregorianEnd:   string
  type:           'chong' | 'he'
  affectsA:       string    // A's pillar labels, e.g. "日支"
  affectsB:       string    // B's pillar labels
}

export type CompatibilityForecast = {
  timeline:    ForecastMonth[]
  keyA:        { chong: Interaction[]; he: Interaction[] }
  keyB:        { chong: Interaction[]; he: Interaction[] }
  sharedChong: SharedResonanceMonth[]
  sharedHe:    SharedResonanceMonth[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function baziToPillars(b: BaziPartnerData) {
  return {
    year:  b.yearPillar,
    month: b.monthPillar,
    day:   b.dayPillar,
    hour:  b.hourPillar ?? null,
  }
}

function computeShared(
  interactionsA: Interaction[],
  interactionsB: Interaction[],
  type: 'chong' | 'he',
): SharedResonanceMonth[] {
  const result: SharedResonanceMonth[] = []
  for (const ia of interactionsA) {
    const ib = interactionsB.find(i => i.month.index === ia.month.index)
    if (ib) {
      result.push({
        step:           ia.month.index,
        monthGanzhi:    ia.month.ganZhi,
        gregorianStart: ia.month.startApprox,
        gregorianEnd:   ia.month.endApprox,
        type,
        affectsA:       ia.pillarLabels.join('/'),
        affectsB:       ib.pillarLabels.join('/'),
      })
    }
  }
  return result
}

// ── Public entry point ────────────────────────────────────────────────────────

export function buildCompatibilityForecast(
  baziA: BaziPartnerData,
  baziB: BaziPartnerData,
  months = 24,
): CompatibilityForecast {
  const forecastA = buildForecastForChart(baziToPillars(baziA), months)
  const forecastB = buildForecastForChart(baziToPillars(baziB), months)

  // Both forecasts share the same timeline window (starts from today)
  const timeline = forecastA.timeline

  const sharedChong = computeShared(forecastA.interactions.chong, forecastB.interactions.chong, 'chong')
  const sharedHe    = computeShared(forecastA.interactions.he,    forecastB.interactions.he,    'he')

  return {
    timeline,
    keyA:        forecastA.interactions,
    keyB:        forecastB.interactions,
    sharedChong,
    sharedHe,
  }
}
