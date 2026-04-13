# 媒体流程

`wx-link` 的媒体链路分成两类：

- 出站媒体：上传后发送
- 入站媒体：解析、下载、解密

## 出站媒体怎么发

最常见的三种输入方式：

- 本地文件路径
- 内存里的 `Buffer`
- 远程 URL

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

收到图片、文件、视频消息后，通常先从 `msg.item_list` 取到 `MessageItem`。

### 只解析，不下载

```ts
const media = client.resolveInboundMedia(item);
```

适合只想拿 URL、类型、文件名等信息。

### 下载并解密

```ts
const downloaded = await client.downloadInboundMedia(item);
```

适合你真正需要拿到文件内容时使用。

## 入站媒体为什么不能直接显示

很多入站媒体本质上是 CDN 密文，消息里会带这些字段：

- `encrypt_query_param`
- `aes_key`

SDK 会利用这些字段拼下载地址并执行解密。

## 什么时候用高层，什么时候用 helper

优先用高层 `WxLinkClient`：

- 发图片、视频、文件
- 解析入站媒体
- 下载入站媒体

只有当你要自己拆上传链路、自己处理 CDN 或做更底层协议封装时，才直接用 media helpers。

相关参考：

- [媒体 API](../api/media.md)
- [状态与关键字段](./state-and-fields.md)
