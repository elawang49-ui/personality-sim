import type { StartProfileTag } from '../engine/types'

export const startTags: StartProfileTag[] = [
  {
    id: 'reads-the-room',
    title: '读空气达人',
    description: '别人随口一说，你就开始复盘。',
    traitDelta: {
      sensitivity: 10,
      arousal: 4,
      trust: -3,
    },
    pathDelta: {
      observer: 4,
    },
  },
  {
    id: 'needs-clear-rules',
    title: '规则裁定',
    description: '忍不住想把边界、流程和责任重新标出来。',
    traitDelta: {
      orderNeed: 12,
      stability: 3,
      anger: 2,
    },
    pathDelta: {
      strategist: 5,
    },
  },
  {
    id: 'structure-seeker',
    title: '顶级架构师',
    description: '不太相信“偶然”和“巧合”，更想知道事情背后是谁在受益。',
    traitDelta: {
      abstraction: 12,
      trust: -4,
      arousal: 2,
    },
    pathDelta: {
      observer: 5,
      strategist: 2,
    },
  },
  {
    id: 'explains-for-others',
    title: '善解人意',
    description: '每个人都有自己的理由。',
    traitDelta: {
      empathy: 10,
      anger: -4,
      selfEsteem: -2,
    },
    pathDelta: {
      pleaser: 5,
    },
  },
  {
    id: 'pushes-back-when-hurt',
    title: '荆棘之甲',
    description: '叔可忍，婶不能忍。有仇就报。',
    traitDelta: {
      aggression: 12,
      anger: 6,
      actionPower: 4,
    },
    pathDelta: {
      avenger: 6,
    },
  },
  {
    id: 'self-doubt-first',
    title: '自我反思',
    description: '大家都夸你很会反思',
    traitDelta: {
      selfEsteem: -10,
      shame: 8,
      sensitivity: 4,
    },
    pathDelta: {
      pleaser: 4,
      avoider: 3,
    },
  },
  {
    id: 'turns-into-projects',
    title: '产品经理',
    description: '整理成文档、计划、作品或下一步。',
    traitDelta: {
      actionPower: 8,
      abstraction: 4,
      pleasure: 3,
    },
    pathDelta: {
      creator: 7,
      strategist: 2,
    },
  },
  {
    id: 'precious-energy',
    title: '低精力人',
    description: '你很清楚自己不是无限电量，能撑过今天就算一天吧。',
    traitDelta: {
      stability: 4,
      arousal: -5,
      actionPower: -2,
      trust: -2,
    },
    pathDelta: {
      avoider: 6,
      observer: 2,
    },
  },
]
