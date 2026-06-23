import { defineConfig } from "vitepress";

const base = process.env.GITHUB_ACTIONS ? "/wx-link-doc/" : "/";
const llmsTxtUrl = `${base}llms.txt`;

export default defineConfig({
  base,
  lang: "zh-CN",
  title: "wx-link",
  description: "wx-link 的 VitePress 文档站，涵盖接入 Guide 与 API Reference。",
  head: [
    ["link", { rel: "alternate", type: "text/markdown", href: llmsTxtUrl, title: "wx-link LLM context" }],
    ["link", { rel: "llms-txt", href: llmsTxtUrl }],
  ],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API Reference", link: "/api/" },
      { text: "Changelog", link: "/changelog" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "总览", link: "/guide/" },
            { text: "快速接入", link: "/guide/quickstart" },
            { text: "状态与关键字段", link: "/guide/state-and-fields" },
            { text: "登录流程", link: "/guide/login-flow" },
            { text: "轮询与回复", link: "/guide/polling-and-reply" },
            { text: "媒体流程", link: "/guide/media-flow" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "首页", link: "/api/" },
            { text: "登录 API", link: "/api/login" },
            { text: "收发消息 API", link: "/api/messaging" },
            { text: "媒体 API", link: "/api/media" },
            { text: "底层协议 API", link: "/api/protocol" },
            { text: "参考索引", link: "/api/reference" },
          ],
        },
      ],
      "/changelog": [
        {
          text: "Changelog",
          items: [{ text: "版本变更", link: "/changelog" }],
        },
      ],
    },
    editLink: {
      pattern: "https://github.com/yhsrzbg/wx-link-doc/edit/main/:path",
      text: "在代码仓库中查看此页",
    },
    footer: {
      message: "wx-link 文档站由 VitePress 构建",
      copyright: "Copyright © wx-link contributors",
    },
  },
});
