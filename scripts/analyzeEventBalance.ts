import { readFileSync } from 'node:fs'
import { getLabelToneClass } from '../src/utils/labelColorMap.ts'
import { stateKeys, type SimEvent, type StateDelta, type StateKey } from '../src/engine/types.ts'

type NumericStats = {
  positive: number
  negative: number
  net: number
  count: number
}

type ChipClass =
  | 'chip-danger'
  | 'chip-shame'
  | 'chip-observe'
  | 'chip-structure'
  | 'chip-trust'
  | 'chip-create'
  | 'chip-recover'
  | 'chip-withdraw'
  | 'chip-neutral'

const eventsPath = new URL('../src/data/events.json', import.meta.url)
const events = JSON.parse(readFileSync(eventsPath, 'utf8')) as SimEvent[]
const validStateKeys = new Set<string>(stateKeys)
const chipClasses: ChipClass[] = [
  'chip-danger',
  'chip-shame',
  'chip-observe',
  'chip-structure',
  'chip-trust',
  'chip-create',
  'chip-recover',
  'chip-withdraw',
  'chip-neutral',
]

function createStats(): NumericStats {
  return {
    positive: 0,
    negative: 0,
    net: 0,
    count: 0,
  }
}

function addDelta(target: Map<string, NumericStats>, delta?: StateDelta): void {
  if (!delta) {
    return
  }

  Object.entries(delta).forEach(([key, value]) => {
    if (typeof value !== 'number' || value === 0) {
      return
    }

    const stats = target.get(key) ?? createStats()
    if (value > 0) {
      stats.positive += value
    } else {
      stats.negative += value
    }
    stats.net += value
    stats.count += 1
    target.set(key, stats)
  })
}

function getEventDeltas(event: SimEvent): Map<string, NumericStats> {
  const totals = new Map<string, NumericStats>()

  event.firstReactions.forEach((reaction) => {
    addDelta(totals, reaction.emotionDelta)
    addDelta(totals, reaction.traitDelta)
    addDelta(totals, reaction.pathDelta)
  })
  event.tags.forEach((tag) => addDelta(totals, tag.moodDelta))
  event.behaviors.forEach((behavior) => addDelta(totals, behavior.moodDelta))
  event.attributions.forEach((attribution) => addDelta(totals, attribution.pathDelta))

  return totals
}

function mergeStats(target: Map<string, NumericStats>, source: Map<string, NumericStats>): void {
  source.forEach((sourceStats, key) => {
    const stats = target.get(key) ?? createStats()
    stats.positive += sourceStats.positive
    stats.negative += sourceStats.negative
    stats.net += sourceStats.net
    stats.count += sourceStats.count
    target.set(key, stats)
  })
}

function formatNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

function getStatNet(totals: Map<string, NumericStats>, key: string): number {
  return totals.get(key)?.net ?? 0
}

function getStatPositive(totals: Map<string, NumericStats>, key: string): number {
  return totals.get(key)?.positive ?? 0
}

function getStatCount(totals: Map<string, NumericStats>, key: string): number {
  return totals.get(key)?.count ?? 0
}

function sortedEntries(totals: Map<string, NumericStats>): [string, NumericStats][] {
  return [...totals.entries()].sort((a, b) => Math.abs(b[1].net) - Math.abs(a[1].net))
}

function topPositive(totals: Map<string, NumericStats>, limit = 5): [string, number][] {
  return [...totals.entries()]
    .filter(([, stats]) => stats.net > 0)
    .sort((a, b) => b[1].net - a[1].net)
    .slice(0, limit)
    .map(([key, stats]) => [key, stats.net])
}

function topNegative(totals: Map<string, NumericStats>, limit = 5): [string, number][] {
  return [...totals.entries()]
    .filter(([, stats]) => stats.net < 0)
    .sort((a, b) => a[1].net - b[1].net)
    .slice(0, limit)
    .map(([key, stats]) => [key, stats.net])
}

function printKeyValues(values: [string, number][]): string {
  if (values.length === 0) {
    return '无'
  }

  return values.map(([key, value]) => `${key} ${formatNumber(value)}`).join(', ')
}

