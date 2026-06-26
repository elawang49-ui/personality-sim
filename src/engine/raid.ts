import type {
  AttributionOption,
  BehaviorOption,
  CharacterState,
  EventTagOption,
  FirstReactionOption,
  StateDelta,
  StateKey,
} from './types'

export type RaidResult = {
  hasExtracted: boolean
  completedRounds: number
  maxRounds: number
  cashValue: number
  cashLevel: string
}

type BuildRaidResultParams = Omit<RaidResult, 'cashLevel'>

export type RaidViewModel = {
  roundLabel: string
  statusValue: number
  statusLevel: string
  pressureValue: number
  pressureLevel: string
  cashValue: number
  cashDelta: number
  cashLevel: string
}

export type RaidCashEvent = {
  id:
    | 'operator-hidden-charge'
    | 'case-expense'
    | 'lottery-jackpot'
    | 'a-share-crash'
    | 'us-stock-crash'
    | 'negative-first-reaction'
    | 'negative-label'
    | 'negative-response'
    | 'negative-attribution'
  label: string
  amount: number
}

export type RaidEventSchedule = {
  lotteryJackpotRound?: number
  aShareCrashRounds: number[]
  usStockCrashRounds: number[]
}

type RaidViewModelParams = {
  state: CharacterState
  roundIndex: number
  maxRounds: number
  previousCashValue?: number
  cashValue?: number
  cashDelta?: number
}

type RaidRoundGainParams = {
  before: CharacterState
  after: CharacterState
  roundIndex: number
  allowPressureReward?: boolean
}

type RaidRoundNarrativeParams = {
  eventId: string
  cashDelta: number
  cashEvents: RaidCashEvent[]
}

export type RaidChoiceCashSource =
  | {
      kind: 'firstReaction'
      option?: FirstReactionOption
    }
  | {
      kind: 'label'
      option?: EventTagOption
    }
  | {
      kind: 'response'
      option?: BehaviorOption
    }
  | {
      kind: 'attribution'
      option?: AttributionOption
    }

type RaidChoiceCashImpact = {
  label: string
  amount: number
  score: number
}

export const RAID_STARTING_CASH = 1000
export const OPERATOR_HIDDEN_CHARGE_AMOUNT = 35
export const LOTTERY_JACKPOT_AMOUNT = 1888
export const A_SHARE_CRASH_AMOUNT = 4200
export const US_STOCK_CRASH_AMOUNT = 42000
export const CASH_REWARD_PRESSURE_LIMIT = 25

const caseExpenseEvents: Record<string, { label: string; amount: number }> = {
  'team-message': {
    label: '沟通补救成本',
    amount: -180,
  },
  'late-feedback': {
    label: '返工成本',
    amount: -260,
  },
  'friend-last-minute-cancel': {
    label: '爽约沉没成本',
    amount: -220,
  },
  'work-credit-taken': {
    label: '方案补救成本',
    amount: -360,
  },
  'interview-vague-rejection': {
    label: '面试通勤成本',
    amount: -280,
  },
  'family-caring-denial': {
    label: '情绪恢复开销',
    amount: -160,
  },
  'group-joke-belittle': {
    label: '社交局损耗',
    amount: -180,
  },
  'opaque-rule-extra-work': {
    label: '重填材料成本',
    amount: -240,
  },
  'need-expression-silence': {
    label: '关系维护成本',
    amount: -150,
  },
}

const pathKeys: StateKey[] = [
  'creator',
  'strategist',
  'pleaser',
  'observer',
  'avenger',
  'avoider',
  'caregiver',
  'judge',
]

