import { MockTestDataAdapter } from './mockAdapter'
import { SupabaseTestDataAdapter } from './supabaseAdapter'
import type {
  CompleteTestInput,
  CreateSessionInput,
  RecordAnswerInput,
  RecordShareEventInput,
} from './types'

const ACTIVE_SESSION_KEY = 'psti.active-session-id'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

const adapter =
  supabaseUrl && supabaseKey
    ? new SupabaseTestDataAdapter(supabaseUrl, supabaseKey)
    : new MockTestDataAdapter()

let pendingSession: Promise<string> | null = null

export const testDataBackend = supabaseUrl && supabaseKey ? 'supabase' : 'mock'

export function startNewTestSession(input: CreateSessionInput) {
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
  pendingSession = createAndRememberSession(input)
  return pendingSession
}

export function ensureTestSession(input: CreateSessionInput) {
  const existingSessionId = window.localStorage.getItem(ACTIVE_SESSION_KEY)

  if (existingSessionId) {
    return Promise.resolve(existingSessionId)
  }

  if (!pendingSession) {
    pendingSession = createAndRememberSession(input)
  }

  return pendingSession
}

export function clearActiveTestSession() {
  pendingSession = null
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
}

export async function recordTestAnswer(
  input: Omit<RecordAnswerInput, 'sessionId'>,
) {
  const sessionId = await ensureTestSession({ totalRounds: 10 })
  await adapter.recordAnswer({ ...input, sessionId })
}

export async function completeTest(
  input: Omit<CompleteTestInput, 'sessionId'>,
) {
  const sessionId = await ensureTestSession({ totalRounds: 10 })
  await adapter.completeTest({ ...input, sessionId })
}

export function getTestResult(resultId: string) {
  return adapter.getResult(resultId)
}

export function recordShareEvent(input: RecordShareEventInput) {
  return adapter.recordShareEvent(input)
}

async function createAndRememberSession(input: CreateSessionInput) {
  try {
    const sessionId = await adapter.createSession(input)
    window.localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
    return sessionId
  } finally {
    pendingSession = null
  }
}

export type {
  AnswerType,
  ShareEventType,
  StateChangeSummary,
  StoredTestResult,
} from './types'
