<div align="center">

# FANDEX

**现代化知识图谱学习平台** · Tauri 2 + Astro 7 + React 19

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=flat-square&logo=github&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-22c55e?style=flat-square&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-exe/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

</div>

---

## 项目维护公告

尊敬的用户：

感谢您一直以来对 FANDEX 项目的关注与支持。为推动项目长期健康发展，FANDEX 体系正在进行全面整合与架构重构，相关调整说明如下：

1. **内容更新暂停**：本仓库及站内文档内容将暂停更新与维护，不再新增或修订学习资料。
2. **美术风格持续探索**：后续仍将围绕 UI/UX 设计与视觉风格进行探索性迭代与更新。
3. **项目重构与新仓库发布**：FANDEX 体系项目正在进行整体重构，未来将以全新仓库形式重新发布。
4. **维护重心迁移**：新仓库上线后，所有项目维护与内容更新将统一迁移至新仓库进行，本仓库将进入归档状态。

如有任何疑问或建议，欢迎通过 GitHub Issues 与我们联系。

—— FANDEX 项目组 · 2026 年 7 月

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
