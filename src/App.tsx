import { useEffect, useMemo, useRef, useState } from 'react'
import { EventIntroPage } from './components/EventIntroPage'
import { EventPanel } from './components/EventPanel'
import { PersonaReport } from './components/PersonaReport'
import { ResultPage } from './components/ResultPage'
import { StartProfile } from './components/StartProfile'
import { StatePanel } from './components/StatePanel'
import { TitlePage } from './components/TitlePage'
import { copy } from './data/copy'
import { getRevealedAttentionHooks } from './engine/attention'
import { selectNextEvent } from './engine/eventDirector'
import { events } from './engine/events'
import { calculatePathUpdate } from './engine/pathUpdate'
import {
  buildPersonaReport,
  type CompletedEventRecord,
} from './engine/report'
import {
  applyDelta,
  initialState,
  loadStartProfileReady,
  loadState,
  resetState,
  saveStartProfileReady,
  saveState,
} from './engine/state'
import type {
  AttributionOption,
  BehaviorOption,
  CharacterState,
  ChoiceRecord,
  EventTagOption,
  FirstReactionOption,
  Stage,
  StartProfileTag,
} from './engine/types'
import {
  clearActiveTestSession,
  completeTest,
  ensureTestSession,
  recordTestAnswer,
  startNewTestSession,
  TestDataConfigurationError,
} from './services/testData'
import { buildStateChangeSummary } from './services/testData/stateSummary'
import './App.css'

const fallbackEvent = events[0]
const totalRounds = 10

