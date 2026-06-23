<div align="center">

# FANDEX-exe

**Windows 桌面端离线学习平台** · Electron 33

为 Windows 系统打造的完全离线桌面学习应用。将 FANDEX-web 的全部学习内容封装为独立桌面程序，无需浏览器、无需网络、无需 Node.js 运行时，安装后双击图标即可使用。在离线访问基础上，提供网页端不具备的桌面级特殊功能。

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![文档数](https://img.shields.io/badge/文档-2031-0ea5e9?style=flat-square)](https://github.com/fanquanpp/FANDEX-exe)
[![完全开源](https://img.shields.io/badge/开源-完全共享-22c55e?style=flat-square)](https://github.com/fanquanpp/FANDEX-exe)

</div>

---

## 项目背景

FANDEX 项目的创立初衷在于：**协助零基础学习者迈出计算机科学学习的第一步**。

众多零基础学习者在无网络环境下亦需学习，或更倾向于使用桌面应用而非浏览器。FANDEX-exe 将完整的知识体系封装为 Windows 桌面应用，确保学习者在任何环境下均可离线访问全部学习内容。

**核心理念：**

- 完全离线：安装后无需网络，所有功能本地运行
- 桌面级体验：独立窗口、系统菜单、本地文件访问
- 桌面级能力：提供网页端不具备的桌面级功能
- AI 辅助学习：鼓励学习者使用外部 AI 工具辅助学习

## 项目概述

FANDEX-exe 是 FANDEX 知识体系的 **Windows 桌面端离线学习平台**。其基于 FANDEX-web 的内容，通过 Electron 封装为独立桌面程序，内置静态文件服务器，提供完全离线的学习体验。

与网页版相比，桌面端具备以下差异：

| 维度     | FANDEX-web（网页版）       | FANDEX-exe（桌面端）                  |
| :------- | :------------------------- | :------------------------------------ |
| 访问方式 | 浏览器访问，需网络或部署   | 双击图标启动，完全离线                |
| 运行环境 | 浏览器                     | 独立桌面进程，内置 Node.js 静态服务器 |
| 系统集成 | 浏览器沙箱限制             | 系统菜单、多窗口、本地文件访问        |
| 特殊功能 | 无                         | 桌面级通知、系统托盘、本地文件操作    |
| 更新方式 | 自动部署，浏览器刷新即最新 | 需下载新版本安装包                    |

## 仓库特色

| 特色维度   | 说明                                                             |
| :--------- | :--------------------------------------------------------------- |
| 完全离线   | 内置静态服务器，安装后无需网络，所有文档和功能本地可用           |
| 桌面级体验 | 独立窗口、系统菜单栏、多窗口支持、自动隐藏菜单                   |
| 安全隔离   | contextIsolation 启用、nodeIntegration 禁用、sandbox 启用        |
| 四层分离   | monorepo 架构（内容层/知识工程层/能力层/应用层），关注点分离     |
| 多形态交付 | Web 在线版 + Electron 桌面应用 + 离线 ZIP 包 + 移动端导出产物    |
| 知识图谱   | 8800 节点 + 18183 边的知识图谱，可视化概念间的深层关联           |
| 完全开源   | 所有内容完全开源，允许任何用途（含商业用途），作者不承担任何责任 |

## 关于 AI 学习

本项目**不内置任何 AI 功能**。项目的核心理念是：在 AI 时代，学习者应当学会运用 AI 工具进行自主学习。

在桌面端离线环境下，学习者可以：

- 阅读文档后，使用外部 AI 工具（如 ChatGPT、Claude 等）解答疑惑
- 将代码示例粘贴到 AI 工具中，请求更详细的执行流程解释
- 让 AI 工具根据当前学习模块生成练习题

## 关联项目

FANDEX 生态包含以下关联仓库，各仓库代码互相独立、内容互相关联：

| 仓库                                                  | 定位             | 用处                                                           | 特色                                                                                          |
| :---------------------------------------------------- | :--------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| [FANDEX-web](https://github.com/fanquanpp/FANDEX-web) | 线上学习平台     | 零基础到本科毕业的完整在线自学，概念讲解与代码示例的系统化学习 | 内容基准仓库，51 模块 1993 篇文档，浏览器直接访问，交互测验与知识地图                         |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | 离线移动速查应用 | 移动场景下的编程语法即时查阅，实践中的语法签名与代码示例速查   | Android 原生应用，完全离线，Kotlin + Jetpack Compose 原生渲染，中英日三语界面，公式化语法速查 |

## 功能特性

| 特性       | 说明                                                      |
| :--------- | :-------------------------------------------------------- |
| 完全离线   | 内置静态服务器，所有文档和功能本地运行，无需网络          |
| 桌面窗口   | 独立窗口（1400x900），最小尺寸 1024x600，支持多窗口       |
| 系统菜单   | 文件/视图/帮助菜单，自动隐藏菜单栏                        |
| 外部链接   | 外部链接在系统默认浏览器中打开，保证安全                  |
| 进度追踪   | localStorage + IndexedDB 双存储备份，支持导出/导入 JSON   |
| 术语悬浮   | 构建时预编译术语标记，桌面端 tooltip                      |
| 交互测验   | 填空 / 选择 / 代码修正三种题型，即时反馈                  |
| 知识地图   | Mermaid 构建时预渲染为 SVG，零运行时 JS                   |
| 全文搜索   | Pagefind 构建后索引 + Fuse.js Web Worker                  |
| 暗色模式   | Dark / Light 主题切换，localStorage 持久化 + 闪烁防护     |
| 代码运行   | JS/TS 代码块 Web Worker 沙箱执行，5 秒超时保护            |
| 移动端导出 | build:mobile 脚本生成 dist-mobile.zip，供 FANDEX-App 使用 |

## 技术栈

| 层级  | 技术                           | 说明                                                      |
| :---- | :----------------------------- | :-------------------------------------------------------- |
| 框架  | Astro 5                        | SSG 静态站点生成，岛屿架构                                |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合                 |
| 桌面  | Electron 33                    | 内置静态服务器，独立桌面应用                              |
| 高亮  | Shiki                          | 双主题代码高亮（github-light / github-dark），构建时零 JS |
| 数学  | KaTeX + remark-math            | 构建时渲染，font-display:swap                             |
| 图表  | Mermaid 11                     | 构建时预渲染为 SVG                                        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker 模糊搜索                          |
| 质量  | Husky + lint-staged + Prettier | Pre-commit 自动格式化                                     |
| CI/CD | GitHub Actions                 | 三阶段流水线（codeql + build + deploy）                   |

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（端口 3000）
npm run dev

# 构建生产版本
npm run build

# Electron 开发模式
npm run electron:dev

# 打包 Windows 桌面应用
npm run electron:build

# 质量检查
npm run lint
npm run typecheck
npm run test
```

## 构建命令

```bash
# 标准 Web 构建
npm run build

# 构建移动端产物（生成 dist-mobile.zip）
npm run build:mobile

# 构建离线包
npm run build:offline
npm run pack:offline

# Electron 桌面应用
npm run electron:dev       # 开发模式
npm run electron:build     # 打包 exe
```

## 四层分离架构

```
FANDEX-exe/
  content/               内容层 — Markdown 文档源（51 模块）
  metadata/              知识工程层 — 术语/路线图/标签/复习卡片
  packages/              能力层 — Remark/Rehype 插件 + 共享数据 + 术语搜索
  apps/web/              应用层 — Astro 5 SSG 项目
    src/                   页面、组件、布局、服务层
    electron/              Electron 桌面应用（main.js / preload.js）
  scripts/               构建脚本（22 个）
```

依赖方向单向向下：应用层引用能力层和知识工程层，能力层引用内容层，禁止反向依赖。

## 部署

仓库已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），push 到 `main` 分支即自动构建发布。

**流水线阶段：**

1. **setup** — 安装依赖，缓存 node_modules
2. **build** — 构建站点，运行 QA 检查，上传产物
3. **build-offline** — 构建离线 ZIP 包
4. **build-electron** — 构建 Windows 桌面应用
5. **release** — 创建 GitHub Release（含离线包 + 桌面应用）
6. **deploy** — 部署到 GitHub Pages

## 更新日志规则

| 级别       | 版本号变化         | 说明                                            | 日志书写方式                         |
| :--------- | :----------------- | :---------------------------------------------- | :----------------------------------- |
| 大版本更新 | `1.x.x` -> `2.x.x` | 新模块、新功能、新页面增加及重构                | 独立作为更新版本，详细说明更新内容   |
| 小更新     | `1.0.x` -> `1.1.x` | 小 BUG 修复（文档纠错、按钮位置调整、颜色优化） | 写在大版本更新日志内，简要书写       |
| 补丁修复   | `1.x.0` -> `1.x.1` | 同一问题或其所属范围内的多次修复                | 写在小更新日志内，写"修复了一些 BUG" |

> 仓库记录每一次更新日志，须附带详细日期与内容，无论版本大小。

## 开源共享与免责声明

### 开源共享

本仓库所有内容均完全开源。任何个人或机构均可自由获取、使用、修改和分发本仓库的全部内容，包括但不限于学习、研究、修改、分发及商业用途，无需获得作者授权。

### 免责声明

- 本仓库所有内容均由人工与人工智能技术协同编撰、搜集、整理与编排。受限于编撰方式及知识更新周期，内容可能存在遗漏、过时或错误之处。使用者应结合官方文档与权威资料进行独立验证与核实，切勿将本仓库内容作为唯一依据
- 因使用或引用本仓库内容所产生的一切直接或间接后果，均由使用者自行承担。本仓库作者及维护者不对使用后果承担任何形式的法律责任或连带责任
- 本仓库不保证内容的准确性、完整性、时效性或适用性。在任何情况下，本仓库作者及维护者均不对因使用本仓库内容而导致的任何损失或损害承担责任
