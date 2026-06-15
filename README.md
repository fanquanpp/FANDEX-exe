<div align="center">

# FANDEX

**计算机自学教程** · fanquanpp + memex

从零基础到计算机专业毕业生水平的系统化自学路径，覆盖工具链 · 开发语言 · 数据库 · 计算机科学 · 工程基础设施 · 数据技术与AI

[![在线阅读](https://img.shields.io/badge/在线阅读-fanquanpp.github.io%2FFANDEX-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX/)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![文档数](https://img.shields.io/badge/文档-2031+-0ea5e9?style=flat-square)](https://fanquanpp.github.io/FANDEX/)
[![模块数](https://img.shields.io/badge/模块-51-8b5cf6?style=flat-square)](https://fanquanpp.github.io/FANDEX/)

</div>

---

## 模块总览

| 类别           | 模块                                                                                                                           |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| 工具链         | 入门指南 · Markdown · Git · GitHub                                                                                             |
| 开发语言       | HTML5 · CSS · JavaScript · TypeScript · Vue 3 · React · C · C++ · Java · Kotlin · C# · Python · Go · Lua · HarmonyOS           |
| 数据库         | SQL · MySQL · PostgreSQL · Redis                                                                                               |
| 计算机科学     | 算法与数据结构 · 计算机基础 · 高等数学 · 离散数学 · 线性代数 · 概率论与数理统计 · 英语                                         |
| 工程与基础设施 | 运维 · 网络技术 · 网络安全 · 云计算 · 物联网 · 软件测试 · AI Agent · 软件工程 · 软件架构 · 工程实践                            |
| 数据技术       | 数据分析 · 大数据 · 机器学习 · 深度学习 · AI工程 · 计算机视觉 · 自然语言处理 · 大语言模型 · 生成式AI · 多模态AI · AI伦理与安全 |

> 2031 篇文档 · 51 个模块 · 13 篇术语表 · 交互式测验 · 知识地图

## 功能特性

| 特性     | 说明                                                              |
| :------- | :---------------------------------------------------------------- |
| 进度追踪 | localStorage + IndexedDB 双存储备份，支持导出/导入 JSON           |
| 术语悬浮 | 自动匹配文档中的专业术语并弹出解释，桌面端 tooltip / 移动端 modal |
| 交互测验 | 填空 / 选择 / 代码修正三种题型，即时反馈                          |
| 知识地图 | Mermaid 可视化概念关联                                            |
| 前置知识 | 模块间依赖关系展示，自动渲染前置模块链接                          |
| 全文搜索 | Pagefind 客户端搜索索引 + Fuse.js Web Worker，支持按模块/难度筛选 |
| 标签索引 | 跨模块知识检索，按模块/难度/相关度筛选                            |
| 学习路线 | 10 条职业方向路径可视化（11 阶段递进）                            |
| 离线可用 | Service Worker 缓存（Cache First + Network First + SWR）          |
| 暗色模式 | Dark / Light 主题切换，localStorage 持久化 + 闪烁防护             |
| 响应式   | 桌面端侧边栏 + 移动端抽屉导航 + 底部导航栏                        |
| 代码运行 | JS/TS 代码块 Web Worker 沙箱执行，5 秒超时保护                    |

## 技术栈

| 层级  | 技术                           | 说明                                                            |
| :---- | :----------------------------- | :-------------------------------------------------------------- |
| 框架  | Astro 5                        | 静态站点生成 (SSG)，岛屿架构                                    |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合                       |
| 高亮  | Shiki                          | 双主题代码高亮 (github-light / github-dark)，构建时零 JS        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker 模糊搜索                                |
| 图表  | Mermaid 11                     | 知识地图渲染，CDN 按需加载                                      |
| SEO   | JSON-LD + Sitemap              | 结构化数据 + Open Graph + Twitter Card                          |
| 离线  | Service Worker                 | Cache First (哈希资源) + Network First (HTML/数据) + SWR (图片) |
| 测试  | Vitest                         | 单元测试                                                        |
| 质量  | Husky + lint-staged + Prettier | Pre-commit 自动格式化                                           |
| CI/CD | GitHub Actions                 | 三阶段流水线 (setup → build → deploy)                           |

## 仅获取文档内容

如果你只需要文档 Markdown 源文件（`src/content/docs/`），无需克隆整个项目，可以使用 Git sparse-checkout：

```bash
# 初始化空仓库
git clone --no-checkout --filter=blob:none https://github.com/fanquanpp/FANDEX.git
cd FANDEX

# 启用 sparse-checkout 并指定路径
git sparse-checkout set src/content/docs

# 拉取内容
git checkout
```

文档目录结构：

```
src/content/docs/
├── agent/                  # AI Agent
├── algorithm/              # 算法与数据结构
├── big-data/               # 大数据
├── c/                      # C 语言
├── calculus/               # 高等数学
├── cloud-computing/        # 云计算
├── cpp/                    # C++
├── csharp/                 # C#
├── cs-fundamentals/        # 计算机基础
├── css/                    # CSS
├── cybersecurity/          # 网络安全
├── data-analysis/          # 数据分析
├── deep-learning/          # 深度学习
├── devops/                 # 运维
├── discrete-math/          # 离散数学
├── engineering-practices/  # 工程实践
├── english/                # 英语
├── getting-started/        # 入门指南
├── git/                    # Git
├── github/                 # GitHub
├── go/                     # Go
├── harmonyos/              # 鸿蒙开发
├── html5/                  # HTML5
├── iot/                    # 物联网
├── java/                   # Java
├── javascript/             # JavaScript
├── kotlin/                 # Kotlin
├── linear-algebra/         # 线性代数
├── lua/                    # Lua
├── machine-learning/       # 机器学习
├── markdown/               # Markdown
├── mysql/                  # MySQL
├── networking/             # 网络技术
├── postgresql/             # PostgreSQL
├── probability-statistics/ # 概率论与数理统计
├── python/                 # Python
├── react/                  # React
├── redis/                  # Redis
├── software-architecture/  # 软件架构
├── software-engineering/   # 软件工程
├── software-testing/       # 软件测试
├── sql/                    # SQL
├── typescript/             # TypeScript
└── vue3/                   # Vue 3
```

> 每篇文档均为独立 Markdown 文件，包含 frontmatter 元数据（标题、模块、难度、标签等）和正文内容，可直接在任何 Markdown 阅读器中使用。

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

# 预发布质量检查（需先构建）
npm run qa

# 内容质量审计（源码级）
node scripts/content-audit.mjs
```

> **注意：** 开发模式下 Pagefind 搜索索引未生成，搜索功能不可用。需 `npm run build` 后 `npm run preview` 才能使用搜索。

## 项目结构

<details>
<summary>点击展开</summary>

```
FANDEX/
├── .github/workflows/     # GitHub Actions (部署 / CodeQL / 内容审计)
├── .husky/                # Git pre-commit 钩子
├── public/
│   ├── data/              # 搜索索引 + 术语索引 (构建生成)
│   ├── fonts/             # JetBrains Mono 字体
│   ├── sw.js              # Service Worker
│   └── robots.txt         # SEO
├── scripts/               # 工具脚本
│   ├── build-glossary-index.mjs   # 术语索引构建
│   ├── build-search-index.mjs     # 搜索索引构建
│   ├── clean-true-prefix.mjs      # AI 痕迹清理
│   ├── content-audit.mjs          # 内容质量审计
│   └── qa-check.mjs               # 预发布质量检查
├── src/
│   ├── components/        # Astro 组件
│   │   ├── Layout.astro            # 文档页布局（导航+侧边栏+主内容）
│   │   ├── HomeLayout.astro        # 首页布局
│   │   ├── Sidebar.astro           # 侧边栏（章节/大纲/模块切换）
│   │   ├── SEO.astro               # SEO 元数据 + JSON-LD
│   │   ├── Breadcrumb.astro        # 面包屑导航
│   │   ├── ModuleCard.astro        # 模块卡片
│   │   └── DocNav.astro            # 上下篇导航
│   ├── content/
│   │   ├── docs/{51 模块}/ # 文档内容 (2031 篇)
│   │   ├── glossary/      # 术语表 (13 篇)
│   │   └── config.ts      # Zod Schema 定义
│   ├── islands/           # Vue 岛屿组件
│   │   ├── ThemeToggle.vue         # 暗色模式切换
│   │   ├── ProgressToggle.vue      # 阅读进度追踪
│   │   └── QuizBlock.vue           # 交互测验
│   ├── lib/               # 工具函数
│   │   ├── constants.ts            # 站点常量
│   │   ├── modules.ts              # 模块定义与前置关系
│   │   ├── progress.ts             # 进度追踪 (localStorage + IndexedDB)
│   │   ├── store.ts                # Vue 全局状态 + BroadcastChannel
│   │   ├── term-tooltip.ts         # 术语悬浮提示
│   │   ├── code-runner.ts          # 代码运行器 (Web Worker)
│   │   ├── animations.ts           # 微交互动画
│   │   ├── remark-admonition.ts    # Remark 提示框插件
│   │   └── rehype-lazy-images.ts   # Rehype 图片懒加载插件
│   ├── pages/             # 路由页面
│   │   ├── index.astro             # 首页
│   │   ├── [module]/               # 动态模块路由
│   │   ├── search.astro            # 搜索页
│   │   ├── roadmap.astro           # 学习路线图
│   │   ├── tags/                   # 标签路由
│   │   ├── 404.astro              # 404 页面
│   │   └── rss.xml.js             # RSS 订阅
│   ├── styles/            # 全局样式
│   │   ├── variables.css           # CSS 变量/设计令牌
│   │   ├── global.css              # 全局重置
│   │   ├── typography.css          # 排版
│   │   ├── code.css                # 代码块
│   │   └── components.css          # 组件
│   └── workers/
│       └── search-worker.ts        # Fuse.js 搜索 Web Worker
├── astro.config.ts        # Astro 配置
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── vitest.config.ts        # 测试配置
```

</details>

## 构建流程

```
npm run build
  │
  ├── 1. build-glossary-index.mjs  →  public/data/glossary-index.json
  ├── 2. build-search-index.mjs    →  public/data/search-index.json
  ├── 3. astro build               →  dist/ (静态 HTML + 资源)
  └── 4. pagefind --site dist      →  dist/pagefind/ (搜索索引)
```

## 部署

仓库已配置 GitHub Actions 自动部署 (`.github/workflows/deploy.yml`)，push 到 `main` 分支即自动构建发布。

**流水线三阶段：**

1. **setup** — 安装依赖，缓存 `node_modules`
2. **build** — 构建站点，运行 QA 检查，上传产物
3. **deploy** — 部署到 GitHub Pages

Settings → Pages → Source 选择 **GitHub Actions** 即可。

## 文档

- **[CODE_WIKI.md](./CODE_WIKI.md)** — 完整的代码维基文档，包含项目架构、模块职责、关键函数说明、依赖关系等

## 免责声明

本项目所有内容仅供个人学习与参考使用，不构成任何形式的专业建议、担保或承诺。详见 [免责声明](https://fanquanpp.github.io/FANDEX/)。

## 许可证

本项目仅供个人学习使用。未经授权，禁止将本项目内容用于商业用途。
