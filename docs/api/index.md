# API Reference

这一组文档只回答一件事：`wx-link` 的能力应该怎么调用。

如果你还在理解接入流程、状态保存或字段来源，建议先看 Guide：

- [快速接入](../guide/quickstart.md)
- [状态与关键字段](../guide/state-and-fields.md)

## 分类

- [登录 API](./login.md)
  扫码登录、显式登录 session、二维码状态轮询
- [收发消息 API](./messaging.md)
  `WxLinkClient`、轮询、文本消息、typing、发送媒体
- [媒体 API](./media.md)
  上传 helper、远程下载、入站媒体解析、下载和解密
- [底层协议 API](./protocol.md)
  raw HTTP endpoint wrappers 和请求上下文
- [参考索引](./reference.md)
  常量、枚举、日志 helper、常用类型入口
