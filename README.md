# wx-link-doc

`wx-link-doc` 是 `wx-link` 的独立文档站项目，使用 VitePress 构建。

## 本地开发

```bash
npm install
npm run docs:dev
```

默认文档根目录是 `docs/`。

## 构建静态站点

```bash
npm run docs:build
npm run docs:preview
```

构建产物输出到 `docs/.vitepress/dist/`。

## 文档结构

- `docs/index.md`：站点首页
- `docs/guide/*`：接入流程、状态保存、媒体和消息处理 Guide
- `docs/api/*`：登录、消息、媒体和底层协议 API Reference
- `docs/.vitepress/config.ts`：站点导航、侧边栏和主题配置

`wx-link-doc/docs` 现在是文档网站的主维护目录。
