# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- 用中文回复。
- 先读再改，不猜测。改动最小化，不动无关代码。
- `.env.local` 有密钥，永远不提交、不读取内容、不在对话中展示。
- 不要提交 `dist/`、`node_modules/`、`.DS_Store`。
- Token 省着用：不逐行解释改动，不主动列出文件树，一次说清楚不反复确认。

## Commands

```
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build → dist/
npm run lint      # ESLint
npm run preview   # Vite preview (serve dist/)
```

无测试脚本。项目使用 npm（`package-lock.json` 存在）。

## Environment Variables

```
VITE_SUPABASE_URL            # Supabase 项目 URL（生产必需）
VITE_SUPABASE_PUBLISHABLE_KEY  # Supabase anon/publishable key（生产必需）
# 兼容旧名：VITE_SUPABASE_ANON_KEY
```

适配器自动选择逻辑（`services/testData/index.ts`）：

```
有 VITE_SUPABASE_URL + key → SupabaseTestDataAdapter
无变量但 import.meta.env.DEV → MockTestDataAdapter（localStorage）
无变量且非 DEV → adapter = null → throw TestDataConfigurationError
```

生产部署前必须配置两个环境变量，否则用户完全无法开始测试。

## Architecture

**Vite + React 19 + TypeScript**，中文人格模拟器。用户选初始标签 → 经历 10 个社交场景，每场景做多层选择 → 生成人格报告。

### 分层

| 层 | 目录 | 职责 |
|---|---|---|
| Engine | `src/engine/` | 纯 TS，零 React。22 维角色状态、事件选择算法、注意力揭示、路径更新、报告生成 |
| Data | `src/data/` | 静态内容：32 人格类型、事件 JSON、中文文案、头像映射 |
| Services | `src/services/testData/` | 适配器模式：Supabase（匿名 auth + RLS）或 localStorage mock，dev 自动降级 |
| UI | `src/components/` + `App.tsx` | 状态机驱动的测试流程 |

### 状态机流程

```
TitlePage → StartProfile → [EventIntro → firstReaction → attentionReveal → label → response → attribution → summary] × 10 → report → ResultPage
```

`App.tsx` 管理全部阶段。路由仅客户端：`pushState` + `popstate`，`/result/:resultId` 查看结果。

## 当前游戏设计草案：搜打撤

当前版本正在从“人格测试 10 轮”转向轻量“搜打撤”骨架。设计原则是：**人格引擎继续作为底层模拟，玩家前台只看到行动状态、压力、金额和撤离决策**。

### 核心体验

玩家带着 1–3 个开局底色进入一局搜打撤。每个现实事件是一处遭遇点，玩家依次完成：

1. 第一判断：先做即时反应。
2. 搜点发现：揭示注意力落点。
3. 标记威胁：判断这件事在心里算什么。
4. 选择打法：决定如何回应。
5. 装进背包：让这次经历变成长期路径的一部分。
6. 本轮结算：获得本轮收益，并选择继续或撤离。

目标不是“测出人格”，而是：进去搜，遇事打，见好就撤。现实事件只是这一套搜打撤循环的包装。

### 玩家侧核心数值

前台不再展示 22 个原始人格字段，而展示玩家能理解的四项：

| 字段 | 含义 | 来源 |
|---|---|---|
| 状态 | 玩家还能不能撑住 | `stability`、`selfEsteem`、`actionPower` 加成；`arousal`、`shame`、`anger` 扣分 |
| 压力 | 局势压迫感和失控风险 | `arousal`、`shame`、`anger`、`aggression` 加压；`stability`、`selfEsteem` 降压 |
| 带出金额 | 当前撤离可带走的游戏化收益 | 开局 `¥1,000` + 已完成轮次收益累计 |
| 本轮收益 | 最近一轮新增收益 | 本轮前后 state delta 推导，最低 `¥30`，最高 `¥600` |

这些字段由 `src/engine/raid.ts` 生成。`raid.ts` 只做玩家侧映射，不修改人格引擎。

### 状态分级

`状态` 是 0–100：

- 80–100：稳定
- 60–79：可控
- 40–59：受压
- 20–39：危险
- 0–19：崩盘边缘

当前公式：

```
60
+ stability * 0.4
+ selfEsteem * 0.25
+ actionPower * 0.15
- arousal * 0.25
- shame * 0.3
- anger * 0.15
```

