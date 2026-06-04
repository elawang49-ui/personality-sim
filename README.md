# Personality Sim

纯静态 Vite + React + TypeScript demo，不接 API，不需要服务器。

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

## 注意

这是一个浏览器端纯静态项目，角色状态保存在浏览器 `localStorage` 中。
