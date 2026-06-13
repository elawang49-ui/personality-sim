import type { Stage, StateKey } from '../engine/types'

export const copy = {
  titlePage: {
    eyebrow: '现实敲打人格小剧场',
    title: '别再 MBTI 了！',
    subtitle: '摸爬滚打模拟器',
    description:
      '生活你看扁我，我只会扁扁地走开',
    startButton: '别打我！',
    continueButton: '继续上次敲打',
    restartButton: '我要验牌',
  },

  startProfile: {
    eyebrow: '开局天赋',
    title: '选择你进入游戏前的「底色」',
    description:
      '“后来我才知道，有些东西一直如影随影。”',
    selectedCountPrefix: '已选择',
    selectedEmpty: '还没有选择底色',
    summaryTitle: '你的开局状态',
    confirmButton: '带着这些「底色」进入',
    maxSelectionWarning: '最多只能带3个「底色」进入现实。',
    minSelectionWarning: '至少选择1个「底色」。',
  },

  eventPanel: {
    appEyebrow: 'Personality Sim',
    imageAltSuffix: '插图',
    stageTitles: {
      eventIntro: '事件正文',
      firstReaction: '你第一反应是？',
      attentionReveal: '注意力浮现',
      label: '你把这件事理解成了什么？',
      response: '你准备怎么回应？',
      attribution: '最后，它成了记忆中的哪一部分？',
      summary: '总结',
      report: '最终结算',
    } satisfies Record<Stage, string>,
    choiceLabels: {
      firstReaction: '第一反应',
      eventTag: '事件标注',
      behavior: '行为回应',
      attribution: '人格归因',
    },
    attentionContinueButton: '确认',
    nextEventButton: '进入下一事件',
    reactionTraceTitle: '这个反应留下了一点痕迹',
    reactionTraceDetails: '查看变化',
    deltaTitles: {
      emotion: '情绪波动',
      trait: '人格倾向',
      path: '长期路径',
    },
    roundTraceTitle: '本轮沉淀',
    reactionSentences: {
      anger: '你把此事记作不公平。火气上来了，判断也变得更锋利。',
      shame:
        '你先把矛头转向了自己。场面还没定性，心里已经开始扣分。',
      avoider: '你往后退了一点，至少要避免自我消耗。',
      strategist: '你开始建立边界：哪里要问清，哪里不能再靠猜。',
      observer: '表面云淡风轻，实际上已经开始记账了。',
      fallback: '你只是默默改变了自己接下来要做的。',
    },
    roundTrace: {
      emotionPrefix: '情绪',
      pathPrefix: '路径',
      noEmotion: '没有明显起伏',
      noPath: '还没有明显加深',
      suffix: '记忆不会凭空消失，它已经被你放进了下一次判断里。',
    },
  },

  attentionReveal: {
    eyebrow: 'Attention reveal',
    title: '你没有明说，但你的注意力已经落在了这里：',
  },

  statePanel: {
    eyebrow: '角色状态',
    title: '当前数值',
    resetButton: '重置',
    groups: [
      {
        title: '核心倾向',
        keys: [
          'sensitivity',
          'selfEsteem',
          'aggression',
          'abstraction',
          'orderNeed',
          'empathy',
          'stability',
        ],
      },
      {
        title: '当前情绪',
        keys: ['pleasure', 'arousal', 'anger', 'shame', 'trust', 'actionPower'],
      },
      {
        title: '人格路径',
        keys: [
          'creator',
          'strategist',
          'pleaser',
          'observer',
          'avenger',
          'avoider',
          'caregiver',
          'judge',
        ],
      },
    ] satisfies Array<{ title: string; keys: StateKey[] }>,
  },

  stateLabels: {
    sensitivity: '敏感度',
    selfEsteem: '自尊',
    aggression: '攻击性',
    abstraction: '抽象化',
    orderNeed: '秩序需求',
    empathy: '共情',
    stability: '稳定性',
    pleasure: '愉悦',
    arousal: '唤醒',
    anger: '愤怒',
    shame: '羞耻',
    trust: '信任',
    actionPower: '行动力',
    creator: '创造者',
    strategist: '策略者',
    pleaser: '讨好者',
    observer: '观察者',
    avenger: '复仇者',
    avoider: '回避者',
    caregiver: '照料者',
    judge: '审判者',
  } satisfies Record<StateKey, string>,

  shortStateLabels: {
    sensitivity: '敏感',
    selfEsteem: '自尊',
    aggression: '攻击性',
    abstraction: '抽象',
    orderNeed: '秩序需求',
    empathy: '共情',
    stability: '稳定',
    pleasure: '愉悦',
    arousal: '唤醒',
    anger: '怒气',
    shame: '羞耻',
    trust: '信任',
    actionPower: '行动力',
    creator: '创造者',
    strategist: '策略者',
    pleaser: '讨好者',
    observer: '观察者',
    avenger: '复仇者',
    avoider: '回避者',
    caregiver: '照料者',
    judge: '审判者',
  } satisfies Record<StateKey, string>,

  reportPage: {
    eyebrow: '最终结算',
    topPathEyebrow: 'Long-term paths',
    topPathTitle: '长期路径 Top 3',
    attentionCardTitle: '注意力高频',
    attentionTypeTitle: '注意力类型',
    attentionContentTitle: '注意力内容',
    choiceCardTitle: '选择习惯',
    frequentLabelsTitle: '高频标注',
    frequentActionsTitle: '高频回应',
    frequentAttributionsTitle: '高频归因',
    shareButton: '分享结果',
    restartButton: '重新开始',
  },

  resultRoute: {
    loading: '正在读取这份人格报告…',
    notFoundTitle: '这份报告没有找到',
    notFoundBody: '链接可能不完整，或者这份本地 mock 报告来自另一台设备。',
    loadErrorTitle: '报告暂时读取失败',
    loadErrorBody: '请稍后刷新页面重试。你的链接没有发生变化。',
    backButton: '返回首页',
    shared: '分享链接已准备好',
    copied: '链接已复制',
    shareError: '暂时无法复制，请从地址栏复制链接',
    shareTitle: '我的 PSTI 人格报告',
    shareText: '这是我的 PSTI 人格模拟测试结果。',
    saving: '正在生成可分享链接…',
    saveError: '结果保存失败，请重试。当前报告仍保留在本页。',
    retryButton: '重试保存',
  },

  avatarCard: {
    topPathPrefix: 'Top1 路径：',
    altSuffix: 'avatar',
  },

  reportGeneration: {
    fallbackPathSummary: '这条路径还在形成中',
    defaultStrongReading:
      '你不是被现实随便推着走的人，你会先把风向记下来，再决定自己要站在哪里。',
    pathComboFallbacks: {
      first: '观察者',
      second: '策略者',
      third: '创造者',
    },
    strengthPrefix: '你的亮点很明显：',
    warningPrefix: '但这张牌也不全是好话：',
    advicePrefix: '最后的提醒是：',
    strongReadings: {
      creator:
        '把一地碎片捡起来，说它能够拼成一片星空。',
      observer:
        '你不是冷淡，只是太早学会了察言观色。',
      strategist:
        '被现实坑过几次以后，开始随身携带流程图。',
      pleaser:
        '不是天生好说话，只是太过熟练地委屈自己。',
      avenger:
        '每一种情绪，都是你身体里的信使。',
      avoider:
        '电量和温柔都很贵',
      caregiver:
        '习惯了做所有人的屋檐，却忘了自己也需要一个肩膀',
      judge:
        '见不得规则被随手拧弯，还要假装无事发生',
    } satisfies Partial<Record<StateKey, string>>,
    attentionCategoryLabels: {
      tone: '语气',
      'hidden-belittling': '隐含贬低',
      'relationship-change': '关系变化',
      rule: '规则',
      process: '流程',
      responsibility: '责任',
      structure: '结构',
      'power-relation': '权力关系',
      'long-term-signal': '长期信号',
      'other-motive': '对方动机',
      vulnerability: '脆弱',
      hostility: '敌意',
      'attack-signal': '攻击信号',
      literal: '字面含义',
    },
  },

  pathUpdate: {
    summaryText: '“你做的很好，继续。”',
  },
} as const

export function buildPathComboReportText() {
  return '你的路径：先接住第一声响，再开始找出口，最后把剩下的疼痛捏成能用的形状。'
}
