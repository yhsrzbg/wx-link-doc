# 轮询与回复

`wx-link` 的消息接入核心很简单：

1. 用保存好的凭证创建 `WxLinkClient`
2. 带着 `cursor` 轮询
3. 从入站消息里取 `from_user_id` 和 `context_token`
4. 构造回复

## 创建客户端

```ts
// saved 是你的应用从数据库或状态文件中读取的账号记录
declare const saved: {
  baseUrl: string;
  botToken: string;
  cursor?: string;
};

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

for (const msg of updates.msgs ?? []) {
  console.log(msg.from_user_id, msg.item_list);
}
```

轮询的关键点只有一个：每次都把 `nextCursor` 保存下来。本文后面出现的 `msg`，都是 `updates.msgs` 数组中的一条消息。

## 入站消息里最重要的字段

最常用的是：

- `msg.from_user_id`
  通常就是你回复时的 `toUserId`
- `msg.context_token`
  回复已有会话时建议原样透传
- `msg.item_list`
  文本、图片、语音、文件、视频等消息内容都在这里

这里有一个很重要的前提：第一次开始对话时，通常也要先依赖这条入站消息把 `context_token` 带回来。也就是说，应该先让微信用户主动发来一条消息，再由服务端进入回复链路。

## 读取文本和语音转写

`item_list` 中每一项的 `type` 决定具体内容字段。文本消息使用 `text_item.text`，语音消息使用 `voice_item`：

```ts
const updates = await client.poll(cursor);

for (const msg of updates.msgs ?? []) {
  for (const item of msg.item_list ?? []) {
    if (item.type === MessageItemType.TEXT) {
      console.log(item.text_item?.text);
    }

    if (item.type === MessageItemType.VOICE) {
      const transcript = item.voice_item?.text?.trim();
      const displayText = transcript ? `[语音] ${transcript}` : "[语音]";
      console.log(displayText);
    }
  }
}
```

`voice_item.text` 是 `getupdates` 服务端响应中携带的可选语音转写结果。`wx-link` 只负责解析响应，不会下载音频后自行执行 ASR，也不会生成或补写这个字段。

语音音频和转写文本是两份独立数据：

- `voice_item.media` 用于定位、下载和解密音频
- `voice_item.text` 是服务端可能返回的转写文本
- 音频能够下载不代表一定存在转写
- 没有 `text` 时，如有需要，可以下载音频后接入自己的 ASR 服务

协议没有承诺转写一定返回，也没有规定服务端何时生成转写。业务代码不要把 `voice_item.text` 当成必填字段。

## 回复文本

```ts
const updates = await client.poll(cursor);

for (const msg of updates.msgs ?? []) {
  if (!msg.from_user_id) continue;

  await client.sendText({
    toUserId: msg.from_user_id,
    text: "hello",
    contextToken: msg.context_token,
  });
}
```

## 发送 typing

```ts
const updates = await client.poll(cursor);

for (const msg of updates.msgs ?? []) {
  if (!msg.from_user_id) continue;
  await client.sendTyping(msg.from_user_id, msg.context_token);
}
```

高层 `client.sendTyping()` 会自动先拿 `typing_ticket`，通常不用你自己处理。

## 发送长文本

```ts
const longText = "这里放需要自动拆分的长文本";
const updates = await client.poll(cursor);

for (const msg of updates.msgs ?? []) {
  if (!msg.from_user_id) continue;

  await client.sendTextChunked(
    msg.from_user_id,
    longText,
    msg.context_token,
  );
}
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
- [媒体流程](./media-flow.md)
