import { AvatarCard } from './AvatarCard'
import { copy } from '../data/copy'
import type { PersonaReportData } from '../engine/report'
import type { ReactNode } from 'react'

type PersonaReportProps = {
  report: PersonaReportData
  onRestart: () => void
  onCopyLink?: () => void
  onGeneratePoster?: () => void
  isGeneratingPoster?: boolean
  shareFeedback?: string
  statusMessage?: string
  onRetrySave?: () => void
}

export function PersonaReport({
  report,
  onRestart,
  onCopyLink,
  onGeneratePoster,
  isGeneratingPoster = false,
  shareFeedback,
  statusMessage,
  onRetrySave,
}: PersonaReportProps) {
  const hasTopPaths = report.topPaths.length > 0

  return (
    <main className="report-page">
      <section className="report-hero">
        <div className="report-title-card">
          <p className="eyebrow">{copy.reportPage.eyebrow}</p>
          <h1>{report.typeName}</h1>
          <ReportText text={report.reportText} />
        </div>
        <AvatarCard report={report} />
      </section>

      <section className="top-path-section">
        <p className="eyebrow">{copy.reportPage.topPathEyebrow}</p>
        <h2>{copy.reportPage.topPathTitle}</h2>
        {hasTopPaths ? (
          <div className="top-path-grid">
            {report.topPaths.map((path, index) => (
              <article className="top-path-card" key={path.key}>
                <span className="path-rank">#{index + 1}</span>
                <div>
                  <h3>{path.label}</h3>
                  <p>{path.summary}</p>
                </div>
                <strong>{path.value}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="top-path-empty">路径数据缺失，请重新完成一次测试。</p>
        )}
      </section>

      <section className="report-stats">
        <ReportCard title={copy.reportPage.attentionCardTitle}>
          <FrequencyBlock
            title={copy.reportPage.attentionTypeTitle}
            items={report.frequentAttentionTypes}
          />
          <FrequencyBlock
            title={copy.reportPage.attentionContentTitle}
            items={report.frequentAttentionLabels}
          />
        </ReportCard>
        <ReportCard title={copy.reportPage.choiceCardTitle}>
          <FrequencyBlock
            title={copy.reportPage.frequentLabelsTitle}
            items={report.frequentLabels}
          />
          <FrequencyBlock
            title={copy.reportPage.frequentActionsTitle}
            items={report.frequentActions}
          />
          <FrequencyBlock
            title={copy.reportPage.frequentAttributionsTitle}
            items={report.frequentAttributions}
          />
        </ReportCard>
      </section>

      <div className="report-actions">
        {onCopyLink && (
          <button className="primary-button" type="button" onClick={onCopyLink}>
            {copy.reportPage.copyLinkButton}
          </button>
        )}
        {onGeneratePoster && (
          <button
            className="report-poster-button"
            type="button"
            onClick={onGeneratePoster}
            disabled={isGeneratingPoster}
          >
            {isGeneratingPoster
              ? copy.reportPage.generatingPosterButton
              : copy.reportPage.generatePosterButton}
          </button>
        )}
        <button className="report-secondary-button" type="button" onClick={onRestart}>
          {copy.reportPage.restartButton}
        </button>
        {onRetrySave && (
          <button className="report-secondary-button" type="button" onClick={onRetrySave}>
            {copy.resultRoute.retryButton}
          </button>
        )}
        {statusMessage && <p className="report-action-feedback">{statusMessage}</p>}
        {shareFeedback && <p className="report-action-feedback">{shareFeedback}</p>}
      </div>
    </main>
  )
}

function ReportText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph) => !isPathHeading(paragraph))

  return (
    <div className="report-text">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function isPathHeading(paragraph: string) {
  return paragraph.replace(/\s/g, '') === '你的路径：'
}

function ReportCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="report-card">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function FrequencyBlock({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number }[]
}) {
  return (
    <div className="frequency-block">
      <h3>{title}</h3>
      <FrequencyList items={items} />
    </div>
  )
}

function FrequencyList({ items }: { items: { label: string; count: number }[] }) {
  return (
    <div className="frequency-list">
      {items.map((item) => (
        <div className="frequency-item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  )
}
