type ChipTone =
  | 'chip-danger'
  | 'chip-shame'
  | 'chip-observe'
  | 'chip-structure'
  | 'chip-trust'
  | 'chip-create'
  | 'chip-recover'
  | 'chip-withdraw'
  | 'chip-neutral'

const toneKeywordMap: Array<{ tone: ChipTone; keywords: string[] }> = [
  {
    tone: 'chip-danger',
    keywords: [
      '反击',
      '竞争',
      '攻击',
      '敌意',
      '压迫',
      '坑',
      '愤怒',
      '不怀好意',
      '直接指出',
      '投诉',
      '夺回',
      '开战',
      '威胁',
      '警惕',
      '翻车',
      '爆炸',
    ],
  },
  {
    tone: 'chip-shame',
    keywords: [
      '自疑',
      '羞耻',
      '否定',
      '不配',
      '质量问题',
      '廉价',
      '丢脸',
      '没用',
      '拖后腿',
      '尴尬',
      '我又被坑',
      '肯定我也有问题',
    ],
  },
  {
    tone: 'chip-recover',
    keywords: [
      '休息',
      '修复',
      '稳定',
      '睡',
      '低功耗',
      '身体',
      '回血',
      '恢复',
      '断电',
      '慢一点',
      '维修',
      '停火',
      '停战',
      '缓和',
      '回神',
      '普通疲惫回血',
    ],
  },
  {
    tone: 'chip-trust',
    keywords: [
      '善意',
      '信任',
      '关心',
      '看见',
      '接住',
      '帮助',
      '温柔',
      '记得',
      '反向投喂',
      '被看见',
      '被听见',
      '认可',
      '旧夸奖',
      '下次再来',
      '随口一句',
    ],
  },
  {
    tone: 'chip-create',
    keywords: [
      '创作',
      '素材',
      '作品',
      '灵感',
      '表达',
      '继续',
      '好玩',
      '做东西',
      '火苗',
      '手痒',
      '创造入口',
      '支线',
      '任务提示',
      '事件卡',
      '喜剧',
      '荒诞',
    ],
  },
  {
    tone: 'chip-structure',
    keywords: [
      '规则',
      '流程',
      '标准',
      '整理',
      '对齐',
      '计划',
      '系统',
      '结构',
      '需求',
      '工作流程',
      '查账单',
      '记录',
      '可见',
      '复盘',
      '边界',
      '讲清楚',
    ],
  },
  {
    tone: 'chip-observe',
    keywords: [
      '观察',
      '局势',
      '关系',
      '权力',
      '语气',
      '信号',
      '上下文',
      '读懂',
      '对方动机',
      '隐含',
      '荒诞',
      '空气',
      '刷新',
      '证据',
      '复杂',
      '看见',
      '听见',
      '翻车',
    ],
  },
  {
    tone: 'chip-withdraw',
    keywords: [
      '撤退',
      '回避',
      '保持距离',
      '暂停',
      '退出',
      '匿了',
      '拖一会',
      '先退出',
      '收起来',
      '划走',
      '不看',
      '离开',
    ],
  },
]

export function getLabelToneClass(label?: string): string {
  if (!label) {
    return 'chip-neutral'
  }

  const normalizedLabel = label.trim()

  if (!normalizedLabel) {
    return 'chip-neutral'
  }

  return (
    toneKeywordMap.find(({ keywords }) =>
      keywords.some((keyword) => normalizedLabel.includes(keyword)),
    )?.tone ?? 'chip-neutral'
  )
}
