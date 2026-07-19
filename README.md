<div align="center">

# FANDEX-exe

**FANDEX 知识体系的 Windows 离线桌面学习应用** · Electron 33

将 FANDEX-web 的完整学习内容封装为独立 Windows 桌面程序。无需浏览器、无需 Node.js 运行时、无需网络，安装后双击图标即可使用。基于 Electron 33 内置静态文件服务器，提供独立窗口、系统菜单、多窗口、原生对话框等浏览器沙箱无法实现的桌面级能力。

[![下载](https://img.shields.io/badge/下载-GitHub%20Releases-2563eb?style=flat-square&logo=electron&logoColor=white)](https://github.com/fanquanpp/FANDEX-exe/releases)
[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-22c55e?style=flat-square&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-exe/)
[![Electron](https://img.shields.io/badge/Electron-33.4.11-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

</div>

---

## 下载与安装

### 获取安装包

前往 [GitHub Releases](https://github.com/fanquanpp/FANDEX-exe/releases) 下载最新版 `FANDEX-Setup-x.y.z.exe`（NSIS 安装程序，仅支持 Windows x64）。

### 安装步骤

1. 双击 `FANDEX-Setup-x.y.z.exe` 启动安装向导（`oneClick: false`，非一键安装）
2. 选择安装目录（默认 `%LOCALAPPDATA%\FANDEX`，`allowToChangeInstallationDirectory: true` 支持自定义）
3. 安装向导自动创建桌面快捷方式与开始菜单快捷方式（`shortcutName: FANDEX`）
4. 安装完成后可选择立即运行（`runAfterFinish: true`）

### 卸载

通过 Windows「设置 → 应用 → FANDEX」卸载，或在安装目录运行 `Uninstall FANDEX.exe`。卸载默认保留用户学习进度数据（`deleteAppDataOnUninstall: false`）。

### 运行要求

- 操作系统：Windows 10/11（x64）
- 磁盘空间：约 500 MB（含 Chromium 运行时与全部学习内容）
- 无需预装 Node.js、浏览器或任何运行时依赖
- 无需管理员权限（`requestedExecutionLevel: asInvoker`）

---

## 桌面级能力

FANDEX-exe 与 FANDEX-web 共享同一套学习内容与前端代码，差异在于「桌面进程封装」带来的运行环境与系统集成能力。

### 与 FANDEX-web 的差异对比

| 维度       | FANDEX-web（网页版）                | FANDEX-exe（桌面端）                          |
| :--------- | :---------------------------------- | :-------------------------------------------- |
| 访问方式   | 浏览器访问 GitHub Pages，需网络     | 双击桌面/开始菜单图标启动，完全离线           |
| 运行环境   | 浏览器进程，受浏览器沙箱限制        | 独立桌面进程，内置 Node.js 静态文件服务器     |
| 站点托管   | GitHub Pages CDN                    | 本地 `127.0.0.1:4321` 内置静态服务器          |
| 系统集成   | 浏览器沙箱，无原生菜单与窗口控制    | 原生系统菜单、独立窗口、多窗口、原生对话框    |
| 外部链接   | 浏览器标签页内打开                  | 自动在系统默认浏览器中打开                    |
| 学习进度   | 浏览器 localStorage / IndexedDB    | 同上，但数据持久化在用户目录，不受浏览器清理影响 |
| 更新方式   | 部署后浏览器刷新即最新              | 需下载新版本安装包覆盖安装                    |
| 安装形态   | 无需安装                            | NSIS 安装程序，含桌面/开始菜单快捷方式        |

### 已实现的桌面级能力清单

| 能力             | 实现位置                          | 说明                                                         |
| :--------------- | :-------------------------------- | :----------------------------------------------------------- |
| 独立窗口         | `electron/main.cjs` createWindow  | 默认 1400×900，最小 1024×600，独立任务栏图标                 |
| 多窗口支持       | 「文件 → 新建窗口」(Ctrl+N)       | 可同时打开多个学习窗口，互不影响                             |
| 原生应用菜单     | `electron/main.cjs` createMenu    | 文件/视图/帮助三栏菜单，`autoHideMenuBar` 自动隐藏（Alt 显示）|
| 原生关于对话框   | 「帮助 → 关于 FANDEX」            | 调用系统 `dialog.showMessageBox`，显示版本与文档统计         |
| 外部链接拦截     | `setWindowOpenHandler`            | 非 localhost 链接转交 `shell.openExternal` 在系统浏览器打开  |
| 系统快捷方式     | `electron-builder.config.cjs`     | 安装时自动创建桌面快捷方式与开始菜单快捷方式                 |
| 应用图标         | `electron/build/icon.ico`         | 独立应用图标，区别于浏览器标签                              |
| 单实例运行       | NSIS 安装向导                     | `requestedExecutionLevel: asInvoker`，无需管理员权限         |

> 注：本仓库当前未实现系统托盘（Tray）与桌面通知（Notification）能力。

---

## 离线运行机制

1. 用户双击 FANDEX 图标启动 Electron 主进程
2. 主进程在 `app.whenReady()` 中启动内置 Node.js HTTP 服务器，监听 `127.0.0.1:4321`
3. 服务器从 `resources/dist/` 目录（打包后）或 `apps/web/dist/`（开发时）读取静态文件
4. 主进程创建 `BrowserWindow`，加载 `http://127.0.0.1:4321/`
5. 渲染进程通过 contextBridge 暴露的 `window.electronAPI` 检测运行环境
6. 应用退出时主进程关闭静态服务器（`before-quit` / `window-all-closed` 事件）

**静态服务器安全防护**：

- 路径遍历攻击防护：`path.resolve` 校验，禁止跳出根目录
- 仅监听 `127.0.0.1` 回环地址，不对外网暴露
- 所有响应附带 `Cache-Control: no-cache`，确保内容更新即时生效
- 完整 MIME 类型映射覆盖 19 种扩展名

**与 Web 版的构建差异**：Web 版基础路径为 `/FANDEX-exe/`；桌面端使用 `BASE_PATH=./`（相对路径），确保从本地 `127.0.0.1` 加载时资源路径正确解析。

---

## 安全隔离

Electron 应用默认面临「渲染进程逃逸」风险，本仓库采用三要素安全配置：

| 配置项              | 值      | 作用                                                  |
| :------------------ | :------ | :---------------------------------------------------- |
| `contextIsolation`  | `true`  | 隔离 preload 脚本与渲染进程的 JavaScript 上下文       |
| `nodeIntegration`   | `false` | 禁止渲染进程直接访问 Node.js API（`require`/`process`）|
| `sandbox`           | `true`  | 启用 Chromium 沙箱，限制渲染进程的系统调用范围        |

**预加载脚本最小化暴露**：`electron/preload.cjs` 仅通过 `contextBridge.exposeInMainWorld` 暴露 `version`、`isElectron`、`platform` 三个只读属性，不暴露任何文件系统、网络或进程控制能力。

**外部链接安全**：`setWindowOpenHandler` 拦截所有 `window.open` 调用，`http://127.0.0.1` / `http://localhost` 开头的链接在应用内打开，其他外部链接通过 `shell.openExternal` 转交系统默认浏览器处理。

---

## Monorepo 架构

采用 npm workspaces 管理的多包仓库结构，关注点分离，依赖方向单向向下。

```
FANDEX-exe/
├── apps/
│   └── web/                          应用层 — Astro 5 SSG 项目 + Electron 桌面封装
│       ├── src/                      Astro 组件 / Vue 岛屿 / 路由页面 / 服务层
│       ├── electron/                 Electron 主进程与预加载脚本
│       ├── electron-builder.config.cjs  NSIS 打包配置（Windows x64）
│       └── astro.config.ts           Astro 构建配置（Markdown 管线 / Shiki / KaTeX）
├── packages/                         能力层 — 可复用 NPM 包
│   ├── markdown/                     Remark/Rehype 插件（mermaid/admonition/term-link/image-optimize）
│   ├── search/                       术语搜索与 tooltip
│   └── shared/                       共享常量与模块定义
├── content/                          内容基准源 — Markdown 文档（51 模块 1996 篇）
├── metadata/                         知识工程层 — 术语/路线图/标签/复习卡片
├── scripts/                          构建脚本（22 个，含 build-offline/build-mobile 等）
└── .github/workflows/                CI/CD（ci.yml / codeql.yml / deploy.yml）
```

### 内容基准说明

本仓库 `content/` 目录是 FANDEX 知识体系的本地内容基准源，包含全部 51 模块、1996 篇 Markdown 文档。FANDEX-web 仓库为同一内容体系的网页版部署仓库，二者内容保持同步。本仓库在内容基础上额外提供 Electron 桌面封装能力，`content/` 目录本身不依赖桌面运行时，可被任意 Astro 构建流程消费。

### 依赖方向

应用层（apps/web） ──引用──> 能力层（packages/*） ──引用──> 内容层（content/、metadata/）

> 禁止反向依赖。能力层的 Remark/Rehipe 插件在 Astro 构建时消费 `content/` 与 `metadata/`，将术语标记、Mermaid 图表、数学公式等在构建时预编译为静态 HTML，运行时零 JS 依赖。

---

## 本地开发

### 环境要求

- Node.js 20+
- npm 10+
- Windows 10/11（仅桌面打包需要 Windows 环境与 Electron 二进制）

### 常用命令

```bash
# 安装依赖（在仓库根目录，自动安装 apps/* 与 packages/* 全部 workspace）
npm install

# Web 开发模式（端口 3000）
npm run dev

# Electron 桌面开发模式（先构建离线包，再启动 Electron）
npm run electron:dev -w apps/web

# 打包 Windows 桌面应用（生成 apps/web/release/FANDEX-Setup-x.y.z.exe）
npm run electron:build -w apps/web

# 质量检查
npm run lint -w apps/web
npm run typecheck -w apps/web
npm run test -w apps/web
```

### 构建产物对照

| 命令                     | 产物                                  | 用途                         |
| :----------------------- | :------------------------------------ | :--------------------------- |
| `npm run build`          | `apps/web/dist/`                      | 标准 Web 静态站点            |
| `npm run build:offline`  | 离线包目录                            | 本地静态服务器运行的离线包   |
| `npm run build:mobile`   | `dist-mobile.zip`                     | 供 FANDEX-App 移动端消费     |
| `npm run electron:build` | `apps/web/release/FANDEX-Setup-*.exe` | Windows NSIS 安装程序        |

### CI/CD 流水线

仓库配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），push 到 `main` 分支触发：setup → build → build-offline → build-electron → release → deploy 六阶段流水线。

---

## 关联项目

FANDEX 生态包含以下关联仓库，各仓库代码互相独立、内容互相关联：

| 仓库                                                  | 定位               | 与本仓库的关系                                |
| :---------------------------------------------------- | :----------------- | :-------------------------------------------- |
| [FANDEX-web](https://github.com/fanquanpp/FANDEX-web) | 线上学习平台       | 内容基准仓库，本仓库 `content/` 与其保持同步  |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | 离线移动速查应用   | 消费本仓库 `build:mobile` 产出的 dist-mobile.zip |

---

## 贡献与协议

### 贡献指南

欢迎通过 Issue 报告问题或通过 Pull Request 贡献代码。提交前请阅读：

- [CONTRIBUTING.md](./CONTRIBUTING.md) — 贡献指南
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — 贡献者行为准则
- [SECURITY.md](./SECURITY.md) — 安全政策与漏洞报告指南
- [DISCLAIMER.md](./DISCLAIMER.md) — 免责声明
- [Code-Wiki.md](./Code-Wiki.md) — 代码维基

### 开源协议

本仓库基于 [MIT 许可证](./LICENSE) 完全开源（Copyright (c) 2026 FANDEX Project）。任何个人或机构均可自由获取、使用、修改和分发本仓库全部内容，包括学习、研究、修改、分发及商业用途，无需获得作者授权，但须保留原始版权声明与许可声明。

### 免责声明

- 本仓库所有内容均由人工与人工智能技术协同编撰。受限于编撰方式及知识更新周期，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证
- 因使用或引用本仓库内容所产生的一切直接或间接后果，均由使用者自行承担
- 本仓库不保证内容的准确性、完整性、时效性或适用性

### 更新日志规则

| 级别       | 版本号变化         | 说明                                            | 日志书写方式                         |
| :--------- | :----------------- | :---------------------------------------------- | :----------------------------------- |
| 大版本更新 | `1.x.x` -> `2.x.x` | 新模块、新功能、新页面增加及重构                | 独立作为更新版本，详细说明更新内容   |
| 小更新     | `1.0.x` -> `1.1.x` | 小 BUG 修复（文档纠错、按钮位置调整、颜色优化） | 写在大版本更新日志内，简要书写       |
| 补丁修复   | `1.x.0` -> `1.x.1` | 同一问题或其所属范围内的多次修复                | 写在小更新日志内，写"修复了一些 BUG" |

> 仓库记录每一次更新日志，须附带详细日期与内容，无论版本大小。详见 [CHANGELOG.md](./CHANGELOG.md)。
