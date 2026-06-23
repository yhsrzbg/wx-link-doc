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
// savedAccount 是你的应用从数据库或状态文件中读取的账号记录
declare const savedAccount: {
  baseUrl: string;
  botToken: string;
};

const ctx = createApiContext({
  baseUrl: savedAccount.baseUrl,
  token: savedAccount.botToken,
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

### 入站消息内容

`msgs` 中的每条 `WeixinMessage` 通过 `item_list` 携带实际内容：

```ts
interface MessageItem {
  type?: number;
  text_item?: { text?: string };
  image_item?: ImageItem;
  voice_item?: VoiceItem;
  file_item?: FileItem;
  video_item?: VideoItem;
}
```

常见 `type`：

| 值 | 常量 | 内容字段 |
| --- | --- | --- |
| `1` | `MessageItemType.TEXT` | `text_item` |
| `2` | `MessageItemType.IMAGE` | `image_item` |
| `3` | `MessageItemType.VOICE` | `voice_item` |
| `4` | `MessageItemType.FILE` | `file_item` |
| `5` | `MessageItemType.VIDEO` | `video_item` |

语音项的结构：

```ts
interface VoiceItem {
  media?: CDNMedia;
  encode_type?: number;
  bits_per_sample?: number;
  sample_rate?: number;
  playtime?: number;
  text?: string;
  url?: string;
  cdn_url?: string;
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `media` | `CDNMedia` | 语音 CDN 引用，可能包含下载参数和 AES key |
| `encode_type` | `number` | 音频编码类型，由服务端返回 |
| `bits_per_sample` | `number` | 音频位深 |
| `sample_rate` | `number` | 采样率，单位 Hz |
| `playtime` | `number` | 播放时长，单位毫秒 |
| `text` | `string` | 可选的语音转文字结果 |
| `url` / `cdn_url` | `string` | 某些响应中可能提供的直接媒体地址 |

`voice_item.text` 直接来自 `getupdates` 的 JSON 响应。`getUpdates()` 和 `client.poll()` 不会执行语音识别，只会解析并返回该字段。协议也不保证每条语音都包含 `text`。

**最小示例**

```ts
// 首次轮询传空字符串；后续传上一次响应里的 get_updates_buf
let cursor = "";
const resp = await getUpdates(ctx, { get_updates_buf: cursor });
cursor = resp.get_updates_buf ?? cursor;

for (const msg of resp.msgs ?? []) {
  for (const item of msg.item_list ?? []) {
    if (item.type === MessageItemType.VOICE) {
      console.log(item.voice_item?.text ?? "没有服务端转写");
    }
  }
}
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
const updates = await getUpdates(ctx, { get_updates_buf: "" });
const inbound = updates.msgs?.find((message) => message.from_user_id);

if (!inbound?.from_user_id) {
  throw new Error("尚未收到可回复的入站消息");
}

await sendMessage(ctx, {
  msg: {
    from_user_id: "",
    to_user_id: inbound.from_user_id,
    client_id: "custom-id",
    message_type: MessageType.BOT,
    message_state: MessageState.FINISH,
    context_token: inbound.context_token,
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
const updates = await getUpdates(ctx, { get_updates_buf: "" });
const inbound = updates.msgs?.find((message) => message.from_user_id);

if (!inbound?.from_user_id) {
  throw new Error("尚未收到可回复的入站消息");
}

const config = await getConfig(ctx, inbound.from_user_id, inbound.context_token);
if (!config.typing_ticket) {
  throw new Error("服务端没有返回 typing_ticket");
}

await sendTyping(ctx, {
  ilink_user_id: inbound.from_user_id,
  typing_ticket: config.typing_ticket,
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
const updates = await getUpdates(ctx, { get_updates_buf: "" });
const inbound = updates.msgs?.find((message) => message.from_user_id);

if (inbound?.from_user_id) {
  const config = await getConfig(
    ctx,
    inbound.from_user_id,
    inbound.context_token,
  );
  console.log(config.typing_ticket);
}
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
// 下列字段由你的上传准备逻辑计算；toUserId 通常来自入站消息 from_user_id。
declare const filekey: string;
declare const toUserId: string;
declare const rawsize: number;
declare const rawfilemd5: string;
declare const filesize: number;
declare const aeskey: string;

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
