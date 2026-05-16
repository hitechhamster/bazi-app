import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterCommunicationPrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, nameA, nameB, locale, mode } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Three of this Premium Compatibility Reading.
Chapter title in target language: 沟通与冲突 / Communication & Conflict / 溝通與衝突
Start with: ## [Chapter title in target language]

TARGET: 2,000+ words. This chapter is the most practically useful — name the exact recurring dynamics, where they come from in the charts, and what to do about them. Specific to THIS pairing.

---

### SECTION 1 — How Each Person Communicates

The Ten-God profile shapes HOW a person expresses themselves, processes information, and receives emotional input.

${nameA} dominant profile: ${baziA.shishenProfile.en} (${baziA.shishenProfile.traits.join(', ')})
${nameB} dominant profile: ${baziB.shishenProfile.en} (${baziB.shishenProfile.traits.join(', ')})

For ${nameA}:
- What is their natural communication style? Do they lead with logic, intuition, emotion, control, or charm? Ground this in their Ten-God dominance and Day Master element.
- How do they process conflict internally — do they confront directly, withdraw and reflect, intellectualise, or deflect?
- What do they need to feel heard and understood? What shuts them down?
- Their emotional blind spot in communication: the thing they do unconsciously that impacts partners most.

For ${nameB}:
- The same four questions applied to ${nameB}'s chart.

Minimum: 500 words.

---

### SECTION 2 — The Communication Chemistry

Now analyse what happens when THESE two communication styles meet.

- Where they speak the same language: the dimensions where information flows naturally and both feel understood without effort.
- The translation gap: where their natural styles diverge and what happens when neither adjusts — describe the specific recurring fight or silence pattern that emerges from this elemental mismatch.
- The [[食神]]/[[伤官]] dynamic: if either person carries strong Hurting Officer or Food God energy, how does this affect verbal expression, the desire to "win" arguments, or the need to be creatively heard? How does the other person's chart receive this energy?
- The [[官殺]] dynamic: if authority, control, or correction energy is strong in either chart, describe how it operates in communication — who tends to direct, correct, or impose structure on the conversation, and how the other receives it.
- Silence vs. speech: which person tends toward verbal processing, which toward internal processing? How does this create friction, and how can they use this difference intentionally?

Minimum: 500 words.

---

### SECTION 3 — Root Causes of Recurring Conflict

Name 3–4 specific conflict patterns this couple will encounter, each grounded in chart interactions:

For each pattern:
**Pattern name** (e.g., "The Control vs. Freedom Loop")
- Elemental root: which specific chart features (Day Master elements, Ten-God positions, cross-pillar interactions) generate this pattern?
- How it plays out: the specific sequence — what triggers it, how each person responds, how it escalates or collapses.
- The unconscious belief driving each person in this moment.
- What each person actually needs in this moment (which is usually different from what they're expressing).
- The resolution pathway: one concrete, specific practice this couple can use to interrupt the pattern.

Cover at minimum 3 patterns. Each pattern minimum 150 words.

---

### SECTION 4 — Elemental Harmony Points

Every couple has natural domains where their charts create ease. Name and describe 3 areas where this couple's energy flows without friction:

For each:
- Which elemental or pillar interactions create this harmony?
- What does it feel like in day-to-day life — where does conversation flow, where do they finish each other's sentences, where do they feel most seen?
- How to deliberately cultivate more of this quality.

Minimum: 300 words.

---

### SECTION 5 — Communication Practice Map

Provide a specific, actionable framework for this couple — not generic advice, but practices derived from their chart logic:

- The one non-negotiable communication rule for this pairing (based on their elemental dynamic).
- The best time of day / day of week for difficult conversations (linked to elemental energy if possible).
- The phrase or approach ${nameA} can use that speaks directly to ${nameB}'s chart energy.
- The phrase or approach ${nameB} can use that speaks directly to ${nameA}'s chart energy.
- The single most important thing NOT to do — the specific communication behavior that this pairing's chart logic makes especially corrosive.

Minimum: 300 words.

---

QUALITY STANDARD:
BAD: "You may sometimes have disagreements but with communication you can resolve them."
GOOD: "When ${nameA}'s [[伤官]] energy is activated — and it will be, whenever the conversation touches creative vision or perceived constraints — it doesn't just speak: it performs. [[伤官]] is constitutionally unable to state its view without some artfulness, some edge. ${nameB}'s [[正官]] receives this as challenge rather than expression. The clash is not about the content of what's said. It's about [[官]] meeting [[伤官]] — structure meeting the energy that inherently subverts structure. Until both name this, they'll fight about the dishes when they're really fighting about freedom vs. security."

Total chapter minimum: 2,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 12000 }
}
