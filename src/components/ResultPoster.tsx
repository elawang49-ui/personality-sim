import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getAvatarForReport } from '../data/avatarMap'
import type { PersonaReportData } from '../engine/report'

const PUBLIC_SITE_ORIGIN = 'https://personalitysim.icu'

type ResultPosterProps = {
  report: PersonaReportData
  shareUrl: string
}

export const ResultPoster = forwardRef<HTMLDivElement, ResultPosterProps>(
  function ResultPoster({ report, shareUrl }, ref) {
    const summary = getPosterReportExcerpt(report.reportText)
    const [topPath, ...secondaryPaths] = report.topPaths.slice(0, 3)
    const posterShareUrl = toPublicShareUrl(shareUrl)

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

            <div className="result-poster-qr-block">
              <QRCodeSVG
                value={posterShareUrl}
                size={136}
                bgColor="#e0dee5"
                fgColor="#17161c"
                level="M"
                marginSize={2}
              />
              <span>扫码查看结果</span>
              <strong>personalitysim.icu</strong>
            </div>

            <div className="result-poster-persona">
              <img src={getAvatarForReport(report)} alt="" />
              <div>
                <span>人格称号</span>
                <strong>{report.personaTag}</strong>
                {topPath && <small>主路径：{topPath.label}</small>}
              </div>
            </div>

            <blockquote>{summary}</blockquote>

            {topPath ? (
              <section className="result-poster-top-path">
                <small>TOP 1 PATH</small>
                <div>
                  <strong>{topPath.label}</strong>
                  <em>{topPath.value}</em>
                </div>
                <p>{topPath.summary}</p>
              </section>
            ) : (
              <section className="result-poster-top-path result-poster-path-empty">
                <small>PATH DATA</small>
                <p>路径数据缺失，请重新完成一次测试。</p>
              </section>
            )}

            {secondaryPaths.length > 0 && (
              <div className="result-poster-tags">
                {secondaryPaths.map((tag, index) => (
                  <span key={tag.key}>
                    <small>0{index + 2}</small>
                    <strong>{tag.label}</strong>
                    <em>{tag.value}</em>
                  </span>
                ))}
              </div>
            )}
          </div>

          <footer className="result-poster-footer">
            <p>不是 MBTI，是摸爬滚打模拟器</p>
            <div className="result-poster-share-row">
              <div className="result-poster-link">
                <span>查看完整结果</span>
                <strong>{posterShareUrl}</strong>
              </div>
            </div>
          </footer>
        </article>
      </div>
    )
  },
)

function toPublicShareUrl(shareUrl?: string) {
  const fallbackUrl = `${PUBLIC_SITE_ORIGIN}/`
  const trimmedUrl = shareUrl?.trim()

  if (!trimmedUrl) {
    return fallbackUrl
  }

  try {
    const url = new URL(trimmedUrl)
    return `${PUBLIC_SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallbackUrl
  }
}

function getPosterReportExcerpt(reportText: string) {
  const content = reportText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph) => !isPathHeading(paragraph))
    .join('\n\n')

  return truncatePosterText(content || reportText, 240)
}

function truncatePosterText(text: string, maxLength: number) {
  const normalizedText = text.trim()

  if (normalizedText.length <= maxLength) {
    return normalizedText
  }

  const slice = normalizedText.slice(0, maxLength)
  const naturalBreak = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('！'),
    slice.lastIndexOf('？'),
  )

  if (naturalBreak >= 80) {
    return `${slice.slice(0, naturalBreak + 1)}`
  }

  return `${slice.replace(/[，、；：,.!?！？。]*$/, '')}……`
}

function isPathHeading(paragraph: string) {
  return paragraph.replace(/\s/g, '') === '你的路径：'
}
