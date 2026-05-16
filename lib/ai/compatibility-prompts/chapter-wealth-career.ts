import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterWealthCareerPrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, nameA, nameB, locale, mode } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter Four of this Premium Compatibility Reading.
Chapter title in target language: 财运与事业 / Wealth & Career / 財運與事業
Start with: ## [Chapter title in target language]

TARGET: 2,000+ words. Analyse wealth-building capacity, career compatibility, financial dynamics, and the couple's combined financial destiny. Ground everything in specific chart logic.

---

### SECTION 1 — Individual Wealth Profiles

For ${nameA}:
- [[财星]] (Wealth Star) position and strength: which stem/branch carries the Wealth Star? Is it rooted (有根) or floating (无根)? What does this say about ${nameA}'s relationship with money — is wealth accumulated steadily, won in bursts, or elusive?
- Career archetype: based on their Day Master ${baziA.dayMaster} (${baziA.dayMasterElement}), dominant Ten-God (${baziA.shishenProfile.en}), and Month Pillar [[${baziA.monthPillar}]], what vocational domains suit this person most naturally? Name specific industries or roles.
- The [[官殺]] (Officer/Killings) position: how does career authority, external pressure, or professional structure sit in ${nameA}'s chart? Are they designed to lead, execute, or innovate independently?
- Money psychology: is ${nameA} a builder, a spender, an accumulator, or a risk-taker? What elemental force drives this?
- Their financial ceiling: what chart structure sets the upper limit of ${nameA}'s solo wealth capacity — and what would need to activate for that ceiling to rise?

Minimum: 400 words.

For ${nameB}:
- The same five questions applied to ${nameB}'s chart (Day Master ${baziB.dayMaster}, ${baziB.dayMasterElement}; profile ${baziB.shishenProfile.en}; Month Pillar [[${baziB.monthPillar}]]).

Minimum: 400 words.

---

### SECTION 2 — Career Compatibility: Working Together or Parallel

- Do their vocational archetypes complement or compete? Describe specifically: when ${nameA}'s career energy meets ${nameB}'s, what happens — synergy, friction, or parallel non-interference?
- The division of labour encoded in their charts: is one person the visionary and one the executor? One the relationship-builder and one the analyst? Name the roles their charts naturally assign.
- Shared ventures: if this couple were to build a business or financial project together, what would be their natural strengths and structural vulnerabilities as a team? Which industries or domains would their combined chart energy support?
- Professional interference risk: are there elemental or pillar interactions that could create competition, resentment, or power struggles in professional contexts? Name them specifically.
- The chart's verdict on whether this couple should keep finances/careers merged or separated — and why.

Minimum: 400 words.

---

### SECTION 3 — Combined Wealth Destiny

- When both charts are considered as a unit, what is the elemental quality of their combined wealth-building capacity? Which elements are amplified, which are neutralised?
- Mutual activation: does each person's chart carry elements that activate the other's Wealth Star? If yes — describe the mechanism and what it means for their financial trajectory together. If no — describe what element they need to invite into their shared environment.
- Financial peak windows: based on their combined chart structure, during which elemental years or Luck Cycle types (e.g., Metal years, Wood cycles) does this couple's combined wealth capacity peak?
- The single greatest financial opportunity this pairing creates — the unique wealth dimension that neither would access as easily alone.
- The single greatest financial risk embedded in this pairing — the elemental dynamic that, if unmanaged, costs them money, opportunity, or stability.

Minimum: 400 words.

---

### SECTION 4 — Practical Wealth Strategy for This Couple

Based entirely on their combined chart logic:

- The optimal financial role for each person: who should handle which type of financial decision?
- Asset classes and domains that align with their combined elemental profile (e.g., real estate, creative ventures, trading, service businesses).
- The one financial habit or practice most prescribed by their combined chart energy.
- The one financial pattern most warned against by their combined chart energy.
- A specific near-term action (within 1–2 years) this couple could take to activate their combined wealth potential.

Minimum: 300 words.

---

QUALITY STANDARD:
BAD: "You can work well together if you communicate clearly about money."
GOOD: "${nameA}'s [[正财]] sits rooted in [[丑]]土 of the Month Branch — this is patient, disciplined, accumulative wealth energy. It does not sprint; it compounds. ${nameB}'s [[偏财]] floats in the Year Stem without root — speculative, social, opportunistic. Put these together and you get a pairing where ${nameA} builds the foundation while ${nameB} finds the deals. The danger is that ${nameB}'s unrooted [[偏财]] convinces ${nameA} to move faster than their chart can sustain. That conversation will happen. The chart says: ${nameA} wins that argument in the long run."

Total chapter minimum: 2,000 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 12000 }
}