export function createRaidViewModel({
  state,
  roundIndex,
  maxRounds,
  previousCashValue,
  cashValue = previousCashValue ?? RAID_STARTING_CASH,
  cashDelta = 0,
}: RaidViewModelParams): RaidViewModel {
  const statusValue = calculateRaidStatus(state)
  const pressureValue = calculateRaidPressure(state)

  return {
    roundLabel: `第 ${Math.min(roundIndex, maxRounds)} / ${maxRounds} 轮`,
    statusValue,
    statusLevel: getStatusLevel(statusValue),
    pressureValue,
    pressureLevel: getPressureLevel(pressureValue),
    cashValue: Math.max(0, Math.round(cashValue)),
    cashDelta: Math.round(cashDelta),
    cashLevel: getCashLevel(cashValue),
  }
}

export function calculateRaidRoundGain({
  before,
  after,
  roundIndex,
  allowPressureReward = false,
}: RaidRoundGainParams) {
  const delta = getStateDelta(before, after)
  const positivePathDelta = pathKeys.reduce(
    (sum, key) => sum + Math.max(0, delta[key] ?? 0),
    0,
  )
  const boundaryRelatedDelta =
    Math.max(0, delta.strategist ?? 0) +
    Math.max(0, delta.judge ?? 0) +
    Math.max(0, delta.avoider ?? 0)
  const statusValue = calculateRaidStatus(after)
  const pressureValue = calculateRaidPressure(after)

  if (!allowPressureReward && pressureValue > CASH_REWARD_PRESSURE_LIMIT) {
    return 0
  }

  const riskBonus = pressureValue >= 65 && statusValue >= 55 ? 45 : 0
  let gain =
    100 +
    roundIndex * 12 +
    positivePathDelta * 20 +
    Math.max(0, delta.actionPower ?? 0) * 15 +
    Math.max(0, delta.strategist ?? 0) * 15 +
    Math.max(0, delta.creator ?? 0) * 15 +
    boundaryRelatedDelta * 15 +
    riskBonus

  if (statusValue < 40) {
    gain *= 0.75
  } else if (statusValue < 60) {
    gain *= 0.9
  }

  if (pressureValue > 75) {
    gain *= 0.78
  } else if (pressureValue > 60) {
    gain *= 0.9
  }

  return clamp(Math.round(gain), 30, 600)
}

export function createRaidEventSchedule(maxRounds: number): RaidEventSchedule {
  return {
    lotteryJackpotRound:
      Math.random() < 0.2 ? randomRound(maxRounds) : undefined,
    aShareCrashRounds:
      Math.random() < 0.2 ? pickUniqueRounds(maxRounds, 2) : [],
    usStockCrashRounds:
      Math.random() < 0.1 ? pickUniqueRounds(maxRounds, 2) : [],
  }
}

export function getScheduledRaidCashEvents(
  schedule: RaidEventSchedule,
  roundIndex: number,
): RaidCashEvent[] {
  const events: RaidCashEvent[] = []

  if (schedule.lotteryJackpotRound === roundIndex) {
    events.push({
      id: 'lottery-jackpot',
      label: '刮彩票大奖',
      amount: LOTTERY_JACKPOT_AMOUNT,
    })
  }

  if (schedule.aShareCrashRounds.includes(roundIndex)) {
    events.push({
      id: 'a-share-crash',
      label: 'A股崩盘',
      amount: -A_SHARE_CRASH_AMOUNT,
    })
  }

  if (schedule.usStockCrashRounds.includes(roundIndex)) {
    events.push({
      id: 'us-stock-crash',
      label: '美股崩盘',
      amount: -US_STOCK_CRASH_AMOUNT,
    })
  }

  return events
}

export function getRaidEventCashEvents(eventId: string): RaidCashEvent[] {
  const caseExpenseEvent = caseExpenseEvents[eventId]

  if (eventId === 'operator-hidden-charge') {
    return [
      {
        id: 'operator-hidden-charge',
        label: '运营商扣费',
        amount: -OPERATOR_HIDDEN_CHARGE_AMOUNT,
      },
    ]
  }

  if (caseExpenseEvent) {
    return [
      {
        id: 'case-expense',
        label: caseExpenseEvent.label,
        amount: caseExpenseEvent.amount,
      },
    ]
  }

  return []
}

