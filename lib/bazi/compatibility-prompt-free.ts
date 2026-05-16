/**
 * Builds the free-tier compatibility report prompt.
 * Ported from Shopify `constructMarriagePrompt` — bracelet chapter and
 * product references removed; dynamic year; TEASER markers retained.
 */

import type { BaziPartnerData } from './compatibility'
import type { CompatibilityScores } from './compatibility'

// ── Day Master nature imagery ─────────────────────────────────────────────────

const dayMasterImagery: Record<string, string> = {
  甲: 'Like a towering oak that grows relentlessly upward, 甲木 Day Masters possess an unyielding drive and pioneering spirit. They are natural leaders who initiate growth and push through obstacles with remarkable tenacity.',
  乙: 'Like a climbing vine that finds its way through every crack and crevice, 乙木 Day Masters are adaptable and resourceful. They achieve their goals through flexibility, charm, and an intuitive sense of where opportunity lies.',
  丙: 'Like the blazing sun that illuminates everything in its path, 丙火 Day Masters radiate warmth, enthusiasm, and unstoppable energy. They bring light to dark situations and inspire others with their generous, outgoing nature.',
  丁: 'Like a candle flame that burns steadily even in darkness, 丁火 Day Masters possess an inner brilliance and quiet intensity. They illuminate truth, nurture deep connections, and possess remarkable focus and persistence.',
  戊: 'Like a vast mountain range that stands immovable through all seasons, 戊土 Day Masters embody stability, reliability, and profound groundedness. They are the steady anchors in relationships, providing security and dependable support.',
  己: 'Like fertile farmland that nourishes all life placed upon it, 己土 Day Masters are deeply nurturing, patient, and supportive. They create environments where others flourish, possessing exceptional emotional intelligence and empathy.',
  庚: 'Like tempered steel that has been forged in fire, 庚金 Day Masters possess exceptional strength, determination, and clarity of purpose. They are decisive, principled, and bring order and structure to everything they touch.',
  辛: 'Like a polished gem that reveals its beauty through refinement, 辛金 Day Masters are elegant, perceptive, and deeply value quality and authenticity. They possess refined taste and a natural ability to perceive hidden worth in people and situations.',
  壬: 'Like a mighty river that flows through mountains and valleys, 壬水 Day Masters are intellectually expansive, adaptable, and possess remarkable depth. They can navigate any situation with fluidity and bring wisdom and perspective wherever they go.',
  癸: 'Like morning dew that quietly nourishes all it touches, 癸水 Day Masters are intuitive, sensitive, and possess deep emotional wisdom. They work quietly behind the scenes, offering profound insight and gentle transformation.',
}

// ── Teaser text per locale ────────────────────────────────────────────────────

