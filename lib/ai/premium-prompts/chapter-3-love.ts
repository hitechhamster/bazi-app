import 'server-only'
import {
  LANG_TONE, SYSTEM_BASE, chartDataBlock, genderInstruction,
  type PremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapter3Prompt(ctx: PremiumContext, locale: string): ChapterPrompt {
  const {
    dayMaster, dayMasterElement, pillars, fiveElements,
    structured, luckCycles, forecastYear, currentDayun, approxAge,
  } = ctx

  const lang   = LANG_TONE[locale] ?? LANG_TONE['en']
  const gender = genderInstruction(ctx.gender, locale)
  const data   = chartDataBlock(ctx)

  const pastCycles   = luckCycles.filter(c => c.endYear   < forecastYear)
  const futureCycles = luckCycles.filter(c => c.startYear > forecastYear)

  const favorableStr   = structured.favorable.join('、')   || '未确定'
  const dayBranch      = pillars.day[1] ?? '?'

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

Write Chapter Three of this person's Premium Destiny Reading.
Chapter title in target language: 婚恋情感与健康 / Love, Marriage & Health / 婚戀情感與健康
Start with: ## [Chapter title in target language]

TARGET: 2,500+ words.

COVER ALL FIVE TOPICS IN FULL:

---

### TOPIC 1 — Spouse Palace & Relationship Stars
Day Pillar: ${pillars.day} | Day Branch / Spouse Palace (日支): ${dayBranch}
${gender}

- The Day Branch (日支) as the Spouse Palace: what energy does ${dayBranch} hold? What kind of partner archetype does this position naturally magnetize?
- For this Day Master (${dayMaster}): which Ten God represents the spouse, based on the gender instruction above? Where does this star appear in the chart? Is it strong, rooted, hidden in a stem, or absent?
- The Peach Blossom star (桃花): is it present in this chart? Where is it positioned? What does its presence or absence say about romantic attractiveness and the quality of this person's love life?
- The recurring relationship pattern: what dynamic keeps appearing in this person's closest bonds — and what specific chart element is responsible?
- The relationship self-sabotage pattern (if any): what does the chart reveal about how this person unconsciously undermines intimacy?

Minimum: 600 words.

---

### TOPIC 2 — Ideal Partner Portrait
- Paint a vivid portrait of the ideal partner for this chart: not physical appearance, but elemental energy, personality archetype, and life orientation.
- Which Day Master element in a partner creates the most natural harmony with ${dayMaster} (${dayMasterElement})? Which creates friction — and why is the friction sometimes attractive anyway?
- The unconscious partner template this person keeps returning to: what archetype do they keep choosing, and why does the chart explain both the initial attraction and the eventual tension?
- What this person genuinely needs in a relationship — the unspoken requirements they may not consciously articulate.
- What they offer a partner — and what the chart reveals they struggle to provide without deliberate effort.
- The partner who would change everything: what elemental combination or chart type would be genuinely transformative for this person?

Minimum: 500 words.

---

### TOPIC 3 — Marriage Timing & Relationship Cycles
Person's approximate age: ~${approxAge}
Past cycles: ${pastCyclesStr}
Current cycle: ${currentDayun ? `${currentDayun.ganZhi} (${currentDayun.startYear}–${currentDayun.endYear})` : 'not active'}
Future cycles: ${futureCyclesStr}

For EACH past Luck Cycle (${pastCyclesStr}):
- What did that decade do to the spouse palace and relationship stars?
- What relationship events likely occurred — meeting, commitment, conflict, separation, or deepening?
- Was it a romantic building phase, a partnership activation, or a relationship stress period?
Minimum 150 words per past cycle.

For the CURRENT Luck Cycle (${currentDayun ? `${currentDayun.ganZhi}, ${currentDayun.startYear}–${currentDayun.endYear}` : 'not active'}):
- What is this decade doing to the relationship sphere?
- Is the spouse palace being activated, pressured, or stabilised?
- The most significant relationship development this decade is pointing toward.
Minimum 200 words.

Marriage window analysis:
- Based on Luck Cycles and annual year patterns, what age range or year range is most likely for partnership commitment or major relationship shifts?
- For upcoming cycles (${futureCyclesStr}): what relationship changes do they portend?
- The single year in the next 5 carrying the most significant romantic energy — name it with chart reasoning.

Minimum total for this topic: 500 words.

---

### TOPIC 4 — Health & Longevity
Five Elements: Wood ${fiveElements.wood} | Fire ${fiveElements.fire} | Earth ${fiveElements.earth} | Metal ${fiveElements.metal} | Water ${fiveElements.water}
Favorable: ${favorableStr}

Five element → organ system mapping:
- Wood → Liver, Gallbladder, Eyes, Tendons, Nervous System
- Fire → Heart, Small Intestine, Blood Vessels, Inflammation
- Earth → Spleen, Stomach, Pancreas, Muscles, Immune function
- Metal → Lungs, Large Intestine, Skin, Respiratory, Immune defense
- Water → Kidneys, Bladder, Bones, Reproductive System, Endocrine

Analysis:
- Which element is most deficient or excessive? What organ systems does this suggest monitoring? (Use "tendency toward" language — not diagnosis.)
- The health-sensitive Luck Cycle periods: when does the elemental balance become most stressed?
- Mental and emotional health patterns: what psychological tendencies does the chart structure create? Name them specifically (e.g., anxiety from over-controlled charts, emotional intensity from hidden stems, perfectionism from certain patterns) with chart evidence.
- Lifestyle rhythms this chart calls for: how should this person structure rest, activity, social intensity, and solitude?
- One specific health consideration for the current Luck Cycle and year.

Minimum: 400 words.

---

### TOPIC 5 — Closing: What Love & Life Ask of This Person
This is not a summary — it is a direct message.

- The deepest relationship lesson embedded in this chart: what is this person here to learn through their closest bonds?
- The single most important insight about their emotional world that, once truly understood, changes how they relate to everyone.
- The relationship they are capable of versus the relationship they usually settle for — and what the gap reveals about their chart's unresolved tension.
- A powerful close: what does this chart say about the quality of love available to this person, and what is genuinely required to access it fully?

Minimum: 300 words.

---

Total chapter minimum: 2,500 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 16000 }
}
