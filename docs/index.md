---
layout: home

hero:
  name: wx-link
  text: iLink Stateless Core SDK 文档
  tagline: 聚焦扫码登录、消息轮询、发送消息和媒体处理的独立文档站。
  actions:
    - theme: brand
      text: 快速接入
      link: /guide/quickstart
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: Guide 优先
    details: 从扫码登录、状态保存到轮询回复，先把接入链路走通。
  - title: API 可检索
    details: 登录、消息、媒体和底层协议按能力拆分，便于快速查参数和返回值。
  - title: Stateless 约束明确
    details: 文档强调 token、cursor、会话和聊天记录需要由业务侧自己保存和管理。
---

## 文档结构

- [Guide 总览](/guide/)
- [API Reference 首页](/api/)

## 安装

```bash
npm i wx-link
```

如果你要继续看最短接入链路，直接去：

- [快速接入](/guide/quickstart)

## 推荐阅读顺序

1. [快速接入](/guide/quickstart)
2. [状态与关键字段](/guide/state-and-fields)
3. [登录流程](/guide/login-flow)
4. [轮询与回复](/guide/polling-and-reply)
5. [媒体流程](/guide/media-flow)

## 常用入口

- [登录 API](/api/login)
- [收发消息 API](/api/messaging)
- [媒体 API](/api/media)
- [底层协议 API](/api/protocol)
- [参考索引](/api/reference)
