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
  event,
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
    summaryText: buildSummaryText({
      eventId: event.id,
      selectedLabel,
      selectedAction,
      selectedAttribution,
      pathDelta,
    }),
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

function buildSummaryText({
  eventId,
  selectedLabel,
  selectedAction,
  selectedAttribution,
  pathDelta,
}: {
  eventId: string
  selectedLabel: EventTagOption
  selectedAction: BehaviorOption
  selectedAttribution: AttributionOption
  pathDelta: StateDelta
}) {
  const eventSummary = eventSummaryText[eventId]?.[selectedAttribution.id]

  if (eventSummary) {
    return eventSummary
  }

  const pathSummary = getPathSummary(pathDelta)

  return `你把这次「${selectedLabel.label}」用「${selectedAction.label}」处理掉，最后记成「${selectedAttribution.label}」：${pathSummary}`
}

const eventSummaryText: Record<string, Record<string, string>> = {
  'operator-hidden-charge': {
    'too-poor': '你把35块记成生活预算里的一个破洞。',
    'system-is-opaque': '你没有放过这笔扣费，而是把看不见的规则标了出来。',
    'solve-not-punish-self': '你决定追回问题，不再让身体替运营商买单。',
    'turn-anger-into-action': '你把火气换成查账单、投诉和记录。',
  },
}

function getPathSummary(pathDelta: StateDelta) {
  const [topPath] = Object.entries(pathDelta)
    .filter(([, value]) => (value ?? 0) > 0)
    .sort(([, first], [, second]) => (second ?? 0) - (first ?? 0))

  switch (topPath?.[0]) {
    case 'creator':
      return '这次遭遇被你拆成了一个还能继续推进的项目。'
    case 'strategist':
      return '这次遭遇被你收进了下次可用的规则里。'
    case 'pleaser':
      return '这次遭遇被你放进了对他人期待的判断里。'
    case 'observer':
      return '这次遭遇没有凭空消失，而是被你记进了局势里。'
    case 'avenger':
      return '这次不爽被你留成了下一次反击的燃料。'
    case 'avoider':
      return '这次遭遇被你折成了一条更清楚的撤退路线。'
    case 'caregiver':
      return '这次遭遇变成了照顾自己或他人的提醒。'
    case 'judge':
      return '这次遭遇被你记成了一条不想再让步的标准。'
    default:
      return copy.pathUpdate.summaryText
  }
}
