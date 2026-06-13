import type { PersonaReportData } from '../../engine/report'
import type { CharacterState, StateDelta, StateKey } from '../../engine/types'

export type AnswerType =
  | 'firstReaction'
  | 'label'
  | 'response'
  | 'attribution'

export type StateChange = {
  key: StateKey
  before: number
  after: number
  delta: number
}

export type StateChangeSummary = {
  answerType: AnswerType
  delta: StateDelta
  changes: StateChange[]
  summaryText?: string
}

export type CreateSessionInput = {
  totalRounds: number
}

export type RecordAnswerInput = {
  sessionId: string
  eventId: string
  roundIndex: number
  answerType: AnswerType
  selectedOptionId: string
  stateSummary: StateChangeSummary
  timestamp: string
}

export type CompleteTestInput = {
  sessionId: string
  resultId: string
  report: PersonaReportData
  finalState: CharacterState
  completedRounds: number
  timestamp: string
}

export type ShareEventType = 'result_open' | 'share_click'

export type RecordShareEventInput = {
  clientEventId: string
  resultId: string
  eventType: ShareEventType
}

export type StoredTestResult = {
  resultId: string
  report: PersonaReportData
  createdAt: string
}

export interface TestDataAdapter {
  createSession(input: CreateSessionInput): Promise<string>
  recordAnswer(input: RecordAnswerInput): Promise<void>
  completeTest(input: CompleteTestInput): Promise<void>
  getResult(resultId: string): Promise<StoredTestResult | null>
  recordShareEvent(input: RecordShareEventInput): Promise<void>
}
