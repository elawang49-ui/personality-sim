import { AttentionHooks } from './AttentionHooks'
import { GrowthFeedback } from './GrowthFeedback'
import { OptionButton } from './OptionButton'
import { copy } from '../data/copy'
import { getLabelToneClass } from '../utils/labelColorMap'
import type {
  AttributionOption,
  BehaviorOption,
  ChoiceRecord,
  EventTagOption,
  FirstReactionOption,
  SimEvent,
  Stage,
  StateDelta,
  StateKey,
} from '../engine/types'

type EventPanelProps = {
  event: SimEvent
  stage: Stage
  choices: ChoiceRecord
  onEnterScene: () => void
  onFirstReaction: (option: FirstReactionOption) => void
  onContinueFromAttention: () => void
  onTag: (option: EventTagOption) => void
  onBehavior: (option: BehaviorOption) => void
  onAttribution: (option: AttributionOption) => void
  onNextEvent: () => void
}

export function EventPanel({
  event,
  stage,
  choices,
  onEnterScene,
  onFirstReaction,
  onContinueFromAttention,
  onTag,
  onBehavior,
  onAttribution,
  onNextEvent,
}: EventPanelProps) {
  return (
    <main className="event-panel">
      <header className="app-header">
        <p className="eyebrow">{copy.eventPanel.appEyebrow}</p>
        <h1>{event.title}</h1>
      </header>

      {stage === 'sceneIntro' ? (
        <section className="scene-intro-card">
          {event.image && (
            <img
              className="event-image"
              src={event.image}
              alt={`${event.title} ${copy.eventPanel.imageAltSuffix}`}
            />
          )}
          <p>{event.text}</p>
          <button className="primary-button" type="button" onClick={onEnterScene}>
            {copy.eventPanel.eventScene.continueButton}
          </button>
        </section>
      ) : (
        <section className="scene-context">
          <span>{copy.eventPanel.eventScene.compactEyebrow}</span>
          <strong>{event.title}</strong>
        </section>
      )}

      {stage === 'attentionReveal' && choices.revealedAttentionHooks && (
        <AttentionHooks hooks={choices.revealedAttentionHooks} />
      )}

      {stage !== 'sceneIntro' && (
      <section className="stage-block">
        <h2>{copy.eventPanel.stageTitles[stage]}</h2>

        {stage === 'firstReaction' && (
          <div className="option-list">
            {event.firstReactions.map((option) => (
              <button
                className="option-button first-reaction-button"
                key={option.id}
                type="button"
                onClick={() => onFirstReaction(option)}
              >
                <span
                  className={`option-corner-label ${getLabelToneClass(
                    option.tone,
                  )}`}
                >
                  #{option.tone}
                </span>
                <span className="option-main-text">{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {stage === 'attentionReveal' && (
          <div className="summary">
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.firstReaction}
              value={choices.firstReaction?.text}
            />
            {choices.firstReaction && (
              <ReactionTrace reaction={choices.firstReaction} />
            )}
            <button
              className="primary-button"
              type="button"
              onClick={onContinueFromAttention}
            >
              {copy.eventPanel.attentionContinueButton}
            </button>
          </div>
        )}

        {stage === 'label' && (
          <>
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.firstReaction}
              value={choices.firstReaction?.text}
            />
            <div className="option-list">
              {event.tags.map((option) => (
                <OptionButton
                  key={option.id}
                  cornerLabel={option.label}
                  label={option.label}
                  description={option.description}
                  onClick={() => onTag(option)}
                />
              ))}
            </div>
          </>
        )}

        {stage === 'response' && (
          <>
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.eventTag}
              value={choices.tag?.label}
            />
            <div className="option-list">
              {event.behaviors.map((option) => (
                <OptionButton
                  key={option.id}
                  cornerLabel={option.label}
                  label={option.label}
                  description={option.description}
                  onClick={() => onBehavior(option)}
                />
              ))}
            </div>
          </>
        )}

        {stage === 'attribution' && (
          <>
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.eventTag}
              value={choices.tag?.label}
            />
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.behavior}
              value={choices.behavior?.label}
            />
            <div className="option-list">
              {event.attributions.map((option) => (
                <OptionButton
                  key={option.id}
                  cornerLabel={option.label}
                  label={option.label}
                  description={option.description}
                  onClick={() => onAttribution(option)}
                />
              ))}
            </div>
          </>
        )}

        {stage === 'summary' && (
          <div className="summary">
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.firstReaction}
              value={choices.firstReaction?.text}
            />
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.eventTag}
              value={choices.tag?.label}
            />
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.behavior}
              value={choices.behavior?.label}
            />
            <ChoiceLine
              label={copy.eventPanel.choiceLabels.attribution}
              value={choices.attribution?.label}
            />
            {choices.firstReaction && (
              <RoundTrace
                attribution={choices.attribution}
                reaction={choices.firstReaction}
              />
            )}
            <p>{choices.summaryText}</p>
            <GrowthFeedback event={event} choices={choices} />
            <button className="primary-button" type="button" onClick={onNextEvent}>
              {copy.eventPanel.nextEventButton}
            </button>
          </div>
        )}
      </section>
      )}
    </main>
  )
}

