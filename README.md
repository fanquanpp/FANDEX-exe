<div align="center">

# FANDEX

**现代化知识图谱学习平台** · Tauri 2 + Astro 7 + React 19

基于 Astro 7 静态站点生成 + React 19 交互岛屿的渐进式自学平台，覆盖零基础到本科毕业的 51 个知识模块、1996 篇文档。支持 Tauri 2 桌面端跨平台运行（Windows / macOS / Linux）与 PWA 离线访问。

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=flat-square&logo=github&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-22c55e?style=flat-square&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-exe/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://v2.tauri.app)
[![Astro 7](https://img.shields.io/badge/Astro-7-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

</div>

---

## 核心特性

- **跨平台桌面端**：Tauri 2 原生应用，支持 Windows / macOS / Linux，Rust 后端 + WebView 前端
- **1996 篇文档 + 51 模块**：覆盖 AI / 后端 / 大数据 / 算法 / 云原生 / Python 等核心学习方向
- **Pagefind + Fuse.js 双引擎搜索**：构建时索引（1996 页 / 57457 词）+ 客户端模糊搜索 fallback
- **React 19 岛屿交互**：16 个交互组件覆盖搜索 / 批注 / 测验 / 知识图谱 / 主题切换
- **TipTap 批注编辑器**：富文本编辑、任务列表、链接、占位符扩展
- **Zustand v5 + IndexedDB**：学习进度与笔记持久化
- **PWA 完整支持**：Service Worker 离线缓存 + Web App Manifest
- **Tailwind v4 + shadcn/ui**：CSS-first 主题系统，深色 / 浅色双模式

## 快速开始

### 环境要求

- Node.js >= 24
- pnpm >= 10
- Rust stable（桌面端构建）
- Git

### 安装与运行

```bash
git clone https://github.com/fanquanpp/FANDEX-exe.git
cd FANDEX-exe
corepack enable
pnpm install

# Web 开发（端口 4321）
pnpm dev

# Tauri 桌面端开发
pnpm tauri:dev

# 构建
pnpm build           # Web 静态站点
pnpm tauri:build     # 跨平台桌面安装包
```

## 技术栈

| 层级 | 技术 | 用途 |
| :--- | :--- | :--- |
| 桌面壳层 | Tauri 2.11 | 跨平台原生应用，Rust 后端 + WebView 前端 |
| 静态生成 | Astro 7 | SSG 构建，内容优先，岛屿架构 |
| 交互层 | React 19 | 16 个交互组件 |
| 类型系统 | TypeScript 7 | 严格模式，全栈类型安全 |
| 样式 | Tailwind CSS v4 + shadcn/ui | CSS-first 主题，深色 / 浅色双模式 |
| 状态管理 | Zustand v5 | 轻量全局状态 + IndexedDB 持久化 |
| 富文本 | TipTap v3 | 批注编辑器扩展 |
| 搜索 | Pagefind + Fuse.js | 构建时索引 + 客户端 fallback |
| 工具链 | Biome v2 | lint + format 一体化 |
| 包管理 | pnpm v10 | workspace monorepo |

## 关联项目

| 仓库 | 定位 | 关系 |
| :--- | :--- | :--- |
| [FANDEX-web](https://github.com/fanquanpp/FANDEX-web) | 线上学习平台 | 内容基准仓库，本仓库 `content/` 与其保持同步 |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | Android 离线速查应用 | 消费本仓库 `build:mobile` 产出的移动端资源 |

## 许可证

[MIT License](./LICENSE) · Copyright (c) 2026 FANDEX Project

## 免责声明

本仓库所有内容均由人工与人工智能技术协同编撰，受限于编撰方式及知识更新周期，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。因使用或引用本仓库内容所产生的一切直接或间接后果，均由使用者自行承担。
