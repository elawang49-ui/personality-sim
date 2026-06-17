import { MockTestDataAdapter } from './mockAdapter'
import { SupabaseTestDataAdapter } from './supabaseAdapter'
import type {
  CompleteTestInput,
  CreateSessionInput,
  RecordAnswerInput,
  RecordShareEventInput,
  TestDataAdapter,
} from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)

const adapter: TestDataAdapter = supabaseUrl && supabaseKey
  ? new SupabaseTestDataAdapter(supabaseUrl, supabaseKey)
  : new MockTestDataAdapter()

let pendingSession: Promise<string> | null = null

export const testDataBackend = hasSupabaseConfig ? 'supabase' : 'mock'

const ACTIVE_SESSION_KEY = buildActiveSessionKey()

console.info('[test-data] adapter selected', {
  adapter: testDataBackend,
  mode: import.meta.env.MODE,
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasSupabaseKey: Boolean(supabaseKey),
})

if (!hasSupabaseConfig) {
  console.warn(
    '[test-data] Supabase is not configured; using localStorage mock storage. Results are only available in this browser.',
  )
}

export class TestDataConfigurationError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.',
    )
    this.name = 'TestDataConfigurationError'
  }
}

export function startNewTestSession(input: CreateSessionInput) {
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
  pendingSession = createAndRememberSession(input)
  return pendingSession
}

export async function ensureTestSession(input: CreateSessionInput) {
  requireAdapter()
  const existingSessionId = window.localStorage.getItem(ACTIVE_SESSION_KEY)

  if (existingSessionId) {
    return existingSessionId
  }

  if (!pendingSession) {
    pendingSession = createAndRememberSession(input)
  }

  return await pendingSession
}

export function clearActiveTestSession() {
  pendingSession = null
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
}

export async function recordTestAnswer(
  input: Omit<RecordAnswerInput, 'sessionId'>,
) {
  const sessionId = await ensureTestSession({ totalRounds: 10 })
  await requireAdapter().recordAnswer({ ...input, sessionId })
}

export async function completeTest(
  input: Omit<CompleteTestInput, 'sessionId'>,
) {
  const sessionId = await ensureTestSession({ totalRounds: 10 })
  await requireAdapter().completeTest({ ...input, sessionId })
}

export async function getTestResult(resultId: string) {
  return await requireAdapter().getResult(resultId)
}

export async function recordShareEvent(input: RecordShareEventInput) {
  await requireAdapter().recordShareEvent(input)
}

async function createAndRememberSession(input: CreateSessionInput) {
  try {
    const sessionId = await requireAdapter().createSession(input)
    window.localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
    return sessionId
  } finally {
    pendingSession = null
  }
}

function requireAdapter() {
  return adapter
}

function buildActiveSessionKey() {
  if (testDataBackend === 'supabase') {
    return `psti.active-session-id.supabase.${getSupabaseProjectHost()}`
  }

  return `psti.active-session-id.${testDataBackend}`
}

function getSupabaseProjectHost() {
  if (!supabaseUrl) {
    return 'unknown-project'
  }

  try {
    return new URL(supabaseUrl).host
  } catch {
    return 'invalid-url'
  }
}

export type {
  AnswerType,
  ShareEventType,
  StateChangeSummary,
  StoredTestResult,
} from './types'
