import 'server-only'
import {
  LANG_TONE, SYSTEM_BASE, chartDataBlock, genderInstruction,
  type PremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapter1Prompt(ctx: PremiumContext, locale: string): ChapterPrompt {
  const { dayMaster, dayMasterElement, pillars, fiveElements, isThreePillar, structured } = ctx

  const lang   = LANG_TONE[locale] ?? LANG_TONE['en']
  const gender = genderInstruction(ctx.gender, locale)
  const data   = chartDataBlock(ctx)

  const favorableStr   = structured.favorable.join('、')   || '未确定'
  const unfavorableStr = structured.unfavorable.join('、') || '未确定'

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter One of this person's Premium Destiny Reading.
Chapter title in target language: 命局灵魂 / Core Chart Soul / 命局靈魂
Start with: ## [Chapter title in target language]

TARGET: 3,000+ words. This is the foundation chapter — the entire reading builds on it.

COVER ALL SIX TOPICS IN FULL:

---

### TOPIC 1 — Day Master Deep Dive
Day Master: ${dayMaster} (${dayMasterElement}) | Strength: ${structured.strength ?? 'undetermined'}

- What elemental archetype is this Day Master at its core? Not textbook — as lived experience. What does it MEAN to be this energy?
- Strength verdict: ${structured.strength ?? 'undetermined'}. Walk through the reasoning step by step: seasonal support from the month branch (得令/失令), rooting in earthly branches, how many stems produce vs. drain the Day Master. Then describe what this strength level FEELS like from the inside — does this person feel solid, pressured, scattered, or overflowing?
- Rooting: which earthly branches provide root for the Day Master? What does deep vs. shallow rooting mean for resilience and stability in this person's life?
- The Day Master's relationship to each pillar: Year (ancestry/early life energy), Month (career/drive — most critical), Hour (aspirations/late life) — what do those elemental relationships reveal about core tensions?
- The private experience: what does this person feel like to themselves? Their default emotional state, their inner landscape.

Minimum: 600 words.

---

### TOPIC 2 — Chart Pattern & Ten Gods
Pattern: ${structured.pattern ?? 'no dominant pattern'}

- State the pattern and explain HOW it emerged from the chart (month branch Qi → stem transparency logic). Make this feel like a revelation, not a classification exercise.
- The 3–4 most prominent Ten Gods in this chart: name each, state its position (Year/Month/Day/Hour pillar), its elemental strength (rooted vs. floating), and then describe its REAL-WORLD expression — the specific behaviors, dynamics, and experiences this person will recognize as unmistakably theirs.
- Dynamic tensions: which Ten Gods clash, suppress, or compete with each other? What psychological complexity does that create?
- The single "loudest" Ten God — the force that most visibly shapes this person's choices, identity, and recurring patterns.
- Pattern success conditions: which Luck Cycles or elemental years activate this pattern fully? Which suppress it?

Minimum: 700 words.

---

### TOPIC 3 — Hidden Stems & Five Element Architecture
Five Elements: Wood ${fiveElements.wood} | Fire ${fiveElements.fire} | Earth ${fiveElements.earth} | Metal ${fiveElements.metal} | Water ${fiveElements.water}
Favorable: ${favorableStr} | Unfavorable: ${unfavorableStr}

- Hidden stems (藏干) in each earthly branch: which hidden energies are latent vs. surfaced? Specifically, what do the hidden stems in the Month Branch (最重要的藏干) reveal?
- Five element distribution analysis: which element dominates? Which is absent or deficient? Paint a vivid picture of what this elemental landscape FEELS like as a life — not abstract percentages, but lived texture.
- Favorable elements (${favorableStr}): explain WHY each helps — what it activates, what gap it fills, what potential it unlocks. How does this person recognize when a favorable element "arrives" in life as a person, opportunity, or environment?
- Unfavorable elements (${unfavorableStr}): explain WHY each harms — what it over-activates or suppresses. What behavioral or relational pattern does this create when unfavorable elements dominate?

Minimum: 500 words.

---

### TOPIC 4 — Four Pillars as Life Architecture
- Year Pillar (${pillars.year}): the ancestral inheritance, early environment, the "soil" this person grew from. How did the world first receive them?
- Month Pillar (${pillars.month}): the career engine, the drive, the ambition structure. This is the most important vocational pillar — what does its elemental character say about how this person builds, climbs, and creates?
- Day Pillar (${pillars.day}): the self and the spouse, how this person loves and is loved. The Day Branch (日支) is the Spouse Palace — what does it hold?
${isThreePillar
  ? '- Hour Pillar: UNKNOWN — note once that the birth hour was not provided, then omit this sub-section.'
  : `- Hour Pillar (${pillars.hour ?? '?'}): late life, children, hidden desires, the legacy impulse — what does it hold?`
}
- The cross-pillar narrative: how do the pillars interact with each other? Is there harmony, tension, or a dramatic story written across the four columns?

Minimum: 400 words.

---

### TOPIC 5 — Empty Pillars (空亡 / Void Cycle)
- Identify the empty branches (旬空) based on the Day Pillar's 旬 cycle.
- Which of the four pillars or major life domains do the empty branches govern?
- How does the person EXPERIENCE these vacancies — as longing, detachment, spiritual sensitivity, or paradoxical freedom?
- The hidden gift of 空亡: why emptiness in certain positions can create unusual depth, independence, or spiritual capacity.

Minimum: 300 words.

---

### TOPIC 6 — Core Destiny Themes
Synthesize everything above into a unified portrait.

- What is this life FUNDAMENTALLY about? What is the chart's central drama or question?
- The one core tension (or gift) that, once named, explains everything else about this person — their recurring choices, relationships, struggles, and breakthroughs.
- How the chart's structure has shaped this person's actual biography in ways they may not have named yet.
- A powerful closing statement: if this master could say only one thing about who this person IS at their deepest level, what would it be?

Minimum: 400 words.

---

QUALITY STANDARD — Write at this level:
BAD: "You are creative and can achieve success in many fields."
GOOD: "The [[Hurting Officer]] bursting from your Month Pillar means you were almost certainly the child who couldn't stop asking 'why' — the one teachers found difficult and parents secretly worried about. Every time you tried to fit into someone else's structure, between ages [cycle] and [cycle], the chart was working. Not failing — working."

Total chapter minimum: 3,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 16000 }
}
