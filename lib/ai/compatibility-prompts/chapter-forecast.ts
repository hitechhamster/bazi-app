import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterForecastPrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, nameA, nameB, locale, mode, forecast } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const todayStr   = new Date().toISOString().split('T')[0]

  // Build timeline block
  let timelineBlock = 'No forecast data available.'
  let sharedChongBlock = ''
  let sharedHeBlock    = ''

  if (forecast) {
    const { timeline, keyA, keyB, sharedChong, sharedHe } = forecast

    const timelineLines = timeline.map(m =>
      `  Month ${m.index.toString().padStart(2, ' ')} | ${m.ganZhi} | ${m.startApprox} → ${m.endApprox}`
    ).join('\n')
    timelineBlock = `24-MONTH TIMELINE (${timeline[0]?.startApprox ?? todayStr} → ${timeline[timeline.length - 1]?.endApprox ?? ''}):\n${timelineLines}`

    // Key interactions for A
    const aChong = keyA.chong.map(i =>
      `  Month ${i.month.index} ${i.month.ganZhi} (${i.month.startApprox}): 月支${i.monthZhi} 冲 ${nameA}的 ${i.pillarLabels.join('/')} ${i.targetZhi}`
    ).join('\n')
    const aHe = keyA.he.map(i =>
      `  Month ${i.month.index} ${i.month.ganZhi} (${i.month.startApprox}): 月支${i.monthZhi} 合 ${nameA}的 ${i.pillarLabels.join('/')} ${i.targetZhi}`
    ).join('\n')

    // Key interactions for B
    const bChong = keyB.chong.map(i =>
      `  Month ${i.month.index} ${i.month.ganZhi} (${i.month.startApprox}): 月支${i.monthZhi} 冲 ${nameB}的 ${i.pillarLabels.join('/')} ${i.targetZhi}`
    ).join('\n')
    const bHe = keyB.he.map(i =>
      `  Month ${i.month.index} ${i.month.ganZhi} (${i.month.startApprox}): 月支${i.monthZhi} 合 ${nameB}的 ${i.pillarLabels.join('/')} ${i.targetZhi}`
    ).join('\n')

    // Shared resonance
    if (sharedChong.length > 0) {
      sharedChongBlock = `\n⚠ SHARED CLASH MONTHS (both partners affected simultaneously):\n` +
        sharedChong.map(m =>
          `  Month ${m.step} ${m.monthGanzhi} (${m.gregorianStart}): affects ${nameA} [${m.affectsA}] AND ${nameB} [${m.affectsB}]`
        ).join('\n')
    }
    if (sharedHe.length > 0) {
      sharedHeBlock = `\n✓ SHARED HARMONY MONTHS (both partners benefit simultaneously):\n` +
        sharedHe.map(m =>
          `  Month ${m.step} ${m.monthGanzhi} (${m.gregorianStart}): activates ${nameA} [${m.affectsA}] AND ${nameB} [${m.affectsB}]`
        ).join('\n')
    }

    if (aChong || aHe) {
      timelineBlock += `\n\n${nameA} KEY INTERACTIONS:\n${aChong ? `Clashes:\n${aChong}` : '  No clash months'}${aHe ? `\nHarmonies:\n${aHe}` : ''}`
    }
    if (bChong || bHe) {
      timelineBlock += `\n\n${nameB} KEY INTERACTIONS:\n${bChong ? `Clashes:\n${bChong}` : '  No clash months'}${bHe ? `\nHarmonies:\n${bHe}` : ''}`
    }
    if (sharedChongBlock) timelineBlock += sharedChongBlock
    if (sharedHeBlock)    timelineBlock += sharedHeBlock
  }

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Six (Final Chapter) of this Premium Compatibility Reading.
Chapter title in target language: 24个月关系预测 / 24-Month Relationship Forecast / 24個月關係預測
Start with: ## [Chapter title in target language]

