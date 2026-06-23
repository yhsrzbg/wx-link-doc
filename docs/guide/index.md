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

## 让 LLM 使用 wx-link

如果你准备让 LLM 帮你设计或编写 `wx-link` 接入代码，不建议只把文档首页地址发给它。部分 LLM 只读取用户明确提供的页面，不会自动寻找站点中的 `llms.txt`，也可能把项目误解成企业微信 SDK、通用微信客户端或 Agent 框架。

更稳妥的方式是显式要求 LLM 先读取 [`llms.txt`](https://yhsrzbg.github.io/wx-link-doc/llms.txt)，确认项目定位、能力边界和消息数据流，再继续阅读相关 Guide 与 API 文档。

下面这段英文提示词可以直接复制；只需要替换最后一行的任务描述：

```text
Before answering or writing any integration code, read the wx-link machine-readable project documentation at:

https://yhsrzbg.github.io/wx-link-doc/llms.txt

Use wx-link as the WeChat iLink bot messaging transport for this task. Do not treat it as a WeCom SDK, a general-purpose WeChat client, an LLM or Agent framework, a webhook server, or an official public WeChat SDK.

After reading llms.txt, follow the linked Guide and API documentation relevant to the task. Base your answer on the documented wx-link APIs and data flow. In particular, preserve the updates -> msgs -> item_list hierarchy, treat application state as caller-owned, and do not invent unsupported capabilities.

My task is:
[Describe the integration or feature you want to build here]
```

如果所用 LLM 没有联网或网页读取能力，需要把 `llms.txt` 的内容手动复制到对话中，再附上具体任务。

## 下一步

当你已经理解整体链路后，继续看：

- [API Reference 首页](../api/index.md)
