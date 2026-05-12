import 'server-only'
import {
  LANG_TONE, SYSTEM_BASE, chartDataBlock,
  type PremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapter4Prompt(ctx: PremiumContext, locale: string): ChapterPrompt {
  const {
    dayMaster, dayMasterElement, structured,
    forecastYear, forecastNextYear, currentDayun, currentLiuNian,
    approxAge, forecastData,
  } = ctx

  const lang = LANG_TONE[locale] ?? LANG_TONE['en']
  const data = chartDataBlock(ctx)

  const todayStr    = new Date().toISOString().split('T')[0]
  const firstMonth  = forecastData.timeline[0]
  const lastMonth   = forecastData.timeline[forecastData.timeline.length - 1]

  const chongLines = forecastData.interactions.chong.map(i =>
    `  第${i.month.index}月 ${i.month.ganZhi}（${i.month.startApprox}）：月支${i.monthZhi} 冲 ${i.pillarLabels.join('/')}${i.targetZhi}`
  ).join('\n')

  const heLines = forecastData.interactions.he.map(i =>
    `  第${i.month.index}月 ${i.month.ganZhi}（${i.month.startApprox}）：月支${i.monthZhi} 合 ${i.pillarLabels.join('/')}${i.targetZhi}`
  ).join('\n')

  const userPrompt = `${data}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Four (Final Chapter) of this person's Premium Destiny Reading.
Chapter title in target language: 24个月流年流月预测 / 24-Month Forecast / 24個月流年流月預測
Start with: ## [Chapter title in target language]

TARGET: 3,000+ words. This chapter must be the most practical and time-specific.

=== PRE-COMPUTED FORECAST DATA ===
Today: ${todayStr}
Forecast window: ${firstMonth?.startApprox ?? todayStr} → ${lastMonth?.endApprox ?? ''}

24-MONTH GANZHI TABLE (use this exactly — do NOT recompute):
${forecastData.timelineMarkdown}

${forecastData.interactionsMarkdown}
${chongLines ? `\n⚠ CLASH MONTHS that require focused attention:\n${chongLines}` : ''}
${heLines ? `\n✓ HARMONY MONTHS — auspicious windows:\n${heLines}` : ''}

=== FORECAST CHART CONTEXT ===
Day Master: ${dayMaster} (${dayMasterElement})
Favorable: ${structured.favorable.join(', ') || 'undetermined'}
Unfavorable: ${structured.unfavorable.join(', ') || 'undetermined'}
Pattern: ${structured.pattern ?? 'none'}
Current 大运: ${currentDayun ? `${currentDayun.ganZhi} (${currentDayun.startYear}–${currentDayun.endYear})` : 'not active'}
Current 流年: ${currentLiuNian ? `${currentLiuNian.ganZhi} ${currentLiuNian.year}` : forecastYear}
Approximate age: ~${approxAge}

---

COVER ALL FOUR SECTIONS IN FULL:

### SECTION 1 — Year-Level Analysis: ${forecastYear} & ${forecastNextYear}

For ${forecastYear} (current year — ${currentLiuNian?.ganZhi ?? forecastYear}):
- The year's ganzhi and elemental character. How it interacts with the Day Master (${dayMaster}) and Pattern.
- Three dominant themes for ${forecastYear}: one for career/wealth, one for relationships, one for personal development.
- The BEST 3-month window in ${forecastYear} for major moves — identify the specific months from the table and explain why their ganzhi creates an opening.
- The most challenging period in ${forecastYear} — identify it from the table and explain the elemental tension.
- One bold, specific prediction for ${forecastYear}.

For ${forecastNextYear}:
- ${forecastNextYear}'s ganzhi and elemental character.
- How the energy shifts from ${forecastYear} to ${forecastNextYear}: what changes, what opens, what closes?
- The dominant theme of ${forecastNextYear} for this person.
- One bold, specific prediction for ${forecastNextYear}.

Minimum: 600 words.

---

### SECTION 2 — Month-by-Month Analysis: All 24 Months

Go through EVERY month from the 24-month table. For each month use this format:

**第N月 [干支] ([start]~[end])**
- Elemental relationship to Day Master ${dayMaster} and pattern ${structured.pattern ?? 'none'}: producing / draining / clashing / harmonising / neutral — explain briefly what this means in practice.
- Primary theme for this month: career opportunity / relationship activation / financial decision / rest & consolidation / caution period / creative expansion (pick the most relevant one, explain why).
- Guidance: advance, consolidate, or wait?
${forecastData.interactions.chong.length > 0 ? '- ⚠ If this is a clash month: describe the clash energy in detail — what area of life it impacts, what the chart indicates to watch for.' : ''}
${forecastData.interactions.he.length > 0 ? '- ✓ If this is a harmony month: describe what this combination opens — what opportunity or ease it creates.' : ''}
- One specific observation about what this month brings for this person.

MANDATORY: All 24 months in the table must be covered individually. Do not group months together.
Minimum per month: 60 words. Section total minimum: 1,500 words.

---

### SECTION 3 — Key Windows & Decision Points

Based on the complete 24-month analysis:
- The 3 BEST months for major life moves (career change, major investment, starting something new, making a commitment): name each from the table with full reasoning.
- The 3 months requiring most caution: name them and explain specifically what the elemental tension is.
- The single most important month in the entire 24-month window: name it and explain why it stands above the rest.
- Practical timing guidance: if this person has one major undecided action, which month range is most auspicious to execute it?

Minimum: 300 words.

---

### SECTION 4 — Closing: The Bigger Picture

This is the final section of the entire Premium Reading. Write it with the gravity, warmth, and authority of a master speaking directly to this person for the last time.

- Synthesise the 3 most important insights from the ENTIRE reading (all four chapters combined).
- The central life theme: what is this chart fundamentally asking this person to do, become, or understand in this lifetime?
- The single greatest gift in this chart — and how to deploy it with intention rather than by accident.
- The single most important limitation to work WITH (not fight — route around intelligently).
- A closing statement: if this master could say only one thing to this person, what would it be?

Minimum: 300 words. End powerfully. This is the last thing they read.

---

CRITICAL: All 24 months from the table must appear individually in Section 2.
Total chapter minimum: 3,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 24000 }
}
