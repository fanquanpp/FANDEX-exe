<div align="center">

# FANDEX-Web

**零基础到本科毕业的智能学习平台** · AI 增强版

在原始内容基准之上，引入五项 AI 能力，将静态文档升级为可交互、可推理、可追踪的智能学习系统。四层分离架构（内容层 / 知识工程层 / 能力层 / 应用层），51 个模块，2031 篇文档，提供 Web、桌面、离线三种交付形态，为零基础自学者打造从入门到精通的完整 AI 辅助学习体验。

[![在线阅读](https://img.shields.io/badge/在线阅读-fanquanpp.github.io%2FFANDEX-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX/)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![AI 能力](https://img.shields.io/badge/AI-5项服务-8b5cf6?style=flat-square)](https://fanquanpp.github.io/FANDEX/)
[![完全开源](https://img.shields.io/badge/开源-完全共享-22c55e?style=flat-square)](https://github.com/fanquanpp/FANDEX-Web)

</div>

---

## 这是什么

FANDEX-Web 是 FANDEX 知识体系的**智能学习平台版本**。它在原始内容基准之上，引入五项 AI 能力，将传统的静态文档查阅升级为可交互、可推理、可追踪的智能学习系统。

平台面向零基础自学者，覆盖从环境搭建到 AI 前沿的完整知识路径。学习者不仅能阅读结构化文档，还能通过 AI 语义搜索精准定位知识、通过智能测验检验学习成果、通过学习推荐获取个性化路径、通过路线规划构建职业发展蓝图、通过知识图谱问答理解概念间的关联网络。

所有 AI 服务支持优雅降级：未配置 API Key 时自动回退到本地规则与数据驱动方案，功能不中断，确保在任何环境下都能持续学习。

## 仓库特色

本仓库是 FANDEX 知识体系的**AI 增强平台**，承担以下独特角色：

| 特色维度   | 说明                                                                                           |
| :--------- | :--------------------------------------------------------------------------------------------- |
| AI 增强    | 五项 AI 服务（语义搜索/智能测验/学习推荐/路线规划/知识图谱问答），将静态文档升级为智能学习系统 |
| 四层分离   | monorepo 架构（内容层/知识工程层/能力层/应用层），关注点分离，内容与代码独立演进               |
| 多形态交付 | Web 在线版 + Electron 桌面应用 + 离线 ZIP 包 + 移动端导出产物，适配不同学习场景                |
| 知识工程   | 独立的知识工程层，管理术语表、路线图、标签索引、复习卡片等结构化元数据                         |
| 知识图谱   | 8800 节点 + 18183 边的知识图谱，GraphRAG 增强问答，理解概念间的深层关联                        |
| 优雅降级   | 所有 AI 服务支持本地降级，未配置 API Key 时功能不中断，降低部署门槛                            |
| 完全开源   | 所有内容完全开源共享，不主张知识产权保护，可自由获取、使用、修改和分发                         |

## 关联项目

FANDEX 生态包含以下关联仓库，各仓库代码互相独立、内容互相关联：

| 仓库                                                  | 定位             | 特色                                                                                                          |
| :---------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------ |
| [FANDEX](https://github.com/fanquanpp/FANDEX)         | 内容基准仓库     | 原始 Astro 版本，本仓库的前身，51 模块 6 分类，文档体系最为完善，单体项目结构易于贡献                         |
| [FANDEX-App](https://github.com/fanquanpp/FANDEX-App) | 离线移动速查应用 | Android 原生应用，完全离线，零基础学习者的语法速查伴侣，Kotlin + Jetpack Compose 原生渲染，支持中英日三语界面 |

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
│   ├── workflows/              # GitHub Actions（deploy / content-update / codeql / ci）
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
