import type { CharacterState, EventPressure, SimEvent, StateDelta } from './types'

const DIRECTOR_TOP_PICK_COUNT = 5
const DEFAULT_EVENT_WEIGHT = 10

const VALID_DIRECTOR_TAGS = [
  'trustRepair',
  'recover',
  'shameSafe',
  'lowArousal',
  'lightCreate',
] as const

type DirectorTag = (typeof VALID_DIRECTOR_TAGS)[number]

const validDirectorTags = new Set<string>(VALID_DIRECTOR_TAGS)

type EventProfile = {
  pressure: EventPressure
  tags: DirectorTag[]
  weight: number
  net: StateDelta
}

type SelectNextEventArgs = {
  events: SimEvent[]
  characterState: CharacterState
  usedEventIds: string[]
}

export function selectNextEvent({
  events,
  characterState,
  usedEventIds,
}: SelectNextEventArgs) {
  const used = new Set(usedEventIds)
  const candidates = events.filter(
    (event) => !event.inactive && !event.backup && !used.has(event.id),
  )

  if (candidates.length === 0) {
    return undefined
  }

  const recentEvents = usedEventIds
    .slice(-2)
    .map((id) => events.find((event) => event.id === id))
    .filter((event): event is SimEvent => Boolean(event))
  const recentHighPressureCount = recentEvents.filter(
    (event) => getEventProfile(event).pressure === 'high',
  ).length

  const scored = candidates
    .map((event) => ({
      event,
      score: scoreEvent(event, characterState, recentHighPressureCount),
    }))
    .sort((a, b) => b.score - a.score)

  const picked = weightedPick(scored.slice(0, DIRECTOR_TOP_PICK_COUNT))

  return picked
}

function scoreEvent(
  event: SimEvent,
  characterState: CharacterState,
  recentHighPressureCount: number,
) {
  const profile = getEventProfile(event)
  let score = profile.weight

  if (recentHighPressureCount > 0 && profile.pressure === 'high') {
    score -= 24 * recentHighPressureCount
  }

  if (recentHighPressureCount > 0 && profile.pressure === 'low') {
    score += 8 * recentHighPressureCount
  }

  const needsRepair =
    characterState.trust < 42 ||
    characterState.selfEsteem < 42 ||
    characterState.stability < 42 ||
    characterState.shame > 58 ||
    characterState.arousal > 58 ||
    characterState.anger > 58

  if (needsRepair) {
    if (profile.tags.includes('trustRepair')) score += 18
    if (profile.tags.includes('recover')) score += 16
    if (profile.tags.includes('shameSafe')) score += 10
    if (profile.tags.includes('lowArousal')) score += 10
    if (profile.tags.includes('lightCreate')) score += 6
    if (profile.pressure === 'high') score -= 12
  }

  if (characterState.trust < 35 && profile.tags.includes('trustRepair')) {
    score += 12
  }

  if (characterState.arousal > 65 && profile.tags.includes('lowArousal')) {
    score += 12
  }

  if (characterState.shame > 65 && profile.tags.includes('shameSafe')) {
    score += 10
  }

  return Math.max(1, score)
}

function getEventProfile(event: SimEvent): EventProfile {
  const net = sumEventDelta(event)
  const tags = Array.isArray(event.meta?.directorTags)
    ? normalizeDirectorTags(event.id, event.meta.directorTags)
    : inferDirectorTags(net)

  return {
    pressure: event.meta?.pressure ?? inferPressure(net),
    tags,
    weight: normalizeEventWeight(event.meta?.weight),
    net,
  }
}

function normalizeDirectorTags(eventId: string, tags: string[]) {
  const normalizedTags = tags.filter(isDirectorTag)

  if (import.meta.env.DEV && normalizedTags.length !== tags.length) {
    const unknownTags = tags.filter((tag) => !isDirectorTag(tag))
    console.warn('[event-director] unknown directorTags ignored', {
      eventId,
      unknownTags,
    })
  }

  return normalizedTags
}

function isDirectorTag(tag: string): tag is DirectorTag {
  return validDirectorTags.has(tag)
}

function normalizeEventWeight(weight: unknown) {
  return typeof weight === 'number' && Number.isFinite(weight) && weight > 0
    ? weight
    : DEFAULT_EVENT_WEIGHT
}

function inferDirectorTags(net: StateDelta): DirectorTag[] {
  const tags = new Set<DirectorTag>()

  if ((net.trust ?? 0) >= 8) tags.add('trustRepair')
  if ((net.stability ?? 0) >= 8 || (net.arousal ?? 0) <= -4) {
    tags.add('recover')
  }
  if ((net.shame ?? 0) <= 2) tags.add('shameSafe')
  if ((net.arousal ?? 0) <= 0) tags.add('lowArousal')
  if ((net.creator ?? 0) > 0 && (net.creator ?? 0) <= 6) {
    tags.add('lightCreate')
  }

  return Array.from(tags)
}

function inferPressure(delta: StateDelta): EventPressure {
  const pressureScore =
    (delta.shame ?? 0) +
    (delta.anger ?? 0) +
    Math.max(0, delta.arousal ?? 0) +
    Math.max(0, -(delta.trust ?? 0)) +
    Math.max(0, -(delta.selfEsteem ?? 0))

  const repairScore =
    Math.max(0, delta.trust ?? 0) +
    Math.max(0, delta.stability ?? 0) +
    Math.max(0, -(delta.arousal ?? 0)) +
    Math.max(0, delta.selfEsteem ?? 0)

  if (pressureScore >= 36 && pressureScore > repairScore + 8) {
    return 'high'
  }

  if (pressureScore <= 18 || repairScore >= pressureScore + 8) {
    return 'low'
  }

  return 'medium'
}

function sumEventDelta(event: SimEvent) {
  const sum: StateDelta = {}

  for (const option of event.firstReactions) {
    addDelta(sum, option.emotionDelta)
    addDelta(sum, option.traitDelta)
    addDelta(sum, option.pathDelta)
  }

  for (const option of event.tags) {
    addDelta(sum, option.moodDelta)
  }

  for (const option of event.behaviors) {
    addDelta(sum, option.moodDelta)
  }

  for (const option of event.attributions) {
    addDelta(sum, option.pathDelta)
  }

  return sum
}

function addDelta(total: StateDelta, delta?: StateDelta) {
  if (!delta) {
    return
  }

  for (const [key, value] of Object.entries(delta)) {
    total[key as keyof StateDelta] = (total[key as keyof StateDelta] ?? 0) + value
  }
}

function weightedPick(scored: { event: SimEvent; score: number }[]) {
  const finiteScores = scored
    .map((item) => item.score)
    .filter((score) => Number.isFinite(score))
  const floor = finiteScores.length > 0 ? Math.min(...finiteScores) : 0
  const weights = scored.map((item) =>
    normalizePickWeight(
      Number.isFinite(item.score) ? item.score - floor + 1 : undefined,
    ),
  )
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return scored[0]?.event
  }

  let roll = Math.random() * totalWeight

  for (let index = 0; index < scored.length; index += 1) {
    roll -= weights[index]
    if (roll <= 0) {
      return scored[index].event
    }
  }

  return scored[0].event
}

function normalizePickWeight(weight: unknown) {
  return typeof weight === 'number' && Number.isFinite(weight) && weight > 0
    ? weight
    : DEFAULT_EVENT_WEIGHT
}