function classifyEvent(totals: Map<string, NumericStats>): string {
  const creator = getStatNet(totals, 'creator')
  const observer = getStatNet(totals, 'observer')
  const stability = getStatNet(totals, 'stability')
  const selfEsteem = getStatNet(totals, 'selfEsteem')
  const trust = getStatNet(totals, 'trust')
  const shame = getStatNet(totals, 'shame')
  const anger = getStatNet(totals, 'anger')
  const aggression = getStatNet(totals, 'aggression')
  const avenger = getStatNet(totals, 'avenger')
  const pleaser = getStatNet(totals, 'pleaser')
  const avoider = getStatNet(totals, 'avoider')
  const labels: string[] = []

  if (creator >= 5) labels.push('偏创作转化')
  if (observer >= 5) labels.push('偏观察分析')
  if (stability + selfEsteem + trust >= 8) labels.push('偏恢复稳定')
  if (shame >= 5 || selfEsteem <= -4) labels.push('偏羞耻内耗')
  if (anger + aggression + avenger >= 8) labels.push('偏反击爆发')
  if (pleaser + avoider >= 8) labels.push('偏讨好回避')

  return labels.length > 0 ? labels.join(' / ') : '相对中性'
}

function getTheme(event: SimEvent): string {
  const eventWithCategory = event as SimEvent & { category?: string }
  return eventWithCategory.category ?? event.theme ?? '未分类'
}

function getChipClass(label: string): ChipClass {
  const className = getLabelToneClass(label)
  return chipClasses.includes(className as ChipClass) ? (className as ChipClass) : 'chip-neutral'
}

function collectChipLabels(event: SimEvent): { label: string; source: string }[] {
  return [
    ...event.firstReactions.map((reaction) => ({
      label: reaction.tone,
      source: `${event.id} / firstReaction`,
    })),
    ...event.attentionHooks.map((hook) => ({
      label: hook.label,
      source: `${event.id} / attentionHook`,
    })),
    ...event.tags.map((tag) => ({
      label: tag.label,
      source: `${event.id} / tag`,
    })),
    ...event.behaviors.map((behavior) => ({
      label: behavior.label,
      source: `${event.id} / behavior`,
    })),
    ...event.attributions.map((attribution) => ({
      label: attribution.label,
      source: `${event.id} / attribution`,
    })),
  ]
}

function printEventPoolSummary(): void {
  const themeCounts = new Map<string, number>()
  events.forEach((event) => {
    const theme = getTheme(event)
    themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1)
  })

  console.log('=== Event Pool Summary ===')
  console.log(`总事件数: ${events.length}`)
  console.log('\n分类 / theme 数量:')
  ;[...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([theme, count]) => console.log(`- ${theme}: ${count}`))

  console.log('\n每个事件的结构数量:')
  events.forEach((event, index) => {
    console.log(
      `${index + 1}. ${event.title} (${event.id}) | firstReactions ${event.firstReactions.length}, tags ${event.tags.length}, behaviors ${event.behaviors.length}, attributions ${event.attributions.length}, attentionHooks ${event.attentionHooks.length}`,
    )
  })
}

function printStateTotals(globalTotals: Map<string, NumericStats>): void {
  console.log('\n=== StateKey Totals ===')
  sortedEntries(globalTotals).forEach(([key, stats]) => {
    const unsupported = validStateKeys.has(key) ? '' : ' [unsupported]'
    console.log(
      `${key}${unsupported}: 正向 ${formatNumber(stats.positive)}, 负向 ${stats.negative}, 净值 ${formatNumber(stats.net)}, 出现 ${stats.count} 次`,
    )
  })
}

function printRiskWarnings(globalTotals: Map<string, NumericStats>, perEventTotals: Map<string, Map<string, NumericStats>>): void {
  const warnings: string[] = []
  const shamePositive = getStatPositive(globalTotals, 'shame')
  const shameNet = getStatNet(globalTotals, 'shame')
  const shameCount = getStatCount(globalTotals, 'shame')
  const creatorPositive = getStatPositive(globalTotals, 'creator')
  const creatorNet = getStatNet(globalTotals, 'creator')
  const stabilityPositive = getStatPositive(globalTotals, 'stability')
  const stabilityNet = getStatNet(globalTotals, 'stability')
  const selfEsteemPositive = getStatPositive(globalTotals, 'selfEsteem')
  const selfEsteemNet = getStatNet(globalTotals, 'selfEsteem')
  const dangerNet =
    getStatNet(globalTotals, 'anger') +
    getStatNet(globalTotals, 'aggression') +
    getStatNet(globalTotals, 'avenger')
  const supportNet = stabilityNet + selfEsteemNet

  if (shameNet > creatorNet && shameCount > getStatCount(globalTotals, 'creator')) {
    warnings.push('事件池可能偏向自疑/羞耻。')
  }

  if (creatorPositive < shamePositive * 0.7) {
    warnings.push('创作者路径可能不足。')
  }

  if (dangerNet > creatorNet + stabilityNet || dangerNet > 35) {
    warnings.push('事件池可能重新走向内有狂犬。')
  }

  if (stabilityPositive + selfEsteemPositive < shamePositive * 0.8 || supportNet < shameNet) {
    warnings.push('事件池缺少恢复和自我支撑。')
  }

  perEventTotals.forEach((totals, eventId) => {
    totals.forEach((stats, key) => {
      if (Math.abs(stats.net) >= 12) {
        warnings.push(`${eventId} 的 ${key} 净值达到 ${formatNumber(stats.net)}，该事件可能单次强行改命。`)
      }
    })
  })

  console.log('\n=== Risk Warnings ===')
  if (warnings.length === 0) {
    console.log('未发现明显红线；仍建议结合试玩结果观察。')
    return
  }

  warnings.forEach((warning) => console.log(`- ${warning}`))
}