export function hasRaidEventCashCost(eventId: string) {
  return eventId === 'operator-hidden-charge' || Boolean(caseExpenseEvents[eventId])
}

export function isRaidCashRewardBlocked(state: CharacterState) {
  return calculateRaidPressure(state) > CASH_REWARD_PRESSURE_LIMIT
}

export function getRaidChoiceCashEvents(
  sources: RaidChoiceCashSource[],
): RaidCashEvent[] {
  const cashEvents: RaidCashEvent[] = []

  for (const source of sources) {
    const impact = getRaidChoiceCashImpact(source)

    if (!impact) {
      continue
    }

    cashEvents.push({
      id: getChoiceCashEventId(source.kind),
      label: impact.label,
      amount: impact.amount,
    })
  }

  return cashEvents
}

export function getRaidChoiceCashImpact(
  source: RaidChoiceCashSource,
): RaidChoiceCashImpact | undefined {
  if (!source.option) {
    return undefined
  }

  const score = getNegativeChoiceScore(getOptionDelta(source.option))

  if (score < getChoiceCashThreshold(source.kind)) {
    return undefined
  }

  return {
    label: getChoiceCashLabel(source.kind),
    amount: -clamp(Math.round(score * 18), 90, 720),
    score,
  }
}

export function createRaidRoundNarrative({
  eventId,
  cashDelta,
  cashEvents,
}: RaidRoundNarrativeParams) {
  const amount = formatCurrency(Math.abs(cashDelta))
  const lotteryEvent = cashEvents.find((event) => event.id === 'lottery-jackpot')
  const aShareCrashEvent = cashEvents.find(
    (event) => event.id === 'a-share-crash',
  )
  const usStockCrashEvent = cashEvents.find(
    (event) => event.id === 'us-stock-crash',
  )
  const operatorEvent = cashEvents.find(
    (event) => event.id === 'operator-hidden-charge',
  )
  const caseExpenseEvent = cashEvents.find(
    (event) => event.id === 'case-expense',
  )
  const choiceCostTotal = cashEvents
    .filter((event) => event.id.startsWith('negative-'))
    .reduce((sum, event) => sum + Math.abs(event.amount), 0)

  if (usStockCrashEvent && aShareCrashEvent) {
    return pick([
      `A股先跌，美股又补了一脚，两个市场一起把包里的钱打穿，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `盘面红得像警报灯，A股和美股同时下坠，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `你还没来得及撤，A股和美股的崩盘提示一起弹出，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (usStockCrashEvent) {
    return pick([
      `美股隔夜跳水，虚拟账户像被抽掉地板，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `纳指一根长阴砸下来，你的屏幕红得发烫，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `美股崩盘新闻刷满首页，包里的钱被海外市场卷走一大截，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (aShareCrashEvent) {
    return pick([
      `A股突然下砸，你的虚拟持仓当场冒烟，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `市场一根绿柱砸下来，屏幕比你的脸还冷，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `A股崩盘消息弹出来，包里的钱被现实削了一刀，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (lotteryEvent) {
    return pick([
      `路过彩票店随手刮了一张，柜台老板沉默了三秒：中大奖了，本轮净带走${amount}。`,
      `你本来只是想买瓶水，顺手刮开一张彩票，结果直接爆金币，本轮净带走${amount}。`,
      `现实突然给你开了一次补给箱，彩票大奖掉进包里，本轮净带走${amount}。`,
    ])
  }

  if (eventId === 'operator-hidden-charge' && operatorEvent) {
    return pick([
      `运营商先从你口袋里摸走${formatCurrency(Math.abs(operatorEvent.amount))}，但你转头接住一笔意外补给，本轮净带走${amount}。`,
      `账单扣费弹出来的一瞬间，红字很刺眼；好在路上又捡回一点零碎，本轮净带走${amount}。`,
      `这局先被运营商抽了一刀，随后靠随机掉落回了点血，本轮净带走${amount}。`,
    ])
  }

  if (caseExpenseEvent && choiceCostTotal > 0 && cashDelta < 0) {
    return pick([
      `这个案子本身就先扣了${formatCurrency(Math.abs(caseExpenseEvent.amount))}，后面的选择又继续漏钱，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `案子自带账单，选择还追加内耗，包里的钱这轮被连续削掉，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `现实成本和选择成本叠在一起，结算时红字很明显，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (caseExpenseEvent && cashDelta < 0) {
    return pick([
      `这个案子不是免费挨打，${caseExpenseEvent.label}先从包里划走一笔，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `案子刚落地，账单也跟着落地：${caseExpenseEvent.label}，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `这类麻烦自带现实成本，${caseExpenseEvent.label}扣完以后，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (caseExpenseEvent) {
    return pick([
      `这个案子自带${caseExpenseEvent.label}，但你还是把收益扛回来了，本轮净带走${amount}。`,
      `先被${caseExpenseEvent.label}削了一口，最后仍然勉强正收益，本轮净带走${amount}。`,
      `现实成本先扣，行动收益后补，本轮净带走${amount}。`,
    ])
  }

  if (choiceCostTotal > 0 && cashDelta < 0) {
    return pick([
      `这轮的选择太耗电，情绪和行动一起漏钱，包里净少了${amount}。`,
      `负面定性一路滚下去，现实顺手扣了一笔损耗费，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `你不是没处理，只是处理方式太贵了，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (choiceCostTotal > 0) {
    return pick([
      `这轮有些选择在漏钱，但你还是带出了一点收益，本轮净带走${amount}。`,
      `情绪成本扣掉一截，剩下的钱被你勉强塞进包里，本轮净带走${amount}。`,
      `选择里的内耗被算进账单，好在最后仍是正收益，本轮净带走${amount}。`,
    ])
  }

  if (cashDelta > 0) {
    return pick([
      `路上捡到一笔没人认领的小钱，本轮多带走${amount}。`,
      `家里突然塞来一个红包，你把它顺手装进包里，本轮多带走${amount}。`,
      `抖音上的好心人给你撒了点钱，你眼疾手快接住了，本轮多带走${amount}。`,
      `自动售货机像良心发现一样多吐了一点，本轮多带走${amount}。`,
      `有人顺手把你拉进一场福利雨，你没问，先捡了，本轮多带走${amount}。`,
    ])
  }

  if (cashDelta < 0) {
    return pick([
      `路过一个看似免费的坑，出来时包里少了${amount}。`,
      `一笔小账单突然追上来，本轮少带走${amount}。`,
      `现实伸手收了点过路费，本轮少带走${amount}。`,
    ])
  }

  return '这轮没有明显进账，也没有继续漏钱，包里的金额暂时没有变化。'
}

export function buildRaidResult({
  hasExtracted,
  completedRounds,
  maxRounds,
  cashValue,
}: BuildRaidResultParams): RaidResult {
  return {
    hasExtracted,
    completedRounds,
    maxRounds,
    cashValue: Math.max(0, Math.round(cashValue)),
    cashLevel: getCashLevel(cashValue),
  }
}

function calculateRaidStatus(state: CharacterState) {
  return clamp(
    Math.round(
      60 +
        state.stability * 0.4 +
        state.selfEsteem * 0.25 +
        state.actionPower * 0.15 -
        state.arousal * 0.25 -
        state.shame * 0.3 -
        state.anger * 0.15,
    ),
  )
}

function calculateRaidPressure(state: CharacterState) {
  return clamp(
    Math.round(
      20 +
        state.arousal * 0.35 +
        state.shame * 0.25 +
        state.anger * 0.25 +
        state.aggression * 0.15 -
        state.stability * 0.2 -
        state.selfEsteem * 0.1,
    ),
  )
}

function getStatusLevel(value: number) {
  if (value >= 80) return '稳定'
  if (value >= 60) return '可控'
  if (value >= 40) return '受压'
  if (value >= 20) return '危险'
  return '崩盘边缘'
}

function getPressureLevel(value: number) {
  if (value <= 25) return '低压'
  if (value <= 50) return '紧张'
  if (value <= 75) return '高压'
  return '濒临爆炸'
}

export function getCashLevel(value: number) {
  if (value < 1000) return '亏损边缘'
  if (value < 2000) return '小赚'
  if (value < 3500) return '赚到了'
  return '高价值撤离'
}

function getStateDelta(before: CharacterState, after: CharacterState) {
  return Object.fromEntries(
    Object.entries(after).map(([key, value]) => [
      key,
      value - before[key as keyof CharacterState],
    ]),
  ) as Partial<CharacterState>
}

function getOptionDelta(
  option:
    | FirstReactionOption
    | EventTagOption
    | BehaviorOption
    | AttributionOption,
) {
  const delta: StateDelta = {}

  addDelta(delta, 'emotionDelta' in option ? option.emotionDelta : undefined)
  addDelta(delta, 'traitDelta' in option ? option.traitDelta : undefined)
  addDelta(delta, 'pathDelta' in option ? option.pathDelta : undefined)
  addDelta(delta, 'moodDelta' in option ? option.moodDelta : undefined)

  return delta
}

function getNegativeChoiceScore(delta: StateDelta) {
  return (
    Math.max(0, delta.shame ?? 0) +
    Math.max(0, delta.anger ?? 0) * 0.8 +
    Math.max(0, delta.arousal ?? 0) * 0.6 +
    Math.max(0, delta.aggression ?? 0) * 0.5 +
    Math.max(0, -(delta.trust ?? 0)) * 0.8 +
    Math.max(0, -(delta.selfEsteem ?? 0)) +
    Math.max(0, -(delta.stability ?? 0)) * 0.7 +
    Math.max(0, -(delta.actionPower ?? 0)) * 0.8 +
    Math.max(0, -(delta.pleasure ?? 0)) * 0.7
  )
}

function addDelta(total: StateDelta, delta?: StateDelta) {
  if (!delta) {
    return
  }

  for (const [key, value] of Object.entries(delta)) {
    total[key as keyof StateDelta] = (total[key as keyof StateDelta] ?? 0) + value
  }
}

function getChoiceCashEventId(kind: RaidChoiceCashSource['kind']) {
  if (kind === 'firstReaction') return 'negative-first-reaction'
  if (kind === 'label') return 'negative-label'
  if (kind === 'response') return 'negative-response'
  return 'negative-attribution'
}

function getChoiceCashLabel(kind: RaidChoiceCashSource['kind']) {
  if (kind === 'firstReaction') return '第一反应内耗'
  if (kind === 'label') return '负面定性成本'
  if (kind === 'response') return '高耗能回应'
  return '长期归因损耗'
}

function getChoiceCashThreshold(kind: RaidChoiceCashSource['kind']) {
  if (kind === 'firstReaction') return 6
  if (kind === 'label') return 12
  if (kind === 'response') return 7
  return 7
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function formatDeltaCurrency(value: number) {
  const rounded = Math.round(value)
  return `${rounded >= 0 ? '+' : '-'}¥${Math.abs(rounded).toLocaleString('zh-CN')}`
}

function pick(items: string[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0]
}

function randomRound(maxRounds: number) {
  return Math.floor(Math.random() * maxRounds) + 1
}

function pickUniqueRounds(maxRounds: number, count: number) {
  const rounds = new Set<number>()

  while (rounds.size < Math.min(maxRounds, count)) {
    rounds.add(randomRound(maxRounds))
  }

  return Array.from(rounds).sort((first, second) => first - second)
}
