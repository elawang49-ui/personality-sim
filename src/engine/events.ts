import rawEvents from '../data/events.json'
import type { SimEvent } from './types'

export const events = rawEvents as SimEvent[]

export function getEvent(index: number) {
  return events[index % events.length]
}
