# Guide

这一组文档聚焦 `wx-link` 的接入流程、状态保存和关键字段来源。

## 演示 Demo

- [wx-link-web-demo](https://github.com/yhsrzbg/wx-link-web-demo)
  一个基于 `wx-link` 的示例项目，适合拿来参考微信机器人、消息桥接和基础接入方式。

## 推荐先读

- [快速接入](./quickstart.md)
  从扫码登录到收发消息的最短路径
- [状态与关键字段](./state-and-fields.md)
  解释 `token`、`baseUrl`、`cursor`、`contextToken` 等字段的来源和保存建议

## 进阶 Guide

- [登录流程](./login-flow.md)
  解释二维码登录会话、状态变化和登录结果生命周期
- [轮询与回复](./polling-and-reply.md)
  解释如何保存轮询游标、如何从入站消息构造回复
- [媒体流程](./media-flow.md)
  解释上传、下载、解密和媒体相关字段来源

## 下一步

当你已经理解整体链路后，继续看：

- [API Reference 首页](../api/index.md)
