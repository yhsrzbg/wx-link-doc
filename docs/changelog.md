# Changelog

本页记录 `wx-link` 的版本变更。版本号遵循语义化版本（SemVer）。

## 0.2.0（2026-06-22）

本次更新增强了扫码登录流程和请求兼容性，并支持为接入方标记应用身份。现有公开 API 未被删除，新增参数和回调均为可选。

### 修复

- **Node.js 24 兼容性**：修复部分请求因手动设置 `Content-Length` 而失败的问题，现在由 `fetch` 自动计算请求长度。

### 新增

- **配对码登录**：扫码后需要输入手机端配对码时，可以通过 `loginWithQR()` 的 `onVerifyCode` 回调完成验证。
- **更多登录状态**：新增 `need_verifycode`、`verify_code_blocked` 和 `binded_redirect`，便于应用展示更准确的登录进度和处理结果。
- **已绑定账号识别**：获取二维码时可以通过 `localTokenList` 提交最近使用的 bot token，最多支持 10 个。
- **应用标识**：`ClientOptions` 新增可选的 `botAgent`，用于声明当前接入应用；SDK 会在发送前自动校验和清洗其格式。
- **工具导出**：新增 `sanitizeBotAgent`、`DEFAULT_BOT_AGENT` 和 `buildClientVersion`。

### API 变化

- `loginWithQR()` 新增可选回调 `onVerifyCode`
- `loginWithQR()` 和 `createQrLoginSession()` 新增可选参数 `localTokenList`
- `pollQrLoginSession()` 和 `pollQrStatus()` 新增可选参数 `verifyCode`
- `PollQrLoginSessionResult` 新增可选字段 `alreadyConnected`
- `ClientOptions` 新增可选字段 `botAgent`

详见 [登录 API](/api/login)、[登录流程](/guide/login-flow)、[收发消息 API](/api/messaging)。

## 0.1.1

- 初始公开版本：扫码登录、消息轮询、文本/媒体收发、入站媒体解析与下载。