TARGET: 3,000+ words. This is the most time-specific chapter — guide this couple through each of the next 24 months as a PAIR. This is not two individual forecasts: it is a joint relational forecast. Every month must be interpreted through the lens of how the month's energy affects THIS relationship.

=== PRE-COMPUTED FORECAST DATA (do not recompute — use exactly) ===
Today: ${todayStr}

${timelineBlock}

===

---

### SECTION 1 — The Next 24 Months: Relational Landscape Overview

Before going month-by-month, set the stage:

- What is the dominant elemental quality of the entire 24-month window? Does it favour this couple's combined chart energy or challenge it?
- The 2–3 most important themes that will run through this period for ${nameA} and ${nameB} as a pair.
- The single most important month in the entire 24-month window for this relationship — and why it stands above all others.
- Year-level summary: what is ${new Date().getFullYear()} bringing for this couple as a pair? What does ${new Date().getFullYear() + 1} bring?

Minimum: 400 words.

---

### SECTION 2 — Month-by-Month Relational Forecast

Go through EVERY month in the 24-month table. For each month use this format:

**Month N | [干支] | [gregorian dates]**
- Monthly energy: the ganzhi's elemental character and its relationship to the couple's combined chart (both Day Masters, both dominant elements).
- Relational theme: the quality this month brings to their relationship — connection, tension, growth, withdrawal, desire, clarity, distance, conflict, intimacy, collaboration, or transformation. Name the most dominant one and explain why.
${forecast && forecast.sharedChong.length > 0 ? '- ⚠ If this is a SHARED CLASH MONTH: describe in detail which aspect of the relationship comes under pressure (communication, finances, physical distance, family friction, desire conflict). What should both people know and do?'  : ''}
${forecast && forecast.sharedHe.length > 0 ? '- ✓ If this is a SHARED HARMONY MONTH: describe what opens for them as a couple — the specific domain where cooperation, love, or opportunity peaks.'  : ''}
- If only ONE person has a key interaction this month: describe how their activation affects the relationship dynamic (e.g., "${nameA} enters a clash month — they may be more reactive, absorbed in external pressure, or needing space. ${nameB}'s role this month is...").
- Practical guidance: one specific, concrete thing this couple should prioritise, attempt, or avoid this month.

MANDATORY: All 24 months must be covered individually. Do not group or skip any month.
Minimum per month: 80 words. Section total minimum: 2,000 words.

---

### SECTION 3 — Key Windows for Relationship Milestones

Based on the full 24-month analysis:

- The 3 BEST months for major relationship milestones (commitment conversations, travel together, moving in, engagement, marriage registration, starting a family): name each from the table with full elemental reasoning.
- The 3 months requiring most relational care: name them and explain the elemental tension — what NOT to do during these months, and how to stay connected despite pressure.
- The optimal window for a "relationship reset" or important conversation if they have unresolved issues.
- If the couple is considering a major shared decision (moving, marriage, financial merger): which month range does the chart most clearly favour?

Minimum: 350 words.

---

### SECTION 4 — Closing: The Invitation of This Pairing

This is the final section of the entire Premium Compatibility Reading. Write it with the gravity, warmth, and authority of a master speaking directly to both people.

- The three most important truths about this relationship revealed across all six chapters.
- What this relationship is asking of EACH person — the growth it requires, the patterns it will reveal, the version of themselves it is calling them toward.
- The single greatest gift this pairing carries — the thing neither person could access alone, which this relationship uniquely makes possible.
- A closing statement addressed directly to ${nameA} and ${nameB}: if this master could say only one thing to both of them about the nature of their connection, what would it be?

Minimum: 300 words. End with power and precision. This is the last thing they read.

---

CRITICAL RULES:
- All 24 months from the table must appear individually in Section 2. Do not skip or merge months.
- Shared clash/harmony months must receive special emphasis as described above.
- This is a RELATIONAL forecast — always interpret month energy through how it affects this couple together, not as two parallel individual readings.

Total chapter minimum: 3,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 24000 }
}
