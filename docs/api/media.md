# 媒体 API

这页只讲媒体相关 helper 和工具函数。

## `downloadRemoteMedia(params)`

**用途**

把远程文件下载到内存。

**什么时候该用**

你要先取回远程文件内容，再继续上传或处理时使用。

**签名**

```ts
downloadRemoteMedia(params: {
  url: string;
  fetchImpl?: typeof fetch;
}): Promise<{ buffer: Buffer; contentType: string | null; fileName: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string` | 远程文件地址 |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |

**返回值**

```ts
{
  buffer: Buffer;
  contentType: string | null;
  fileName: string;
}
```

**关键字段来源**

- `fileName` 是 SDK 根据响应头或 URL 推断出的临时文件名

**最小示例**

```ts
const remote = await downloadRemoteMedia({ url: "https://example.com/demo.jpg" });
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

## 上传 helper

### `uploadImageToWeixin(params)` / `uploadVideoToWeixin(params)` / `uploadFileToWeixin(params)`

**用途**

按本地文件路径上传媒体。

**什么时候该用**

你要自己控制上传链路，而不是直接用 `WxLinkClient` 时使用。

**签名**

```ts
uploadImageToWeixin(params): Promise<UploadedFileInfo>
uploadVideoToWeixin(params): Promise<UploadedFileInfo>
uploadFileToWeixin(params): Promise<UploadedFileInfo>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ctx` | `ApiContext` | API 上下文 |
| `filePath` | `string` | 本地文件路径 |
| `toUserId` | `string` | 目标微信用户 ID |
| `cdnBaseUrl` | `string` | CDN 地址，可选 |

**返回值**

```ts
interface UploadedFileInfo {
  filekey: string;
  downloadEncryptedQueryParam: string;
  aeskey: string;
  aesKeyBase64: string;
  fileSize: number;
  fileSizeCiphertext: number;
}
```

**关键字段来源**

- `filekey` 和 `aeskey` 是上传前生成的临时字段
- `downloadEncryptedQueryParam` 来自 CDN 上传成功响应

**最小示例**

```ts
const uploaded = await uploadImageToWeixin({
  ctx,
  filePath: "./demo.jpg",
  toUserId,
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `uploadImageBufferToWeixin(params)` / `uploadVideoBufferToWeixin(params)` / `uploadFileBufferToWeixin(params)`

**用途**

按内存 `Buffer` 上传媒体。

**什么时候该用**

你已经拿到内存中的文件内容，并且要自己构造发消息链路时使用。

**签名**

```ts
uploadImageBufferToWeixin(params): Promise<UploadedFileInfo>
uploadVideoBufferToWeixin(params): Promise<UploadedFileInfo>
uploadFileBufferToWeixin(params): Promise<UploadedFileInfo>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ctx` | `ApiContext` | API 上下文 |
| `buffer` | `Buffer` | 文件内容 |
| `toUserId` | `string` | 目标微信用户 ID |
| `cdnBaseUrl` | `string` | CDN 地址，可选 |

**返回值**

与 `UploadedFileInfo` 相同。

**关键字段来源**

- 各返回字段来源与路径上传版本相同

**最小示例**

```ts
const uploaded = await uploadImageBufferToWeixin({
  ctx,
  buffer,
  toUserId,
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `uploadBufferToCdn(params)`

**用途**

把明文 `Buffer` 上传到 CDN。

**什么时候该用**

只有在你自己拆分上传流程时才需要直接调用。

**签名**

```ts
uploadBufferToCdn(params: {
  buffer: Buffer;
  uploadFullUrl?: string;
  uploadParam?: string;
  filekey: string;
  cdnBaseUrl?: string;
  aesKey: Buffer;
  fetchImpl?: typeof fetch;
}): Promise<{ downloadParam: string }>
```

**参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `buffer` | `Buffer` | 明文内容 |
| `uploadFullUrl` | `string` | 完整上传 URL，可选 |
| `uploadParam` | `string` | 加密上传参数，可选 |
| `filekey` | `string` | 文件标识 |
| `cdnBaseUrl` | `string` | CDN 地址，可选 |
| `aesKey` | `Buffer` | AES key |
| `fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |

**返回值**

```ts
{ downloadParam: string }
```

**关键字段来源**

- `downloadParam` 来自 CDN 响应头 `x-encrypted-param`

**最小示例**

```ts
const uploaded = await uploadBufferToCdn({
  buffer,
  uploadParam,
  filekey,
  aesKey,
});
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

## 入站媒体 helper

### `resolveInboundMedia(item, options?)`

**用途**

解析入站媒体，不下载。

**什么时候该用**

你只想拿到 URL、媒体类型、文件名等信息时使用。

**签名**

```ts
resolveInboundMedia(
  item: MessageItem,
  options?: { cdnBaseUrl?: string },
): ResolvedInboundMedia | null
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `item` | `MessageItem` | 入站消息项 |
| `options.cdnBaseUrl` | `string` | 自定义 CDN 地址，可选 |

**返回值**

```ts
ResolvedInboundMedia | null
```

**关键字段来源**

- 下载地址来自入站消息原始 URL、CDN URL 或 `encrypt_query_param`
- `aesKeyBase64` 来自消息体里的媒体 key

**最小示例**

```ts
const media = resolveInboundMedia(item);
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `downloadInboundMedia(item, options?)`

**用途**

下载并解密入站媒体。

**什么时候该用**

你需要真正拿到文件内容时使用。

**签名**

```ts
downloadInboundMedia(
  item: MessageItem,
  options?: { cdnBaseUrl?: string; fetchImpl?: typeof fetch },
): Promise<DownloadedInboundMedia | null>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `item` | `MessageItem` | 入站消息项 |
| `options.cdnBaseUrl` | `string` | 自定义 CDN 地址，可选 |
| `options.fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |

**返回值**

```ts
DownloadedInboundMedia | null
```

**关键字段来源**

- 解密所需的媒体 key 来自消息体

**最小示例**

```ts
const downloaded = await downloadInboundMedia(item);
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `downloadResolvedInboundMedia(media, options?)`

**用途**

对已经解析出的媒体对象执行下载和解密。

**什么时候该用**

你已经先做过 `resolveInboundMedia()`，现在只想继续下载时使用。

**签名**

```ts
downloadResolvedInboundMedia(
  media: ResolvedInboundMedia,
  options?: { fetchImpl?: typeof fetch },
): Promise<DownloadedInboundMedia>
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `media` | `ResolvedInboundMedia` | 已解析媒体对象 |
| `options.fetchImpl` | `typeof fetch` | 自定义 `fetch`，可选 |

**返回值**

```ts
DownloadedInboundMedia
```

**关键字段来源**

- `media` 通常来自 `resolveInboundMedia()`

**最小示例**

```ts
const resolved = resolveInboundMedia(item);
if (resolved) {
  const downloaded = await downloadResolvedInboundMedia(resolved);
}
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

## 媒体工具函数

### `buildCdnDownloadUrl(encryptedQueryParam, cdnBaseUrl?)`

**用途**

根据下载参数拼 CDN 下载 URL。

**什么时候该用**

你在做更底层的媒体处理逻辑时使用。

**签名**

```ts
buildCdnDownloadUrl(encryptedQueryParam: string, cdnBaseUrl?: string): string
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `encryptedQueryParam` | `string` | 加密下载参数 |
| `cdnBaseUrl` | `string` | CDN 地址，可选 |

**返回值**

- `string`

**关键字段来源**

- `encryptedQueryParam` 典型来源是入站消息媒体字段里的 `encrypt_query_param`

**最小示例**

```ts
const url = buildCdnDownloadUrl(encryptedQueryParam);
```

**相关 Guide**

- [媒体流程](../guide/media-flow.md)

### `parseInboundAesKey(aesKeyBase64)`

**用途**

把媒体 key 解析成可用于解密的 `Buffer`。

**什么时候该用**

只有你要自己调用解密函数时使用。

**签名**

```ts
parseInboundAesKey(aesKeyBase64: string): Buffer
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `aesKeyBase64` | `string` | base64 形式的媒体 key |

**返回值**

- `Buffer`

**关键字段来源**

- `aesKeyBase64` 典型来源是入站媒体里的 `aes_key`

**最小示例**

```ts
const key = parseInboundAesKey(aesKeyBase64);
```

### `decryptInboundMedia(ciphertext, aesKeyBase64)`

**用途**

用媒体 key 解密下载到的密文。

**什么时候该用**

只有你在自己拼接下载与解密流程时使用。

**签名**

```ts
decryptInboundMedia(ciphertext: Buffer, aesKeyBase64: string): Buffer
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `ciphertext` | `Buffer` | 下载到的密文 |
| `aesKeyBase64` | `string` | 媒体 key |

**返回值**

- `Buffer`

**关键字段来源**

- `ciphertext` 来自 CDN 下载结果
- `aesKeyBase64` 来自入站媒体字段

**最小示例**

```ts
const plaintext = decryptInboundMedia(ciphertext, aesKeyBase64);
```

### `detectMediaContentType(buffer, fallbackType?)`

**用途**

根据文件头推断媒体 MIME 类型。

**什么时候该用**

你拿到 `Buffer` 后需要推断内容类型时使用。

**签名**

```ts
detectMediaContentType(buffer: Buffer, fallbackType?: string): string
```

**参数**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `buffer` | `Buffer` | 文件内容 |
| `fallbackType` | `string` | 推断失败时回退的 MIME 类型，可选 |

**返回值**

- `string`

**最小示例**

```ts
const contentType = detectMediaContentType(buffer);
```
