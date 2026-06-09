import { useEffect, useMemo, useState } from 'react'
import { EventIntroPage } from './components/EventIntroPage'
import { EventPanel } from './components/EventPanel'
import { PersonaReport } from './components/PersonaReport'
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
import './App.css'

const fallbackEvent = events[0]

function App() {
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

  function confirmStartProfile() {
    if (selectedStartTags.length === 0) {
      setProfileWarning(copy.startProfile.minSelectionWarning)
      return
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
    setCharacterState((current) => applyDelta(current, option.moodDelta))
    setChoices((current) => ({ ...current, tag: option }))
    setStage('response')
  }

  function chooseBehavior(option: BehaviorOption) {
    setCharacterState((current) => applyDelta(current, option.moodDelta))
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

    setCharacterState(nextState)
    setCompletedEvents((current) => [...current, completedEvent])
    setChoices((current) => ({
      ...current,
      attribution: option,
      summaryText: result.summaryText,
    }))
    const nextCompletedCount = completedEvents.length + 1
    const nextStage = nextCompletedCount >= 10 ? 'report' : 'summary'
    setStage(nextStage)
  }

  function goToNextEvent() {
    const nextEvent = selectNextEvent({
      events,
      characterState,
      usedEventIds: selectedEventIds,
    })

    if (!nextEvent) {
      setStage('report')
      return
    }

    setSelectedEventIds((current) => [...current, nextEvent.id])
    setCurrentEventId(nextEvent.id)
    setChoices({})
    setStage('eventIntro')
  }

  function handleReset() {
    setCharacterState(resetState())
    setIsProfileReady(false)
    setHasEnteredTitle(true)
    setSelectedStartTags([])
    setProfileWarning('')
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
    setStage('eventIntro')
  }

  function handleStartFromTitle() {
    setHasEnteredTitle(true)
  }

  function handleContinueFromTitle() {
    setHasEnteredTitle(true)
  }

  if (stage === 'report') {
    return <PersonaReport report={personaReport} onRestart={handleReset} />
  }

  if (!hasEnteredTitle) {
    return (
      <TitlePage
        hasProgress={isProfileReady}
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
          totalRounds={10}
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

export default App