function App() {
  const [resultRouteId, setResultRouteId] = useState(() => getResultIdFromPath())

  useEffect(() => {
    function syncRoute() {
      setResultRouteId(getResultIdFromPath())
    }

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  function openResult(resultId: string) {
    window.history.pushState({}, '', `/result/${resultId}`)
    setResultRouteId(resultId)
  }

  function restartFromResult() {
    resetState()
    clearActiveTestSession()
    window.history.pushState({}, '', '/')
    setResultRouteId(null)
  }

  if (resultRouteId) {
    return (
      <ResultPage
        key={resultRouteId}
        resultId={resultRouteId}
        onRestart={restartFromResult}
      />
    )
  }

  return <TestExperience onResultReady={openResult} />
}

type TestExperienceProps = {
  onResultReady: (resultId: string) => void
}

type PendingResult = {
  resultId: string
  report: ReturnType<typeof buildPersonaReport>
  finalState: CharacterState
  completedRounds: number
  timestamp: string
}

function TestExperience({ onResultReady }: TestExperienceProps) {
  const [characterState, setCharacterState] =
    useState<CharacterState>(() => loadState())
  const [isProfileReady, setIsProfileReady] = useState(() =>
    loadStartProfileReady(),
  )
  const [hasEnteredTitle, setHasEnteredTitle] = useState(false)
  const [selectedStartTags, setSelectedStartTags] = useState<StartProfileTag[]>(
    [],
  )
  const [profileWarning, setProfileWarning] = useState('')
  const [dataConnectionError, setDataConnectionError] = useState('')
  const [isConnectingData, setIsConnectingData] = useState(false)
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(() => {
    const firstEvent =
      selectNextEvent({
        events,
        characterState: loadState(),
        usedEventIds: [],
      }) ?? fallbackEvent

    return [firstEvent.id]
  })
  const [currentEventId, setCurrentEventId] = useState(
    () => selectedEventIds[0] ?? fallbackEvent.id,
  )
  const [stage, setStage] = useState<Stage>('eventIntro')
  const [choices, setChoices] = useState<ChoiceRecord>({})
  const [completedEvents, setCompletedEvents] = useState<CompletedEventRecord[]>(
    [],
  )
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null)
  const [isSavingResult, setIsSavingResult] = useState(false)
  const [resultSaveFailed, setResultSaveFailed] = useState(false)
  const saveAttemptRef = useRef(0)
  const event = useMemo(
    () => events.find((item) => item.id === currentEventId) ?? fallbackEvent,
    [currentEventId],
  )
  const personaReport = useMemo(
    () => buildPersonaReport(characterState, completedEvents),
    [characterState, completedEvents],
  )

  useEffect(() => {
    if (isProfileReady) {
      saveState(characterState)
    }
  }, [characterState, isProfileReady])

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    })
  }, [currentEventId, hasEnteredTitle, isProfileReady, stage])

  const startPreviewState = useMemo(
    () =>
      selectedStartTags.reduce(
        (state, tag) =>
          applyDelta(applyDelta(state, tag.traitDelta), tag.pathDelta ?? {}),
        initialState,
      ),
    [selectedStartTags],
  )

  function toggleStartTag(tag: StartProfileTag) {
    setProfileWarning('')
    setSelectedStartTags((current) => {
      if (current.some((item) => item.id === tag.id)) {
        return current.filter((item) => item.id !== tag.id)
      }

      if (current.length >= 3) {
        setProfileWarning(copy.startProfile.maxSelectionWarning)
        return current
      }

      return [...current, tag]
    })
  }

  async function confirmStartProfile() {
    if (selectedStartTags.length === 0) {
      setProfileWarning(copy.startProfile.minSelectionWarning)
      return
    }

    setIsConnectingData(true)
    setProfileWarning('')

    try {
      await ensureTestSession({ totalRounds })
    } catch (error) {
      console.error('Failed to confirm test session', error)
      setProfileWarning(getDataConnectionMessage(error))
      return
    } finally {
      setIsConnectingData(false)
    }

    setCharacterState(startPreviewState)
    saveState(startPreviewState)
    saveStartProfileReady()
    setIsProfileReady(true)
    const firstEvent =
      selectNextEvent({
        events,
        characterState: startPreviewState,
        usedEventIds: [],
      }) ?? fallbackEvent
    setSelectedEventIds([firstEvent.id])
    setCurrentEventId(firstEvent.id)
    setChoices({})
    setCompletedEvents([])
    setStage('eventIntro')
  }

  function enterEvent() {
    setStage('firstReaction')
  }

  function chooseFirstReaction(option: FirstReactionOption) {
    const nextState = applyDelta(
      applyDelta(applyDelta(characterState, option.emotionDelta), option.traitDelta),
      option.pathDelta ?? {},
    )
    const revealedAttentionHooks = getRevealedAttentionHooks(
      nextState,
      event.attentionHooks,
      option,
    )

    setCharacterState(nextState)
    trackAnswer(
      'firstReaction',
      option.id,
      characterState,
      nextState,
    )
    setChoices({
      firstReaction: option,
      revealedAttentionHooks,
    })
    setStage('attentionReveal')
  }

  function continueFromAttention() {
    setStage('label')
  }

  function chooseTag(option: EventTagOption) {
    const nextState = applyDelta(characterState, option.moodDelta)

    setCharacterState(nextState)
    trackAnswer('label', option.id, characterState, nextState)
    setChoices((current) => ({ ...current, tag: option }))
    setStage('response')
  }

  function chooseBehavior(option: BehaviorOption) {
    const nextState = applyDelta(characterState, option.moodDelta)

    setCharacterState(nextState)
    trackAnswer('response', option.id, characterState, nextState)
    setChoices((current) => ({ ...current, behavior: option }))
    setStage('attribution')
  }

  function chooseAttribution(option: AttributionOption) {
    const selectedLabel = choices.tag
    const selectedAction = choices.behavior

    if (!selectedLabel || !selectedAction) {
      return
    }

    const result = calculatePathUpdate({
      characterState,
      event,
      selectedLabel,
      selectedAction,
      selectedAttribution: option,
    })

    const nextState = applyDelta(
      applyDelta(
        applyDelta(characterState, result.emotionDelta),
        result.traitDelta,
      ),
      result.pathDelta,
    )
    const revealedHooks = choices.revealedAttentionHooks ?? []
    const completedEvent: CompletedEventRecord = {
      eventTitle: event.title,
      attentionCategories: revealedHooks.map((hook) => hook.type),
      attentionLabels: revealedHooks.map((hook) => hook.label),
      selectedLabel: selectedLabel.label,
      selectedAction: selectedAction.label,
      selectedAttribution: option.label,
    }
    const nextCompletedEvents = [...completedEvents, completedEvent]

    setCharacterState(nextState)
    setCompletedEvents(nextCompletedEvents)
    trackAnswer(
      'attribution',
      option.id,
      characterState,
      nextState,
      result.summaryText,
    )
    setChoices((current) => ({
      ...current,
      attribution: option,
      summaryText: result.summaryText,
    }))
    const nextCompletedCount = nextCompletedEvents.length

    if (nextCompletedCount >= totalRounds) {
      finishTest(nextState, nextCompletedEvents)
    } else {
      setStage('summary')
    }
  }

  function goToNextEvent() {
    const nextEvent = selectNextEvent({
      events,
      characterState,
      usedEventIds: selectedEventIds,
    })

    if (!nextEvent) {
      finishTest(characterState, completedEvents)
      return
    }

    setSelectedEventIds((current) => [...current, nextEvent.id])
    setCurrentEventId(nextEvent.id)
    setChoices({})
    setStage('eventIntro')
  }

  function handleReset() {
    saveAttemptRef.current += 1
    clearActiveTestSession()
    setCharacterState(resetState())
    setIsProfileReady(false)
    setHasEnteredTitle(true)
    setSelectedStartTags([])
    setProfileWarning('')
    setDataConnectionError('')
    setIsConnectingData(false)
    const firstEvent =
      selectNextEvent({
        events,
        characterState: initialState,
        usedEventIds: [],
      }) ?? fallbackEvent
    setSelectedEventIds([firstEvent.id])
    setCurrentEventId(firstEvent.id)
    setChoices({})
    setCompletedEvents([])
    setPendingResult(null)
    setIsSavingResult(false)
    setResultSaveFailed(false)
    setStage('eventIntro')
  }

  async function handleStartFromTitle() {
    setDataConnectionError('')
    setIsConnectingData(true)

    try {
      await startNewTestSession({ totalRounds })
      setHasEnteredTitle(true)
    } catch (error) {
      console.error('Failed to start test session', error)
      setDataConnectionError(getDataConnectionMessage(error))
    } finally {
      setIsConnectingData(false)
    }
  }

  async function handleContinueFromTitle() {
    setDataConnectionError('')
    setIsConnectingData(true)

    try {
      await ensureTestSession({ totalRounds })
      setHasEnteredTitle(true)
    } catch (error) {
      console.error('Failed to continue test session', error)
      setDataConnectionError(getDataConnectionMessage(error))
    } finally {
      setIsConnectingData(false)
    }
  }

  function trackAnswer(
    answerType: 'firstReaction' | 'label' | 'response' | 'attribution',
    selectedOptionId: string,
    before: CharacterState,
    after: CharacterState,
    summaryText?: string,
  ) {
    void recordTestAnswer({
      eventId: event.id,
      roundIndex: completedEvents.length + 1,
      answerType,
      selectedOptionId,
      stateSummary: buildStateChangeSummary(
        answerType,
        before,
        after,
        summaryText,
      ),
      timestamp: new Date().toISOString(),
    }).catch((error: unknown) => {
      console.error('Failed to record test answer', error)
    })
  }

  function finishTest(
    finalState: CharacterState,
    finalCompletedEvents: CompletedEventRecord[],
  ) {
    const result: PendingResult = {
      resultId: crypto.randomUUID(),
      report: buildPersonaReport(finalState, finalCompletedEvents),
      finalState,
      completedRounds: finalCompletedEvents.length,
      timestamp: new Date().toISOString(),
    }

    setPendingResult(result)
    setStage('report')
    persistResult(result)
  }

  function persistResult(result: PendingResult) {
    const attemptId = saveAttemptRef.current + 1
    saveAttemptRef.current = attemptId
    setIsSavingResult(true)
    setResultSaveFailed(false)

    void completeTest(result)
      .then(() => {
        if (saveAttemptRef.current === attemptId) {
          onResultReady(result.resultId)
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to save test result', error)
        if (saveAttemptRef.current === attemptId) {
          setResultSaveFailed(true)
        }
      })
      .finally(() => {
        if (saveAttemptRef.current === attemptId) {
          setIsSavingResult(false)
        }
      })
  }

  if (stage === 'report') {
    return (
      <PersonaReport
        report={pendingResult?.report ?? personaReport}
        statusMessage={
          isSavingResult
            ? copy.resultRoute.saving
            : resultSaveFailed
              ? copy.resultRoute.saveError
              : undefined
        }
        onRestart={handleReset}
        onRetrySave={
          resultSaveFailed && pendingResult
            ? () => persistResult(pendingResult)
            : undefined
        }
      />
    )
  }

  if (!hasEnteredTitle) {
    return (
      <TitlePage
        hasProgress={isProfileReady}
        connectionError={dataConnectionError}
        isConnecting={isConnectingData}
        onStart={handleStartFromTitle}
        onContinue={handleContinueFromTitle}
        onRestart={handleReset}
      />
    )
  }

  if (!isProfileReady) {
    return (
      <StartProfile
        previewState={startPreviewState}
        selectedTags={selectedStartTags}
        warning={profileWarning}
        isConnecting={isConnectingData}
        onToggle={toggleStartTag}
        onConfirm={confirmStartProfile}
      />
    )
  }

  return (
    <div className="app-shell">
      {stage === 'eventIntro' ? (
        <EventIntroPage
          event={event}
          roundIndex={completedEvents.length + 1}
          totalRounds={totalRounds}
          onEnterEvent={enterEvent}
        />
      ) : (
        <EventPanel
          event={event}
          stage={stage}
          choices={choices}
          onFirstReaction={chooseFirstReaction}
          onContinueFromAttention={continueFromAttention}
          onTag={chooseTag}
          onBehavior={chooseBehavior}
          onAttribution={chooseAttribution}
          onNextEvent={goToNextEvent}
        />
      )}
      <StatePanel state={characterState} onReset={handleReset} />
    </div>
  )
}

function getDataConnectionMessage(error: unknown) {
  if (error instanceof TestDataConfigurationError) {
    return '数据连接失败：生产环境缺少 Supabase 配置，请联系管理员。'
  }

  return '数据连接失败，请检查网络后重试。测试尚未开始。'
}

function getResultIdFromPath() {
  const match = window.location.pathname.match(/^\/result\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default App