最后 clamp 到 0–100。

### 压力分级

`压力` 是 0–100：

- 0–25：低压
- 26–50：紧张
- 51–75：高压
- 76–100：濒临爆炸

当前公式：

```
20
+ arousal * 0.35
+ shame * 0.25
+ anger * 0.25
+ aggression * 0.15
- stability * 0.2
- selfEsteem * 0.1
```

最后 clamp 到 0–100。

### 金额与收益

金额只是游戏化表达，不代表真实金钱。

- 开局金额：`¥1,000`
- 总金额：`¥1,000 + 所有已完成轮次收益累计`
- 单轮收益：最低 `¥30`，最高 `¥600`

当前收益主要看本轮前后 delta：

- 基础收益：`¥100`
- 人格路径正增长会加收益
- `actionPower`、`strategist`、`creator` 增长会加收益
- 边界相关增长（`strategist`、`judge`、`avoider`）会加收益
- 状态较低会打折
- 压力过高会打折
- 高压下状态仍能撑住，会给少量风险奖励

金额评价：

- `¥0–999`：亏损边缘
- `¥1,000–1,999`：小赚
- `¥2,000–3,499`：赚到了
- `¥3,500+`：高价值撤离

### 撤离流程

每轮 `summary` 阶段展示居中结算框，包含结算图片、选择回顾、本轮沉淀、按钮：

- `继续`：进入下一轮事件
- `撤离结算`：提前进入 report，并设置 `hasExtracted = true`

不足 10 轮也可以撤离。打满 10 轮时自动进入 report，视为“完成全部轮次”。

报告顶部显示轻量撤离信息：

- 撤离状态：`已撤离` / `完成全部轮次`
- 带出金额 / 最终金额
- 撤离评价

报告正文、人格类型、Top3 路径和原报告算法暂不重写。

### 现阶段实现边界

本阶段是机制骨架，不做复杂背包、战斗、物资表、事件大重写或视觉重设计。不要把 22 维调参字段重新暴露给玩家。

相关文件：

- `src/engine/raid.ts`：玩家侧状态 / 压力 / 金额映射
- `src/App.tsx`：raid 金额状态、单轮收益累计、提前撤离
- `src/components/StatePanel.tsx`：行动面板
- `src/components/EventPanel.tsx`：summary 结算框和撤离按钮
- `src/components/PersonaReport.tsx`：报告顶部撤离信息
- `src/components/StartProfile.tsx`：开局不展示原始人格数值

### 三阶段 delta 累加顺序（关键）

每轮选择的 state delta 按固定顺序叠加，后者的 delta 覆盖同键的前者：

1. **firstReaction** → `applyDelta(emotionDelta + traitDelta + pathDelta)`  （三合一传入）
2. **label** → `applyDelta(moodDelta)`  （仅影响情绪）
3. **response** → `applyDelta(moodDelta)`  （仅影响情绪）
4. **attribution** → `calculatePathUpdate()` → `applyDelta(emotionDelta + traitDelta + pathDelta)`  （含路径增量）

`applyDelta` 对每个 stateKey 做 `clamp(val + delta, 0, 100)`。 attribution 的 pathDelta 初始来自 `selectedAttribution.pathDelta`，然后 `pathUpdate.ts` 根据角色状态阈值和关键词匹配再叠加。

### 22 维角色状态（0–100）

- **核心特质**: sensitivity, selfEsteem, aggression, abstraction, orderNeed, empathy, stability
- **情绪**: pleasure, arousal, anger, shame, trust, actionPower
- **人格路径**: creator, strategist, pleaser, observer, avenger, avoider, caregiver, judge

### 关键 Engine 文件

- `state.ts` — `initialState`、`applyDelta`（clamp 0-100）、`loadState`/`saveState`（localStorage，含 JSON 损坏 fallback）
- `eventDirector.ts` — `selectNextEvent`：过滤 inactive/backup/已用 → 评分 → 取 Top5 → `weightedPick`。注意：`??` 不防御 NaN，`weightedPick` 在 NaN 时静默返回首个候选
- `attention.ts` — `getRevealedAttentionHooks`：linkedScore(6) + traitScore(0-3 per trait) + weight + 位置衰减，取 Top3
- `pathUpdate.ts` — `calculatePathUpdate`：根据 sensitivity/abstraction/selfEsteem 阈值 + 关键词匹配，叠加 emotionDelta/traitDelta/pathDelta
- `report.ts` — `buildPersonaReport`：Top3 路径排序 → `selectPersonaType`（8路径 × 4变体 = 32种人格）
- `avatar.ts` — `buildAvatarPrompt`：为 AI 生图准备的 prompt 字符串（当前未在 UI 中使用）

