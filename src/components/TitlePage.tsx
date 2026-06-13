import { copy } from '../data/copy'

type TitlePageProps = {
  hasProgress: boolean
  connectionError: string
  isConnecting: boolean
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
}

export function TitlePage({
  hasProgress,
  connectionError,
  isConnecting,
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
        {connectionError && <p className="start-warning">{connectionError}</p>}

        <div className="title-actions">
          {hasProgress ? (
            <>
              <button
                className="game-start-button"
                type="button"
                disabled={isConnecting}
                onClick={onContinue}
              >
                {isConnecting ? '正在连接…' : copy.titlePage.continueButton}
              </button>
              <button className="title-reset-button" type="button" onClick={onRestart}>
                {copy.titlePage.restartButton}
              </button>
            </>
          ) : (
            <button
              className="game-start-button"
              type="button"
              disabled={isConnecting}
              onClick={onStart}
            >
              {isConnecting ? '正在连接…' : copy.titlePage.startButton}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
