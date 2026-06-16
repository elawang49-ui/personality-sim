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
            事件 {roundIndex} / {totalRounds}
          </p>
          <h1 className="event-intro-title">{event.title}</h1>
        </header>

        <p className="event-intro-text">{event.text}</p>

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
            进入事件
          </button>
        </div>
      </article>
    </main>
  )
}
