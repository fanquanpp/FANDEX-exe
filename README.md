<div align="center">

# FANDEX-Web

**循序渐进的自学之旅** · Astro 5 SSG 知识学习平台

基于四层分离架构构建的知识学习平台，集成 AI 能力（语义搜索、智能测验、学习推荐、路线规划、知识图谱增强生成），覆盖 51 个模块、2031 篇文档，提供 Web、桌面、离线三种交付形态。

[![在线阅读](https://img.shields.io/badge/在线阅读-fanquanpp.github.io%2FFANDEX-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX/)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![文档数](https://img.shields.io/badge/文档-2031-0ea5e9?style=flat-square)](https://fanquanpp.github.io/FANDEX/)
[![模块数](https://img.shields.io/badge/模块-51-8b5cf6?style=flat-square)](https://fanquanpp.github.io/FANDEX/)

</div>

---

## 关于

FANDEX-Web 是 FANDEX 知识体系的 Web 平台版本，采用 monorepo 四层分离架构（内容层 / 知识工程层 / 能力层 / 应用层），将静态文档升级为可交互、可推理、可追踪的学习系统。

平台在传统文档站点基础上，引入五项 AI 能力：语义搜索（嵌入向量 + 余弦相似度）、智能测验（填空 / 选择 / 代码修复三种题型）、学习推荐（个性化路径规划）、路线规划（Kahn 拓扑排序 + AI 规划）、知识图谱增强生成（8800 节点 + 18183 边的图谱检索问答）。所有 AI 服务支持优雅降级：未配置 API Key 时自动回退到本地规则与数据驱动方案。

## 关联项目

FANDEX 生态包含以下关联仓库，各仓库代码互相独立、内容互相关联：

| 仓库                                                  | 说明                                                                                                            |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| [FANDEX](https://github.com/fanquanpp/FANDEX)         | 原始 Astro 版本，FANDEX-Web 的前身，51 模块 6 分类，基于 GitHub Pages 构建的云端在线查阅平台                    |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | Android 平台完全离线查阅应用（Kotlin + Jetpack Compose 原生渲染），无网络依赖，支持中英日三语界面与深浅色双模式 |

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

> 51 个模块 · 8 大分类 · 2031 篇文档 · 27 篇术语表 · 知识图谱 · AI 能力

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

## AI 服务层

AI 服务层位于 `apps/web/src/services/ai/`，采用适配器模式，所有 AI 请求统一封装，UI 层禁止直接调用。

| 服务         | AI 模式                           | 降级模式                               |
| :----------- | :-------------------------------- | :------------------------------------- |
| 语义搜索     | 嵌入向量 + 余弦相似度             | 关键词匹配评分                         |
| 智能测验     | AI 生成题目（填空/选择/代码修复） | frontmatter 中的 quiz 数据             |
| 学习推荐     | AI 个性化推荐                     | 模块前置关系规则推荐                   |
| 路线规划     | AI 分阶段规划                     | career-paths.json 匹配 + Kahn 拓扑排序 |
| 知识图谱问答 | AI 生成式回答                     | 相关节点列表（无生成式回答）           |

未配置 API Key 时，所有 AI 服务自动降级为本地规则与数据驱动方案，功能不中断。

## 功能特性

| 特性        | 说明                                                      |
| :---------- | :-------------------------------------------------------- |
| AI 语义搜索 | 嵌入向量 + 余弦相似度，支持自然语言查询                   |
| AI 智能测验 | 填空 / 选择 / 代码修复三种题型，即时反馈                  |
| AI 学习推荐 | 个性化学习路径推荐，基于学习状态分析                      |
| AI 路线规划 | 10 条职业方向路径，Kahn 拓扑排序 + AI 规划                |
| AI 知识图谱 | 8800 节点 + 18183 边，GraphRAG 增强问答                   |
| 进度追踪    | localStorage + IndexedDB 双存储备份，支持导出/导入 JSON   |
| 术语悬浮    | 构建时预编译术语标记，桌面端 tooltip / 移动端 modal       |
| 知识地图    | Mermaid 构建时预渲染为 SVG，零运行时 JS                   |
| 全文搜索    | Pagefind 构建后索引 + Fuse.js Web Worker                  |
| 标签索引    | 跨模块知识检索，按模块/难度/相关度筛选                    |
| 离线可用    | Service Worker 缓存（Cache First + Network First + SWR）  |
| 暗色模式    | Dark / Light 主题切换，localStorage 持久化 + 闪烁防护     |
| 响应式      | 桌面端侧边栏 + 移动端抽屉导航 + 底部导航栏                |
| 代码运行    | JS/TS 代码块 Web Worker 沙箱执行，5 秒超时保护            |
| 桌面应用    | Electron 33 封装，内置静态服务器，独立桌面应用            |
| 移动端导出  | build:mobile 脚本生成 dist-mobile.zip，供 FANDEX-App 使用 |

## 技术栈

| 层级  | 技术                           | 说明                                                      |
| :---- | :----------------------------- | :-------------------------------------------------------- |
| 框架  | Astro 5                        | SSG 静态站点生成，岛屿架构                                |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合                 |
| 高亮  | Shiki                          | 双主题代码高亮（github-light / github-dark），构建时零 JS |
| 数学  | KaTeX + remark-math            | 构建时渲染，font-display:swap                             |
| 图表  | Mermaid 11                     | 构建时预渲染为 SVG                                        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker 模糊搜索                          |
| AI    | OpenAI 兼容 API                | 语义搜索 / Quiz / Tutor / Roadmap / GraphRAG              |
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

## AI 能力配置

在 `.env` 文件中配置环境变量以启用 AI 能力：

```bash
AI_PROVIDER=openai                              # openai | deepseek | custom
AI_API_KEY=your-api-key                         # API 密钥（未配置时自动降级）
AI_BASE_URL=                                    # 可选，自定义端点
AI_CHAT_MODEL=gpt-4o-mini                       # 聊天模型
AI_EMBEDDING_MODEL=text-embedding-3-small       # 嵌入模型
```

未配置 API Key 时，所有 AI 服务自动降级为本地规则与数据驱动方案，功能不中断。

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
│   ├── workflows/              # GitHub Actions（deploy / content-update / codeql）
│   └── codeql/                 # CodeQL 配置
├── apps/web/                   # 应用层 — Astro 5 SSG 项目
│   ├── src/
│   │   ├── components/         # Astro 组件（Layout / Sidebar / AIQuiz 等）
│   │   ├── islands/            # Vue 岛屿组件（ThemeToggle / QuizBlock 等）
│   │   ├── layouts/            # 布局组件
│   │   ├── lib/                # 工具层（store / progress / code-runner 等）
│   │   ├── pages/              # 路由页面（11 个）
│   │   ├── services/          # 服务层（AI 适配器 + 5 项 AI 服务）
│   │   │   ├── ai/            # AI 基础设施（types / config / adapter）
│   │   │   ├── search/        # 语义搜索服务
│   │   │   ├── quiz/          # 智能测验服务
│   │   │   ├── tutor/         # 学习推荐服务
│   │   │   ├── roadmap/       # 路线规划服务
│   │   │   └── graphrag/      # 知识图谱增强生成服务
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

## 构建流程

构建过程依次执行：预构建脚本（速查表高亮、PWA 图标）-> 元数据复制 -> 术语索引构建 -> 模块文档索引构建 -> 标签索引构建 -> 搜索索引构建 -> 知识图谱生成 -> 嵌入向量索引生成 -> Astro 静态站点构建 -> Pagefind 搜索索引生成 -> Service Worker 预缓存清单生成。

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

## 内容源说明

本仓库为 FANDEX 知识体系的 Web 平台版本，内容源位于 `content/` 目录。原始版本（FANDEX-Original-HTML）为最早建立的内容仓库，文档体系最为完善。本仓库在其基础上进行了架构升级与 AI 能力扩展。

本仓库所有内容均由人工与人工智能（AI）共同编写、搜集、整理与编排。受限于编撰方式与知识更新速度，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。

## 更新日志规则

| 级别       | 版本号变化         | 说明                                            | 日志书写方式                         |
| :--------- | :----------------- | :---------------------------------------------- | :----------------------------------- |
| 大版本更新 | `3.x.x` -> `4.x.x` | 新模块、新功能、新页面增加及重构                | 独立作为更新版本，详细说明更新内容   |
| 小更新     | `4.0.x` -> `4.1.x` | 小 BUG 修复（文档纠错、按钮位置调整、颜色优化） | 写在大版本更新日志内，简要书写       |
| 补丁修复   | `4.x.0` -> `4.x.1` | 同一问题或其所属范围内的多次修复                | 写在小更新日志内，写"修复了一些 BUG" |

> 仓库记录每一次更新日志，须附带详细日期与内容，无论版本大小。

## 免责声明

本仓库所有内容均以开放共享为宗旨，不主张知识产权保护。任何个人或机构均可自由获取、使用、修改和分发本仓库内容，对本仓库内容的使用不设任何限制，包括但不限于学习、研究、修改、分发及商业用途。因使用本仓库内容所产生的一切后果，均由使用者自行承担，本仓库及其作者、维护者不对使用后果承担任何形式的责任。

本仓库所有内容均由人工与 AI 共同编写、搜集、整理与编排，可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。
