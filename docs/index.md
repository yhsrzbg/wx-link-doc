---
layout: home

hero:
  name: wx-link
  text: 在微信里接入机器人、Agent 与自动化能力
  tagline: 用一个 stateless core SDK，接管扫码登录、消息轮询、文本/媒体发送，以及入站媒体解析下载，把微信会话接到你自己的 webhook、Agent runtime 或 Claude 能力上。
  actions:
    - theme: brand
      text: 立即安装
      link: /guide/quickstart
    - theme: alt
      text: 使用场景
      link: /#use-cases
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: 封装一个微信 webhook
    details: 用 poll 拉消息，再转成你的 HTTP webhook、队列事件或业务命令，让企业微信机器人能力接进现有后端。
  - title: 做一个能在微信里聊天的 Agent
    details: 把入站消息接到你自己的 LLM 或 Agent runtime，生成结果后再通过 wx-link 发回微信。
  - title: 挂接 Claude Code 或自动化工作流
    details: 用它处理微信收发链路，再把消息路由到 Claude Code SDK、工具调用系统或内部自动化平台。
  - title: 处理媒体消息而不是只发文本
    details: 支持上传图片、视频、文件，也支持解析、下载、解密收到的微信媒体内容。
---

<div class="landing-strip">
  <span>npm i wx-link</span>
  <span>stateless core</span>
  <span>login / poll / send / media</span>
  <span>wechat bot bridge</span>
</div>

## 安装

```bash
npm i wx-link
```

如果你只想先把最小链路跑通，直接看：

- [快速接入](/guide/quickstart)
- [轮询与回复](/guide/polling-and-reply)

## 这个 SDK 能做什么

<div id="use-cases" class="use-case-grid">
  <article class="use-case-card">
    <p class="case-tag">Webhook Bridge</p>
    <h3>把微信消息接进你自己的服务</h3>
    <p>你可以用 <code>wx-link</code> 轮询微信消息，再把它们转成 webhook、事件流或任务队列，接到你已有的客服系统、工单系统或内部机器人平台。</p>
  </article>
  <article class="use-case-card">
    <p class="case-tag">Agent Chat</p>
    <h3>直接在微信里和 Agent 聊天</h3>
    <p>把收到的文本、上下文和媒体交给你自己的 Agent runtime，生成结果后再回发到微信，就能把微信变成一个自然的 Agent 对话入口。</p>
  </article>
  <article class="use-case-card">
    <p class="case-tag">Claude Workflow</p>
    <h3>把 Claude 能力接到微信会话里</h3>
    <p>你可以把 <code>wx-link</code> 作为微信收发层，再把消息路由到 Claude Code SDK、工具调用链或自动化工作流，在微信里触发 Claude 帮你查资料、生成代码或执行任务。</p>
  </article>
  <article class="use-case-card">
    <p class="case-tag">Media Pipeline</p>
    <h3>不仅是聊天，还能处理图片和文件</h3>
    <p>除了文本回复，你还可以上传图片、视频、文件，也可以解析并下载收到的微信媒体，为视觉问答、文件处理和多模态 Agent 留出入口。</p>
  </article>
</div>

## 一条典型链路

<div class="flow-steps">
  <div class="flow-step">
    <strong>1. 登录</strong>
    <span>扫码拿到 <code>botToken</code> 和 <code>baseUrl</code></span>
  </div>
  <div class="flow-step">
    <strong>2. 轮询</strong>
    <span>用 <code>poll(cursor)</code> 持续接收微信消息</span>
  </div>
  <div class="flow-step">
    <strong>3. 路由</strong>
    <span>把消息交给 webhook、Agent 或 Claude 工作流</span>
  </div>
  <div class="flow-step">
    <strong>4. 回复</strong>
    <span>用 <code>sendText</code> / 媒体接口把结果发回微信</span>
  </div>
</div>

## 快速示例

下面这个例子展示的是最小机器人链路：登录、轮询、回复。

```ts
import { loginWithQR, WxLinkClient } from "wx-link";

const login = await loginWithQR({
  onQRCode: (url) => console.log("Scan QR:", url),
});

const client = new WxLinkClient({
  baseUrl: login.baseUrl,
  token: login.botToken,
});

let cursor = "";

while (true) {
  const updates = await client.poll(cursor);
  cursor = updates.nextCursor;

  for (const msg of updates.msgs ?? []) {
    if (!msg.from_user_id) {
      continue;
    }

    await client.sendText({
      toUserId: msg.from_user_id,
      text: "hello",
      contextToken: msg.context_token,
    });
  }
}
```

## 下一步看哪里

<div class="doc-paths">
  <a class="doc-path-card" href="/guide/quickstart">
    <strong>快速接入</strong>
    <span>先把登录、轮询和回复跑通</span>
  </a>
  <a class="doc-path-card" href="/guide/state-and-fields">
    <strong>状态与关键字段</strong>
    <span>理解 token、baseUrl、cursor 和 contextToken</span>
  </a>
  <a class="doc-path-card" href="/guide/polling-and-reply">
    <strong>轮询与回复</strong>
    <span>把消息接进 webhook、Agent 或自定义流程</span>
  </a>
  <a class="doc-path-card" href="/api/">
    <strong>API Reference</strong>
    <span>按能力查接口、参数和返回值</span>
  </a>
</div>

## 适合谁用

- 想把微信变成业务系统消息入口的后端开发者
- 想在微信里接入自定义机器人、客服机器人或 AI 助手的团队
- 想把 Agent、Claude Code SDK 或内部工具链接到微信里的自动化工程师
- 需要处理入站图片、文件、视频，而不仅是发文本消息的多模态场景

## 说明

`wx-link` 依赖 iLink 私有 HTTP / CDN 协议，不是微信官方公开 SDK。它刻意保持 stateless：账号凭证、cursor、会话和聊天记录应由你的应用自己管理。
