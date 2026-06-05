import type { ChoiceRecord, SimEvent, StateDelta, StateKey } from './types'

export type GrowthFeedback = {
  protectedText: string
  sacrificedText: string
  alternativeText: string
  focusKeys?: string[]
}

type DirectionCandidate = {
  id: string
  label: string
  description: string
  delta: StateDelta
}

const actionKeys: StateKey[] = [
  'creator',
  'observer',
  'stability',
  'selfEsteem',
  'trust',
  'actionPower',
  'abstraction',
  'empathy',
  'orderNeed',
  'strategist',
]

const selfCheckKeys: StateKey[] = ['shame']
const forceKeys: StateKey[] = ['anger', 'aggression', 'avenger']
const retreatKeys: StateKey[] = ['avoider']
const relationKeys: StateKey[] = ['pleaser']

export function buildGrowthFeedback(
  event: SimEvent,
  choices: ChoiceRecord,
): GrowthFeedback | null {
  const { firstReaction, tag, behavior, attribution } = choices

  if (!firstReaction || !tag || !behavior || !attribution) {
    return null
  }

  const totals = mergeDeltas(
    firstReaction.emotionDelta,
    firstReaction.traitDelta,
    firstReaction.pathDelta,
    tag.moodDelta,
    behavior.moodDelta,
    attribution.pathDelta,
  )
  const focusKeys = getFocusKeys(totals)

  return {
    protectedText: buildProtectedText(totals),
    sacrificedText: buildSacrificedText(totals),
    alternativeText: buildAlternativeText(event, choices, totals),
    focusKeys,
  }
}

function mergeDeltas(...deltas: Array<StateDelta | undefined>): StateDelta {
  return deltas.reduce<StateDelta>((total, delta) => {
    if (!delta) {
      return total
    }

    Object.entries(delta).forEach(([key, value]) => {
      if (typeof value !== 'number') {
        return
      }

      const stateKey = key as StateKey
      total[stateKey] = (total[stateKey] ?? 0) + value
    })

    return total
  }, {})
}

function getFocusKeys(totals: StateDelta) {
  return Object.entries(totals)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .sort((first, second) => Math.abs(second[1] ?? 0) - Math.abs(first[1] ?? 0))
    .slice(0, 4)
    .map(([key]) => key)
}

function buildProtectedText(totals: StateDelta) {
  const key = getTopPositiveKey(totals)

  if (!key) {
    return '这次你保护的是一点暂时的余地。局面还没被你写成定论，牌还在手里。'
  }

  if (key === 'creator') {
    return '创作欲和把现实转化成素材的能力。你没有让这件事只停在消耗里。'
  }

  if (key === 'observer') {
    return '观察局势的能力。你没有急着把场面判死，而是先看它怎么运转。'
  }

  if (key === 'stability') {
    return '稳定和恢复。你让自己没有继续被事件拖着跑。'
  }

  if (key === 'selfEsteem') {
    return '自我支撑。你没有把自己的价值完全交给外界反应。'
  }

  if (key === 'trust') {
    return '对善意的识别。你没有把所有回应都翻译成威胁。'
  }

  if (key === 'actionPower') {
    return '行动感。你让自己从原地内耗里挪出来了一点。'
  }

  if (key === 'abstraction') {
    return '抽象和提炼能力。你开始看见事件背后的结构。'
  }

  if (key === 'empathy') {
    return '理解他人的余地。你给对方留了一点不是恶意的空间。'
  }

  if (key === 'orderNeed' || key === 'strategist') {
    return '秩序和控制变量。你试图把混乱拆成可处理的部分。'
  }

  if (key === 'shame') {
    return '熟悉的自我检查机制。它让你避免贸然冲出去，但也可能让你太快把错揽回自己身上。'
  }

  if (key === 'anger' || key === 'aggression' || key === 'avenger') {
    return '反击动能。它帮你守住不被继续冒犯的边界。'
  }

  if (key === 'avoider') {
    return '安全距离。你先把自己从场面里撤出来，避免继续消耗。'
  }

  if (key === 'pleaser') {
    return '关系表面的稳定。你优先避免场面立刻破裂。'
  }

  return '你当下最需要保住的那一点能量。它不一定漂亮，但它正在帮你撑过这一轮。'
}

