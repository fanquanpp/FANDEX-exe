# Changelog

本项目所有重要变更均会记录在本文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，并遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [3.0.0] - 2026-07-19

### Added

- Tauri 2 桌面壳层（替代 Electron 33），跨平台支持 Windows / macOS / Linux
- React 19 岛屿架构（完全移除 Vue），16 个交互组件
- Tailwind v4 CSS-first 配置（@theme 设计令牌系统）
- shadcn/ui 组件系统（20 个组件，基于 Radix UI + CVA）
- Zustand v5 状态管理 + IndexedDB 持久化
- TipTap 批注编辑器（v3，含 link / placeholder / task-list 扩展）
- Motion 动画系统（v12，过渡与手势交互）
- Command Palette 搜索（Pagefind + Fuse.js 双引擎）
- 16 个 React 岛屿组件
- 12 个 Astro 组件与布局
- 4 个 Markdown 插件 + 2 个 Web Worker
- PWA 完整支持（manifest + service worker + 5 个 PWA 资源）
- 151 单元测试 + 48 E2E 测试
- 10 个构建脚本（索引 / 图谱 / Pagefind / 离线包）
- Biome v2 统一工具链（lint + format 一体化）
- Husky Git 钩子（pre-commit + commit-msg Conventional Commits 校验）
- GitHub Actions CI/CD 流水线（ci / deploy / release-tauri / release / codeql）
- CodeQL 代码安全扫描（javascript-typescript + rust）

### Changed

- 桌面壳层从 Electron 33 → Tauri 2
- 交互层从 Vue 3 → React 19
- 样式系统从手写 CSS 变量 → Tailwind v4 CSS-first
- 状态管理从 Vue reactive → Zustand v5
- 富文本编辑从 textarea → TipTap v3
- 动画系统从 SpringAnimator → Motion v12
- 代码质量工具从 ESLint + Prettier → Biome v2
- 包管理从 npm workspace → pnpm v10 workspace
- 构建工具从 Vite 单体 → Astro 7 + Vite 集成
- 内容集合从手动管理 → Astro Content Collections
- 搜索索引从单引擎 → Pagefind + Fuse.js 双引擎

### Removed

- Electron 33 桌面壳层（含 electron-builder 配置）
- Vue 3 与所有 Vue 依赖（vue / vue-router / vuex / vue-tsc 等）
- ESLint + Prettier 配置（eslint.config.mjs / .prettierrc）
- 手写 CSS 变量系统
- electron / electron-builder / electron-builder.config.cjs
- SpringAnimator 自定义动画库

---

## [2.0.0] - 2026-07-16

### 文本勘误与完善

- 确认 LICENSE 版权年份为 2026（仓库新建于 2026 年）
- 校对 README.md，确认文档数（1996 篇）、GitHub Pages 与 Releases 链接、关联项目描述等关键内容准确无误
- 校对 DISCLAIMER.md，确认桌面应用安装风险条款与 AI 功能说明完整
- 校对 CODE_OF_CONDUCT.md 与 CONTRIBUTING.md，补充 GitHub Issues 与 Pull Requests 链接指向 fanquanpp/FANDEX-exe 仓库
- 校对 SECURITY.md，确认 GitHub Security Advisory 链接正确

### 跨项目统一重构

- packages 真包化：为 `@fandex/shared` / `@fandex/search` / `@fandex/markdown` 三个能力层 package 新增独立 `package.json`
- UI 越层 fetch 修复：`Sidebar.astro` 与 `tags/index.astro` 改为通过 `searchService` 调用，移除直接 `fetch`
- tags/index.astro `any` 类型修复：新增 `dompurify.d.ts` 类型声明，全部 `any` 改为具体类型
- CI 与配置修复：统一 lint-staged 配置至根目录，`initGlobalState` 函数用 try-catch 包裹
- 测试基线建立：新增 74 个单元测试，覆盖 search / quiz / ai-config / progress 等核心服务

---

## [1.1.0] - 2026-06-24

### 正式发行版

Windows 桌面端离线学习平台，基于 Electron + Astro 5 构建。

#### 新增

- 51 模块 1996 篇文档，完全离线访问
- 内置静态服务器，双击即可使用
- 深色/浅色双模式
- 交互测验与知识地图
- 桌面级系统集成（菜单、多窗口、全屏）
- 可选 AI 能力（需用户自行配置环境变量）
- NSIS 安装程序，支持一键安装与卸载
- 离线 ZIP 包导出功能
- 移动端导出产物生成功能
- 程序图标字母 F（path 绘制，统一品牌视觉）

#### 技术栈

- Electron 33 桌面应用框架
- Astro 5 静态站点生成
- Pagefind + Fuse.js 搜索引擎
- Service Worker 离线缓存
- TypeScript 严格模式
