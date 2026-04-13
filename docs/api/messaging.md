# 收发消息 API

这页聚焦业务最常用的高层能力，也就是 `WxLinkClient`。

> 提醒：如果这是和某个用户的第一轮对话，建议先让对方从微信发来一条消息。服务端拿到入站消息里的 `msg.context_token` 后，再调用 `sendText()`、`sendTyping()` 或其他回复接口会更稳妥。

## `new WxLinkClient(options)`

**用途**

创建高层客户端。

**什么时候该用**

当你已经拿到了账号凭证，准备轮询和发消息时使用。

**签名**

```ts
new WxLinkClient(options: ClientOptions)
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | API 地址 |
| `token` | `string` | bot token |
| `cdnBaseUrl` | `string` | 媒体 CDN 地址，可选 |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `logger` | `LoggerLike` | 自定义日志对象，可选 |

更多参数见 [参考索引](./reference.md) 的类型入口。

**返回值**

- `WxLinkClient`

**关键字段来源**

- `token` 最常见来源是扫码登录成功后的 `LoginResult.botToken`
- `baseUrl` 最常见来源是扫码登录成功后的 `LoginResult.baseUrl`

**最小示例**

```ts
const client = new WxLinkClient({
  baseUrl: saved.baseUrl,
  token: saved.botToken,
});
```

**相关 Guide**

- [快速接入](../guide/quickstart.md)
- [状态与关键字段](../guide/state-and-fields.md)

## `WxLinkClient.fromAccount(record, options?)`

**用途**

用已经保存的账号凭证创建客户端。

**什么时候该用**

你的账号数据已经在数据库或状态文件里时优先使用。

**签名**

```ts
WxLinkClient.fromAccount(
  record: Pick<ClientOptions, "token" | "baseUrl" | "cdnBaseUrl">,
  options?: Omit<Partial<ClientOptions>, "token" | "baseUrl" | "cdnBaseUrl">,
): WxLinkClient
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `record.token` | `string` | 已保存的 bot token |
| `record.baseUrl` | `string` | 已保存的 API 地址 |
| `record.cdnBaseUrl` | `string` | 已保存的 CDN 地址，可选 |
| `options` | `Partial<ClientOptions>` | 其他附加选项，可选 |

**返回值**

- `WxLinkClient`

**关键字段来源**

- `record.token` 和 `record.baseUrl` 来自你的业务存储

**最小示例**

```ts
const client = WxLinkClient.fromAccount({
  baseUrl: saved.baseUrl,
  token: saved.botToken,
});
```

**相关 Guide**

- [状态与关键字段](../guide/state-and-fields.md)

## `client.poll(cursor?)`

**用途**

长轮询消息。

**什么时候该用**

接收消息时每轮都要调用。

**签名**

```ts
client.poll(cursor?: string): Promise<PollUpdatesResult>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `cursor` | `string` | 上一次保存的轮询游标，首次通常为空字符串 |

**返回值**

```ts
interface PollUpdatesResult extends GetUpdatesResp {
  nextCursor: string;
}
```

**关键字段来源**

- `cursor` 来自上一次轮询返回的 `nextCursor`
- `nextCursor` 需要由你的应用自己保存

**最小示例**

```ts
const updates = await client.poll(cursor);
cursor = updates.nextCursor;
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## `client.sendText(options)`

**用途**

发送文本消息。

**什么时候该用**

回复用户或主动发送文本时使用。

**签名**

```ts
client.sendText(options: SendTextOptions): Promise<{ messageId: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toUserId` | `string` | 目标微信用户 ID |
| `text` | `string` | 文本内容 |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

```ts
{ messageId: string }
```

**关键字段来源**

- `toUserId` 最常见来源是入站消息 `msg.from_user_id`
- `contextToken` 最常见来源是入站消息 `msg.context_token`

如果是首次会话，建议把“先收到一条用户消息，再回复”作为默认流程，而不是依赖没有 `contextToken` 的主动开聊。

**最小示例**

```ts
await client.sendText({
  toUserId: msg.from_user_id!,
  text: "hello",
  contextToken: msg.context_token,
});
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## `client.sendTextChunked(toUserId, text, contextToken?, maxLength?)`

**用途**

自动拆分长文本并逐条发送。

**什么时候该用**

一次性生成的文本可能超出单条长度时使用。

**签名**

```ts
client.sendTextChunked(
  toUserId: string,
  text: string,
  contextToken?: string,
  maxLength?: number,
): Promise<number>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `toUserId` | `string` | 目标微信用户 ID |
| `text` | `string` | 长文本内容 |
| `contextToken` | `string` | 会话上下文 token，可选 |
| `maxLength` | `number` | 每条消息最大长度，默认 `4000` |

**返回值**

- `Promise<number>`，表示发送了多少条消息

**关键字段来源**

- `toUserId` 和 `contextToken` 的典型来源与 `sendText()` 相同

**最小示例**

