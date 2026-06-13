import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { copy } from '../data/copy'
import {
  getTestResult,
  recordShareEvent,
  type StoredTestResult,
} from '../services/testData'
import { PersonaReport } from './PersonaReport'
import { ResultPoster } from './ResultPoster'

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
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const shareUrl = useMemo(() => buildResultUrl(resultId), [resultId])

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

  async function copyResultLink() {
    setShareFeedback('')
    recordResultShare(resultId)

    try {
      await copyText(shareUrl)
      setShareFeedback(copy.resultRoute.copied)
    } catch {
      setShareFeedback(copy.resultRoute.shareError)
    }
  }

  async function generatePoster() {
    const poster = posterRef.current

    if (!poster || isGeneratingPoster) {
      return
    }

    setIsGeneratingPoster(true)
    setShareFeedback('')
    recordResultShare(resultId)

    try {
      await document.fonts.ready
      await waitForImages(poster)
      const dataUrl = await toPng(poster, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#f3eadc',
      })

      downloadImage(dataUrl, `personality-sim-${resultId}.png`)
      setShareFeedback(copy.resultRoute.posterSaved)
    } catch (error) {
      console.error('Failed to generate result poster', error)
      setShareFeedback(copy.resultRoute.posterError)
    } finally {
      setIsGeneratingPoster(false)
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
    <>
      <PersonaReport
        report={loadState.result.report}
        shareFeedback={shareFeedback}
        isGeneratingPoster={isGeneratingPoster}
        onRestart={onRestart}
        onCopyLink={copyResultLink}
        onGeneratePoster={generatePoster}
      />
      <ResultPoster
        ref={posterRef}
        report={loadState.result.report}
        shareUrl={shareUrl}
      />
    </>
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

function buildResultUrl(resultId: string) {
  return new URL(`/result/${resultId}`, window.location.origin).toString()
}

function recordResultShare(resultId: string) {
  void recordShareEvent({
    clientEventId: crypto.randomUUID(),
    resultId,
    eventType: 'share_click',
  }).catch((error: unknown) => {
    console.error('Failed to record share click', error)
  })
}

async function copyText(text: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Some embedded browsers expose Clipboard API but deny write permission.
    }
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.append(textArea)
  textArea.select()

  const didCopy = document.execCommand('copy')
  textArea.remove()

  if (!didCopy) {
    throw new Error('Copy command failed')
  }
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll('img'))

  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    }),
  )
}

function downloadImage(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  document.body.append(link)
  link.click()
  link.remove()
}
