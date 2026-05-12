import 'server-only'
import {
  LANG_TONE, SYSTEM_BASE, chartDataBlock, genderInstruction,
  type PremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapter2Prompt(ctx: PremiumContext, locale: string): ChapterPrompt {
  const {
    dayMaster, dayMasterElement, fiveElements,
    structured, luckCycles, forecastYear, currentDayun, approxAge,
  } = ctx

  const lang   = LANG_TONE[locale] ?? LANG_TONE['en']
  const gender = genderInstruction(ctx.gender, locale)
  const data   = chartDataBlock(ctx)

  const pastCycles   = luckCycles.filter(c => c.endYear   < forecastYear)
  const futureCycles = luckCycles.filter(c => c.startYear > forecastYear)

  const favorableStr   = structured.favorable.join('、')   || '未确定'
  const unfavorableStr = structured.unfavorable.join('、') || '未确定'

  const pastCyclesStr   = pastCycles.length   > 0
    ? pastCycles.map(c   => `${c.ganZhi} (${c.startYear}–${c.endYear})`).join(', ')
    : 'none'
  const futureCyclesStr = futureCycles.length > 0
    ? futureCycles.map(c => `${c.ganZhi} (${c.startYear}–${c.endYear})`).join(', ')
    : 'none'

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Two of this person's Premium Destiny Reading.
Chapter title in target language: 事业财运 / Career & Wealth / 事業財運
Start with: ## [Chapter title in target language]

TARGET: 2,500+ words.

COVER ALL FIVE TOPICS IN FULL:

---

### TOPIC 1 — Wealth Star Analysis
Day Master: ${dayMaster} (${dayMasterElement}) | Pattern: ${structured.pattern ?? 'none'}

- Which element constitutes the Wealth Star for this Day Master? Is the prominent wealth star [[Direct Wealth]] (正财) or [[Indirect Wealth]] (偏财)? Where is it positioned in the chart (which pillar)?
- Wealth star strength and quality: is it rooted in any earthly branch? Is it supported by Output stars (食伤生财) or weakened by competing Companion stars (比劫夺财)?
- The wealth arrival pattern for this chart: does money come through sustained effort, windfalls, partnerships, inheritance, or speculative ventures? Name the mechanism with specific chart evidence.
- Wealth leakage: which star or element tends to drain financial resources? What behavioral pattern does this create in the person's actual money life?
- The single most revealing thing about this person's wealth chart — what makes their financial destiny distinctive?

Minimum: 500 words.

---

### TOPIC 2 — Useful God (用神) & Career Alignment
Favorable: ${favorableStr} | Unfavorable: ${unfavorableStr}
Five Elements: Wood ${fiveElements.wood} | Fire ${fiveElements.fire} | Earth ${fiveElements.earth} | Metal ${fiveElements.metal} | Water ${fiveElements.water}

- The primary useful god (用神/喜用神) for this chart: which element most powerfully balances or completes the Day Master? Why — walk through the elemental logic.
- Industries and career domains that resonate with the favorable elements (${favorableStr}). Map each favorable element to specific sectors:
  - Wood-aligned: education, publishing, health & wellness, environmental work, textiles, timber
  - Fire-aligned: technology, media, entertainment, finance, energy, marketing
  - Earth-aligned: real estate, construction, agriculture, logistics, mining, property
  - Metal-aligned: law, military, engineering, finance, precision manufacturing, consulting
  - Water-aligned: trading, communications, transport, hospitality, creativity, research
  Name 3–4 specific industries for this chart with clear elemental reasoning.
- Industries to approach with caution (aligned with ${unfavorableStr}): which sectors tend to create friction and why?
- Leadership and work style archetype: is this person built to be a founder, operator, creator, specialist, or advisor? Name the chart evidence.

Minimum: 600 words.

---

### TOPIC 3 — Career DNA (职业基因)
Pattern: ${structured.pattern ?? 'none'} | Day Master: ${dayMaster}

- The career archetype this chart produces: what kind of professional is this person fundamentally built to be? Paint a specific, vivid portrait — not job titles, but energy and role.
- Their professional competitive advantage: what do they do better than almost anyone, and what chart element explains it?
- Their professional blind spot: what pattern keeps creating friction in their career, and which chart element is responsible?
- The collaboration dynamic: which elemental type in a colleague or partner amplifies them (favorable element archetype)? Which drains or threatens them?
- Entrepreneurship vs. structured employment: does this chart favor building outside structures or working within them? Why?
- One bold career observation: what professional pivot, breakthrough, or limitation has this chart likely already produced — and what is it building toward?

Minimum: 500 words.

---

### TOPIC 4 — Luck Cycle Career & Wealth Timeline
Person's approximate age: ~${approxAge}
Past cycles: ${pastCyclesStr}
Current cycle: ${currentDayun ? `${currentDayun.ganZhi} (${currentDayun.startYear}–${currentDayun.endYear})` : 'not active'}
Future cycles: ${futureCyclesStr}

For EACH past Luck Cycle (${pastCyclesStr}):
- What shifted elementally in that decade (relative to the Day Master and pattern)?
- What career or wealth events likely occurred? Use past tense — validate the chart against probable biography.
- Was it a building phase, a harvest phase, or a disruption/restructuring phase?
Minimum 150 words per past cycle.

For the CURRENT Luck Cycle (${currentDayun ? `${currentDayun.ganZhi}, ${currentDayun.startYear}–${currentDayun.endYear}` : 'not active'}):
- What is this decade doing to the career structure and wealth potential?
- Key opportunities this cycle opens — and what form they're likely to take.
- Key risks or drains to navigate.
- When within this decade does the energy peak for career/wealth advancement?
Minimum 250 words.

For EACH upcoming Luck Cycle (${futureCyclesStr}):
- What career or wealth character will that decade carry?
- Is it broadly favorable or challenging for this chart? Why?
- One specific prediction for that decade's career/wealth trajectory.
Minimum 150 words per future cycle.

Minimum total for this topic: 700 words.

---

### TOPIC 5 — Practical Wealth & Career Strategy
- The 3 most important career or wealth actions aligned with this chart's structure — not generic advice, each grounded in specific elemental logic.
- The single most dangerous financial or career pattern this chart creates — the trap that keeps recurring and why.
- One bold prediction: where is this person's career and wealth heading over the next 5–10 years, based on the chart's trajectory and coming cycles?
- For ${forecastYear} specifically: what is the single best career or financial move this year, and when should it happen?

Minimum: 200 words.

---

Total chapter minimum: 2,500 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 16000 }
}
