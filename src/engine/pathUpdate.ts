import { copy } from '../data/copy'
import type {
  AttributionOption,
  BehaviorOption,
  CharacterState,
  EventTagOption,
  SimEvent,
  StateDelta,
} from './types'

export type PathUpdateInput = {
  characterState: CharacterState
  event: SimEvent
  selectedLabel: EventTagOption
  selectedAction: BehaviorOption
  selectedAttribution: AttributionOption
}

export type PathUpdateResult = {
  emotionDelta: StateDelta
  traitDelta: StateDelta
  pathDelta: StateDelta
  summaryText: string
}

const highSensitivityThreshold = 60
const highAbstractionThreshold = 55
const lowSelfEsteemThreshold = 40

const belittlingSignals = [
  '轻视',
  '羞辱',
  '压低',
  '否定',
  '被否定',
  '贬低',
  '看不起',
]

const structuralSignals = [
  '结构性问题',
  '结构',
  '权力关系',
  '权力',
  '局势',
  '系统',
  '标准',
]

const selfBlameSignals = [
  '是我太敏感',
  '我不够好',
  '不够好',
  '质量差距',
  '贴合对方',
  '照顾对方期待',
]

const projectDriveSignals = [
  '转化为项目动力',
  '项目动力',
  '创造入口',
  '快速试错',
  '补充说明',
  '立刻重做',
]

export function calculatePathUpdate({
  characterState,
  selectedLabel,
  selectedAction,
  selectedAttribution,
}: PathUpdateInput): PathUpdateResult {
  const emotionDelta: StateDelta = {}
  const traitDelta: StateDelta = {}
  const pathDelta: StateDelta = { ...selectedAttribution.pathDelta }

  if (
    characterState.sensitivity >= highSensitivityThreshold &&
    matchesOption(selectedLabel, belittlingSignals)
  ) {
    addDelta(emotionDelta, { anger: 8, arousal: 8 })
  }

  if (
    characterState.abstraction >= highAbstractionThreshold &&
    matchesOption(selectedAttribution, structuralSignals)
  ) {
    addDelta(pathDelta, { observer: 6, strategist: 6 })
  }

  if (
    characterState.selfEsteem <= lowSelfEsteemThreshold &&
    matchesOption(selectedAttribution, selfBlameSignals)
  ) {
    addDelta(pathDelta, { pleaser: 7 })
    addDelta(traitDelta, { selfEsteem: -6 })
  }

  if (matchesOption(selectedAction, projectDriveSignals)) {
    addDelta(pathDelta, { creator: 6 })
    addDelta(emotionDelta, { actionPower: 6 })
  }

  return {
    emotionDelta,
    traitDelta,
    pathDelta,
    summaryText: buildSummaryText(),
  }
}

function addDelta(target: StateDelta, delta: StateDelta) {
  for (const [key, value] of Object.entries(delta)) {
    const stateKey = key as keyof StateDelta
    target[stateKey] = (target[stateKey] ?? 0) + (value ?? 0)
  }
}

function matchesOption(
  option: { id: string; label: string; description: string },
  signals: string[],
) {
  const haystack = `${option.id} ${option.label} ${option.description}`
  return signals.some((signal) => haystack.includes(signal))
}

function buildSummaryText() {
  return copy.pathUpdate.summaryText
}
