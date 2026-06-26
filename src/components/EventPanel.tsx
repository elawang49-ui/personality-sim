import { AttentionHooks } from './AttentionHooks'
import { OptionButton } from './OptionButton'
import { copy } from '../data/copy'
import type { RaidCashEvent } from '../engine/raid'
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
  onExtract: () => void
  cashDelta: number
  cashEvents: RaidCashEvent[]
  cashValue: number
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
  onExtract,
  cashDelta,
  cashEvents,
  cashValue,
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
        <h2 className={stage === 'summary' ? 'summary-stage-title' : undefined}>
          {copy.eventPanel.stageTitles[stage]}
        </h2>

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
          <div className="round-summary-shell">
            <div className="summary round-summary round-summary-modal">
              <img
                className="round-summary-image"
                src={getSettlementImage(event)}
                alt={`${event.title} ${copy.eventPanel.imageAltSuffix}`}
              />
              <RoundCashChange
                cashDelta={cashDelta}
                cashEvents={cashEvents}
                cashValue={cashValue}
              />
              <p>{choices.summaryText}</p>
              <div className="round-summary-actions">
                <button className="primary-button" type="button" onClick={onNextEvent}>
                  {copy.eventPanel.nextEventButton}
                </button>
                <button
                  className="report-secondary-button"
                  type="button"
                  onClick={onExtract}
                >
                  {copy.eventPanel.extractButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function getSettlementImage(event: SimEvent) {
  return `/images/settlements/${event.id}.svg`
}

function RoundCashChange({
  cashDelta,
  cashEvents,
  cashValue,
}: {
  cashDelta: number
  cashEvents: RaidCashEvent[]
  cashValue: number
}) {
  const toneClass =
    cashDelta > 0
      ? 'cash-positive'
      : cashDelta < 0
        ? 'cash-negative'
        : 'cash-neutral'

  const baseGain =
    cashDelta - cashEvents.reduce((sum, cashEvent) => sum + cashEvent.amount, 0)
  const cashBefore = cashValue - cashDelta

  return (
    <div className="round-cash-summary">
      <div className="round-cash-total">
        <span>本轮金额变化</span>
        <strong className={toneClass}>{formatDeltaCurrency(cashDelta)}</strong>
      </div>
      <div className="round-cash-total">
        <span>当前带出金额</span>
        <strong>{formatCurrency(cashValue)}</strong>
        <em>
          {formatCurrency(cashBefore)} → {formatCurrency(cashValue)}
        </em>
      </div>
      <div className="round-cash-ledger">
        <LedgerRow label="基础带出收益" amount={baseGain} />
        {cashEvents.map((cashEvent, index) => (
          <LedgerRow
            key={`${cashEvent.id}-${index}`}
            label={cashEvent.label}
            amount={cashEvent.amount}
          />
        ))}
      </div>
    </div>
  )
}

function LedgerRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={amount < 0 ? 'cash-ledger-row cash-ledger-loss' : 'cash-ledger-row'}>
      <span>{label}</span>
      <strong>{formatDeltaCurrency(amount)}</strong>
    </div>
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

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function formatDeltaCurrency(value: number) {
  const rounded = Math.round(value)
  return `${rounded >= 0 ? '+' : '-'}¥${Math.abs(rounded).toLocaleString('zh-CN')}`
}
