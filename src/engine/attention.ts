import type { AttentionHook, CharacterState, FirstReactionOption } from './types'

export type HighlightedAttentionHook = AttentionHook & {
  isHighlighted: boolean
  reasons: string[]
}

type AttentionRule = {
  stateKey: keyof CharacterState
  threshold: number
  categories: string[]
  reason: string
}

const rules: AttentionRule[] = [
  {
    stateKey: 'sensitivity',
    threshold: 50,
    categories: ['tone', 'hidden-belittling', 'relationship-change'],
    reason: '敏感度高',
  },
  {
    stateKey: 'orderNeed',
    threshold: 50,
    categories: ['rule', 'process', 'responsibility'],
    reason: '秩序需求高',
  },
  {
    stateKey: 'abstraction',
    threshold: 50,
    categories: ['structure', 'power-relation', 'long-term-signal'],
    reason: '抽象化高',
  },
  {
    stateKey: 'empathy',
    threshold: 50,
    categories: ['other-motive', 'vulnerability'],
    reason: '共情高',
  },
  {
    stateKey: 'aggression',
    threshold: 50,
    categories: ['hostility', 'attack-signal'],
    reason: '攻击性高',
  },
]

export function getHighlightedAttentionHooks(
  characterState: CharacterState,
  attentionHooks: AttentionHook[],
): HighlightedAttentionHook[] {
  return attentionHooks.map((hook) => {
    const reasons = rules
      .filter(
        (rule) =>
          characterState[rule.stateKey] >= rule.threshold &&
          hook.categories.some((category) => rule.categories.includes(category)),
      )
      .map((rule) => rule.reason)

    return {
      ...hook,
      isHighlighted: reasons.length > 0,
      reasons,
    }
  })
}

export function getRevealedAttentionHooks(
  characterState: CharacterState,
  attentionHooks: AttentionHook[],
  firstReaction: FirstReactionOption,
) {
  return attentionHooks
    .map((hook, index) => ({
      hook,
      score:
        linkedScore(hook, firstReaction) +
        traitScore(characterState, hook) +
        (hook.weight ?? 1) +
        (attentionHooks.length - index) * 0.01,
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map((item) => item.hook)
}

function linkedScore(hook: AttentionHook, firstReaction: FirstReactionOption) {
  return firstReaction.linkedAttentionHookIds.includes(hook.id) ? 6 : 0
}

function traitScore(characterState: CharacterState, hook: AttentionHook) {
  return hook.traitBias.reduce((score, key) => {
    const value = characterState[key]
    if (value >= 70) {
      return score + 3
    }

    if (value >= 50) {
      return score + 2
    }

    if (value >= 40) {
      return score + 1
    }

    return score
  }, 0)
}
