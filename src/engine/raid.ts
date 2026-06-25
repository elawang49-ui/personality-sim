import type { CharacterState, StateKey } from './types'

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
  id: 'operator-hidden-charge' | 'lottery-jackpot' | 'stock-crash'
  label: string
  amount: number
}

export type RaidEventSchedule = {
  lotteryJackpotRound?: number
  stockCrashRounds: number[]
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
}

type RaidRoundNarrativeParams = {
  eventId: string
  cashDelta: number
  cashEvents: RaidCashEvent[]
}

export const RAID_STARTING_CASH = 1000
export const OPERATOR_HIDDEN_CHARGE_AMOUNT = 35
export const LOTTERY_JACKPOT_AMOUNT = 1888
export const STOCK_CRASH_AMOUNT = 420

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
    stockCrashRounds:
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

  if (schedule.stockCrashRounds.includes(roundIndex)) {
    events.push({
      id: 'stock-crash',
      label: 'A股崩盘',
      amount: -STOCK_CRASH_AMOUNT,
    })
  }

  return events
}

export function getRaidEventCashEvents(eventId: string): RaidCashEvent[] {
  if (eventId === 'operator-hidden-charge') {
    return [
      {
        id: 'operator-hidden-charge',
        label: '运营商扣费',
        amount: -OPERATOR_HIDDEN_CHARGE_AMOUNT,
      },
    ]
  }

  return []
}

export function createRaidRoundNarrative({
  eventId,
  cashDelta,
  cashEvents,
}: RaidRoundNarrativeParams) {
  const amount = formatCurrency(Math.abs(cashDelta))
  const lotteryEvent = cashEvents.find((event) => event.id === 'lottery-jackpot')
  const stockCrashEvent = cashEvents.find((event) => event.id === 'stock-crash')
  const operatorEvent = cashEvents.find(
    (event) => event.id === 'operator-hidden-charge',
  )

  if (lotteryEvent) {
    return pick([
      `路过彩票店随手刮了一张，柜台老板沉默了三秒：中大奖了，本轮净带走${amount}。`,
      `你本来只是想买瓶水，顺手刮开一张彩票，结果直接爆金币，本轮净带走${amount}。`,
      `现实突然给你开了一次补给箱，彩票大奖掉进包里，本轮净带走${amount}。`,
    ])
  }

  if (stockCrashEvent) {
    return pick([
      `A股突然下砸，你的虚拟持仓当场冒烟，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `市场一根绿柱砸下来，屏幕比你的脸还冷，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
      `A股崩盘消息弹出来，包里的钱被现实削了一刀，本轮净变化${formatDeltaCurrency(cashDelta)}。`,
    ])
  }

  if (eventId === 'operator-hidden-charge' && operatorEvent) {
    return pick([
      `运营商先从你口袋里摸走${formatCurrency(Math.abs(operatorEvent.amount))}，但你转头接住一笔意外补给，本轮净带走${amount}。`,
      `账单扣费弹出来的一瞬间，红字很刺眼；好在路上又捡回一点零碎，本轮净带走${amount}。`,
      `这局先被运营商抽了一刀，随后靠随机掉落回了点血，本轮净带走${amount}。`,
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
