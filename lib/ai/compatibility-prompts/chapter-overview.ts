import 'server-only'
import {
  SYSTEM_BASE, langTone, genderInstruction, dualChartBlock,
  type CompatPremiumContext, type ChapterPrompt,
} from './_shared'

export function buildChapterOverviewPrompt(ctx: CompatPremiumContext): ChapterPrompt {
  const { baziA, baziB, nameA, nameB, locale, mode } = ctx

  const lang   = langTone(locale, mode)
  const gender = genderInstruction(baziA.input.gender, baziB.input.gender, nameA, nameB, locale)
  const data   = dualChartBlock(ctx)

  const userPrompt = `${data}

${gender}

LANGUAGE & TONE: ${lang}

=== CHAPTER ASSIGNMENT ===

Write Chapter One of this Premium Compatibility Reading.
Chapter title in target language: 命主画像 / Partner Portraits / 命主畫像
Start with: ## [Chapter title in target language]

TARGET: 2,500+ words. This chapter introduces both individuals as complete chart personalities before analysing their relationship. Every observation must be traceable to specific chart data above.

---

### SECTION 1 — ${nameA}: Chart Soul & Core Nature

Day Master: [[${baziA.dayMaster}]] (${baziA.dayMasterElement}) | Strength: ${baziA.dayMasterStrength}
Pillars: [[${baziA.yearPillar}]] [[${baziA.monthPillar}]] [[${baziA.dayPillar}]] ${baziA.hourPillar ? `[[${baziA.hourPillar}]]` : '(hour unknown)'}
NaYin: [[${baziA.naYin}]] | Zodiac: ${baziA.zodiac}
Dominant Ten-God profile: ${baziA.shishenProfile.en} — ${baziA.shishenProfile.traits.join(', ')}
Favorable: ${baziA.favorableElements.join(', ') || 'balanced'} | Unfavorable: ${baziA.unfavorableElements.join(', ') || 'none'}

Answer all of the following about ${nameA}:

- What elemental archetype is this [[${baziA.dayMaster}]] Day Master at its core — as lived experience, not textbook definition? What does it feel like to BE this energy?
- Strength (${baziA.dayMasterStrength}): walk through the reasoning — seasonal support, rooting in branches, producing vs. draining stems. Then describe what this strength level feels like from the inside: does this person feel solid, pressured, scattered, or overflowing?
- The Dominant Ten-God (${baziA.shishenProfile.en}): name it, explain its position and elemental strength (rooted vs. floating), and describe its REAL-WORLD expression — the specific behaviors and recurring patterns ${nameA} would recognise as unmistakably theirs.
- NaYin [[${baziA.naYin}]] character: what symbolic layer does this add to the chart? How does it colour the Day Master's expression?
- The Day Pillar [[${baziA.dayPillar}]] Spouse Palace (日支): what does the earthly branch hold about how ${nameA} loves and receives love?
- Core personality portrait: a vivid, specific description of ${nameA}'s default inner landscape — their relationship patterns, emotional texture, the energy they bring into a partnership.

Minimum: 800 words for this section.

---

### SECTION 2 — ${nameB}: Chart Soul & Core Nature

Day Master: [[${baziB.dayMaster}]] (${baziB.dayMasterElement}) | Strength: ${baziB.dayMasterStrength}
Pillars: [[${baziB.yearPillar}]] [[${baziB.monthPillar}]] [[${baziB.dayPillar}]] ${baziB.hourPillar ? `[[${baziB.hourPillar}]]` : '(hour unknown)'}
NaYin: [[${baziB.naYin}]] | Zodiac: ${baziB.zodiac}
Dominant Ten-God profile: ${baziB.shishenProfile.en} — ${baziB.shishenProfile.traits.join(', ')}
Favorable: ${baziB.favorableElements.join(', ') || 'balanced'} | Unfavorable: ${baziB.unfavorableElements.join(', ') || 'none'}

Answer all of the following about ${nameB}:

- What elemental archetype is this [[${baziB.dayMaster}]] Day Master at its core — as lived experience, not textbook?
- Strength (${baziB.dayMasterStrength}): same analysis as above — reasoning plus felt experience.
- The Dominant Ten-God (${baziB.shishenProfile.en}): its position, elemental strength, real-world expression specific to ${nameB}.
- NaYin [[${baziB.naYin}]] character: what symbolic layer does this add?
- The Day Pillar [[${baziB.dayPillar}]] Spouse Palace (日支): what does ${nameB}'s earthly branch hold about how they love?
- Core personality portrait: ${nameB}'s default inner landscape, emotional texture, the energy they bring into a partnership.

Minimum: 800 words for this section.

---

### SECTION 3 — First Impressions: The Elemental Meeting

Now bring both portraits together for the first time.

- When [[${baziA.dayMaster}]] (${baziA.dayMasterElement}) meets [[${baziB.dayMaster}]] (${baziB.dayMasterElement}): what is the elemental relationship between these two Day Masters? (producing, controlling, combining, clashing, or same-element resonance?) Name the specific interaction and explain what it means in the texture of daily life together.
- How do their dominant Ten-God profiles (${baziA.shishenProfile.en} × ${baziB.shishenProfile.en}) meet? What complementary or competing energies do they bring?
- The first impression dynamic: who leads, who grounds, who expands whom? Ground every observation in chart logic.
- The element each person most needs — does the other person carry it? If yes, describe the magnetism. If no, describe the gap.
- A powerful closing statement for Chapter One: the essential quality of this pairing before any deeper analysis — what THIS relationship fundamentally IS at its elemental core.

Minimum: 400 words.

---

QUALITY STANDARD:
BAD: "Both of you are strong individuals who complement each other."
GOOD: "When [[壬水]] meets [[丁火]], the river meets the lamp flame — and the question every [[壬]]–[[丁]] pairing must answer is whether the water nurtures or extinguishes. In ${nameA} and ${nameB}'s case, [[丁火]] sits rooted in [[午]]火 of ${nameB}'s Month Pillar — this is not a candle. The water must navigate accordingly."

Total chapter minimum: 2,500 words. Do not truncate. Complete the full chapter.`

  return { systemPrompt: SYSTEM_BASE, userPrompt, maxTokens: 14000 }
}
