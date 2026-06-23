# 媒体流程

`wx-link` 的媒体链路分成两类：

- 出站媒体：上传后发送
- 入站媒体：解析、下载、解密

## 出站媒体怎么发

最常见的三种输入方式：

- 本地文件路径
- 内存里的 `Buffer`
- 远程 URL

下面示例中的 `msg` 来自 `client.poll()` 返回的 `updates.msgs`。回复入站消息时，可以这样取得目标用户和上下文：

```ts
// 这里用空字符串表示首次轮询；实际应用应传入已保存的 cursor
const updates = await client.poll("");
const msg = updates.msgs?.find((message) => message.from_user_id);

if (!msg?.from_user_id) {
  throw new Error("本轮没有可回复的入站消息");
}

const toUserId = msg.from_user_id;
const contextToken = msg.context_token;
```

### 按路径发送

```ts
await client.sendImage({
  toUserId,
  filePath: "./demo.jpg",
  contextToken,
});
```

### 按 Buffer 发送

```ts
import { readFile } from "node:fs/promises";

const buffer = await readFile("./demo.jpg");

await client.sendImageBuffer({
  toUserId,
  buffer,
  fileName: "demo.jpg",
  contextToken,
});
```

### 按 URL 发送

```ts
await client.sendMediaFromUrl({
  toUserId,
  url: "https://example.com/demo.jpg",
  contextToken,
});
```

## 出站媒体里常见字段从哪来

- `filekey`
  上传前生成的临时文件标识
- `aeskey`
  上传时生成的 AES key
- `downloadEncryptedQueryParam`
  CDN 上传成功后返回，用于后续消息里的下载参数

这些字段大多是上传链路里的临时值，通常不需要长期保存。

## 入站媒体怎么处理

收到图片、语音、文件、视频消息后，通常先从 `msg.item_list` 取到 `MessageItem`。

这里的完整来源关系是：

```ts
const updates = await client.poll("");

for (const msg of updates.msgs ?? []) {
  for (const item of msg.item_list ?? []) {
    const media = client.resolveInboundMedia(item);
    console.log(media);
  }
}
```

### 只解析，不下载

```ts
const updates = await client.poll("");

for (const msg of updates.msgs ?? []) {
  for (const item of msg.item_list ?? []) {
    const media = client.resolveInboundMedia(item);
    if (media) {
      console.log(media.type, media.url);
    }
  }
}
```

适合只想拿 URL、类型、文件名等信息。

### 下载并解密

```ts
const updates = await client.poll("");

for (const msg of updates.msgs ?? []) {
  for (const item of msg.item_list ?? []) {
    const downloaded = await client.downloadInboundMedia(item);
    if (downloaded) {
      console.log(downloaded.contentType, downloaded.buffer.length);
    }
  }
}
```

适合你真正需要拿到文件内容时使用。

### 语音消息

语音消息的 `MessageItem.type` 是 `MessageItemType.VOICE`，内容位于 `voice_item`：

```ts
const updates = await client.poll("");

for (const msg of updates.msgs ?? []) {
  const voiceItem = msg.item_list?.find(
    (item) => item.type === MessageItemType.VOICE,
  );

  if (voiceItem) {
    const transcript = voiceItem.voice_item?.text;
    const downloaded = await client.downloadInboundMedia(voiceItem);

    console.log(transcript);
    console.log(downloaded?.contentType, downloaded?.buffer.length);
  }
}
```

`voice_item` 常见字段：

| 字段 | 说明 |
| --- | --- |
| `media` | 语音文件的 CDN 引用和解密信息 |
| `encode_type` | 服务端返回的音频编码类型 |
| `bits_per_sample` | 音频位深 |
| `sample_rate` | 采样率，单位 Hz |
| `playtime` | 播放时长，单位毫秒 |
| `text` | 可选的服务端语音转写结果 |

`voice_item.text` 不由媒体下载或 AES 解密产生。SDK 收到 `getupdates` 响应时，它要么已经存在于消息体中，要么不存在。需要稳定获得文本时，应在字段缺失后把解密音频交给自己的 ASR 服务。

## 入站媒体为什么不能直接显示

很多入站媒体本质上是 CDN 密文，消息里会带这些字段：

- `encrypt_query_param`
- `aes_key`

SDK 会利用这些字段拼下载地址并执行解密。

## 什么时候用高层，什么时候用 helper

优先用高层 `WxLinkClient`：

- 发图片、视频、文件
- 解析收到的图片、语音、视频和文件
- 下载入站媒体

只有当你要自己拆上传链路、自己处理 CDN 或做更底层协议封装时，才直接用 media helpers。

相关参考：

- [媒体 API](../api/media.md)
- [状态与关键字段](./state-and-fields.md)
