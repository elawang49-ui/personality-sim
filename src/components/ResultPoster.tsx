import { forwardRef } from 'react'
import { getAvatarForReport } from '../data/avatarMap'
import type { PersonaReportData } from '../engine/report'

type ResultPosterProps = {
  report: PersonaReportData
  shareUrl: string
}

export const ResultPoster = forwardRef<HTMLDivElement, ResultPosterProps>(
  function ResultPoster({ report, shareUrl }, ref) {
    const summary = report.reportText.split(/\n{2,}/)[0] ?? report.reportText
    const tags = report.topPaths.slice(0, 3)

    return (
      <div className="result-poster-stage" aria-hidden="true">
        <article className="result-poster" ref={ref}>
          <header className="result-poster-header">
            <span>PERSONALITY-SIM / 最终结算</span>
            <span>摸爬滚打人格报告</span>
          </header>

          <div className="result-poster-main">
            <p className="result-poster-kicker">测出来了，你是</p>
            <h1>{report.typeName}</h1>

            <div className="result-poster-persona">
              <img src={getAvatarForReport(report)} alt="" />
              <div>
                <span>人格称号</span>
                <strong>{report.personaTag}</strong>
              </div>
            </div>

            <blockquote>{summary}</blockquote>

            <div className="result-poster-tags">
              {tags.map((tag, index) => (
                <span key={tag.key}>
                  <small>0{index + 1}</small>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <footer className="result-poster-footer">
            <p>不是 MBTI，是摸爬滚打模拟器</p>
            <div>
              <span>查看完整结果</span>
              <strong>{shareUrl}</strong>
            </div>
          </footer>
        </article>
      </div>
    )
  },
)
