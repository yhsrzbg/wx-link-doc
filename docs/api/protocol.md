# 底层协议 API

这页聚焦 low-level API。只有当你在做更底层的协议封装时，才建议直接使用这些方法。

## `createApiContext(options)`

**用途**

把 `ClientOptions` 规范化成内部 `ApiContext`。

**什么时候该用**

当你不使用 `WxLinkClient`，而是直接调用 low-level API 时使用。

**签名**

```ts
createApiContext(
  options: ClientOptions | (Partial<ClientOptions> & { baseUrl: string }),
): ApiContext
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `baseUrl` | `string` | API 地址 |
| `token` | `string` | bot token，可选但大部分接口都会用到 |
| `appId` | `string` | 自定义 app id，可选 |
| `channelVersion` | `string` | 自定义 channel version，可选 |
| `routeTag` | `string \| number` | 路由标记，可选 |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `logger` | `LoggerLike` | 日志对象，可选 |

**返回值**

```ts
ApiContext
```

**关键字段来源**

- `token` 和 `baseUrl` 的典型来源是登录结果或业务存储

**最小示例**

```ts
const ctx = createApiContext({
  baseUrl: saved.baseUrl,
  token: saved.botToken,
});
```

**相关 Guide**

- [状态与关键字段](../guide/state-and-fields.md)

## `getUpdates(opts, params?)`

**用途**

调用 raw 轮询接口。

**什么时候该用**

只有你不使用 `WxLinkClient.poll()` 时才建议直接调用。

**签名**

```ts
getUpdates(
  opts: ApiContext | ClientOptions,
  params?: { get_updates_buf?: string },
): Promise<GetUpdatesResp>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `opts` | `ApiContext \| ClientOptions` | 请求上下文 |
| `params.get_updates_buf` | `string` | 上一次轮询游标，可选 |

**返回值**

```ts
interface GetUpdatesResp {
  ret?: number;
  errcode?: number;
  errmsg?: string;
  msgs?: WeixinMessage[];
  get_updates_buf?: string;
  longpolling_timeout_ms?: number;
}
```

**关键字段来源**

- `get_updates_buf` 的典型来源是上一次轮询返回值

**最小示例**

```ts
const resp = await getUpdates(ctx, { get_updates_buf: cursor });
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## `sendMessage(opts, body)`

**用途**

发送 raw 消息请求。

**什么时候该用**

只有你要自己构造完整消息体时才建议直接调用。

**签名**

```ts
sendMessage(opts: ApiContext | ClientOptions, body: SendMessageReq): Promise<void>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `opts` | `ApiContext \| ClientOptions` | 请求上下文 |
| `body` | `SendMessageReq` | 完整消息请求体 |

**常见消息字段**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `msg.to_user_id` | `string` | 目标微信用户 ID |
| `msg.client_id` | `string` | 业务生成的唯一消息 ID |
| `msg.context_token` | `string` | 会话上下文 token，可选 |
| `msg.item_list` | `MessageItem[]` | 消息内容项 |

**返回值**

- `Promise<void>`

**关键字段来源**

- `to_user_id` 通常来自入站消息 `from_user_id`
- `context_token` 通常来自入站消息 `context_token`

**最小示例**

```ts
await sendMessage(ctx, {
  msg: {
    from_user_id: "",
    to_user_id: toUserId,
    client_id: "custom-id",
    message_type: MessageType.BOT,
    message_state: MessageState.FINISH,
    item_list: [{ type: MessageItemType.TEXT, text_item: { text: "hello" } }],
  },
});
```

**相关 Guide**

- [轮询与回复](../guide/polling-and-reply.md)

## `sendTyping(opts, body)`

**用途**

发送 raw typing 请求。

**什么时候该用**

只有你要自己处理 `typing_ticket` 时才建议直接调用。

**签名**

```ts
sendTyping(
  opts: ApiContext | ClientOptions,
  body: { ilink_user_id?: string; typing_ticket?: string; status?: number },
): Promise<void>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ilink_user_id` | `string` | 目标微信用户 ID |
| `typing_ticket` | `string` | `getConfig()` 返回的 ticket |
| `status` | `number` | 状态值，通常用 `TypingStatus.TYPING` |

**返回值**

- `Promise<void>`

**关键字段来源**

- `typing_ticket` 应先通过 `getConfig()` 获取

**最小示例**

```ts
await sendTyping(ctx, {
  ilink_user_id: toUserId,
  typing_ticket,
  status: TypingStatus.TYPING,
});
```

**相关 Guide**

- [状态与关键字段](../guide/state-and-fields.md)

## `getConfig(opts, ilinkUserId, contextToken?)`

**用途**

获取用户相关配置。

**什么时候该用**

你需要 `typing_ticket` 或其他配置时使用。

**签名**

```ts
getConfig(
  opts: ApiContext | ClientOptions,
  ilinkUserId: string,
  contextToken?: string,
): Promise<GetConfigResp>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `opts` | `ApiContext \| ClientOptions` | 请求上下文 |
| `ilinkUserId` | `string` | 目标微信用户 ID |
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
const config = await getConfig(ctx, toUserId, contextToken);
```

**相关 Guide**

- [状态与关键字段](../guide/state-and-fields.md)

## `getUploadUrl(opts, params)`

**用途**

获取媒体上传地址和上传参数。

**什么时候该用**

你在自己实现上传链路时使用。

**签名**

```ts
getUploadUrl(
  opts: ApiContext | ClientOptions,
  params: GetUploadUrlReq,
): Promise<GetUploadUrlResp>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `filekey` | `string` | 文件唯一标识 |
| `media_type` | `number` | 媒体类型 |
| `to_user_id` | `string` | 目标微信用户 ID |
| `rawsize` | `number` | 明文大小 |
| `rawfilemd5` | `string` | 明文 MD5 |
| `filesize` | `number` | 加密后大小 |
| `aeskey` | `string` | 十六进制 AES key |

其他缩略图相关字段仅在需要时传入。

**返回值**

```ts
interface GetUploadUrlResp {
  ret?: number;
  errmsg?: string;
  upload_param?: string;
  thumb_upload_param?: string;
  upload_full_url?: string;
}
```

**关键字段来源**

- `filekey`、`rawsize`、`rawfilemd5`、`filesize`、`aeskey` 通常由上传 helper 计算或生成

**最小示例**

```ts
const uploadInfo = await getUploadUrl(ctx, {
  filekey,
  media_type: UploadMediaType.IMAGE,
  to_user_id: toUserId,
  rawsize,
  rawfilemd5,
  filesize,
  aeskey,
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)
