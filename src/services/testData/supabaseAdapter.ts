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
    await this.ensureAnonymousUser()
    const sessionId = crypto.randomUUID()
    const { error } = await this.client.from('test_sessions').insert({
      id: sessionId,
      total_rounds: input.totalRounds,
    })

    if (error) {
      throw error
    }

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
      throw resultError
    }

    const { error: sessionError } = await this.client
      .from('test_sessions')
      .update({ status: 'completed', completed_at: input.timestamp })
      .eq('id', input.sessionId)

    if (sessionError) {
      throw sessionError
    }
  }

  async getResult(resultId: string): Promise<StoredTestResult | null> {
    const { data, error } = await this.client.rpc('get_public_test_result', {
      requested_result_id: resultId,
    })

    if (error) {
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
    const { error } = await this.client.from('share_events').upsert(
      {
        client_event_id: input.clientEventId,
        result_id: input.resultId,
        event_type: input.eventType,
        occurred_at: input.timestamp,
      },
      { onConflict: 'client_event_id', ignoreDuplicates: true },
    )

    if (error) {
      throw error
    }
  }

  private async ensureAnonymousUser() {
    const { data, error } = await this.client.auth.getSession()

    if (error) {
      throw error
    }

    if (data.session) {
      return
    }

    const { error: signInError } = await this.client.auth.signInAnonymously()

    if (signInError) {
      throw signInError
    }
  }
}