### 事件数据结构（events.json）

每个 `SimEvent` 的字段层级：

```
{
  id, title, text, image?, meta?, inactive?, backup?,
  attentionHooks: [{ id, label, description, categories: [], text, type, traitBias: [] }],
  firstReactions: [{ id, text, tone, linkedAttentionHookIds: [], emotionDelta, traitDelta, pathDelta? }],
  tags:        [{ id, label, description, moodDelta }],
  behaviors:   [{ id, label, description, moodDelta }],
  attributions:[{ id, label, description, pathDelta }]
}
```

- `meta.directorTags` 合法值：`trustRepair | recover | shameSafe | lowArousal | lightCreate`
- `meta.pressure`：`low | medium | high`
- `meta.weight`：数字，默认 10
- `attribution.pathDelta` 可修改任意 22 维状态键（不只是路径键）
- 当前 22 个活跃事件，足够支撑 10 轮不重复

### 32 种人格类型

8 路径 × 4 变体（`personaTypes.ts`）：
- 变体：`internal`（内耗型）、`armor`（铠甲型）、`burst`（爆裂型）、`review`（复盘型）
- `selectVariant` 按四维度得分最高者决定：internal = shame+sensitivity+(100-selfEsteem)；armor = orderNeed+stability+(100-trust)；burst = anger+arousal+aggression+actionPower；review = abstraction+observer+strategist+judge

### Services 适配器选择

`services/testData/index.ts` 自动选择，详见上方环境变量节。

### Supabase

迁移在 `supabase/migrations/`。四张表：`test_sessions`、`test_answers`、`test_results`、`share_events`。

- RLS：authenticated 用户只能访问自己 `owner_id` 的数据
- 公开结果：`get_public_test_result` RPC（SECURITY DEFINER，任何人可查任意 result_id）
- 分享事件：`track_share_event` RPC（SECURITY DEFINER，share_events 表对 anon/authenticated revoke all）
- 匿名登录：`ensureAnonymousUser` → `getSession` → 无则 `signInAnonymously`，每次操作前确保有 session
- `trackAnswer` 使用 `.catch()` 静默吞错，不影响用户体验但可能导致答案未记录

### 结果持久化与路由

- 结果通过 `crypto.randomUUID()` 生成 `resultId`
- 内存中 `pendingResult` 存完整报告，`persistResult` 异步写入 Supabase/mock
- `ResultPage` 通过 `getTestResult(resultId)` 从 storage 加载，Supabase 失败时显示 not-found
- Vercel `vercel.json` 配置 rewrite：`/result/:resultId` → `/index.html`（SPA fallback）

### 已知数据问题（来自 QA 报告）

详见 `docs/TEST_REPORT.md`：
- P1-1：13 个事件的 `directorTags` 含 31 个无效值，导演加权规则失效
- P1-2：生产环境无 Supabase 配置时完全阻断
- P2-1：`weightedPick` 的 NaN 传播未防御
- P2-3：`isUuid` 正则仅接受 v1-v5

## 快速参考

| 想做什么 | 去哪里看 |
|---|---|
| 理解完整用户流程 | `App.tsx` 的 `TestExperience` 组件 |
| 改事件数据 | `src/data/events.json` + `src/engine/types.ts` 的 `SimEvent` 类型 |
| 改人格类型 | `src/data/personaTypes.ts` + `src/data/avatarMap.ts` |
| 改评分算法 | `src/engine/eventDirector.ts`（勿动数据文件） |
| 改 UI 文案 | `src/data/copy.ts` |
| 改 CSS | `src/App.css`（主体）+ `src/index.css`（CSS 变量） |
| 改保存逻辑 | `src/services/testData/index.ts`（适配器选择）+ `supabaseAdapter.ts` / `mockAdapter.ts` |
| 改分享海报 | `src/components/ResultPoster.tsx` + `App.tsx` 的 `generatePoster` |
