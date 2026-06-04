import { getAvatarForReport, getDefaultAvatar } from '../data/avatarMap'
import { copy } from '../data/copy'
import type { PersonaReportData } from '../engine/report'

type AvatarCardProps = {
  report: PersonaReportData
}

export function AvatarCard({ report }: AvatarCardProps) {
  const topPath = report.topPaths[0]

  return (
    <section className="avatar-card">
      <img
        className="persona-avatar"
        src={getAvatarForReport(report)}
        alt={`${report.typeName} ${copy.avatarCard.altSuffix}`}
        onError={(event) => {
          event.currentTarget.src = getDefaultAvatar()
        }}
      />
      <div>
        <h2>{report.typeName}</h2>
        <span className={`avatar-persona-tag path-${topPath?.key ?? 'default'}`}>
          {report.personaTag}
        </span>
      </div>
      {topPath && (
        <div className="avatar-path-note">
          <span>
            {copy.avatarCard.topPathPrefix}
            {topPath.label}
          </span>
          <strong>{topPath.value}</strong>
          <p>{topPath.summary}</p>
        </div>
      )}
    </section>
  )
}
