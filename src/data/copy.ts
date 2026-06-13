import type { Stage, StateKey } from '../engine/types'

export const copy = {
  titlePage: {
    eyebrow: '现实敲打人格小剧场',
    title: '别再 MBTI 了！',
    subtitle: '摸爬滚打模拟器',
    description:
      '生活你看扁我，我只会扁扁地走开',
    startButton: '开始挨打',
    continueButton: '继续上次挨打',
    restartButton: '我要验牌',
  },

  startProfile: {
    eyebrow: '开局「底色」',
    title: '选择你进入游戏前的「底色」',
    description:
      '“后来我才知道，有些东西一直如影随形。”',
    selectedCountPrefix: '已选择',
    selectedEmpty: '还没有选择底色',
    summaryTitle: '你的开局「底色」',
    confirmButton: '带着这些「底色」进入',
    maxSelectionWarning: '最多只能带3个「底色」进入现实。',
    minSelectionWarning: '至少选择1个「底色」。',
  },

  eventPanel: {
    appEyebrow: 'Personality Sim',
    imageAltSuffix: '插图',
    stageTitles: {
      eventIntro: '事件发生',
      firstReaction: '你的第一反应是？',
      attentionReveal: '注意力浮现',
      label: '这事在你心里算什么？',
      response: '你打算怎么处理？',
      attribution: '它后来变成了什么？',
      summary: '本轮沉淀',
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
    reactionTraceDetails: '展开看看',
    deltaTitles: {
      emotion: '情绪波动',
      trait: '人格倾向',
      path: '长期路径',
    },
    roundTraceTitle: '本轮沉淀',
    reactionSentences: {
      anger: '你将此事记作不公平。火气上来了，判断也变得更锋利。',
      shame:
        '你先把矛头转向了自己。场面还没定性，心里已经开始给自己扣分。',
      avoider: '你往后退了一些，至少要避免自我消耗。',
      strategist: '你开始建立边界：哪里要问清，哪里不能靠自己瞎猜。',
      observer: '表面云淡风轻，心里已经开始记账了。',
      fallback: '你只是默默改变了自己接下来要做的。',
    },
    roundTrace: {
      emotionPrefix: '情绪',
      pathPrefix: '路径',
      noEmotion: '没有明显起伏',
      noPath: '还没有明显加深',
      suffix: '它没有凭空消失，而是被你放进了下一次判断里。',
    },
  },

  attentionReveal: {
    eyebrow: 'Attention reveal',
    title: '你嘴上没说，但你的注意力已经落在了这里：',
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
    sensitivity: '敏感',
    selfEsteem: '自尊',
    aggression: '攻击',
    abstraction: '抽象',
    orderNeed: '秩序',
    empathy: '共情',
    stability: '稳定',
    pleasure: '愉悦',
    arousal: '唤醒',
    anger: '愤怒',
    shame: '羞耻',
    trust: '信任',
    actionPower: '行动力',
    creator: '创造者',
    strategist: '军师',
    pleaser: '善人',
    observer: '乐子人',
    avenger: '活阎王',
    avoider: '隐士',
    caregiver: '妈妈',
    judge: '锐评家',
  } satisfies Record<StateKey, string>,

  shortStateLabels: {
    sensitivity: '敏感',
    selfEsteem: '自尊',
    aggression: '攻击',
    abstraction: '抽象',
    orderNeed: '秩序',
    empathy: '共情',
    stability: '稳定',
    pleasure: '愉悦',
    arousal: '唤醒',
    anger: '怒气',
    shame: '羞耻',
    trust: '信任',
    actionPower: '行动力',
    creator: '创造者',
    strategist: '军师',
    pleaser: '善人',
    observer: '乐子人',
    avenger: '活阎王',
    avoider: '隐士',
    caregiver: '妈妈',
    judge: '锐评家',
  } satisfies Record<StateKey, string>,

  reportPage: {
    eyebrow: '最终结算',
    topPathEyebrow: 'Long-term paths',
    topPathTitle: '长期路径Top3',
    attentionCardTitle: '注意力集中',
    attentionTypeTitle: '注意力类型',
    attentionContentTitle: '注意力内容',
    choiceCardTitle: '选择习惯',
    frequentLabelsTitle: '最常标注',
    frequentActionsTitle: '最常回应',
    frequentAttributionsTitle: '最常归因',
    copyLinkButton: '复制结果链接',
    generatePosterButton: '生成分享图',
    generatingPosterButton: '正在生成分享图…',
    restartButton: '重新开始',
  },

  resultRoute: {
    loading: '正在读取这份人格报告…',
    notFoundTitle: '这份报告没有找到',
    notFoundBody: '链接可能不完整，或者这份报告来自另一台设备。',
    loadErrorTitle: '报告暂时读取失败',
    loadErrorBody: '请稍后刷新页面重试。你的链接没有发生变化。',
    backButton: '返回首页',
    copied: '链接已复制',
    shareError: '暂时无法复制，请从地址栏复制链接',
    posterSaved: '分享图已生成并开始下载',
    posterError: '分享图生成失败，请稍后重试',
    shareTitle: '我的摸爬滚打人格报告',
    shareText: '我测了一下：现实是怎么把我敲打成现在这样的……',
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
        '你擅长把一地鸡毛捡起来，硬要说它能够拼成一片星空。',
      observer:
      '你不是冷淡，只是太早学会了察言观色。',
      strategist:
        '被现实坑过几次以后，开始随身携带流程图、备选方案和撤退路线。',
      pleaser:
        '你不是天生好说话，只是太过熟练地把自己的需求后置。',
      avenger:
        '你的愤怒不是凭空出现的，它们大部分都是从前没被接住的委屈。',
      avoider:
        '你的电量和温柔都很贵，所以你开始认真挑选谁值得靠近。',
      caregiver:
        '你习惯了做所有人的屋檐，但偶尔也需要有人替你遮一会儿雨。',
      judge:
        '见不得规则被扭曲，还要假装无事发生',
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
  return '你的路径：'
}
