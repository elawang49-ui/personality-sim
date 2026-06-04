import { copy } from '../data/copy'
import type { CharacterState, StateKey } from '../engine/types'

type StatePanelProps = {
  state: CharacterState
  onReset: () => void
}

export function StatePanel({ state, onReset }: StatePanelProps) {
  return (
    <aside className="state-panel">
      <div className="state-header">
        <div>
          <p className="eyebrow">{copy.statePanel.eyebrow}</p>
          <h2>{copy.statePanel.title}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          {copy.statePanel.resetButton}
        </button>
      </div>

      {copy.statePanel.groups.map((group) => (
        <section className="state-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="stat-list">
            {group.keys.map((key) => (
              <StatRow
                key={key}
                label={copy.stateLabels[key as StateKey]}
                value={state[key as StateKey]}
              />
            ))}
          </div>
        </section>
      ))}
    </aside>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-row">
      <div className="stat-meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
