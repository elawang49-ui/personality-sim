const labelToneRules = [
  {
    className: 'chip-danger',
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
      '扣费',
    ],
  },
  {
    className: 'chip-shame',
    keywords: [
      '自疑',
      '羞耻',
      '否定',
      '不配',
      '质量问题',
      '廉价',
      '丢脸',
      '我又被坑',
      '肯定我也有问题',
    ],
  },
  {
    className: 'chip-recover',
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
    ],
  },
  {
    className: 'chip-trust',
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
      '关系不是',
    ],
  },
  {
    className: 'chip-create',
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
    ],
  },
  {
    className: 'chip-structure',
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
    ],
  },
  {
    className: 'chip-observe',
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
    ],
  },
  {
    className: 'chip-withdraw',
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
    ],
  },
] as const

export function getLabelToneClass(label: string): string {
  const normalizedLabel = label.trim()

  if (!normalizedLabel) {
    return 'chip-neutral'
  }

  return (
    labelToneRules.find((rule) =>
      rule.keywords.some((keyword) => normalizedLabel.includes(keyword)),
    )?.className ?? 'chip-neutral'
  )
}
