# 轮询与回复

`wx-link` 的消息接入核心很简单：

1. 用保存好的凭证创建 `WxLinkClient`
2. 带着 `cursor` 轮询
3. 从入站消息里取 `from_user_id` 和 `context_token`
4. 构造回复

## 创建客户端

```ts
const client = WxLinkClient.fromAccount({
  baseUrl: saved.baseUrl,
  token: saved.botToken,
});
```

这里的账号凭证应该来自你自己保存的状态，而不是 SDK 内部状态。

## 轮询消息

```ts
let cursor = saved.cursor ?? "";
const updates = await client.poll(cursor);
cursor = updates.nextCursor;
```

轮询的关键点只有一个：每次都把 `nextCursor` 保存下来。

## 入站消息里最重要的字段

最常用的是：

- `msg.from_user_id`
  通常就是你回复时的 `toUserId`
- `msg.context_token`
  回复已有会话时建议原样透传
- `msg.item_list`
  文本、图片、文件、视频等消息内容都在这里

这里有一个很重要的前提：第一次开始对话时，通常也要先依赖这条入站消息把 `context_token` 带回来。也就是说，应该先让微信用户主动发来一条消息，再由服务端进入回复链路。

## 回复文本

```ts
await client.sendText({
  toUserId: msg.from_user_id!,
  text: "hello",
  contextToken: msg.context_token,
});
```

## 发送 typing

```ts
await client.sendTyping(msg.from_user_id!, msg.context_token);
```

高层 `client.sendTyping()` 会自动先拿 `typing_ticket`，通常不用你自己处理。

## 发送长文本

```ts
await client.sendTextChunked(
  msg.from_user_id!,
  longText,
  msg.context_token,
);
```

适合一次生成的文本超出单条长度限制时使用。

## 主动发消息和回复消息的区别

最稳妥的路径是“基于入站消息回复”：

- `toUserId` 来自入站消息
- `contextToken` 来自入站消息

如果这是第一轮对话，更建议把这个前提写进你的产品逻辑：先让用户从微信发一条消息，服务端拿到 `contextToken` 后再开始聊天。

主动发起新消息时，如果拿不到 `contextToken`，是否可行要看实际环境行为；不要把“无 `contextToken` 首次开聊”当成默认可靠路径。

相关参考：

- [收发消息 API](../api/messaging.md)
- [底层协议 API](../api/protocol.md)
