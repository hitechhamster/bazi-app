import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterCompatibilityPrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, scores, nameA, nameB, locale, mode } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const bd = scores.breakdown

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Two of this Premium Compatibility Reading.
Chapter title in target language: 合婚深析 / Compatibility Deep Analysis / 合婚深析
Start with: ## [Chapter title in target language]

TARGET: 2,500+ words. This is the core analytical chapter — dissect each of the 6 compatibility dimensions with depth and specificity. Every claim must be traceable to the chart data above.

---

### SECTION 1 — Day Master Compatibility (${bd.dayMaster.score}/25)

${bd.dayMaster.description}

The relationship between [[${baziA.dayMaster}]] (${baziA.dayMasterElement}) and [[${baziB.dayMaster}]] (${baziB.dayMasterElement}):

- Name the precise elemental relationship: producing (相生), controlling (相剋), same-element (比肩/劫財 resonance), or combining (合化)? Explain the mechanism step by step.
- What does a score of ${bd.dayMaster.score}/25 mean for this couple's fundamental compatibility rhythm? What does it feel like day-to-day?
- The strength differential: ${nameA} is ${baziA.dayMasterStrength}, ${nameB} is ${baziB.dayMasterStrength}. How does this affect power dynamics and who "sets the temperature" in the relationship?
- The deepest gift of this Day Master pairing — what only THESE two specific elements create together that neither would experience alone.
- The deepest challenge — what elemental tension is structural, not circumstantial, and how can they work with it rather than against it?

Minimum: 500 words.

---

### SECTION 2 — Zodiac Branch Compatibility (${bd.zodiac.score}/20)

${bd.zodiac.description}

${nameA} Zodiac: ${baziA.zodiac} | ${nameB} Zodiac: ${baziB.zodiac}

- Name the precise branch relationship: [[三合]] (三合局), [[六合]] (六合), [[相沖]] (六沖), [[相害]] (六害), [[相刑]] (三刑), or neutral? Explain the interaction mechanism.
- Score ${bd.zodiac.score}/20: what does this tell us about the couple's social compatibility, family integration, and how they are perceived together as a unit?
- The Zodiac dynamic in real life: does this pairing create magnetic attraction, comfortable familiarity, productive tension, or chronic friction? Give specific scenarios.
- How does this branch relationship interact with each person's Year Pillar (ancestral pattern)? Does the pairing reinforce or challenge each person's family-of-origin programming?
- If there is a clash (相沖) or harm (相害): explain exactly what domain it affects and what conscious practice can dissolve the structural tension.

Minimum: 400 words.

---

### SECTION 3 — Five Element Balance (${bd.elements.score}/20)

${bd.elements.description}

${nameA} elements: ${Object.entries(baziA.elements).map(([k,v]) => `${k}:${Number(v).toFixed(1)}`).join(' ')}
${nameB} elements: ${Object.entries(baziB.elements).map(([k,v]) => `${k}:${Number(v).toFixed(1)}`).join(' ')}
${nameA} needs: ${baziA.favorableElements.join(', ') || 'balanced'} | ${nameB} needs: ${baziB.favorableElements.join(', ') || 'balanced'}

- Combined elemental landscape: which elements are dominant in the combined chart? Which are deficient? What does this elemental ecosystem support — and what does it lack?
- Score ${bd.elements.score}/20: does this couple mutually supply each other's favorable elements, or do they amplify each other's excesses?
- The key elemental exchange: name the one or two elemental interactions (e.g., ${nameA}'s Metal feeding ${nameB}'s Water) that most define this relationship's quality.
- Environmental design: what shared environments, occupations, or lifestyle choices activate the couple's combined elemental strengths? What should they consciously avoid?
- Elemental growth prescription: what element does this couple most need to cultivate TOGETHER (through environment, direction, color, career, or shared practice)?

Minimum: 400 words.

---

### SECTION 4 — NaYin Resonance (${bd.naYin.score}/15)

${bd.naYin.description}

${nameA} NaYin: [[${baziA.naYin}]] | ${nameB} NaYin: [[${baziB.naYin}]]

