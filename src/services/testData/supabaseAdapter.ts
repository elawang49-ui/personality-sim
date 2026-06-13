import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  CompleteTestInput,
  CreateSessionInput,
  RecordAnswerInput,
  RecordShareEventInput,
  StoredTestResult,
  TestDataAdapter,
} from './types'

type PublicResultRow = {
  result_id: string
  report_data: StoredTestResult['report']
  created_at: string
}

export class SupabaseTestDataAdapter implements TestDataAdapter {
  private readonly client: SupabaseClient

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey)
  }

  async createSession(input: CreateSessionInput) {
    const ownerId = await this.ensureAnonymousUser()
    const sessionId = crypto.randomUUID()
    const { error } = await this.client.from('test_sessions').insert({
      id: sessionId,
      owner_id: ownerId,
      total_rounds: input.totalRounds,
    })

    if (error) {
      logSupabaseError('test_sessions', 'insert', error)
      throw error
    }

    console.info('[test-data] Supabase write succeeded', {
      table: 'test_sessions',
      action: 'insert',
    })

    return sessionId
  }

  async recordAnswer(input: RecordAnswerInput) {
    await this.ensureAnonymousUser()
    const { error } = await this.client.from('test_answers').upsert(
      {
        session_id: input.sessionId,
        event_id: input.eventId,
        round_index: input.roundIndex,
        answer_type: input.answerType,
        selected_option_id: input.selectedOptionId,
        state_summary: input.stateSummary,
        created_at: input.timestamp,
      },
      {
        onConflict: 'session_id,event_id,round_index,answer_type',
      },
    )

    if (error) {
      logSupabaseError('test_answers', 'upsert', error)
      throw error
    }
  }

  async completeTest(input: CompleteTestInput) {
    await this.ensureAnonymousUser()
    const { error: resultError } = await this.client.from('test_results').upsert(
      {
        result_id: input.resultId,
        session_id: input.sessionId,
        report_data: input.report,
        final_state: input.finalState,
        completed_rounds: input.completedRounds,
        created_at: input.timestamp,
      },
      { onConflict: 'result_id' },
    )

    if (resultError) {
      logSupabaseError('test_results', 'upsert', resultError)
      throw resultError
    }

    const { error: sessionError } = await this.client
      .from('test_sessions')
      .update({ status: 'completed', completed_at: input.timestamp })
      .eq('id', input.sessionId)

    if (sessionError) {
      logSupabaseError('test_sessions', 'complete', sessionError)
      throw sessionError
    }
  }

  async getResult(resultId: string): Promise<StoredTestResult | null> {
    const { data, error } = await this.client.rpc('get_public_test_result', {
      requested_result_id: resultId,
    })

    if (error) {
      logSupabaseError('get_public_test_result', 'rpc', error)
      throw error
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | PublicResultRow
      | undefined

    if (!row) {
      return null
    }

    return {
      resultId: row.result_id,
      report: row.report_data,
      createdAt: row.created_at,
    }
  }

  async recordShareEvent(input: RecordShareEventInput) {
    const { error } = await this.client.rpc('track_share_event', {
      p_client_event_id: input.clientEventId,
      p_result_id: input.resultId,
      p_event_type: input.eventType,
    })

    if (error) {
      logSupabaseError('track_share_event', 'rpc', error)
      throw error
    }
  }

  private async ensureAnonymousUser() {
    const { data, error } = await this.client.auth.getSession()

    if (error) {
      logSupabaseError('auth', 'getSession', error)
      throw error
    }

    if (data.session) {
      return data.session.user.id
    }

    const { data: signInData, error: signInError } =
      await this.client.auth.signInAnonymously()

    if (signInError) {
      logSupabaseError('auth', 'signInAnonymously', signInError)
      throw signInError
    }

    if (!signInData.user) {
      const error = new Error('Anonymous sign-in returned no user')
      logSupabaseError('auth', 'signInAnonymously', error)
      throw error
    }

    console.info('[test-data] Supabase anonymous sign-in succeeded')
    return signInData.user.id
  }
}

function logSupabaseError(table: string, action: string, error: unknown) {
  const details = getErrorDetails(error)

  console.error('[test-data] Supabase operation failed', {
    adapter: 'supabase',
    table,
    action,
    ...details,
  })
}

function getErrorDetails(error: unknown) {
  if (!(error instanceof Error) && (typeof error !== 'object' || error === null)) {
    return { message: String(error) }
  }

  const value = error as {
    message?: unknown
    code?: unknown
    details?: unknown
    hint?: unknown
    status?: unknown
  }

  return {
    message:
      typeof value.message === 'string' ? value.message : 'Unknown Supabase error',
    ...(typeof value.code === 'string' ? { code: value.code } : {}),
    ...(typeof value.details === 'string' ? { details: value.details } : {}),
    ...(typeof value.hint === 'string' ? { hint: value.hint } : {}),
    ...(typeof value.status === 'number' ? { status: value.status } : {}),
  }
}
