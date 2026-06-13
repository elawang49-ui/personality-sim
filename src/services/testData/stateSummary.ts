import { stateKeys } from '../../engine/types'
import type { CharacterState, StateDelta } from '../../engine/types'
import type { AnswerType, StateChangeSummary } from './types'

export function buildStateChangeSummary(
  answerType: AnswerType,
  before: CharacterState,
  after: CharacterState,
  summaryText?: string,
): StateChangeSummary {
  const delta: StateDelta = {}
  const changes = stateKeys.flatMap((key) => {
    const difference = after[key] - before[key]

    if (difference === 0) {
      return []
    }

    delta[key] = difference
    return [{ key, before: before[key], after: after[key], delta: difference }]
  })

  return {
    answerType,
    delta,
    changes,
    ...(summaryText ? { summaryText } : {}),
  }
}