- The symbolic meeting: what are the images encoded in these two NaYin designations? What deeper archetypal story do they tell when placed side by side?
- Score ${bd.naYin.score}/15: NaYin harmony speaks to soulmate resonance, life-path alignment, and whether two people are moving in compatible directions at the deepest level. What does this score say?
- Karmic or fated dimension: does this NaYin pairing carry a quality of destiny — a sense that these two people were meant to cross paths? Or is this a pragmatic, working partnership without that fatedness?
- How the NaYin texture colours the relationship's emotional atmosphere — the "felt sense" or quality this couple generates together.

Minimum: 300 words.

---

### SECTION 5 — GanZhi Pillar Interactions (${bd.ganZhi.score}/10)

${bd.ganZhi.description}

Pillars ${nameA}: [[${baziA.yearPillar}]] [[${baziA.monthPillar}]] [[${baziA.dayPillar}]] ${baziA.hourPillar ? `[[${baziA.hourPillar}]]` : ''}
Pillars ${nameB}: [[${baziB.yearPillar}]] [[${baziB.monthPillar}]] [[${baziB.dayPillar}]] ${baziB.hourPillar ? `[[${baziB.hourPillar}]]` : ''}

- Cross-pillar interactions: identify any clashes (相沖), combinations (合), punishments (刑), or harms (害) between the two sets of pillars. Name each interaction precisely (e.g., "${nameA}'s [[午]] Day Branch clashes ${nameB}'s [[子]] Year Branch").
- What domains do these cross-pillar interactions affect? (Year Pillar = family/ancestry; Month Pillar = career/drive; Day Pillar = self/partner; Hour Pillar = children/goals)
- Score ${bd.ganZhi.score}/10: the density and quality of cross-pillar connections — are there live wires or quiet harmony?
- The most important single cross-pillar interaction in this chart pairing. Why does it matter more than the others?

Minimum: 300 words.

---

### SECTION 6 — Spouse Palace Analysis (${bd.spousePalace.score}/10)

${bd.spousePalace.description}

${nameA} Day Pillar (Spouse Palace): [[${baziA.dayPillar}]] | ${nameB} Day Pillar (Spouse Palace): [[${baziB.dayPillar}]]

- The [[夫妻宮]] of each person: what elemental quality does each person's spouse palace hold? What does this say about the type of partner each person is wired to attract — and become — in a committed relationship?
- Does ${nameB} fit the elemental "template" encoded in ${nameA}'s spouse palace? Does ${nameA} fit ${nameB}'s? Explain precisely.
- Score ${bd.spousePalace.score}/10: spouse palace harmony is about whether this pairing activates the "partner archetype" each person carries. What does this score mean for their long-term partnership potential?
- Practical insight: how does understanding their respective spouse palaces help ${nameA} and ${nameB} show up differently — more consciously — for each other?

Minimum: 250 words.

---

### SECTION 7 — Overall Verdict: ${scores.total}/99

Level: ${scores.level.key}

- Synthesise all six dimensions into a clear, direct overall assessment. What does ${scores.total}/99 actually mean for ${nameA} and ${nameB}?
- The three most powerful compatibility strengths in this pairing — the dimensions where chart energy flows most naturally between them.
- The two most significant structural challenges — not weaknesses of character, but elemental patterns that will recur until consciously addressed.
- A direct, honest statement to this couple: given everything the charts reveal, what should they know about the nature of their connection and what it asks of them?

Minimum: 350 words.

---

QUALITY STANDARD:
BAD: "Your compatibility score shows a strong connection."
GOOD: "A Day Master score of ${bd.dayMaster.score}/25 tells us the elemental negotiation between [[${baziA.dayMaster}]] and [[${baziB.dayMaster}]] requires conscious navigation — this is not a pairing where compatibility arrives automatically. It must be built. The good news: what is built consciously between these two elements is also structurally permanent in ways that 'naturally easy' pairings often are not."

Total chapter minimum: 2,500 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 14000 }
}
