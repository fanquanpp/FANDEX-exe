<div align="center">

# FANDEX

**现代化知识图谱学习平台** · Tauri 2 + Astro 7 + React 19

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=flat-square&logo=github&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-22c55e?style=flat-square&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-exe/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

</div>

---

## 重要通知

> **2026 年 7 月 24 日**

为推进 FANDEX 体系的长期演进，整体项目正进行整合与重构，后续将以全新仓库（`fanquanpp/FANDEX`）作为唯一维护主体重新发布，预计 2026 年 8 月下旬正式完成。

据此，本仓库内容及站内文档自即日起暂停更新，但仍会围绕美术风格、交互体验（UI/UX）等方向持续探索。新仓库正式发布后，本仓库将进入只读归档状态，现有源码与历史 Release 仍可自由获取与使用；如有 fork 或二次开发需求，请遵循 MIT 许可证条款自行处理，作者不再对使用过程中的任何问题提供支持。

敬请留意后续公告，感谢您的理解与支持。

—— FANDEX 维护者

---

## 简介

基于 Astro 7 静态站点生成 + React 19 交互岛屿的渐进式自学平台，覆盖零基础到本科毕业的 51 个知识模块、1996 篇文档。支持 Tauri 2 桌面端跨平台运行（Windows / macOS / Linux）与 PWA 离线访问。

## 快速开始

```bash
git clone https://github.com/fanquanpp/FANDEX-exe.git
cd FANDEX-exe
corepack enable
pnpm install

pnpm dev           # Web 开发（端口 4321）
pnpm tauri:dev     # Tauri 桌面端开发
pnpm build         # Web 静态站点构建
pnpm tauri:build   # 跨平台桌面安装包
```

## 技术栈

| 层级 | 技术 | 用途 |
| :--- | :--- | :--- |
| 桌面壳层 | Tauri 2.11 | 跨平台原生应用，Rust 后端 + WebView 前端 |
| 静态生成 | Astro 7 | SSG 构建，内容优先，岛屿架构 |
| 交互层 | React 19 | 交互组件 |
| 样式 | Tailwind CSS v4 + shadcn/ui | CSS-first 主题，深色 / 浅色双模式 |
| 状态管理 | Zustand v5 | 轻量全局状态 + IndexedDB 持久化 |
| 搜索 | Pagefind + Fuse.js | 构建时索引 + 客户端 fallback |
| 工具链 | Biome v2 | lint + format 一体化 |

## 关联项目

| 仓库 | 定位 |
| :--- | :--- |
| [FANDEX-web](https://github.com/fanquanpp/FANDEX-web) | 线上学习平台，内容基准仓库 |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | Android 离线速查应用 |

## 许可证

[MIT License](./LICENSE) · Copyright (c) 2026 FANDEX Project

## 免责声明

本仓库所有内容均由人工与人工智能技术协同编撰，受限于编撰方式及知识更新周期，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。因使用或引用本仓库内容所产生的一切直接或间接后果，均由使用者自行承担。
