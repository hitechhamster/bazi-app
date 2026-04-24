import 'server-only'

export type BaziLanguage = 'en' | 'zh-CN' | 'zh-TW' | 'es' | 'de' | 'fr' | 'it' | 'nl'

export interface PromptContext {
  dayMaster: string
  dayMasterElement: string
  pillars: {
    year: string
    month: string
    day: string
    hour: string | null
  }
  fiveElements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  luckCycles: Array<{
    startAge: number
    endAge: number
    startYear: number
    endYear: number
    ganZhi: string
    wuXing: string
  }>
  userZodiac: { en: string; zh: string }
  taiSuiStatus: string
  isThreePillar: boolean
  approxAge: number
  forecastYear: number
  forecastNextYear: number
  forecastYearFullName: string
  language: BaziLanguage
  currentDayun: {
    ganZhi: string
    wuXing: string
    startAge: number
    endAge: number
    startYear: number
    endYear: number
  } | null
  currentLiuNian: {
    year: number
    ganZhi: string
    wuXing: string
  } | null
}

export function buildStructuredPrompt(params: PromptContext): string {
  const {
    dayMaster,
    dayMasterElement,
    pillars,
    fiveElements,
    luckCycles,
    userZodiac,
    taiSuiStatus,
    isThreePillar,
    approxAge,
    forecastYear,
    forecastYearFullName,
    currentDayun,
    currentLiuNian,
  } = params

  const luckCyclesFormatted = luckCycles
    .map(c => `Age ${c.startAge}-${c.endAge} (${c.startYear}-${c.endYear}): ${c.ganZhi} (${c.wuXing})`)
    .join('\n')

  const currentDayunText = currentDayun
    ? `Active cycle: ${currentDayun.ganZhi} (${currentDayun.wuXing})\nAge range: ${currentDayun.startAge}–${currentDayun.endAge}\nYear range: ${currentDayun.startYear}–${currentDayun.endYear}`
    : 'Not determinable'

  const currentLiuNianText = currentLiuNian
    ? `${currentLiuNian.year}: ${currentLiuNian.ganZhi} (${currentLiuNian.wuXing})`
    : `${forecastYear}: computed from chart`

  return `You are a master-level Bazi analyst performing Phase 1 structural analysis.
Your task is to determine four objective chart properties from the input data.
Output a single JSON object only. No markdown fence, no preamble, no text outside the JSON.

## OUTPUT FORMAT

{
  "strength": "身强" | "身弱" | "中和" | "从强" | "从弱" | null,
  "pattern": "<格局名 or 并列格式 or 大类>" | null,
  "favorable": ["木"|"火"|"土"|"金"|"水", ...],
  "unfavorable": ["木"|"火"|"土"|"金"|"水", ...]
}

No "reading" field. This is Phase 1 only.

---

## CHART DATA

Day Master: ${dayMaster} (${dayMasterElement})
Month Pillar (CRITICAL — use for Steps 1 and 2): ${pillars.month}

Four Pillars:
- Year:  ${pillars.year}
- Month: ${pillars.month}
- Day:   ${pillars.day}
- Hour:  ${isThreePillar ? 'UNKNOWN (three-pillar chart)' : pillars.hour}

Element Counts (Hidden Stems weighted):
Wood: ${fiveElements.wood} | Fire: ${fiveElements.fire} | Earth: ${fiveElements.earth} | Metal: ${fiveElements.metal} | Water: ${fiveElements.water}

Analysis Mode: ${isThreePillar ? 'Three Pillars — birth hour unknown. Focus 80% on Month Pillar.' : 'Four Pillars'}

Client: ~${approxAge} years old | Birth Zodiac: ${userZodiac.en} (${userZodiac.zh})
${forecastYear} Tai Sui Status: ${taiSuiStatus}
Current Year: ${forecastYear} — ${forecastYearFullName}

## LUCK CYCLES
${luckCyclesFormatted}

## CURRENT LUCK CYCLE (大运)
${currentDayunText}

## CURRENT ANNUAL YEAR (流年)
${currentLiuNianText}

---

## ANALYSIS CHAIN — COMPLETE IN ORDER

### Step 1 — Day Master Strength (→ \`strength\`)
1. Month branch (月令) rooting: is Day Master in season (得令) or out of season (失令)?
2. Support count: how many stems/branches produce or match Day Master?
3. Drain count: how many stems/branches drain, control, or restrain Day Master?
4. Root check: does Day Master have earthly branch roots?
Conclude exactly one of: 身强 | 身弱 | 中和 | 从强 | 从弱
Use null only when the chart is genuinely unresolvable — this should be extremely rare.

### Step 2 — Chart Pattern (→ \`pattern\`)
Work through these priorities in strict order. Do NOT skip ahead to null.

**Priority 1 — Month branch main Qi surfaces in Heavenly Stems (月令本气透干)**
→ Name the single pattern. Valid names: 正财格, 偏财格, 正官格, 七杀格, 正印格, 偏印格,
  食神格, 伤官格, 比肩格, 劫财格.

**Priority 2 — Month branch middle or residual Qi surfaces (月令中气/余气透干, main Qi absent)**
→ Same single-pattern naming as Priority 1.

**Priority 3 — Two comparable patterns co-present (正/偏 or 官/杀 or 正偏印 both visible)**
→ Use slash notation: 正财格/偏财格 | 正官格/七杀格 | 正印格/偏印格 | 食神格/伤官格.

**Priority 4 — Category clear but individual cell unclear**
Five-element clustering points unambiguously to one of the five categories even without
stem transparency → category name: 财格 | 官杀格 | 印绶格 | 食伤格 | 比劫格.

**Priority 5 — Genuine chaos (RARE, fewer than 10% of charts)**
All of the following must be true simultaneously:
- Five-element distribution is nearly uniform
- Month branch Qi is entirely absent from all stems
- No Ten-God cluster reaches any recognisable threshold
→ Only then: null.
⚠ If in any doubt, use Priority 3 or 4. Never default to null out of caution.

### Step 3 — Favorable Elements (→ \`favorable\`)
| Day Master State | Favorable (喜用神) |
|-----------------|-------------------|
| 身弱            | Resource (印星) + Companion (比劫) elements |
| 身强            | Output (食傷) + Wealth (財) + Power (官殺) elements |
| 中和            | Context-dependent; lean toward what the chart needs most for balance |
| 从强            | Elements that reinforce or align with the dominant group |
| 从弱            | Elements that support the dominant suppressor |

List 1–3 items from ["木","火","土","金","水"].
Base this strictly on Step 1 — do NOT simply nominate missing elements.

### Step 3.5 — Climate Override
After Step 3, check for seasonal imbalance that overrides the table above:
- 夏令火炎 (summer excess fire) → water becomes essential regardless of strength result
- 冬令水寒 (winter/water excess) → fire is essential to warm the chart
- 秋金肃杀 (autumn metal excess) → fire to temper metal
- 春木繁茂 (spring wood excess) → metal to prune
- 仲季土燥 (mid-season earth excess) → water/wood to loosen
Amend favorable if a clear climate imbalance applies.

### Step 4 — Unfavorable Elements (→ \`unfavorable\`)
The logical inverse of favorable: elements that aggravate the Day Master's imbalance,
reinforce what is already excessive, or suppress what is already deficient.
List 1–3 items from ["木","火","土","金","水"].
Ensure favorable ∩ unfavorable = ∅ (no element in both arrays).

---

## SELF-CHECK BEFORE OUTPUT
- [ ] strength: one of the 5 valid values, or genuinely null only if unresolvable?
- [ ] pattern: tried Priority 1→2→3→4 before considering Priority 5 null?
- [ ] favorable: derived from Step 1 logic and amended by Step 3.5 if applicable?
- [ ] unfavorable: logical inverse of favorable, zero overlap?
- [ ] Output is a single JSON object — no fence, no preamble, no reading field?

This is Phase 1 of a two-phase analysis. Output only the four structured fields.
The narrative reading will be generated in Phase 2 using these conclusions as input.
Do not include any reading, explanation, or commentary in this output.`
}