const teaserTranslations: Record<string, {
  section1: string
  section2: string
  section3: string
  section4: string
  section5: string
  section6: string
}> = {
  en: {
    section1: 'Curious how {nameA}\'s inner nature plays out in love? The Premium Report reveals exactly which relationship patterns are encoded in their chart — and how to work with them.',
    section2: 'Want to understand {nameB}\'s deepest relationship drivers? The full Premium Report decodes their attachment style, emotional triggers, and the partner they unconsciously seek.',
    section3: 'This energy dance only scratches the surface. The Premium Report maps the full arc of this relationship — where it naturally flows, where it gets stuck, and the hidden gifts in your differences.',
    section4: 'Your conflict patterns run deeper than this. The Premium Report identifies the exact argument cycles in this pairing, when they peak (month-by-month), and the precise language shifts that defuse them.',
    section5: 'Your wealth blueprint as a couple has more layers. The full Premium Report details your ideal financial strategy, major wealth windows through 2027, and how to align your individual money energies for maximum prosperity.',
    section6: 'This preview only covers two years. The Premium Report maps your relationship trajectory across full Luck Cycles — the pivotal years, the growth phases, and the critical moments of transformation ahead.',
  },
  'zh-CN': {
    section1: '想知道{nameA}的内心如何在感情中展现？深度报告将精确揭示编写在命盘中的感情模式，以及如何借势而行。',
    section2: '想深入了解{nameB}最深层的感情驱动力？完整深度报告解码其依附风格、情绪触发点，以及他们潜意识中寻找的伴侣类型。',
    section3: '这段能量舞蹈只触及了表面。深度报告将绘制这段关系的完整轨迹——自然流动的地方、容易卡住的地方，以及差异中隐藏的礼物。',
    section4: '你们的冲突模式远比这更深。深度报告精确识别这对组合的争吵循环、爆发高峰期（逐月分析），以及化解矛盾的精准沟通方式。',
    section5: '你们作为伴侣的财富蓝图还有更多层次。完整深度报告详述理想财务策略、2027年前的主要财富窗口，以及如何协调双方财运能量实现最大繁荣。',
    section6: '这个预测只涵盖两年。深度报告跨越完整大运映射你们的关系轨迹——关键年份、成长阶段，以及前方重要的转变时刻。',
  },
  'zh-TW': {
    section1: '想知道{nameA}的內心如何在感情中展現？深度報告將精確揭示編寫在命盤中的感情模式，以及如何借勢而行。',
    section2: '想深入了解{nameB}最深層的感情驅動力？完整深度報告解碼其依附風格、情緒觸發點，以及他們潛意識中尋找的伴侶類型。',
    section3: '這段能量舞蹈只觸及了表面。深度報告將繪製這段關係的完整軌跡——自然流動的地方、容易卡住的地方，以及差異中隱藏的禮物。',
    section4: '你們的衝突模式遠比這更深。深度報告精確識別這對組合的爭吵循環、爆發高峰期（逐月分析），以及化解矛盾的精準溝通方式。',
    section5: '你們作為伴侶的財富藍圖還有更多層次。完整深度報告詳述理想財務策略、2027年前的主要財富窗口，以及如何協調雙方財運能量實現最大繁榮。',
    section6: '這個預測只涵蓋兩年。深度報告跨越完整大運映射你們的關係軌跡——關鍵年份、成長階段，以及前方重要的轉變時刻。',
  },
}

function getTeaser(locale: string): typeof teaserTranslations['en'] {
  return teaserTranslations[locale] ?? teaserTranslations['en']
}

function fillTeaser(tpl: string, nameA: string, nameB: string): string {
  return tpl.replace(/\{nameA\}/g, nameA).replace(/\{nameB\}/g, nameB)
}

// ── Language instructions ─────────────────────────────────────────────────────

const langInstructions: Record<string, string> = {
  'en': 'Write entirely in English. Use clear, warm, and insightful prose.',
  'zh-CN': '请完全用简体中文写作。使用温暖、有洞见的文风，专业术语用【】标注后附英文。',
  'zh-TW': '請完全用繁體中文寫作。使用溫暖、有洞見的文風，專業術語用【】標注後附英文。',
}

function getLangInstruction(locale: string): string {
  return langInstructions[locale] ?? langInstructions['en']
}

// ── Person analysis block ─────────────────────────────────────────────────────

