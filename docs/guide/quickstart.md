# 快速接入

这页只讲最短接入路径：扫码登录、保存凭证、创建客户端、轮询消息、回复用户。

## 1. 扫码登录

```ts
import { loginWithQR } from "wx-link";

const login = await loginWithQR({
  onQRCode: (url) => console.log("Scan QR:", url),
  onStatusChange: (status) => console.log("Status:", status),
});
```

登录成功后，至少保存这些字段：

- `login.botToken`
- `login.baseUrl`
- `login.accountId`
- `login.userId`

`wx-link` 不会帮你持久化这些字段，应该由你的应用自己保存。

## 2. 创建客户端

```ts
import { WxLinkClient } from "wx-link";

const client = new WxLinkClient({
  baseUrl: login.baseUrl,
  token: login.botToken,
});
```

如果你是从数据库恢复账号，也可以这样创建：

```ts
const client = WxLinkClient.fromAccount({
  baseUrl: saved.baseUrl,
  token: saved.botToken,
});
```

## 3. 轮询消息

```ts
let cursor = saved.cursor ?? "";

const updates = await client.poll(cursor);
cursor = updates.nextCursor;
```

这里的 `cursor` 需要由你的应用自己保存。下次进程重启时，继续把上次保存的值传回去。

## 4. 回复消息

```ts
for (const msg of updates.msgs ?? []) {
  if (!msg.from_user_id) {
    continue;
  }

  await client.sendText({
    toUserId: msg.from_user_id,
    text: "hello",
    contextToken: msg.context_token,
  });
}
```

最常见的回复链路是：

- `toUserId` 取自入站消息 `msg.from_user_id`
- `contextToken` 取自入站消息 `msg.context_token`

## 5. 你需要自己保存的状态

最常见的是这些：

- 账号凭证：`botToken`、`baseUrl`、`accountId`、`userId`
- 轮询状态：`cursor`
- 业务会话：聊天记录、用户映射、上下文等

更多解释见：

- [状态与关键字段](./state-and-fields.md)
- [轮询与回复](./polling-and-reply.md)
- [收发消息 API](../api/messaging.md)
