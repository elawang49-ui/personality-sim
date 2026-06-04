import type { PersonaReportData } from './report'
import type { StateKey } from './types'

const appearanceByPath: Partial<Record<StateKey, string>> = {
  creator:
    'holding a tiny notebook, star sparkles, a feather pen, gentle artistic feeling',
  observer:
    'holding a magnifying glass, floating book pages, calm observant eyes',
  strategist:
    'with a small chess piece, neat folder, subtle geometric shapes',
  pleaser:
    'soft posture, slightly shy, careful hands, warm and gentle expression',
  avenger:
    'stubborn little hedgehog-like vibe, protective tiny spikes, determined but not evil',
  avoider:
    'cozy hood, half-hidden stance, quiet guarded expression, small safe blanket',
}

export function buildAvatarPrompt(personaReport: PersonaReportData) {
  const topTraits = personaReport.topPaths
    .map((path) => appearanceByPath[path.key])
    .filter(Boolean)
    .join(', ')

  return [
    'cute pixel art character',
    'chibi',
    'soft colors',
    'indie game style',
    'expressive face',
    'adorable',
    `personality type: ${personaReport.typeName}`,
    topTraits,
    'small full-body character sprite',
    'transparent or simple warm neutral background',
    'no text, no logo, no watermark',
  ]
    .filter(Boolean)
    .join(', ')
}