function buildPersonBlock(p: BaziPartnerData, name: string): string {
  const imagery = dayMasterImagery[p.dayMaster] ?? `${p.dayMaster}木 Day Master`
  const pillars = [
    `Year: [[${p.yearPillar}]] (${p.yearZhi} zodiac — ${p.zodiac})`,
    `Month: [[${p.monthPillar}]]`,
    `Day: [[${p.dayPillar}]] (Day Master [[${p.dayMaster}]] · ${p.dayMasterElement})`,
    p.hourPillar ? `Hour: [[${p.hourPillar}]]` : 'Hour: Unknown',
  ].join('\n')

  const elements = Object.entries(p.elements)
    .map(([el, n]) => `${el}: ${Number(n).toFixed(1)}`)
    .join(' · ')

  const shishenEn = p.shishenProfile.en
  const traits = p.shishenProfile.traits.slice(0, 3).join(', ')
  const shadow = p.shishenProfile.shadow
  const favorable = p.favorableElements.join(', ') || 'balanced'
  const unfavorable = p.unfavorableElements.join(', ') || 'none'
  const strength = p.dayMasterStrength === 'strong' ? 'Strong (身强)'
    : p.dayMasterStrength === 'weak' ? 'Weak (身弱)' : 'Balanced (中和)'

  return `=== ${name.toUpperCase()} CHART DATA ===
Four Pillars:
${pillars}
Five Elements: ${elements}
Day Master Strength: ${strength} · NaYin: [[${p.naYin}]]
Dominant Energy: ${shishenEn} (${traits})
Shadow Self: ${shadow}
Favorable Elements: ${favorable}
Unfavorable Elements: ${unfavorable}
Season: ${p.season} (score ${p.seasonScore}/5)
${p.tiaohouNeeds ? `Tiaohou Need: ${p.tiaohouNeeds}` : ''}`
}

// ── Score summary block ───────────────────────────────────────────────────────

