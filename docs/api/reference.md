# 参考索引

这页只做轻量参考入口，不做全量类型字典。

## 常量与枚举

| 导出 | 说明 |
| --- | --- |
| `DEFAULT_BASE_URL` | 默认 API 地址 |
| `DEFAULT_CDN_BASE_URL` | 默认媒体 CDN 地址 |
| `DEFAULT_BOT_TYPE` | 默认 bot 类型 |
| `DEFAULT_APP_ID` | 默认请求头 app id |
| `DEFAULT_CHANNEL_VERSION` | 默认 channel version |
| `MessageType` | 消息主体类型枚举 |
| `MessageItemType` | 消息内容项类型枚举 |
| `MessageState` | 消息状态枚举 |
| `TypingStatus` | typing 状态枚举 |
| `UploadMediaType` | 上传媒体类型枚举 |

这些常量主要在 low-level API 或自定义协议封装中使用。

## `createLogger(options?)`

**用途**

创建一个简单的控制台 logger。

**什么时候该用**

你想把统一日志对象传给 `WxLinkClient`、登录 helper 或 low-level API 时使用。

**签名**

```ts
createLogger(options?: { name?: string; level?: string }): LoggerLike
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 日志前缀，默认 `wx-link` |
| `level` | `string` | 最低日志级别，默认读取 `WX_LINK_LOG_LEVEL` 或回退到 `info` |

**返回值**

```ts
interface LoggerLike {
  debug?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
}
```

**最小示例**

```ts
const logger = createLogger({ level: "debug" });
```

## 常用类型入口

最常见的类型可以按使用场景来找：

- 客户端和发送参数
  `ClientOptions`、`SendTextOptions`、`SendMediaByPathOptions`、`SendMediaByBufferOptions`、`SendMediaByUrlOptions`
- 登录相关
  `LoginCallbacks`、`LoginResult`、`QrLoginSession`、`PollQrLoginSessionResult`
- 轮询和消息
  `GetUpdatesReq`、`GetUpdatesResp`、`PollUpdatesResult`、`WeixinMessage`、`MessageItem`
- 上传和媒体
  `GetUploadUrlReq`、`GetUploadUrlResp`、`UploadedFileInfo`、`ResolvedInboundMedia`、`DownloadedInboundMedia`
- 配置和 typing
  `GetConfigResp`、`SendTypingReq`

如果你要按能力查参数，优先看这些页面：

- [登录 API](./login.md)
- [收发消息 API](./messaging.md)
- [媒体 API](./media.md)
- [底层协议 API](./protocol.md)
