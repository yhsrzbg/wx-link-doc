# 登录 API

这页只讲登录相关能力。

## `loginWithQR(callbacks, options?)`

**用途**

自动完成二维码刷新和状态轮询，适合大多数接入场景。

**什么时候该用**

当你只需要“展示二维码并等待登录成功”时，优先用它。

**签名**

```ts
loginWithQR(
  callbacks: LoginCallbacks,
  options?: { baseUrl?: string; botType?: string; fetchImpl?: typeof fetch },
): Promise<LoginResult>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `callbacks.onQRCode` | `(url: string) => void` | 二维码可展示时回调 |
| `callbacks.onStatusChange` | `(status) => void` | 状态变化回调，可选 |
| `options.baseUrl` | `string` | 自定义登录 API 地址，可选 |
| `options.botType` | `string` | bot 类型，可选 |
| `options.fetchImpl` | `typeof fetch` | 自定义 `fetch` 实现，可选 |

**返回值**

```ts
interface LoginResult {
  botToken: string;
  accountId: string;
  baseUrl: string;
  userId?: string;
}
```

**关键字段来源**

- `botToken`、`accountId`、`baseUrl`、`userId` 都来自登录成功结果
- 这些字段要由你的应用自己保存

**最小示例**

```ts
const login = await loginWithQR({
  onQRCode: (url) => console.log(url),
});
```

**相关 Guide**

- [登录流程](../guide/login-flow.md)
- [状态与关键字段](../guide/state-and-fields.md)

## `createQrLoginSession(options?)`

**用途**

创建显式登录 session。

**什么时候该用**

当你的服务端要自己控制二维码展示、状态轮询和刷新逻辑时使用。

**签名**

```ts
createQrLoginSession(options?: CreateQrLoginSessionOptions): Promise<QrLoginSession>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `options.sessionKey` | `string` | 业务自定义 session ID，可选 |
| `options.botType` | `string` | bot 类型，可选 |
| `options.fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `options.logger` | `LoggerLike` | 自定义日志对象，可选 |

**返回值**

```ts
interface QrLoginSession {
  sessionKey: string;
  botType: string;
  qrcode: string;
  qrcodeUrl: string;
  startedAt: number;
  currentApiBaseUrl: string;
  refreshCount: number;
}
```

**关键字段来源**

- `sessionKey` 由业务传入或由 SDK 自动生成
- `qrcode` 和 `qrcodeUrl` 来自二维码获取接口

**最小示例**

```ts
const session = await createQrLoginSession();
console.log(session.qrcodeUrl);
```

**相关 Guide**

- [登录流程](../guide/login-flow.md)

## `pollQrLoginSession(options)`

**用途**

轮询显式登录 session 的状态。

**什么时候该用**

你已经在用 `createQrLoginSession()` 管理登录会话时使用。

**签名**

```ts
pollQrLoginSession(options: PollQrLoginSessionOptions): Promise<PollQrLoginSessionResult>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `options.session` | `QrLoginSession` | 上一次创建或轮询返回的 session |
| `options.fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `options.logger` | `LoggerLike` | 自定义日志对象，可选 |

**返回值**

```ts
interface PollQrLoginSessionResult {
  session: QrLoginSession;
  status: "wait" | "scaned" | "confirmed" | "expired" | "scaned_but_redirect";
  done: boolean;
  connected: boolean;
  message: string;
  botToken?: string;
  accountId?: string;
  baseUrl?: string;
  userId?: string;
}
```

**关键字段来源**

- `session` 是更新后的登录 session
- `botToken`、`accountId`、`baseUrl`、`userId` 只会在确认登录成功时出现

**最小示例**

```ts
const result = await pollQrLoginSession({ session });
session = result.session;
```

**相关 Guide**

- [登录流程](../guide/login-flow.md)

## `fetchQrCode(botType, fetchImpl?, logger?)`

**用途**

直接获取二维码原始响应。

**什么时候该用**

只有当你在实现自定义登录状态机时才需要直接调用。

**签名**

```ts
fetchQrCode(
  botType: string,
  fetchImpl?: typeof fetch,
  logger?: LoginCallbacks["onStatusChange"] | { info?: (...args: unknown[]) => void },
): Promise<QRCodeResponse>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `botType` | `string` | bot 类型 |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `logger` | `LoggerLike` 风格对象 | 日志对象，可选 |

**返回值**

```ts
interface QRCodeResponse {
  qrcode: string;
  qrcode_img_content: string;
}
```

**关键字段来源**

- `qrcode` 是二维码 ID
- `qrcode_img_content` 是二维码展示地址

**最小示例**

```ts
const qr = await fetchQrCode("3");
console.log(qr.qrcode_img_content);
```

**相关 Guide**

- [登录流程](../guide/login-flow.md)

## `pollQrStatus(qrcode, baseUrl, fetchImpl?, logger?)`

**用途**

直接轮询二维码状态。

**什么时候该用**

只有当你在实现更底层的自定义登录流程时才需要。

**签名**

```ts
pollQrStatus(
  qrcode: string,
  baseUrl: string,
  fetchImpl?: typeof fetch,
  logger?: { warn?: (...args: unknown[]) => void },
): Promise<QRStatusResponse>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `qrcode` | `string` | 二维码 ID |
| `baseUrl` | `string` | 当前登录节点地址 |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |
| `logger` | `LoggerLike` 风格对象 | 日志对象，可选 |

**返回值**

```ts
interface QRStatusResponse {
  status: "wait" | "scaned" | "confirmed" | "expired" | "scaned_but_redirect";
  bot_token?: string;
  ilink_bot_id?: string;
  baseurl?: string;
  ilink_user_id?: string;
  redirect_host?: string;
}
```

**关键字段来源**

- `redirect_host` 只在服务端要求切换登录节点时出现
- `bot_token` 等凭证字段只在登录成功时出现

**最小示例**

```ts
const status = await pollQrStatus(session.qrcode, session.currentApiBaseUrl);
```

**相关 Guide**

- [登录流程](../guide/login-flow.md)