function ChoiceLine({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <p className="choice-line">
      <span>{label}</span>
      {value}
    </p>
  )
}

function ReactionTrace({ reaction }: { reaction: FirstReactionOption }) {
  const visibleDeltas = getVisibleDeltas(reaction)

  return (
    <div className="reaction-trace">
      <p className="trace-title">{copy.eventPanel.reactionTraceTitle}</p>
      <p>{buildReactionSentence(reaction)}</p>
      {visibleDeltas.length > 0 && (
        <div className="trace-chip-list">
          {visibleDeltas.map(([key, value]) => (
            <span key={key}>
              {copy.shortStateLabels[key]} {formatDelta(value)}
            </span>
          ))}
        </div>
      )}
      <details>
        <summary>{copy.eventPanel.reactionTraceDetails}</summary>
        <DeltaList
          title={copy.eventPanel.deltaTitles.emotion}
          delta={reaction.emotionDelta}
        />
        <DeltaList
          title={copy.eventPanel.deltaTitles.trait}
          delta={reaction.traitDelta}
        />
        <DeltaList
          title={copy.eventPanel.deltaTitles.path}
          delta={reaction.pathDelta ?? {}}
        />
      </details>
    </div>
  )
}

function RoundTrace({
  attribution,
  reaction,
}: {
  attribution?: AttributionOption
  reaction: FirstReactionOption
}) {
  return (
    <div className="round-trace">
      <p className="trace-title">{copy.eventPanel.roundTraceTitle}</p>
      <p>{buildRoundSentence(reaction, attribution)}</p>
    </div>
  )
}

function DeltaList({ title, delta }: { title: string; delta: StateDelta }) {
  const entries = Object.entries(delta).filter(([, value]) => value !== 0)

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="delta-group">
      <strong>{title}</strong>
      <ul>
        {entries.map(([key, value]) => (
          <li key={key}>
            {copy.shortStateLabels[key as StateKey] ?? key}{' '}
            {formatDelta(value ?? 0)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function getVisibleDeltas(reaction: FirstReactionOption) {
  return Object.entries({
    ...reaction.emotionDelta,
    ...reaction.traitDelta,
    ...reaction.pathDelta,
  })
    .filter(([, value]) => value !== undefined && value !== 0)
    .slice(0, 4) as Array<[StateKey, number]>
}

function buildReactionSentence(reaction: FirstReactionOption) {
  if ((reaction.emotionDelta.anger ?? 0) > 0) {
    return copy.eventPanel.reactionSentences.anger
  }

  if ((reaction.emotionDelta.shame ?? 0) > 0) {
    return copy.eventPanel.reactionSentences.shame
  }

  if ((reaction.pathDelta?.avoider ?? 0) > 0) {
    return copy.eventPanel.reactionSentences.avoider
  }

  if ((reaction.pathDelta?.strategist ?? 0) > 0) {
    return copy.eventPanel.reactionSentences.strategist
  }

  if ((reaction.pathDelta?.observer ?? 0) > 0) {
    return copy.eventPanel.reactionSentences.observer
  }

  return copy.eventPanel.reactionSentences.fallback
}

function buildRoundSentence(
  reaction: FirstReactionOption,
  attribution?: AttributionOption,
) {
  const emotionText = describeDelta(reaction.emotionDelta)
  const pathText = describeDelta({
    ...reaction.pathDelta,
    ...attribution?.pathDelta,
  })

  return `${copy.eventPanel.roundTrace.emotionPrefix}：${
    emotionText || copy.eventPanel.roundTrace.noEmotion
  }。${copy.eventPanel.roundTrace.pathPrefix}：${
    pathText || copy.eventPanel.roundTrace.noPath
  }。${copy.eventPanel.roundTrace.suffix}`
}

function describeDelta(delta: StateDelta) {
  return Object.entries(delta)
    .filter(([, value]) => value !== undefined && value !== 0)
    .slice(0, 3)
    .map(
      ([key, value]) =>
        `${copy.shortStateLabels[key as StateKey] ?? key}${formatDelta(
          value ?? 0,
        )}`,
    )
    .join('，')
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`
}