function buildScoreBlock(scores: CompatibilityScores, nameA: string, nameB: string): string {
  const { breakdown, total, level } = scores
  const lines = [
    `Overall Compatibility: ${total}/99 (${level.key})`,
    `Day Master Harmony: ${breakdown.dayMaster.score}/25 — ${breakdown.dayMaster.description}`,
    `Zodiac Harmony: ${breakdown.zodiac.score}/20 — ${breakdown.zodiac.description}`,
    `Five Elements: ${breakdown.elements.score}/20 — ${breakdown.elements.description}`,
    `NaYin: ${breakdown.naYin.score}/15 — ${breakdown.naYin.description}`,
    `Pillar Interactions: ${breakdown.ganZhi.score}/10 — ${breakdown.ganZhi.description}`,
    `Spouse Palace: ${breakdown.spousePalace.score}/10 — ${breakdown.spousePalace.description}`,
  ]
  if (breakdown.elements.notes?.length) {
    lines.push(`Elements notes: ${breakdown.elements.notes.join('; ')}`)
  }
  return `=== COMPATIBILITY ANALYSIS: ${nameA} & ${nameB} ===\n${lines.join('\n')}`
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildFreeCompatibilityPrompt(
  baziA: BaziPartnerData,
  baziB: BaziPartnerData,
  scores: CompatibilityScores,
  locale: string,
  nameA: string,
  nameB: string,
): string {
  const year1 = new Date().getFullYear()
  const year2 = year1 + 1
  const teaser = getTeaser(locale)
  const langInstr = getLangInstruction(locale)

  const personABlock = buildPersonBlock(baziA, nameA)
  const personBBlock = buildPersonBlock(baziB, nameB)
  const scoreBlock   = buildScoreBlock(scores, nameA, nameB)

  return `You are a master Bazi astrologer writing a deeply personal compatibility reading for two real people. ${langInstr}

Use [[Chinese Term]] notation for all Bazi terminology (e.g. [[天干]], [[日主]], [[五行]]). Do NOT use parentheses for Chinese terms — only double brackets.

Write in a warm, wise, personal voice — as if speaking directly to the couple. Be specific to THEIR chart data. Never use generic statements that could apply to anyone.

TARGET: 2500+ words across 6 chapters. Each chapter must end with exactly one [[TEASER: ...]] block on its own line.

${personABlock}

${personBBlock}

${scoreBlock}

---

## 1. ${nameA} — Who They Truly Are

Write 400+ words about ${nameA}'s inner world as revealed by their Bazi. Cover:
- Their Day Master nature (use the imagery of ${baziA.dayMaster} — its elemental archetype)
- How their dominant energy (${baziA.shishenProfile.en}) shapes their personality and how they show up in relationship
- Their shadow self: the unconscious patterns they bring to intimacy
- What they genuinely need from a partner (tied to their favorable elements: ${baziA.favorableElements.join(', ')})
- 2-3 specific sentences grounded in their exact pillars ([[${baziA.yearPillar}]] [[${baziA.monthPillar}]] [[${baziA.dayPillar}]])

[[TEASER: ${fillTeaser(teaser.section1, nameA, nameB)}]]

## 2. ${nameB} — Who They Truly Are

Write 400+ words about ${nameB}'s inner world as revealed by their Bazi. Cover:
- Their Day Master nature (use the imagery of ${baziB.dayMaster} — its elemental archetype)
- How their dominant energy (${baziB.shishenProfile.en}) shapes their personality and relationship approach
- Their shadow self: the unconscious patterns they bring to intimacy
- What they genuinely need from a partner (tied to their favorable elements: ${baziB.favorableElements.join(', ')})
- 2-3 specific sentences grounded in their exact pillars ([[${baziB.yearPillar}]] [[${baziB.monthPillar}]] [[${baziB.dayPillar}]])

[[TEASER: ${fillTeaser(teaser.section2, nameA, nameB)}]]

## 3. The Dance of Your Energies

Write 350+ words on how ${nameA} and ${nameB}'s energies interact. Cover:
- The primary energy exchange: ${baziA.dayMasterElement} (${nameA}) meeting ${baziB.dayMasterElement} (${nameB}) — is this nourishing, challenging, or transformative?
- Day Master relationship (score ${scores.breakdown.dayMaster.score}/25): ${scores.breakdown.dayMaster.description}
- Zodiac harmony (score ${scores.breakdown.zodiac.score}/20): ${scores.breakdown.zodiac.description}
- The natural rhythms of togetherness — when they feel most aligned and when friction naturally arises
- At least one concrete "this is why they ___" moment grounded in specific pillars

[[TEASER: ${fillTeaser(teaser.section3, nameA, nameB)}]]

## 4. The Anatomy of Your Arguments

Write 400+ words on how this couple fights and how they can resolve conflict. Cover:
- The structural tension in this pairing (reference specific element interactions from the score breakdown)
- 2-3 specific conflict scenarios that are HIGHLY likely for THIS combination of energies
- ${nameA}'s triggers (from their shadow self and unfavorable elements: ${baziA.unfavorableElements.join(', ')})
- ${nameB}'s triggers (from their shadow self and unfavorable elements: ${baziB.unfavorableElements.join(', ')})
- Concrete repair language: specific phrases, timing approaches, and energetic strategies that work for this exact pairing

[[TEASER: ${fillTeaser(teaser.section4, nameA, nameB)}]]

## 5. Building Wealth Together

Write 300+ words on financial compatibility and wealth-building as a unit. Cover:
- Each person's relationship with money and resources (tied to their Five Elements balance and [[财星]] placement)
- Where their financial energies complement each other
- Their natural wealth-building strengths as a team
- 1-2 specific strategies suited to THIS combination of Day Masters (${baziA.dayMaster} + ${baziB.dayMaster})
- One honest wealth friction point to watch for

[[TEASER: ${fillTeaser(teaser.section5, nameA, nameB)}]]

## 6. ${year1}–${year2} Relationship Preview

Write 350+ words previewing the next two years for this couple. Cover:
- The overarching energetic theme for ${year1} — what this year activates for THEIR specific combination
- 2-3 key windows in ${year1} that will be significant for the relationship (growth moments, stress points, or breakthrough opportunities)
- The energetic shift as ${year2} arrives — what changes and what this means for them as a couple
- One actionable recommendation for each year based on their combined chart

[[TEASER: ${fillTeaser(teaser.section6, nameA, nameB)}]]

---
IMPORTANT: Output only the 6 chapters. No preamble, no conclusion, no asterisks. Use ## headings exactly as shown. Place [[TEASER: ...]] blocks exactly at the end of each chapter on their own paragraph line.`
}