function buildSacrificedText(totals: StateDelta) {
  const negativeKey = getLowestNegativeKey(totals)

  if (negativeKey === 'trust') {
    return '一点信任。你可能更难相信对方不是故意的。'
  }

  if (negativeKey === 'selfEsteem') {
    return '一点自我支撑。你可能又把别人的反应拿来审判自己。'
  }

  if (negativeKey === 'stability') {
    return '一点稳定。事件还在继续占用你的后台线程。'
  }

  if (negativeKey === 'actionPower') {
    return '一点行动力。你暂时把自己停在了观望或撤退里。'
  }

  if (negativeKey === 'pleasure') {
    return '一点轻松感。你把这件事处理得更严肃了。'
  }

  if (hasPositive(totals, forceKeys)) {
    return '关系里的柔软。反击能保护你，但也会让场面更硬。'
  }

  if ((totals.shame ?? 0) > 0) {
    return '自我宽待。你开始检查自己，但别让检查变成审判。'
  }

  if ((totals.arousal ?? 0) > 0) {
    return '情绪带宽。你没有崩，但系统风扇已经开始转了。'
  }

  return '这次选择的代价不明显，但它仍然会把你推向某种长期路径。'
}

function buildAlternativeText(
  event: SimEvent,
  choices: ChoiceRecord,
  totals: StateDelta,
) {
  const candidates = getAlternativeCandidates(event, choices)

  if (hasPositive(totals, ['creator']) && findCandidate(candidates, ['stability'])) {
    return '另一种可能是：先停一下，明天再处理。不是所有素材都要当场炼丹。这不是更好，只是另一条路。'
  }

  if (
    hasPositive(totals, ['stability']) &&
    findCandidate(candidates, ['creator', 'observer'])
  ) {
    return '另一种可能是：把它先记成一条素材，而不是完全丢掉。休息和记录可以同时存在。这不是更好，只是另一条路。'
  }

  if (
    hasPositive(totals, ['observer']) &&
    findCandidate(candidates, ['actionPower', 'trust', 'creator'])
  ) {
    return '另一种可能是：看懂以后，做一个很小的动作，不必一直停在分析里。这不是更好，只是另一条路。'
  }

  if (
    hasPositive(totals, ['shame', 'sensitivity']) &&
    findCandidate(candidates, ['selfEsteem', 'trust', 'stability'])
  ) {
    return '另一种可能是：先不要急着把错领走，给这件事留一个更普通的解释。这不是更好，只是另一条路。'
  }

  if (hasPositive(totals, forceKeys) && findCandidate(candidates, ['observer', 'stability'])) {
    return '另一种可能是：先把证据和边界放稳，再决定要不要开战。这不是更好，只是另一条路。'
  }

  const fallbackCandidate = candidates[0]
  if (fallbackCandidate) {
    return `另一种可能是：从「${fallbackCandidate.label}」这个入口处理它。不是更好，只是另一条路。`
  }

  return '另一种可能是：换一个入口处理这件事。不是更好，只是另一条路。'
}

function getAlternativeCandidates(
  event: SimEvent,
  choices: ChoiceRecord,
): DirectionCandidate[] {
  return [
    ...event.behaviors
      .filter((behavior) => behavior.id !== choices.behavior?.id)
      .map((behavior) => ({
        id: behavior.id,
        label: behavior.label,
        description: behavior.description,
        delta: behavior.moodDelta,
      })),
    ...event.attributions
      .filter((attribution) => attribution.id !== choices.attribution?.id)
      .map((attribution) => ({
        id: attribution.id,
        label: attribution.label,
        description: attribution.description,
        delta: attribution.pathDelta,
      })),
  ]
}

function findCandidate(candidates: DirectionCandidate[], keys: StateKey[]) {
  return candidates.find((candidate) =>
    keys.some((key) => (candidate.delta[key] ?? 0) > 0),
  )
}

function hasPositive(totals: StateDelta, keys: StateKey[]) {
  return keys.some((key) => (totals[key] ?? 0) > 0)
}

function getTopPositiveKey(totals: StateDelta): StateKey | undefined {
  const preferredKeys = [
    ...actionKeys,
    ...selfCheckKeys,
    ...forceKeys,
    ...retreatKeys,
    ...relationKeys,
  ]

  return preferredKeys
    .filter((key) => (totals[key] ?? 0) > 0)
    .sort((first, second) => (totals[second] ?? 0) - (totals[first] ?? 0))[0]
}

function getLowestNegativeKey(totals: StateDelta): StateKey | undefined {
  return Object.entries(totals)
    .filter(([, value]) => typeof value === 'number' && value < 0)
    .sort((first, second) => (first[1] ?? 0) - (second[1] ?? 0))[0]?.[0] as
    | StateKey
    | undefined
}
