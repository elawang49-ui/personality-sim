import type {
  CompleteTestInput,
  CreateSessionInput,
  RecordAnswerInput,
  RecordShareEventInput,
  StoredTestResult,
  TestDataAdapter,
} from './types'

const MOCK_STORE_KEY = 'psti.test-data.v1'

type MockSession = {
  id: string
  status: 'in_progress' | 'completed'
  totalRounds: number
  startedAt: string
  completedAt?: string
}

type MockStore = {
  sessions: MockSession[]
  answers: RecordAnswerInput[]
  results: Array<CompleteTestInput>
  shareEvents: Array<RecordShareEventInput & { occurredAt: string }>
}

const emptyStore: MockStore = {
  sessions: [],
  answers: [],
  results: [],
  shareEvents: [],
}

export class MockTestDataAdapter implements TestDataAdapter {
  async createSession(input: CreateSessionInput) {
    const store = readStore()
    const sessionId = crypto.randomUUID()

    store.sessions.push({
      id: sessionId,
      status: 'in_progress',
      totalRounds: input.totalRounds,
      startedAt: new Date().toISOString(),
    })
    writeStore(store)
    return sessionId
  }

  async recordAnswer(input: RecordAnswerInput) {
    const store = readStore()
    const existingIndex = store.answers.findIndex(
      (answer) =>
        answer.sessionId === input.sessionId &&
        answer.eventId === input.eventId &&
        answer.roundIndex === input.roundIndex &&
        answer.answerType === input.answerType,
    )

    if (existingIndex >= 0) {
      store.answers[existingIndex] = input
    } else {
      store.answers.push(input)
    }

    writeStore(store)
  }

  async completeTest(input: CompleteTestInput) {
    const store = readStore()
    const session = store.sessions.find((item) => item.id === input.sessionId)
    const existingResultIndex = store.results.findIndex(
      (result) => result.resultId === input.resultId,
    )

    if (session) {
      session.status = 'completed'
      session.completedAt = input.timestamp
    }

    if (existingResultIndex >= 0) {
      store.results[existingResultIndex] = input
    } else {
      store.results.push(input)
    }

    writeStore(store)
  }

  async getResult(resultId: string): Promise<StoredTestResult | null> {
    const result = readStore().results.find((item) => item.resultId === resultId)

    if (!result) {
      return null
    }

    return {
      resultId: result.resultId,
      report: result.report,
      createdAt: result.timestamp,
    }
  }

  async recordShareEvent(input: RecordShareEventInput) {
    const store = readStore()

    if (
      !store.shareEvents.some(
        (event) => event.clientEventId === input.clientEventId,
      )
    ) {
      store.shareEvents.push({ ...input, occurredAt: new Date().toISOString() })
      writeStore(store)
    }
  }
}

function readStore(): MockStore {
  try {
    const value = window.localStorage.getItem(MOCK_STORE_KEY)

    if (!value) {
      return structuredClone(emptyStore)
    }

    const parsed = JSON.parse(value) as Partial<MockStore>
    return {
      sessions: parsed.sessions ?? [],
      answers: parsed.answers ?? [],
      results: parsed.results ?? [],
      shareEvents: parsed.shareEvents ?? [],
    }
  } catch {
    return structuredClone(emptyStore)
  }
}

function writeStore(store: MockStore) {
  window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(store))
}
