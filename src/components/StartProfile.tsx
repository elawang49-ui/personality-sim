import { copy } from '../data/copy'
import { startTags } from '../data/startTags'
import { RAID_STARTING_CASH } from '../engine/raid'
import type { StartProfileTag } from '../engine/types'

type StartProfileProps = {
  selectedTags: StartProfileTag[]
  warning: string
  isConnecting: boolean
  onToggle: (tag: StartProfileTag) => void
  onConfirm: () => void
}

export function StartProfile({
  selectedTags,
  warning,
  isConnecting,
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
            <div className="start-preview-row">
              <span>入场资金</span>
              <strong>¥{RAID_STARTING_CASH.toLocaleString('zh-CN')}</strong>
            </div>
            <div className="start-preview-row">
              <span>行动目标</span>
              <strong>撤离</strong>
            </div>
            <div className="start-preview-row">
              <span>携带底色</span>
              <strong>{selectedTags.length} / 3</strong>
            </div>
          </div>
          {warning && <p className="start-warning">{warning}</p>}
          <button
            className="primary-button start-confirm"
            type="button"
            disabled={selectedTags.length === 0 || isConnecting}
            onClick={onConfirm}
          >
            {isConnecting ? '正在连接…' : copy.startProfile.confirmButton}
          </button>
        </aside>
      </section>
    </main>
  )
}

function describeImpact(tag: StartProfileTag) {
  const impactCount =
    Object.values(tag.traitDelta).filter((value) => value !== 0).length +
    Object.values(tag.pathDelta ?? {}).filter((value) => value !== 0).length

  return impactCount > 4 ? '影响行动状态与撤离风格' : '轻量影响本局行动'
}
