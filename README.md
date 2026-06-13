# Personality Sim

Vite + React + TypeScript 的 PSTI 早期产品。开发环境默认使用浏览器 mock 数据层；配置后可切换到 Supabase。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/`，入口文件是 `dist/index.html`。

## 数据闭环

前端通过统一 adapter 记录匿名测试过程：

- `test_sessions`：一次测试会话。行数就是测试开始次数，`status` 可观察完成/流失。
- `test_answers`：每个选择阶段一行；`answer_type = 'attribution'` 表示一轮完成。
- `test_results`：最终报告、最终状态和可分享的 `result_id`。行数就是测试完成次数。
- `share_events`：`result_open` 和 `share_click` 两类结果页事件。

`state_summary` 保存本次选择造成的字段变化、前后值和摘要，不保存姓名、手机号、邮箱等个人信息。

## 数据后端

开发环境没有 Supabase 环境变量时自动使用 `localStorage` mock adapter，数据位于：

```text
psti.test-data.v1
```

配置 Supabase 时：

1. 在 Supabase Auth 设置中启用 Anonymous Sign-Ins。
2. 按文件名顺序执行 `supabase/migrations/` 中尚未应用的 migration。若已执行首个建表 migration，还需执行 `20260613000000_reconcile_share_event_rpc.sql`。
3. 复制 `.env.example` 为 `.env.local`，填写：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

旧项目也可使用 `VITE_SUPABASE_ANON_KEY`。不要把 `service_role` key 放进任何 `VITE_` 环境变量。

Supabase adapter 使用匿名 Auth 和 RLS 限制测试写入。公开结果通过 `get_public_test_result` RPC 按 UUID 返回报告字段，不开放结果表的公开遍历。分享埋点通过 `track_share_event` RPC 写入，前端没有 `share_events` 表写权限。

## 本地验证

1. 不配置 `.env.local`，运行 `npm run dev`。
2. 开始测试并完成选择；在 DevTools Application > Local Storage 查看 `psti.test-data.v1`。
3. 完成测试后确认地址变为 `/result/<resultId>`。
4. 刷新结果页，确认报告仍可读取，并检查 `shareEvents` 新增 `result_open`。
5. 点击“分享结果”，确认新增 `share_click`。
6. 打开 `/result/00000000-0000-4000-8000-000000000000`，确认显示友好错误页。

mock 数据只在当前浏览器可用，跨设备分享需要 Supabase。
生产构建缺少 Supabase 配置时，数据操作会明确失败，不会降级到 mock。

## 静态资源

- 所有图片放在 `public/images/`
- 事件图片路径使用 `/images/events/xxx.png`
- 头像图片路径使用 `/images/avatars/xxx.png`
- 构建后这些图片会原样复制到 `dist/images/`

## 部署到 Vercel

1. 打开 Vercel
2. 点击 `Import Git Repository`
3. 选择 `personality-sim` 仓库
4. Framework Preset 选择 `Vite`
5. Build Command 填：`npm run build`
6. Output Directory 填：`dist`
7. 点击 `Deploy`
8. 部署成功后复制 Vercel 生成的链接发给群友

## 部署到 Netlify

- Build command: `npm run build`
- Publish directory: `dist`

## 部署到 Cloudflare Pages

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## 隐私

业务表只保存匿名 UUID、选项 ID、状态变化和报告数据。Supabase 的 `owner_id` 是匿名 Auth 用户 UUID，只用于 RLS，不包含个人资料。
