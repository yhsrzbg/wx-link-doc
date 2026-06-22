# Changelog

本页记录 `wx-link` 的版本变更。版本号遵循语义化版本（SemVer）。

## 0.2.0（2026-06-22）

移植自 `@tencent-weixin/openclaw-weixin` 2.4.x 的协议层改动。现有公开 API 未被删除，新增参数和回调均为可选。

### 修复

- **Node 24 兼容**：移除手动设置的 `Content-Length` 请求头。Node 24 内置的 undici 会以 `UND_ERR_INVALID_ARG` 拒绝预设的 `Content-Length`，导致所有 API 调用失败；现在交由 `fetch` 自行计算。

### 新增

- **配对码登录**：`loginWithQR()` 新增 `onVerifyCode` 回调；`pollQrLoginSession()` / `pollQrStatus()` 新增可选 `verifyCode` 参数；新增 `need_verifycode`、`verify_code_blocked`、`binded_redirect` 三个登录状态，以及 `PollQrLoginSessionResult.alreadyConnected`。
- **`local_token_list`**：获取二维码时可传入 `localTokenList`（本地已有 bot token，最多 10 个），让服务端识别已绑定的 bot 并返回 `binded_redirect`。
- **`bot_agent`**：`ClientOptions` 新增 `botAgent`（UA 风格标识），经 `sanitizeBotAgent` 清洗后作为 `base_info.bot_agent` 随每个请求发送。
- **新导出**：`sanitizeBotAgent`、`DEFAULT_BOT_AGENT`、`buildClientVersion`。

详见 [登录 API](/api/login)、[登录流程](/guide/login-flow)、[收发消息 API](/api/messaging)。

## 0.1.1

- 初始公开版本：扫码登录、消息轮询、文本/媒体收发、入站媒体解析与下载。
