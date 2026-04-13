# 状态与关键字段

`wx-link` 是 stateless core。它不会偷偷帮你保存账号、游标或聊天记录，所以接入时最重要的是先搞清楚：哪些字段由服务端返回，哪些字段需要你的应用自己保存。

## 核心原则

- 登录凭证由业务侧保存
- 轮询进度由业务侧保存
- 聊天记录和上下文由业务侧保存
- 媒体上传过程里的临时字段通常不需要长期保存

## 常见字段一览

| 字段 | 典型来源 | 是否建议保存 |
| --- | --- | --- |
| `token` | 扫码登录成功后的 `LoginResult.botToken` | 是 |
| `baseUrl` | 扫码登录成功后的 `LoginResult.baseUrl` | 是 |
| `accountId` | 扫码登录成功后的 `LoginResult.accountId` | 是 |
| `userId` | 扫码登录成功后的 `LoginResult.userId` | 建议保存 |
| `cursor` | 每次 `client.poll(cursor)` 返回的 `nextCursor` | 是 |
| `contextToken` | 入站消息 `msg.context_token` | 视业务而定 |
| `toUserId` | 入站消息 `msg.from_user_id` 或业务系统目标用户 | 取决于业务 |
| `typing_ticket` | `getConfig()` 返回值 | 否 |
| `sessionKey` | 登录 session 里由业务生成或 SDK 生成 | 登录期间保存即可 |
| `qrcode` | `fetchQrCode()` 返回的二维码 ID | 登录期间保存即可 |
| `qrcodeUrl` | `fetchQrCode()` 返回的二维码展示地址 | 登录期间保存即可 |
| `filekey` | 上传媒体时生成 | 通常不需要 |
| `aeskey` / `aesKeyBase64` | 上传生成或入站媒体自带 | 通常不需要长期保存 |
| `downloadEncryptedQueryParam` | CDN 上传成功后返回 | 仅复用媒体时需要 |

## `token` 是怎么来的

`WxLinkClient` 里的 `token` 不会自动生成，也不会自动续取。它的典型来源只有两种：

1. 你刚扫码登录成功，拿到了 `LoginResult.botToken`
2. 你之前已经把 `botToken` 存到数据库或状态文件里，现在重新恢复

所以 `token` 的来源一定是“扫码得到”或“业务侧已保存”。

## `baseUrl` 为什么也要保存

`baseUrl` 不只是一个默认常量。登录成功后，服务端可能返回实际应该访问的节点地址，因此推荐把 `baseUrl` 和 `token` 一起保存、一起恢复。

## `cursor` 是什么

`cursor` 对应协议里的 `get_updates_buf`，表示“你已经轮询到哪里了”。

- 首次启动通常传空字符串
- 每次轮询后保存新的 `nextCursor`
- 进程重启后继续使用上次保存的值

如果不保存 `cursor`，SDK 不会帮你记住进度。

## `contextToken` 怎么理解

`contextToken` 不是登录态，也不是全局 token。它是某段会话上下文的标识，最常见来源是入站消息里的 `msg.context_token`。

- 回复已有消息时，建议原样透传
- 主动发起新消息时，不一定拿得到它

## `typing_ticket` 怎么来

`typing_ticket` 不是你自己生成的。常见流程是：

1. 调用 `getConfig(userId, contextToken?)`
2. 从返回值里拿到 `typing_ticket`
3. 再调用 `sendTyping()`

如果你用高层 `client.sendTyping()`，这一步 SDK 会自动完成。

## 推荐保存策略

推荐至少保存：

- `botToken`
- `baseUrl`
- `accountId`
- `userId`
- `cursor`

聊天记录、业务上下文、用户映射等则应该按你的应用模型自行保存。
