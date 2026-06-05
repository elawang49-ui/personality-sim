import { copy } from '../data/copy'
import { buildGrowthFeedback } from '../engine/growthFeedback'
import type { ChoiceRecord, SimEvent } from '../engine/types'

type GrowthFeedbackProps = {
  event: SimEvent
  choices: ChoiceRecord
}

export function GrowthFeedback({ event, choices }: GrowthFeedbackProps) {
  const feedback = buildGrowthFeedback(event, choices)

  if (!feedback) {
    return null
  }

  return (
    <section className="growth-feedback">
      <h3 className="growth-feedback-title">{copy.growthFeedback.title}</h3>
      <div className="growth-feedback-grid">
        <FeedbackSection
          label={copy.growthFeedback.protected}
          text={feedback.protectedText}
        />
        <FeedbackSection
          label={copy.growthFeedback.sacrificed}
          text={feedback.sacrificedText}
        />
        <FeedbackSection
          label={copy.growthFeedback.alternative}
          text={feedback.alternativeText}
        />
      </div>
    </section>
  )
}

function FeedbackSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="growth-feedback-section">
      <span className="growth-feedback-label">{label}</span>
      <p className="growth-feedback-text">{text}</p>
    </div>
  )
}