```ts
await client.sendTextChunked(msg.from_user_id!, longText, msg.context_token);
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## `client.sendTyping(userId, contextToken?)`

**用途**

发送“正在输入”状态。

**什么时候该用**

在回复前需要给用户一个正在处理的反馈时使用。

**签名**

```ts
client.sendTyping(userId: string, contextToken?: string): Promise<void>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | `string` | 目标微信用户 ID |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

- `Promise<void>`

**关键字段来源**

- 方法内部会自动先调用 `getConfig()` 获取 `typing_ticket`

**最小示例**

```ts
await client.sendTyping(msg.from_user_id!, msg.context_token);
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## 发送媒体方法

### `client.sendImage(options)` / `client.sendVideo(options)` / `client.sendFile(options)`

**用途**

按本地文件路径上传并发送媒体。

**什么时候该用**

你的文件已经在本地磁盘上时使用。

**签名**

```ts
client.sendImage(options: SendMediaByPathOptions): Promise<{ messageId: string }>
client.sendVideo(options: SendMediaByPathOptions): Promise<{ messageId: string }>
client.sendFile(options: SendMediaByPathOptions): Promise<{ messageId: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toUserId` | `string` | 目标微信用户 ID |
| `filePath` | `string` | 本地文件路径 |
| `text` | `string` | 可选文本 |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

```ts
{ messageId: string }
```

**关键字段来源**

- `toUserId` 和 `contextToken` 的典型来源来自入站消息

**最小示例**

```ts
await client.sendImage({
  toUserId: msg.from_user_id!,
  filePath: "./demo.jpg",
  contextToken: msg.context_token,
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `client.sendMediaFromPath(options)`

**用途**

根据文件扩展名自动判断发送图片、视频还是文件。

**什么时候该用**

调用方不想手动区分文件类型时使用。

**签名**

```ts
client.sendMediaFromPath(options: SendMediaByPathOptions): Promise<{ messageId: string }>
```

**参数**

与 `SendMediaByPathOptions` 相同。

**返回值**

```ts
{ messageId: string }
```

**关键字段来源**

- 类型判断来自文件名扩展名

**最小示例**

```ts
await client.sendMediaFromPath({
  toUserId,
  filePath: "./demo.mp4",
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `client.sendImageBuffer(options)` / `client.sendVideoBuffer(options)` / `client.sendFileBuffer(options)` / `client.sendMediaFromBuffer(options)`

**用途**

按内存 `Buffer` 上传并发送媒体。

**什么时候该用**

文件来自对象存储、HTTP 下载结果或程序内生成内容时使用。

**签名**

```ts
client.sendImageBuffer(options: SendMediaByBufferOptions): Promise<{ messageId: string }>
client.sendVideoBuffer(options: SendMediaByBufferOptions): Promise<{ messageId: string }>
client.sendFileBuffer(options: SendMediaByBufferOptions): Promise<{ messageId: string }>
client.sendMediaFromBuffer(options: SendMediaByBufferOptions): Promise<{ messageId: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toUserId` | `string` | 目标微信用户 ID |
| `buffer` | `Buffer` | 文件内容 |
| `fileName` | `string` | 文件名，可选 |
| `contentType` | `string` | MIME 类型，可选 |
| `text` | `string` | 可选文本 |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

```ts
{ messageId: string }
```

**关键字段来源**

- `sendMediaFromBuffer()` 会根据 `contentType` 或 `fileName` 推断媒体类型

**最小示例**

```ts
await client.sendMediaFromBuffer({
  toUserId,
  buffer,
  fileName: "demo.jpg",
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `client.sendMediaFromUrl(options)`

**用途**

先下载远程文件，再按类型发送。

**什么时候该用**

文件源头是 HTTP/HTTPS 地址时使用。

**签名**

```ts
client.sendMediaFromUrl(options: SendMediaByUrlOptions): Promise<{ messageId: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toUserId` | `string` | 目标微信用户 ID |
| `url` | `string` | 远程文件 URL |
| `text` | `string` | 可选文本 |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

```ts
{ messageId: string }
```

**关键字段来源**

- `url` 来自你的业务系统

**最小示例**

```ts
await client.sendMediaFromUrl({
  toUserId,
  url: "https://example.com/demo.jpg",
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

## `client.getConfig(userId, contextToken?)`

**用途**

获取用户相关配置。

**什么时候该用**

当你需要自己处理 `typing_ticket` 或底层配置时使用。

**签名**

```ts
client.getConfig(userId: string, contextToken?: string): Promise<GetConfigResp>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | `string` | 目标微信用户 ID |
| `contextToken` | `string` | 会话上下文 token，可选 |

**返回值**

```ts
interface GetConfigResp {
  ret?: number;
  errmsg?: string;
  typing_ticket?: string;
}
```

**关键字段来源**

- `typing_ticket` 由服务端返回

**最小示例**

```ts
const config = await client.getConfig(msg.from_user_id!, msg.context_token);
```

**相关 Guide**

- [状态与关键字段](../guide/state-and-fields.md)
