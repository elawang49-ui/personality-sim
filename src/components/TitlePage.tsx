import { copy } from '../data/copy'

type TitlePageProps = {
  hasProgress: boolean
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
}

export function TitlePage({
  hasProgress,
  onStart,
  onContinue,
  onRestart,
}: TitlePageProps) {
  return (
    <main className="title-page">
      <section className="title-card">
        <p className="eyebrow">{copy.titlePage.eyebrow}</p>
        <h1>{copy.titlePage.title}</h1>
        <p className="title-subtitle">{copy.titlePage.subtitle}</p>
        <p className="title-copy">{copy.titlePage.description}</p>

        <div className="title-actions">
          {hasProgress ? (
            <>
              <button className="game-start-button" type="button" onClick={onContinue}>
                {copy.titlePage.continueButton}
              </button>
              <button className="title-reset-button" type="button" onClick={onRestart}>
                {copy.titlePage.restartButton}
              </button>
            </>
          ) : (
            <button className="game-start-button" type="button" onClick={onStart}>
              {copy.titlePage.startButton}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
