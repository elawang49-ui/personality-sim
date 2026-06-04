import { copy } from '../data/copy'
import { startTags } from '../data/startTags'
import type { CharacterState, StartProfileTag } from '../engine/types'

type StartProfileProps = {
  previewState: CharacterState
  selectedTags: StartProfileTag[]
  warning: string
  onToggle: (tag: StartProfileTag) => void
  onConfirm: () => void
}

export function StartProfile({
  previewState,
  selectedTags,
  warning,
  onToggle,
  onConfirm,
}: StartProfileProps) {
  const selectedIds = new Set(selectedTags.map((tag) => tag.id))

  return (
    <main className="start-page">
      <section className="start-hero">
        <p className="eyebrow">{copy.startProfile.eyebrow}</p>
        <h1>{copy.startProfile.title}</h1>
        <p>{copy.startProfile.description}</p>
      </section>

      <section className="start-layout">
        <div className="profile-grid">
          {startTags.map((tag) => (
            <button
              className={
                selectedIds.has(tag.id) ? 'profile-card selected' : 'profile-card'
              }
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag)}
            >
              <span>{tag.title}</span>
              <p>{tag.description}</p>
              <small>{describeImpact(tag)}</small>
            </button>
          ))}
        </div>

        <aside className="start-summary">
          <p className="eyebrow">
            {copy.startProfile.selectedCountPrefix} {selectedTags.length}/3
          </p>
          <h2>{copy.startProfile.summaryTitle}</h2>
          <div className="start-chip-list">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => <span key={tag.id}>{tag.title}</span>)
            ) : (
              <span>{copy.startProfile.selectedEmpty}</span>
            )}
          </div>
          <div className="start-preview-list">
            {previewKeys.map((key) => (
              <div className="start-preview-row" key={key}>
                <span>{copy.shortStateLabels[key]}</span>
                <strong>{previewState[key]}</strong>
              </div>
            ))}
          </div>
          {warning && <p className="start-warning">{warning}</p>}
          <button
            className="primary-button start-confirm"
            type="button"
            disabled={selectedTags.length === 0}
            onClick={onConfirm}
          >
            {copy.startProfile.confirmButton}
          </button>
        </aside>
      </section>
    </main>
  )
}

const previewKeys: Array<keyof CharacterState> = [
  'sensitivity',
  'orderNeed',
  'abstraction',
  'empathy',
  'aggression',
  'selfEsteem',
  'actionPower',
]

function describeImpact(tag: StartProfileTag) {
  const delta = { ...tag.traitDelta, ...tag.pathDelta }
  return Object.entries(delta)
    .filter(([, value]) => value !== undefined && value !== 0)
    .slice(0, 3)
    .map(
      ([key, value]) =>
        `${copy.shortStateLabels[key as keyof CharacterState]} ${formatDelta(
          value ?? 0,
        )}`,
    )
    .join(' / ')
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`
}
