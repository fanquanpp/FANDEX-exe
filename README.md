<div align="center">

# FANDEX-Web

**零基础到本科毕业的完整学习平台** · Astro 5 SSG

面向零基础自学者的计算机科学知识学习平台，采用四层分离架构（内容层 / 知识工程层 / 能力层 / 应用层），51 个模块，2031 篇文档，提供 Web、桌面、离线三种交付形态。平台鼓励学习者运用 AI 工具辅助深度学习，同时保留完整的非 AI 学习路径，确保在任何环境下都能独立完成学习。

[![在线阅读](https://img.shields.io/badge/在线阅读-fanquanpp.github.io%2FFANDEX-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX/)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![文档数](https://img.shields.io/badge/文档-2031-0ea5e9?style=flat-square)](https://fanquanpp.github.io/FANDEX/)
[![完全开源](https://img.shields.io/badge/开源-完全共享-22c55e?style=flat-square)](https://github.com/fanquanpp/FANDEX-Web)

</div>

---

## 这是什么

FANDEX-Web 是 FANDEX 知识体系的**学习平台版本**。它在原始内容基准之上，采用四层分离架构，将静态文档组织为系统化、可追踪的学习体系，覆盖从环境搭建到 AI 前沿的完整知识路径。

平台面向零基础自学者，不假设任何编程经验。每一篇文档都经过结构化编排，包含概念讲解、代码示例与实践要点。模块之间通过前置知识关系自然衔接，学习者可按需跳转，亦可循序渐进。

平台鼓励学习者在学习过程中运用 AI 工具（如 ChatGPT、Claude、Gemini 等任意外部 AI 工具）辅助深度学习——用 AI 解答疑惑、生成练习题、解释代码原理、规划学习路径。同时，平台保留完整的非 AI 学习路径：所有文档均可独立阅读理解，内置的进度追踪、术语悬浮、交互测验、知识地图、全文搜索等功能不依赖任何 AI 服务，确保学习者在无 AI 环境下也能独立完成学习。

## 仓库特色

本仓库是 FANDEX 知识体系的**学习平台**，承担以下独特角色：

| 特色维度   | 说明                                                                             |
| :--------- | :------------------------------------------------------------------------------- |
| 四层分离   | monorepo 架构（内容层/知识工程层/能力层/应用层），关注点分离，内容与代码独立演进 |
| 多形态交付 | Web 在线版 + Electron 桌面应用 + 离线 ZIP 包 + 移动端导出产物，适配不同学习场景  |
| 知识工程   | 独立的知识工程层，管理术语表、路线图、标签索引、复习卡片等结构化元数据           |
| 知识图谱   | 8800 节点 + 18183 边的知识图谱，可视化概念间的深层关联                           |
| AI 友好    | 鼓励学习者使用外部 AI 工具辅助学习，文档结构适配 AI 检索与问答                   |
| 非 AI 可用 | 所有学习功能不依赖 AI 服务，无 AI 环境下可独立完成全部学习                       |
| 完全开源   | 所有内容完全开源共享，不主张知识产权保护，可自由获取、使用、修改和分发           |

## 关于 AI 学习

本项目**不内置任何 AI 功能**。项目的核心理念是：在 AI 时代，学习者应当学会运用 AI 工具进行自主学习。

**建议的 AI 辅助学习方式：**

| 学习场景 | AI 工具用法示例                                      |
| :------- | :--------------------------------------------------- |
| 概念理解 | 将文档中的概念粘贴到 AI 工具，请求更通俗的解释或类比 |
| 代码学习 | 让 AI 工具解释代码示例的执行流程，或生成变体练习     |
| 疑难解答 | 遇到不理解的内容时，向 AI 工具提问，获取多角度解答   |
| 练习生成 | 请 AI 工具根据当前模块生成练习题，检验学习成果       |
| 路径规划 | 让 AI 工具根据个人情况推荐学习顺序和重点             |
| 知识关联 | 请 AI 工具解释当前概念与其他模块知识之间的关联       |

**非 AI 学习路径同样完整：**

- 所有文档均可独立阅读理解，无需 AI 辅助
- 内置进度追踪、术语悬浮、交互测验、知识地图等功能不依赖 AI
- 全文搜索、标签索引、学习路线等功能均为本地实现
- 离线模式下所有学习功能正常可用

## 关联项目

FANDEX 生态包含以下关联仓库，各仓库代码互相独立、内容互相关联：

| 仓库                                                  | 定位             | 特色                                                                                                                  |
| :---------------------------------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------- |
| [FANDEX](https://github.com/fanquanpp/FANDEX)         | 内容基准仓库     | 原始 Astro 版本，本仓库的前身，面向零基础学习者的完整自学教程，51 模块 6 分类，从环境搭建到 AI 前沿，文档体系最为完善 |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | 离线移动速查应用 | Android 原生应用，完全离线，零基础学习者的语法速查伴侣，Kotlin + Jetpack Compose 原生渲染，支持中英日三语界面         |

## 模块总览

| 分类         | 模块                                                                                                                                               |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工具链       | 入门指南 · Markdown · Git · GitHub · 英语                                                                                                          |
| 前端技术     | HTML5 · CSS · JavaScript · TypeScript · Vue 3 · React                                                                                              |
| 后端技术     | Java · Kotlin · C# · Go · Lua · HarmonyOS                                                                                                          |
| 数据库       | SQL · MySQL · PostgreSQL · Redis                                                                                                                   |
| 计算机科学   | 算法与数据结构 · 计算机基础 · C · C++ · Networking                                                                                                 |
| 数学         | 高等数学 · 离散数学 · 线性代数 · 概率论与数理统计                                                                                                  |
| 云与基础设施 | 运维 · 网络安全 · 云计算 · 物联网 · 软件测试 · 软件工程 · 软件架构 · 工程实践                                                                      |
| 人工智能     | Python · AI Agent · 机器学习 · 深度学习 · AI工程 · 计算机视觉 · 自然语言处理 · 大语言模型 · 生成式AI · 多模态AI · AI伦理与安全 · 数据分析 · 大数据 |

> 51 个模块 · 8 大分类 · 2031 篇文档 · 27 篇术语表 · 知识图谱

## 四层分离架构

```
FANDEX-Web/
  content/               内容层 — Markdown 文档源（51 模块）
  metadata/              知识工程层 — 术语/路线图/标签/复习卡片
  packages/              能力层 — Remark/Rehype 插件 + 共享数据 + 术语搜索
    markdown/              自定义 Markdown 处理插件
    shared/                共享常量与模块注册表
    search/                术语搜索与提示
  apps/web/              应用层 — Astro 5 SSG 项目
    src/                   页面、组件、布局、服务层
    electron/              Electron 桌面应用支持
  scripts/               构建脚本（22 个）
```

依赖方向单向向下：应用层引用能力层和知识工程层，能力层引用内容层，禁止反向依赖。

## 功能特性

| 特性       | 说明                                                      |
| :--------- | :-------------------------------------------------------- |
| 进度追踪   | localStorage + IndexedDB 双存储备份，支持导出/导入 JSON   |
| 术语悬浮   | 构建时预编译术语标记，桌面端 tooltip / 移动端 modal       |
| 交互测验   | 填空 / 选择 / 代码修正三种题型，即时反馈                  |
| 知识地图   | Mermaid 构建时预渲染为 SVG，零运行时 JS                   |
| 全文搜索   | Pagefind 构建后索引 + Fuse.js Web Worker                  |
| 标签索引   | 跨模块知识检索，按模块/难度/相关度筛选                    |
| 学习路线   | 10 条职业方向路径可视化（11 阶段递进）                    |
| 离线可用   | Service Worker 缓存（Cache First + Network First + SWR）  |
| 暗色模式   | Dark / Light 主题切换，localStorage 持久化 + 闪烁防护     |
| 响应式     | 桌面端侧边栏 + 移动端抽屉导航 + 底部导航栏                |
| 代码运行   | JS/TS 代码块 Web Worker 沙箱执行，5 秒超时保护            |
| 桌面应用   | Electron 33 封装，内置静态服务器，独立桌面应用            |
| 移动端导出 | build:mobile 脚本生成 dist-mobile.zip，供 FANDEX-App 使用 |

> 以上所有功能均为本地实现，不依赖任何 AI 服务。

## 技术栈

| 层级  | 技术                           | 说明                                                      |
| :---- | :----------------------------- | :-------------------------------------------------------- |
| 框架  | Astro 5                        | SSG 静态站点生成，岛屿架构                                |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合                 |
| 高亮  | Shiki                          | 双主题代码高亮（github-light / github-dark），构建时零 JS |
| 数学  | KaTeX + remark-math            | 构建时渲染，font-display:swap                             |
| 图表  | Mermaid 11                     | 构建时预渲染为 SVG                                        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker 模糊搜索                          |
| 离线  | Service Worker                 | Cache First + Network First + SWR                         |
| 桌面  | Electron 33                    | 内置静态服务器，独立桌面应用                              |
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

# 预览构建结果
npm run preview

# 运行测试
npm run test

# 质量检查
npm run qa

# 内容质量审计
node scripts/content-audit.mjs
```

> 开发模式下 Pagefind 搜索索引未生成，搜索功能不可用。需 `npm run build` 后 `npm run preview` 才能使用搜索。

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

# 质量检查
npm run lint               # ESLint 检查
npm run typecheck           # Astro 类型检查
npm run format              # Prettier 格式化
npm run test                # Vitest 单元测试
```

## 项目结构

<details>
<summary>点击展开</summary>

```
FANDEX-Web/
├── .github/
│   ├── workflows/              # GitHub Actions（deploy / content-update / codeql / ci）
│   └── codeql/                 # CodeQL 配置
├── apps/web/                   # 应用层 — Astro 5 SSG 项目
│   ├── src/
│   │   ├── components/         # Astro 组件（Layout / Sidebar / QuizBlock 等）
│   │   ├── islands/            # Vue 岛屿组件（ThemeToggle / QuizBlock 等）
│   │   ├── layouts/            # 布局组件
│   │   ├── lib/                # 工具层（store / progress / code-runner 等）
│   │   ├── pages/              # 路由页面（11 个）
│   │   ├── services/          # 服务层
│   │   │   ├── ai/            # AI 适配器（可选，未配置时不影响学习功能）
│   │   │   ├── search/        # 搜索服务
│   │   │   ├── quiz/          # 测验服务
│   │   │   ├── tutor/         # 学习推荐服务
│   │   │   ├── roadmap/       # 路线规划服务
│   │   │   └── graphrag/      # 知识图谱服务
│   │   ├── styles/            # 全局样式
│   │   └── workers/           # Web Worker（搜索）
│   ├── electron/              # Electron 桌面应用（main.js / preload.js）
│   ├── astro.config.ts        # Astro 配置
│   └── package.json           # 依赖与脚本
├── content/                    # 内容层 — Markdown 文档源（51 模块）
├── metadata/                   # 知识工程层
│   ├── modules.json            # 模块注册表
│   ├── glossary/               # 术语 JSON（27 个模块）
│   ├── roadmap/                # 路线图数据
│   ├── tags/                   # 标签索引
│   └── review/                 # 复习卡片 YAML
├── packages/                   # 能力层
│   ├── markdown/               # Remark/Rehype 插件
│   ├── shared/                 # 共享数据（constants / modules）
│   └── search/                 # 术语搜索
├── scripts/                    # 构建脚本（22 个）
└── package.json                # monorepo 根配置
```

</details>

## 部署

仓库已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），push 到 `main` 分支即自动构建发布。

**流水线阶段：**

1. **setup** — 安装依赖，缓存 node_modules
2. **build** — 构建站点，运行 QA 检查，上传产物
3. **build-offline** — 构建离线 ZIP 包
4. **build-electron** — 构建 Windows 桌面应用
5. **release** — 创建 GitHub Release（含离线包 + 桌面应用）
6. **deploy** — 部署到 GitHub Pages

Settings -> Pages -> Source 选择 **GitHub Actions** 即可。

## 文档

- **[CODE_WIKI.md](./CODE_WIKI.md)** — 完整的代码维基文档，包含项目架构、模块职责、关键函数说明、依赖关系等

## 更新日志规则

| 级别       | 版本号变化         | 说明                                            | 日志书写方式                         |
| :--------- | :----------------- | :---------------------------------------------- | :----------------------------------- |
| 大版本更新 | `3.x.x` -> `4.x.x` | 新模块、新功能、新页面增加及重构                | 独立作为更新版本，详细说明更新内容   |
| 小更新     | `4.0.x` -> `4.1.x` | 小 BUG 修复（文档纠错、按钮位置调整、颜色优化） | 写在大版本更新日志内，简要书写       |
| 补丁修复   | `4.x.0` -> `4.x.1` | 同一问题或其所属范围内的多次修复                | 写在小更新日志内，写"修复了一些 BUG" |

> 仓库记录每一次更新日志，须附带详细日期与内容，无论版本大小。

## 开源共享声明

本仓库所有内容以开放共享为目的，不主张知识产权保护。任何个人或机构均可自由获取、使用、修改和分发，包括但不限于学习、研究、修改、分发及商业用途。因使用本仓库内容所产生的一切后果，由使用者自行承担，与本仓库及其作者、维护者无关。

本仓库所有内容均由人工与 AI 共同编写、搜集、整理与编排，可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。

本仓库鼓励学习者在学习过程中培养自主运用 AI 工具进行自学与信息辨别的能力。在人工智能时代，学会高效检索、交叉验证与批判性思考，是每一位自学者应当重视和提升的核心素养。
