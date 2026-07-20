<div align="center">

# FANDEX

**现代化知识图谱学习平台** · Tauri 2 + Astro 7 + React 19

基于 Astro 7 静态站点生成 + React 19 交互岛屿的渐进式自学平台，覆盖零基础到本科毕业的 51 个知识模块、1996 篇文档。支持 Tauri 2 桌面端跨平台运行（Windows / macOS / Linux）与 PWA 离线访问。

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=flat-square&logo=github&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-22c55e?style=flat-square&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-exe/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://v2.tauri.app)
[![Astro 7](https://img.shields.io/badge/Astro-7-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

</div>

---

## v3.0.0 发布信息

FANDEX v3.0.0 是基于 Tauri 2.11 + Astro 7 + React 19 + Tailwind v4 的全最新技术栈重构版本，已通过完整风险控制验证。

### 安装包下载

| 平台 | 安装包 | 大小 | 说明 |
| :--- | :--- | :--- | :--- |
| Windows x64 | `FANDEX_3.0.0_x64_en-US.msi` | ~73 MB | MSI 标准安装包（推荐企业部署） |
| Windows x64 | `FANDEX_3.0.0_x64-setup.exe` | ~64 MB | NSIS 用户向安装包（推荐个人用户） |

下载地址：[GitHub Releases](https://github.com/fanquanpp/FANDEX-exe/releases/tag/v3.0.0)

### 风险控制验证结果

- **P1.2 Tauri 构建验证**：Rust 后端编译通过，2 个 Windows 安装包（MSI + NSIS）成功生成
- **P1.3 Playwright E2E 测试**：48 个测试全量通过（47 passed / 1 skipped 移动端专属测试）
- **P2.4 术语表索引**：7174 条术语成功解析（修复 git/markdown 多段标题格式问题）
- **P3.1 CI 工作流兼容**：content-update.yml 适配 pnpm 10 / Node 24
- **Biome Lint**：17 errors + 8 warnings 全部清零
- **单元测试**：151/151 全部通过
- **Astro 构建**：3804 页面构建成功，Pagefind 索引 1996 页 / 57457 词

### 已知限制

- **TypeScript 7.0 与 `astro check` 不兼容**：使用 `tsc --noEmit` 作为替代方案，等待 Astro 官方支持 TS 7.x
- **Tauri 2.11 API 变更**：`WebviewWindow::zoom()` / `toggle_maximize()` / `FsExt::scope()` 已移除，分别通过 emit 事件 + 前端 CSS zoom、`is_maximized + maximize/unmaximize`、capabilities 静态配置替代
- **TipTap SSR 不兼容**：AnnotationLayer 使用 `client:only="react"` 跳过 SSR，避免 `document is not defined` 错误

---

## 特性

- **Tauri 2 桌面端**：跨平台原生应用（Windows / macOS / Linux），最小权限 capabilities 模型，Rust 后端
- **Astro 7 静态生成**：内容优先架构，零 JS 默认，按需激活 React 19 岛屿
- **React 19 岛屿交互**：16 个交互组件覆盖搜索 / 批注 / 测验 / 知识图谱 / 主题切换等核心能力
- **Tailwind v4 CSS-first**：原生 CSS 变量主题系统，深色 / 浅色双模式
- **1996 篇文档 + 51 模块**：覆盖 AI / 后端 / 大数据 / 算法 / 云原生 / Python 等核心学习方向
- **Pagefind + Fuse.js 双引擎搜索**：构建时索引（1996 页 / 57457 词）+ 客户端模糊搜索 fallback
- **Zustand v5 状态管理**：IndexedDB 持久化的学习进度与笔记
- **TipTap 批注编辑器**：富文本编辑、任务列表、链接、占位符扩展
- **Motion 动画系统**：基于 Motion v12 的过渡与手势交互
- **PWA 完整支持**：Service Worker 离线缓存 + Web App Manifest
- **Biome v2 统一工具链**：lint + format 一体化，替代 ESLint + Prettier
- **151 单元测试 + 48 E2E 测试**：Vitest + Playwright 全链路覆盖（47 passed / 1 skipped）

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
| :--- | :--- | :--- | :--- |
| 桌面壳层 | Tauri | 2.11（latest） | 跨平台原生应用封装，Rust 后端 + WebView 前端 |
| 静态生成 | Astro | 7（latest） | SSG 构建，内容优先，Markdown 管线 |
| 交互层 | React | 19（latest） | 岛屿架构，16 个交互组件 |
| 类型系统 | TypeScript | 7.0（latest） | 严格模式，全栈类型安全 |
| 样式 | Tailwind CSS | v4（latest） | CSS-first 配置，@theme 主题 |
| UI 组件 | shadcn/ui | latest | Radix UI + CVA 组件系统（20 个组件） |
| 状态管理 | Zustand | v5（latest） | 轻量全局状态 + IndexedDB 持久化 |
| 富文本 | TipTap | v3（latest） | 批注编辑器扩展 |
| 动画 | Motion | v12（latest） | 过渡与手势交互 |
| 搜索 | Pagefind + Fuse.js | latest | 构建时索引 + 客户端 fallback |
| 表单 | React Hook Form | latest | 类型安全的表单管理 |
| 校验 | Zod | latest | Schema 校验 |
| 工具链 | Biome | v2（latest） | lint + format 一体化 |
| 测试 | Vitest + Playwright | latest | 单元测试 + E2E 测试 |
| 后端 | Rust | stable | Tauri 2 IPC 命令处理 |
| 包管理 | pnpm | v10（latest） | workspace monorepo |
| 运行时 | Node.js | 24 | 构建 / 开发环境 |

## 快速开始

### 前置要求

| 工具 | 版本 | 必需 | 说明 |
| :--- | :--- | :--- | :--- |
| Node.js | >= 24.0.0 | 是 | 构建 / 开发环境 |
| pnpm | >= 10.0.0 | 是 | 包管理与 workspace |
| Rust | stable | 桌面端构建时 | Tauri 2 后端编译 |
| Git | latest | 是 | 代码管理 |
| 操作系统 | Windows 10+ / macOS 11+ / Ubuntu 22.04+ | 桌面构建 | Tauri 跨平台支持 |

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/fanquanpp/FANDEX-exe.git
cd FANDEX-exe

# 启用 pnpm（如未启用）
corepack enable
corepack prepare pnpm@latest --activate

# 安装全部 workspace 依赖
pnpm install
```

### 开发模式

```bash
# Web 开发（Astro dev server，端口 4321）
pnpm dev

# Tauri 桌面端开发（启动 Rust 后端 + WebView）
pnpm tauri:dev
```

### 构建

```bash
# Web 静态站点构建（含构建脚本 + Astro build + Pagefind 索引）
pnpm build

# Tauri 跨平台桌面端打包（生成 .exe / .dmg / .deb / .AppImage）
pnpm tauri:build
```

### 测试

```bash
# 单元测试（Vitest）
pnpm test

# E2E 测试（Playwright，需先构建产物）
pnpm test:e2e

# 类型检查（tsc --noEmit）
# 注：TypeScript 7.0 与 astro check 暂不兼容，使用 tsc --noEmit 作为替代方案
pnpm --filter web typecheck

# 代码规范检查（Biome）
pnpm lint

# 自动修复格式
pnpm format
```

## 项目结构

```
FANDEX-exe/
├── apps/
│   └── web/                          应用层 - Astro 7 + React 19 + Tailwind v4
│       ├── src/
│       │   ├── components/           12 个 Astro 组件与布局
│       │   ├── islands/              16 个 React 19 岛屿组件
│       │   ├── pages/                14 个路由页面（含 RSS / 404）
│       │   ├── scripts/              3 个客户端脚本
│       │   ├── workers/              2 个 Web Worker
│       │   ├── hooks/                React hooks（use-theme）
│       │   ├── lib/                   核心库（cn / db / keyboard / progress 等）
│       │   ├── styles/               Tailwind v4 全局样式
│       │   ├── types/                TypeScript 类型定义
│       │   └── content.config.ts     Astro 内容集合配置
│       ├── public/                   PWA 资源（manifest / sw / icons）
│       ├── tests/
│       │   ├── unit/                 151 个单元测试
│       │   └── e2e/                   48 个 E2E 测试
│       ├── astro.config.ts           Astro 配置（Markdown / Shiki / KaTeX / MDX）
│       ├── biome.json                Biome v2 配置
│       └── package.json
├── src-tauri/                        Tauri 2 桌面端
│   ├── src/                          Rust 后端源码
│   ├── capabilities/                 权限配置（最小权限模型）
│   ├── Cargo.toml
│   └── tauri.conf.json               Tauri 应用配置
├── packages/                        共享能力层
│   ├── markdown/                     Remark / Rehype 插件
│   ├── search/                       术语搜索与 tooltip
│   └── shared/                       共享常量与模块定义
├── content/                          内容基准源 - 1996 篇 Markdown 文档（51 模块）
├── metadata/                         知识工程层 - 术语 / 路线图 / 标签 / 复习卡片
├── scripts/                          10 个构建脚本（索引 / 图谱 / Pagefind）
├── .github/
│   ├── workflows/                    CI/CD 流水线
│   │   ├── ci.yml                    持续集成（lint + typecheck + test + build + e2e）
│   │   ├── deploy.yml                GitHub Pages 部署
│   │   ├── release-tauri.yml         Tauri 跨平台发布
│   │   ├── release.yml               Release Drafter
│   │   └── codeql.yml                代码安全扫描
│   ├── ISSUE_TEMPLATE/               Issue 模板
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── release-drafter.yml           Release Drafter 配置
├── .husky/                           Git 钩子
│   ├── pre-commit                    lint-staged（Biome）
│   └── commit-msg                    Conventional Commits 校验
├── pnpm-workspace.yaml               pnpm workspace 配置
├── biome.json                        根 Biome 配置
├── lint-staged.config.mjs            lint-staged 配置
├── package.json                      根 package.json
└── tsconfig.json
```

### Monorepo 架构

采用 pnpm workspace 管理的多包仓库结构，关注点分离，依赖方向单向向下：

```
应用层 (apps/web)  ──引用──>  能力层 (packages/*)  ──引用──>  内容层 (content/、metadata/)
```

> 禁止反向依赖。能力层的 Remark/Rehype 插件在 Astro 构建时消费 `content/` 与 `metadata/`，将术语标记、Mermaid 图表、数学公式等在构建时预编译为静态 HTML，运行时零 JS 依赖。

## CI/CD 流水线

仓库配置 5 个 GitHub Actions 工作流：

| 工作流 | 触发条件 | 主要任务 |
| :--- | :--- | :--- |
| `ci.yml` | push main / pull_request | lint → typecheck → test → build → e2e |
| `deploy.yml` | push main（内容/前端变更） | 构建 + 部署到 GitHub Pages |
| `release-tauri.yml` | push tag `v*.*.*` | 跨平台 matrix 构建 Tauri 安装包 + 发布 Release |
| `release.yml` | push main | Release Drafter 自动生成 changelog 草稿 |
| `codeql.yml` | push main / pull_request / 周一 | 代码安全扫描（JS/TS + Rust） |

## 关联项目

| 仓库 | 定位 | 与本仓库的关系 |
| :--- | :--- | :--- |
| [FANDEX-web](https://github.com/fanquanpp/FANDEX-web) | 线上学习平台 | 内容基准仓库，本仓库 `content/` 与其保持同步 |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | 离线移动速查应用 | 消费本仓库 `build:mobile` 产出的 dist-mobile.zip |

## 贡献

欢迎通过 Issue 报告问题或通过 Pull Request 贡献代码。提交前请阅读：

- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - 贡献者行为准则
- [SECURITY.md](./SECURITY.md) - 安全政策与漏洞报告指南
- [CHANGELOG.md](./CHANGELOG.md) - 更新日志

### Commit 规范

本仓库严格遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

允许的 type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore` / `build` / `ci` / `revert`

## 许可证

本仓库基于 [MIT 许可证](./LICENSE) 完全开源（Copyright (c) 2026 FANDEX Project）。任何个人或机构均可自由获取、使用、修改和分发本仓库全部内容，包括学习、研究、修改、分发及商业用途，但须保留原始版权声明与许可声明。

## 免责声明

- 本仓库所有内容均由人工与人工智能技术协同编撰。受限于编撰方式及知识更新周期，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证
- 因使用或引用本仓库内容所产生的一切直接或间接后果，均由使用者自行承担
- 本仓库不保证内容的准确性、完整性、时效性或适用性
