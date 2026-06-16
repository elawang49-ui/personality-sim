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
npm run build     # tsc + vite build → dist/
npm run lint      # ESLint
```

无测试脚本。

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

### 22 维角色状态（0–100）

- **核心特质**: sensitivity, selfEsteem, aggression, abstraction, orderNeed, empathy, stability
- **情绪**: pleasure, arousal, anger, shame, trust, actionPower
- **人格路径**: creator, strategist, pleaser, observer, avenger, avoider, caregiver, judge

### 关键 Engine 文件

- `eventDirector.ts` — 评分算法选下一事件（压力推断、导演标签、加权随机）
- `attention.ts` — 基于特质阈值的注意力钩子高亮与揭示
- `pathUpdate.ts` — 完整轮次后的协同增量（阈值 × 关键词匹配）
- `report.ts` — 从最终状态和完成事件生成报告，8 路径 × 4 变体矩阵

### Services 适配器选择

`index.ts` 自动选择：有 Supabase 环境变量 → Supabase；dev 模式 → localStorage mock；生产无配置 → 抛异常。

### Supabase

迁移在 `supabase/migrations/`。四张表：`test_sessions`、`test_answers`、`test_results`、`share_events`。RLS 限制用户只能访问自己的数据，公开结果通过 `get_public_test_result` RPC（SECURITY DEFINER），分享事件通过 `track_share_event` RPC。
