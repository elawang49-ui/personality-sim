import { useEffect, useMemo, useState } from 'react'
import { EventPanel } from './components/EventPanel'
import { PersonaReport } from './components/PersonaReport'
import { StartProfile } from './components/StartProfile'
import { StatePanel } from './components/StatePanel'
import { TitlePage } from './components/TitlePage'
import { copy } from './data/copy'
import { getRevealedAttentionHooks } from './engine/attention'
import { getEvent } from './engine/events'
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

const GAME_PROGRESS_KEY = 'personality-sim.game-progress'
const validStages: Stage[] = [
  'sceneIntro',
  'firstReaction',
  'attentionReveal',
  'label',
  'response',
  'attribution',
  'summary',
  'report',
]

type GameProgress = {
  eventIndex: number
  stage: Stage
  choices: ChoiceRecord
  completedEvents: CompletedEventRecord[]
}

function App() {
  const savedProgress = loadGameProgress()
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
  const [eventIndex, setEventIndex] = useState(savedProgress.eventIndex)
  const [stage, setStage] = useState<Stage>(savedProgress.stage)
  const [choices, setChoices] = useState<ChoiceRecord>(savedProgress.choices)
  const [completedEvents, setCompletedEvents] = useState<CompletedEventRecord[]>(
    savedProgress.completedEvents,
  )
  const event = useMemo(() => getEvent(eventIndex), [eventIndex])
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
    if (!isProfileReady) {
      return
    }

    saveGameProgress({
      eventIndex,
      stage,
      choices,
      completedEvents,
    })
  }, [choices, completedEvents, eventIndex, isProfileReady, stage])

  useEffect(() => {
    if (!isProfileReady) {
      return
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    })
  }, [eventIndex, isProfileReady])

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
    clearGameProgress()
    setIsProfileReady(true)
    setEventIndex(0)
    setChoices({})
    setCompletedEvents([])
    setStage('sceneIntro')
  }

  function enterScene() {
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
    setStage(completedEvents.length + 1 >= 10 ? 'report' : 'summary')
  }

  function goToNextEvent() {
    setEventIndex((current) => current + 1)
    setChoices({})
    setStage('sceneIntro')
  }

  function handleReset() {
    setCharacterState(resetState())
    setIsProfileReady(false)
    setHasEnteredTitle(true)
    setSelectedStartTags([])
    setProfileWarning('')
    setEventIndex(0)
    setChoices({})
    setCompletedEvents([])
    setStage('sceneIntro')
    clearGameProgress()
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
      <EventPanel
        event={event}
        stage={stage}
        choices={choices}
        onEnterScene={enterScene}
        onFirstReaction={chooseFirstReaction}
        onContinueFromAttention={continueFromAttention}
        onTag={chooseTag}
        onBehavior={chooseBehavior}
        onAttribution={chooseAttribution}
        onNextEvent={goToNextEvent}
      />
      <StatePanel state={characterState} onReset={handleReset} />
    </div>
  )
}

function loadGameProgress(): GameProgress {
  const fallback: GameProgress = {
    eventIndex: 0,
    stage: 'sceneIntro',
    choices: {},
    completedEvents: [],
  }
  const saved = window.localStorage.getItem(GAME_PROGRESS_KEY)

  if (!saved) {
    return fallback
  }

  try {
    const parsed = JSON.parse(saved) as Partial<GameProgress>
    const parsedStage = parsed.stage

    return {
      eventIndex:
        typeof parsed.eventIndex === 'number' && parsed.eventIndex >= 0
          ? parsed.eventIndex
          : fallback.eventIndex,
      stage:
        parsedStage && validStages.includes(parsedStage)
          ? parsedStage
          : 'firstReaction',
      choices: parsed.choices ?? fallback.choices,
      completedEvents: Array.isArray(parsed.completedEvents)
        ? parsed.completedEvents
        : fallback.completedEvents,
    }
  } catch {
    return fallback
  }
}

function saveGameProgress(progress: GameProgress) {
  window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress))
}

function clearGameProgress() {
  window.localStorage.removeItem(GAME_PROGRESS_KEY)
}

export default App
