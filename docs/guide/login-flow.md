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

`0.2.0` 起还可能出现 `need_verifycode`、`verify_code_blocked`、`binded_redirect`，详见下方“配对码登录”。

高层 `loginWithQR()` 会把它们整理成更适合 UI 的状态回调，例如 `waiting`、`scanned`、`expired`、`refreshing`。

## 配对码登录（`0.2.0+`）

有些情况下，服务端会在扫码后要求输入手机微信上显示的数字（配对码），底层状态会出现 `need_verifycode`。用 `loginWithQR()` 时，只要提供 `onVerifyCode` 回调即可，SDK 会把数字带入下一次轮询，输入错误时会再次回调（`retry: true`）：

```ts
const login = await loginWithQR({
  onQRCode: (url) => renderQr(url),
  onVerifyCode: async ({ retry }) => {
    return await promptUser(retry ? "配对码不匹配，请重新输入" : "请输入手机微信显示的数字");
  },
});
```

如果你在用显式状态机，则在收到 `need_verifycode` 后，于下一次 `pollQrLoginSession()` 传入 `verifyCode`：

```ts
let result = await pollQrLoginSession({ session });
if (result.status === "need_verifycode") {
  const code = await promptUser("请输入手机微信显示的数字");
  result = await pollQrLoginSession({ session: result.session, verifyCode: code });
}
```

相关状态：

- `need_verifycode`
  服务端要求配对码，应展示提示并在下次轮询传入 `verifyCode`
- `verify_code_blocked`
  配对码错误次数过多；`pollQrLoginSession()` 会自动刷新二维码，并以可继续的 `expired` 结果返回
- `binded_redirect`
  该 bot 已绑定过此应用，显式状态机将收到 `done: true`、`alreadyConnected: true`，可按“无需重复连接”处理；高层 `loginWithQR()` 当前会抛出对应错误

> 获取二维码时还可以传入 `localTokenList`（本地已有的 bot token，最多 10 个），让服务端识别已绑定的 bot 并返回 `binded_redirect`。

## `redirect_host` 是什么

有些登录过程中，服务端会返回 `redirect_host`，表示后续轮询应该切换到新的节点。`pollQrLoginSession()` 会把这个变化合并进新的 `session.currentApiBaseUrl`，调用方只需要保存新的 session。

## 登录成功后该做什么

登录成功后，最推荐的动作只有两件：

1. 保存 `botToken`、`baseUrl`、`accountId`、`userId`
2. 用这些字段创建 `WxLinkClient`

相关参考：

- [登录 API](../api/login.md)
- [状态与关键字段](./state-and-fields.md)
