import type { CharacterState, StateDelta } from './types'
import { stateKeys } from './types'

const STORAGE_KEY = 'personality-sim.character-state'
const PROFILE_READY_KEY = 'personality-sim.start-profile-ready'

export const initialState: CharacterState = {
  sensitivity: 50,
  selfEsteem: 50,
  aggression: 20,
  abstraction: 35,
  orderNeed: 45,
  empathy: 55,
  stability: 50,
  pleasure: 45,
  arousal: 35,
  anger: 15,
  shame: 15,
  trust: 45,
  actionPower: 45,
  creator: 10,
  strategist: 10,
  pleaser: 10,
  observer: 10,
  avenger: 5,
  avoider: 10,
  caregiver: 10,
  judge: 10,
}

export function applyDelta(
  state: CharacterState,
  delta: StateDelta,
): CharacterState {
  const next = { ...state }

  for (const key of stateKeys) {
    const change = delta[key] ?? 0
    next[key] = clamp(next[key] + change)
  }

  return next
}

export function loadState(): CharacterState {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return initialState
  }

  try {
    const parsed = JSON.parse(saved) as Partial<CharacterState>
    return stateKeys.reduce<CharacterState>(
      (state, key) => ({
        ...state,
        [key]: toNumber(parsed[key], initialState[key]),
      }),
      { ...initialState },
    )
  } catch {
    return initialState
  }
}

export function saveState(state: CharacterState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetState() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(PROFILE_READY_KEY)
  return initialState
}

export function loadStartProfileReady() {
  return window.localStorage.getItem(PROFILE_READY_KEY) === 'true'
}

export function saveStartProfileReady() {
  window.localStorage.setItem(PROFILE_READY_KEY, 'true')
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}

function toNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
