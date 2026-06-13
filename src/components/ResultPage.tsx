import { useEffect, useState } from 'react'
import { copy } from '../data/copy'
import {
  getTestResult,
  recordShareEvent,
  type StoredTestResult,
} from '../services/testData'
import { PersonaReport } from './PersonaReport'

type ResultPageProps = {
  resultId: string
  onRestart: () => void
}

type LoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'ready'; result: StoredTestResult }

export function ResultPage({ resultId, onRestart }: ResultPageProps) {
  const [loadState, setLoadState] = useState<LoadState>(() =>
    isUuid(resultId) ? { status: 'loading' } : { status: 'not-found' },
  )
  const [shareFeedback, setShareFeedback] = useState('')

  useEffect(() => {
    let isActive = true

    if (!isUuid(resultId)) {
      return () => {
        isActive = false
      }
    }

    void getTestResult(resultId)
      .then((result) => {
        if (!isActive) {
          return
        }

        if (!result) {
          setLoadState({ status: 'not-found' })
          return
        }

        setLoadState({ status: 'ready', result })
        void recordShareEvent({
          clientEventId: getResultOpenEventId(resultId),
          resultId,
          eventType: 'result_open',
        }).catch((error: unknown) => {
          console.error('Failed to record result open', error)
        })
      })
      .catch((error: unknown) => {
        console.error('Failed to load test result', error)
        if (isActive) {
          setLoadState({ status: 'error' })
        }
      })

    return () => {
      isActive = false
    }
  }, [resultId])

  async function shareResult() {
    setShareFeedback('')
    void recordShareEvent({
      clientEventId: crypto.randomUUID(),
      resultId,
      eventType: 'share_click',
    }).catch((error: unknown) => {
      console.error('Failed to record share click', error)
    })

    const shareData = {
      title: copy.resultRoute.shareTitle,
      text: copy.resultRoute.shareText,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShareFeedback(copy.resultRoute.shared)
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      setShareFeedback(copy.resultRoute.copied)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setShareFeedback(copy.resultRoute.shareError)
    }
  }

  if (loadState.status === 'loading') {
    return <ResultMessage title={copy.resultRoute.loading} />
  }

  if (loadState.status === 'not-found') {
    return (
      <ResultMessage
        title={copy.resultRoute.notFoundTitle}
        body={copy.resultRoute.notFoundBody}
        onBack={onRestart}
      />
    )
  }

  if (loadState.status === 'error') {
    return (
      <ResultMessage
        title={copy.resultRoute.loadErrorTitle}
        body={copy.resultRoute.loadErrorBody}
        onBack={onRestart}
      />
    )
  }

  return (
    <PersonaReport
      report={loadState.result.report}
      shareFeedback={shareFeedback}
      onRestart={onRestart}
      onShare={shareResult}
    />
  )
}

function ResultMessage({
  title,
  body,
  onBack,
}: {
  title: string
  body?: string
  onBack?: () => void
}) {
  return (
    <main className="result-message-page">
      <section className="result-message-card">
        <p className="eyebrow">PSTI Result</p>
        <h1>{title}</h1>
        {body && <p>{body}</p>}
        {onBack && (
          <button className="primary-button" type="button" onClick={onBack}>
            {copy.resultRoute.backButton}
          </button>
        )}
      </section>
    </main>
  )
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function getResultOpenEventId(resultId: string) {
  const historyState = (window.history.state ?? {}) as Record<string, unknown>

  if (
    historyState.pstiResultId === resultId &&
    typeof historyState.pstiResultOpenEventId === 'string'
  ) {
    return historyState.pstiResultOpenEventId
  }

  const clientEventId = crypto.randomUUID()
  window.history.replaceState(
    {
      ...historyState,
      pstiResultId: resultId,
      pstiResultOpenEventId: clientEventId,
    },
    '',
  )
  return clientEventId
}
