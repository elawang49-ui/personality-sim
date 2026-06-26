import type { SimEvent } from '../engine/types'

type EventIntroPageProps = {
  event: SimEvent
  roundIndex: number
  totalRounds: number
  onEnterEvent: () => void
}

export function EventIntroPage({
  event,
  roundIndex,
  totalRounds,
  onEnterEvent,
}: EventIntroPageProps) {
  return (
    <main className="event-intro-page">
      <article className="event-intro-card">
        <header className="event-intro-header">
          <p className="event-intro-kicker">
            案子 {roundIndex} / {totalRounds}
          </p>
          <h1 className="event-intro-title">{event.title}</h1>
        </header>

        <p className="event-intro-text">{formatEventIntroText(event.text)}</p>

        {event.image && (
          <div className="event-image-frame">
            <img
              className="event-image"
              src={event.image}
              alt={`${event.title} 插图`}
            />
          </div>
        )}

        <div className="event-intro-actions">
          <button
            className="event-intro-enter-button"
            type="button"
            onClick={onEnterEvent}
          >
            进入案子
          </button>
        </div>
      </article>
    </main>
  )
}

function formatEventIntroText(text: string) {
  return text.replace(/。(?=.)/g, '。\n')
}
