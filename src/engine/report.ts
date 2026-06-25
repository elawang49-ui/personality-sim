import { buildPathComboReportText, copy } from '../data/copy'
import { personaLabels, personaTypes } from '../data/personaTypes'
import type {
  PersonaTypeDefinition,
  PersonaVariant,
} from '../data/personaTypes'
import type { RaidResult } from './raid'
import type { CharacterState, StateKey } from './types'

export type CompletedEventRecord = {
  eventTitle: string
  attentionCategories: string[]
  attentionLabels: string[]
  selectedLabel: string
  selectedAction: string
  selectedAttribution: string
}

export type FrequencyItem = {
  label: string
  count: number
}

export type PathScore = {
  key: StateKey
  label: string
  value: number
  summary: string
}

export type PersonaReportData = {
  personaKey: string
  typeName: string
  personaTag: string
  reportText: string
  raidResult?: RaidResult
  topPaths: PathScore[]
  frequentAttentionTypes: FrequencyItem[]
  frequentAttentionLabels: FrequencyItem[]
  frequentLabels: FrequencyItem[]
  frequentActions: FrequencyItem[]
  frequentAttributions: FrequencyItem[]
}

const pathKeys: StateKey[] = [
  'creator',
  'observer',
  'strategist',
  'pleaser',
  'avenger',
  'avoider',
  'caregiver',
  'judge',
]

export function buildPersonaReport(
  characterState: CharacterState,
  completedEvents: CompletedEventRecord[],
): PersonaReportData {
  const topPaths = pathKeys
    .map((key) => ({
      key,
      label: personaLabels[key] ?? key,
      value: characterState[key],
      summary:
        personaTypes.find((type) => type.mainPath === key)?.pathSummary ??
        copy.reportGeneration.fallbackPathSummary,
    }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 3)

  const primaryType = selectPersonaType(characterState, topPaths[0]?.key)

  return {
    personaKey: primaryType.key,
    typeName: primaryType.name,
    personaTag: `${personaLabels[primaryType.mainPath] ?? primaryType.mainPathName} · ${
      primaryType.variantName
    }`,
    reportText: buildReportText(primaryType),
    topPaths,
    frequentAttentionTypes: topItems(
      completedEvents.flatMap((event) => event.attentionCategories),
      copy.reportGeneration.attentionCategoryLabels,
    ),
    frequentAttentionLabels: topItems(
      completedEvents.flatMap((event) => event.attentionLabels),
    ),
    frequentLabels: topItems(completedEvents.map((event) => event.selectedLabel)),
    frequentActions: topItems(completedEvents.map((event) => event.selectedAction)),
    frequentAttributions: topItems(
      completedEvents.map((event) => event.selectedAttribution),
    ),
  }
}

function buildReportText(primaryType: PersonaTypeDefinition) {
  const primary = primaryType.mainPath
  const strongReadings: Partial<Record<StateKey, string>> =
    copy.reportGeneration.strongReadings

  return [
    strongReadings[primary] ?? copy.reportGeneration.defaultStrongReading,
    buildPathComboReportText(),
    `${copy.reportGeneration.strengthPrefix}${primaryType.strength}`,
    `${copy.reportGeneration.warningPrefix}${primaryType.warning}`,
    `${copy.reportGeneration.advicePrefix}${primaryType.growthAdvice}`,
  ].join('\n\n')
}

function selectPersonaType(
  characterState: CharacterState,
  mainPath: StateKey = 'observer',
) {
  const variant = selectVariant(characterState)
  return (
    personaTypes.find(
      (type) => type.mainPath === mainPath && type.variant === variant,
    ) ??
    personaTypes.find((type) => type.mainPath === mainPath) ??
    personaTypes[0]
  )
}

function selectVariant(characterState: CharacterState): PersonaVariant {
  const scores: Record<PersonaVariant, number> = {
    internal:
      characterState.shame +
      characterState.sensitivity +
      (100 - characterState.selfEsteem),
    armor:
      characterState.orderNeed +
      characterState.stability +
      (100 - characterState.trust),
    burst:
      characterState.anger +
      characterState.arousal +
      characterState.aggression +
      characterState.actionPower,
    review:
      characterState.abstraction +
      characterState.observer +
      characterState.strategist +
      characterState.judge,
  }

  return (Object.entries(scores).sort(
    ([, first], [, second]) => second - first,
  )[0]?.[0] ?? 'internal') as PersonaVariant
}

function topItems(
  values: string[],
  labelMap: Record<string, string> = {},
  limit = 3,
): FrequencyItem[] {
  const counts = values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1
    return result
  }, {})

  return Object.entries(counts)
    .map(([label, count]) => ({ label: labelMap[label] ?? label, count }))
    .sort((first, second) => second.count - first.count)
    .slice(0, limit)
}
