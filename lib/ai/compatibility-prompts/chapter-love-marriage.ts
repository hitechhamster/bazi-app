import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterLoveMarriagePrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, nameA, nameB, locale, mode } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Five of this Premium Compatibility Reading.
Chapter title in target language: 婚恋深析 / Love & Marriage / 婚戀深析
Start with: ## [Chapter title in target language]

TARGET: 2,000+ words. This is the emotional and relational core of the reading — the chapter both people are most anxious to read. Write with precision, depth, and honest compassion. Ground every insight in the specific chart data.

---

### SECTION 1 — The Spouse Palace: What Each Person Seeks in Love

The [[夫妻宫]] (Spouse Palace) is the Day Branch — it encodes the partner archetype each person unconsciously seeks.

${nameA} Spouse Palace: [[${baziA.dayPillar}]] → Day Branch earthly branch
${nameB} Spouse Palace: [[${baziB.dayPillar}]] → Day Branch earthly branch

For ${nameA}:
- What elemental and Ten-God quality does ${nameA}'s Spouse Palace hold? What type of partner does this encoding draw them toward at an unconscious level?
- Does the Spouse Palace show harmony or tension with their own Day Master? What does this say about their relationship with intimacy — do they move toward love easily or approach it with ambivalence?
- The partner they need vs. the partner they often choose: are these aligned in this chart, or is there an archetypal mismatch to navigate?
- Love language encoded in the chart: how does ${nameA} give love, and what do they need to RECEIVE in order to feel truly loved?

Minimum: 350 words.

For ${nameB}:
- The same four questions applied to ${nameB}'s Spouse Palace and Day Master.

Minimum: 350 words.

---

### SECTION 2 — The Fit: Does Each Person Fulfill the Other's Spouse Palace?

This is the most direct compatibility question in Bazi love analysis.

- Does ${nameB}'s Day Master ([[${baziB.dayMaster}]], ${baziB.dayMasterElement}) satisfy the elemental template encoded in ${nameA}'s Spouse Palace? Explain the mechanism precisely.
- Does ${nameA}'s Day Master ([[${baziA.dayMaster}]], ${baziA.dayMasterElement}) satisfy the elemental template encoded in ${nameB}'s Spouse Palace? Explain the mechanism precisely.
- The mutual resonance verdict: does each person activate the other's deepest "partner archetype," or does one person fit and the other require more conscious cultivation?
- What happens when a chart's Spouse Palace is NOT perfectly satisfied by the actual partner — is this a dealbreaker, or can consciousness bridge the gap? For THIS couple, specifically.

Minimum: 400 words.

---

### SECTION 3 — Romantic Chemistry & Physical Magnetism

- The elemental basis of attraction: which specific chart interactions create the magnetic pull between ${nameA} and ${nameB}? Name them precisely (e.g., cross-pillar [[六合]], Day Master producing-relationship, NaYin harmony).
- Is the chemistry primarily intellectual, emotional, physical, or spiritual — and what chart logic generates each layer?
- The passion dynamic: which of the two carries more [[偏财]] or [[正官]] partner energy? How does this affect who pursues and who receives — and how does that dynamic feel to each person?
- Long-term attraction: does the chart structure support deepening desire over time, or does the elemental pattern suggest that initial chemistry needs to be consciously renegotiated as the relationship matures?

Minimum: 350 words.

---

### SECTION 4 — Marriage Prospects & Timing

- What does the combined chart say about marriage — is this written as a committed, long-term, potentially lifelong partnership, or does the chart energy suggest a transformative relationship of a defined chapter?
- The [[夫妻宫]] interaction between the two charts: do their Day Branches form any notable relationship (combination, clash, punishment)? What does this interaction say about the quality of their shared domestic life, living together, and building a home?
- Auspicious timing: based on the chart structures, what elemental years or Luck Cycle types support marriage or major commitment for this couple? What years or cycles to approach with more discernment?
- Children potential: if the hour pillars are known, what do they suggest about family-building? If unknown, speak to what the Day Pillar and Month Pillar structure suggests about this couple's orientation toward family.

Minimum: 350 words.

---

### SECTION 5 — The Long Game: Sustaining Love

This section is about the decades, not the months.

- The primary evolution this relationship will go through: how will the dynamic between ${nameA} and ${nameB} shift across life stages? What changes as they each enter different Luck Cycles?
- The one quality that, if cultivated, ensures this relationship deepens rather than stagnates over time — and which specific chart feature points to it.
- The one pattern that, if left unconscious, gradually erodes intimacy — and which specific chart interaction generates it.
- A closing statement: what is the fundamental gift this relationship carries for both people? Not compatibility statistics — the deeper WHY this meeting was written into both charts.

Minimum: 300 words.

---

QUALITY STANDARD:
BAD: "You are both loving people who can create a beautiful relationship."
GOOD: "The reason ${nameA} and ${nameB} find each other so immediately compelling is not chemistry in the vague sense — it's that [[${baziA.dayMaster}]] and [[${baziB.dayMaster}]] occupy the exact elemental positions in a producing chain that each person's chart has been quietly waiting for. ${nameA} has been drawing people who excite but don't ground them. ${nameB} has been drawing people who are stable but not generative. These charts fit. The question is whether both people are willing to let the fit reveal what it costs them to be truly known."

Total chapter minimum: 2,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 12000 }
}
