# 登录流程

`wx-link` 提供两种登录方式：

- 简单接入：`loginWithQR()`
- 显式状态机：`createQrLoginSession()` + `pollQrLoginSession()`

## 方式一：直接用 `loginWithQR()`

适合 UI 只需要“展示二维码”和“等待结果”的场景。

```ts
const login = await loginWithQR({
  onQRCode: (url) => renderQr(url),
  onStatusChange: (status) => console.log(status),
});
```

成功后你会拿到：

- `botToken`
- `accountId`
- `baseUrl`
- `userId`

这些字段就是后续创建客户端的凭证，应该由你的应用保存。

## 方式二：显式管理登录 session

适合服务端自己管理登录流程、轮询状态和二维码刷新。

```ts
const session = await createQrLoginSession();
renderQr(session.qrcodeUrl);

const result = await pollQrLoginSession({ session });
```

这条链路里常见字段的职责是：

- `sessionKey`
  这次登录会话的唯一标识
- `qrcode`
  底层二维码 ID，用于轮询二维码状态
- `qrcodeUrl`
  更适合直接展示给用户扫描的二维码地址
- `currentApiBaseUrl`
  当前登录节点地址，服务端要求切换节点时会更新
- `refreshCount`
  SDK 内部记录二维码刷新次数

## 登录状态如何变化

底层二维码状态一般会经历这些阶段：

- `wait`
- `scaned`
- `scaned_but_redirect`
- `confirmed`
- `expired`

高层 `loginWithQR()` 会把它们整理成更适合 UI 的状态回调，例如 `waiting`、`scanned`、`expired`、`refreshing`。

## `redirect_host` 是什么

有些登录过程中，服务端会返回 `redirect_host`，表示后续轮询应该切换到新的节点。`pollQrLoginSession()` 会把这个变化合并进新的 `session.currentApiBaseUrl`，调用方只需要保存新的 session。

## 登录成功后该做什么

登录成功后，最推荐的动作只有两件：

1. 保存 `botToken`、`baseUrl`、`accountId`、`userId`
2. 用这些字段创建 `WxLinkClient`

相关参考：

- [登录 API](../api/login.md)
- [状态与关键字段](./state-and-fields.md)
