import { AttentionHooks } from './AttentionHooks'
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
} from '../engine/types'

type EventPanelProps = {
  event: SimEvent
  stage: Stage
  choices: ChoiceRecord
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

      {stage === 'attentionReveal' && choices.revealedAttentionHooks && (
        <AttentionHooks hooks={choices.revealedAttentionHooks} />
      )}

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
                <div className={`option-corner-label ${getLabelToneClass(option.tone)}`}>
                  #{option.tone}
                </div>
                <span>{option.text}</span>
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
                  description={option.description}
                  cornerLabel={option.label}
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
                  description={option.description}
                  cornerLabel={option.label}
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
                  description={option.description}
                  cornerLabel={option.label}
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
            <button className="primary-button" type="button" onClick={onNextEvent}>
              {copy.eventPanel.nextEventButton}
            </button>
          </div>
        )}
      </section>
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
  return (
    <div className="reaction-trace">
      <p className="trace-title">{copy.eventPanel.reactionTraceTitle}</p>
      <p>{buildReactionSentence(reaction)}</p>
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
  void reaction
  void attribution

  return copy.eventPanel.roundTrace.suffix
}
