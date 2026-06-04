export const stateKeys = [
  'sensitivity',
  'selfEsteem',
  'aggression',
  'abstraction',
  'orderNeed',
  'empathy',
  'stability',
  'pleasure',
  'arousal',
  'anger',
  'shame',
  'trust',
  'actionPower',
  'creator',
  'strategist',
  'pleaser',
  'observer',
  'avenger',
  'avoider',
  'caregiver',
  'judge',
] as const

export type StateKey = (typeof stateKeys)[number]

export type CharacterState = Record<StateKey, number>

export type StateDelta = Partial<Record<StateKey, number>>

export type StartProfileTag = {
  id: string
  title: string
  description: string
  traitDelta: StateDelta
  pathDelta?: StateDelta
}

export type EventTagOption = {
  id: string
  label: string
  description: string
  moodDelta: StateDelta
}

export type BehaviorOption = {
  id: string
  label: string
  description: string
  moodDelta: StateDelta
}

export type AttributionOption = {
  id: string
  label: string
  description: string
  pathDelta: StateDelta
}

export type AttentionHook = {
  id: string
  label: string
  description: string
  categories: string[]
  text: string
  type: string
  traitBias: StateKey[]
  weight?: number
}

export type FirstReactionOption = {
  id: string
  text: string
  tone: string
  linkedAttentionHookIds: string[]
  emotionDelta: StateDelta
  traitDelta: StateDelta
  pathDelta?: StateDelta
}

export type SimEvent = {
  id: string
  title: string
  theme?: string
  text: string
  image?: string
  attentionHooks: AttentionHook[]
  firstReactions: FirstReactionOption[]
  tags: EventTagOption[]
  behaviors: BehaviorOption[]
  attributions: AttributionOption[]
}

export type Stage =
  | 'firstReaction'
  | 'attentionReveal'
  | 'label'
  | 'response'
  | 'attribution'
  | 'summary'
  | 'report'

export type ChoiceRecord = {
  firstReaction?: FirstReactionOption
  revealedAttentionHooks?: AttentionHook[]
  tag?: EventTagOption
  behavior?: BehaviorOption
  attribution?: AttributionOption
  summaryText?: string
}
