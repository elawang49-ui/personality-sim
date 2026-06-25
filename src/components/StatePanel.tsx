import { copy } from '../data/copy'
import type { RaidViewModel } from '../engine/raid'

type StatePanelProps = {
  raid: RaidViewModel
  onReset: () => void
}

export function StatePanel({ raid, onReset }: StatePanelProps) {
  return (
    <aside className="state-panel">
      <div className="state-header">
        <div>
          <p className="eyebrow">{copy.statePanel.eyebrow}</p>
          <h2>{copy.statePanel.title}</h2>
          <p className="raid-round-label">{raid.roundLabel}</p>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          {copy.statePanel.resetButton}
        </button>
      </div>

      <section className="state-group">
        <h3>{copy.statePanel.raidGroupTitle}</h3>
        <div className="stat-list">
          <StatRow
            label="状态"
            value={`${raid.statusValue} / 100`}
            level={raid.statusLevel}
            percent={raid.statusValue}
          />
          <StatRow
            label="压力"
            value={`${raid.pressureValue} / 100`}
            level={raid.pressureLevel}
            percent={raid.pressureValue}
            tone="pressure"
          />
          <StatRow
            label="带出金额"
            value={formatCurrency(raid.cashValue)}
            level={raid.cashLevel}
            percent={Math.min(100, (raid.cashValue / 3500) * 100)}
          />
          <StatRow
            label="本轮收益"
            value={formatDeltaCurrency(raid.cashDelta)}
            level={raid.cashDelta > 0 ? '已入包' : '待结算'}
            percent={Math.min(100, (Math.max(0, raid.cashDelta) / 600) * 100)}
          />
        </div>
      </section>
    </aside>
  )
}

function StatRow({
  label,
  value,
  level,
  percent,
  tone,
}: {
  label: string
  value: string
  level: string
  percent: number
  tone?: 'pressure'
}) {
  return (
    <div className="stat-row">
      <div className="stat-meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="raid-stat-level">{level}</div>
      <div className="stat-track">
        <div
          className={tone === 'pressure' ? 'stat-fill pressure-fill' : 'stat-fill'}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function formatDeltaCurrency(value: number) {
  const rounded = Math.round(value)
  return `${rounded >= 0 ? '+' : '-'}¥${Math.abs(rounded).toLocaleString('zh-CN')}`
}