function printPerEventBalance(perEventTotals: Map<string, Map<string, NumericStats>>): void {
  console.log('\n=== Per Event Balance ===')
  events.forEach((event) => {
    const totals = perEventTotals.get(event.id) ?? new Map<string, NumericStats>()
    const focusKeys: StateKey[] = [
      'creator',
      'observer',
      'stability',
      'shame',
      'anger',
      'aggression',
      'avenger',
    ]

    console.log(`\n${event.title} (${event.id})`)
    console.log(`分类: ${getTheme(event)}`)
    console.log(`Top 正向: ${printKeyValues(topPositive(totals))}`)
    console.log(`Top 负向: ${printKeyValues(topNegative(totals))}`)
    console.log(
      `重点值: ${focusKeys.map((key) => `${key} ${formatNumber(getStatNet(totals, key))}`).join(', ')}`,
    )
    console.log(`判断: ${classifyEvent(totals)}`)
  })
}

function printChipDistribution(): void {
  const chipCounts = new Map<ChipClass, number>(chipClasses.map((className) => [className, 0]))
  const neutralLabels = new Map<string, Set<string>>()

  events.forEach((event) => {
    collectChipLabels(event).forEach(({ label, source }) => {
      const chipClass = getChipClass(label)
      chipCounts.set(chipClass, (chipCounts.get(chipClass) ?? 0) + 1)

      if (chipClass === 'chip-neutral') {
        const sources = neutralLabels.get(label) ?? new Set<string>()
        sources.add(source)
        neutralLabels.set(label, sources)
      }
    })
  })

  console.log('\n=== Chip Class Distribution ===')
  chipClasses.forEach((className) => {
    console.log(`${className}: ${chipCounts.get(className) ?? 0}`)
  })

  console.log('\n=== Neutral Labels ===')
  if (neutralLabels.size === 0) {
    console.log('没有落到 chip-neutral 的 label/tone。')
    return
  }

  ;[...neutralLabels.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .forEach(([label, sources]) => {
      console.log(`- ${label}: ${[...sources].join('; ')}`)
    })
}

function printUnsupportedKeys(globalTotals: Map<string, NumericStats>): void {
  const unsupportedKeys = [...globalTotals.keys()].filter((key) => !validStateKeys.has(key))

  console.log('\n=== Unsupported Delta Keys ===')
  if (unsupportedKeys.length === 0) {
    console.log('未发现 engine/types 外的 delta key。')
    return
  }

  unsupportedKeys.forEach((key) => console.log(`- ${key}`))
}

function printSuggestions(): void {
  console.log('\n=== Suggestions ===')
  console.log('- 理想上，chip-shame 不要长期高于 chip-create 太多。')
  console.log('- chip-create 应接近或超过 shame 的 70%。')
  console.log('- chip-recover / chip-trust 不能太低。')
  console.log('- chip-danger 不应该成为前三高。')
  console.log('- observer / structure 可以高，但不要把所有事件都变成分析题。')
  console.log('- 本工具只读分析，不会自动修改 events.json。')
}

const globalTotals = new Map<string, NumericStats>()
const perEventTotals = new Map<string, Map<string, NumericStats>>()

events.forEach((event) => {
  const totals = getEventDeltas(event)
  perEventTotals.set(event.id, totals)
  mergeStats(globalTotals, totals)
})

printEventPoolSummary()
printStateTotals(globalTotals)
printRiskWarnings(globalTotals, perEventTotals)
printPerEventBalance(perEventTotals)
printChipDistribution()
printUnsupportedKeys(globalTotals)
printSuggestions()
