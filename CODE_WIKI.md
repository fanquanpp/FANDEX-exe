# FANDEX Code Wiki

> **FANDEX** — 开发者知识库 | Astro 5 + Vue 3 | 45 模块 · 1511 篇文档

---

## 1. 项目概述

FANDEX 是一个基于 Astro 5 SSG 的开发者知识库站点，使用 Vue 3 岛屿架构实现客户端交互。项目覆盖 45 个技术模块、1511 篇文档、13 篇术语表，部署在 GitHub Pages 上。

**核心特性：**

- 静态站点生成 (SSG)，构建时零 JS 输出内容
- Vue 3 岛屿组件实现交互（暗色模式、进度追踪、交互测验）
- Pagefind 全文搜索 + Fuse.js 客户端搜索
- Service Worker 离线缓存
- 进度追踪（localStorage + IndexedDB 双存储）
- 术语悬浮提示（自动匹配文档术语）
- Mermaid 知识地图渲染
- JSON-LD 结构化数据 (SEO)
- KaTeX 数学公式渲染
- Admonition 提示框（note/tip/warning/danger/caution/info/important）
- 6 大分类统一颜色体系

---

## 2. 整体架构

```
┌──────────────────────────────────────────────────────┐
│                    GitHub Pages                       │
│                  (Static Hosting)                     │
├──────────────────────────────────────────────────────┤
│                  Astro 5 SSG Build                   │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ Content  │  │ Astro    │  │ Vue 3 Islands     │   │
│  │ Markdown │→ │ Pages &  │→ │ (client:load /    │   │
│  │ + MDX    │  │ Components│  │  client:visible)  │   │
│  └─────────┘  └──────────┘  └───────────────────┘   │
│  ┌──────────────────────────────────────────────┐    │
│  │ Build Pipeline                               │    │
│  │ 1. build-glossary-index.mjs → glossary JSON  │    │
│  │ 2. build-search-index.mjs  → search JSON     │    │
│  │ 3. astro build              → static HTML     │    │
│  │ 4. pagefind --site dist     → search index    │    │
│  └──────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────┤
│  Client-side Enhancements                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │Service   │ │Term      │ │Code      │ │Mermaid │  │
│  │Worker    │ │Tooltip   │ │Runner    │ │Render  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │KaTeX     │ │Admonition│ │GFM/Emoji │             │
│  │Math      │ │Styles    │ │Headings  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
└──────────────────────────────────────────────────────┘
```

**架构原则：**

- **内容优先**：所有文档以 Markdown/MDX 存储，构建时渲染为静态 HTML
- **岛屿架构**：交互组件使用 Vue 3 岛屿，按需水合（`client:load` / `client:visible`）
- **零 JS 内容**：文档正文在构建时渲染，客户端无需 JS 即可阅读
- **渐进增强**：搜索、术语提示、代码运行等功能在 JS 可用时增强体验
- **分类颜色统一**：6 大分类各一种高饱和颜色，全站一致

---

## 3. 技术栈与依赖

### 运行时依赖 (dependencies)

| 包名                       | 版本    | 用途                             |
| :------------------------- | :------ | :------------------------------- |
| `astro`                    | ^5.5.0  | 静态站点生成框架                 |
| `@astrojs/mdx`             | ^4.2.0  | MDX 内容支持                     |
| `@astrojs/rss`             | ^4.0.11 | RSS 订阅源生成                   |
| `@astrojs/sitemap`         | ^3.3.0  | sitemap.xml 生成                 |
| `@astrojs/vue`             | ^5.0.0  | Vue 3 集成                       |
| `vue`                      | ^3.5.0  | 岛屿交互组件                     |
| `fuse.js`                  | ^7.3.0  | 客户端模糊搜索 (Web Worker)      |
| `remark-gfm`               | ^4.0.1  | GFM 表格/删除线/任务列表支持     |
| `remark-emoji`             | ^5.0.2  | Emoji 短代码转换（:smile: → 😄） |
| `remark-math`              | ^6.0.0  | LaTeX 数学公式语法解析           |
| `rehype-katex`             | ^7.0.1  | KaTeX 数学公式渲染               |
| `rehype-slug`              | ^6.0.0  | 标题自动添加 id 锚点             |
| `rehype-autolink-headings` | ^7.1.0  | 标题锚点自动链接                 |

### 开发依赖 (devDependencies)

| 包名          | 版本    | 用途               |
| :------------ | :------ | :----------------- |
| `pagefind`    | ^1.5.2  | 构建后全文搜索索引 |
| `typescript`  | ^5.7.0  | 类型检查           |
| `vitest`      | ^4.1.7  | 单元测试           |
| `husky`       | ^9.1.7  | Git 钩子管理       |
| `lint-staged` | ^17.0.5 | 暂存区文件 lint    |
| `prettier`    | ^3.8.3  | 代码格式化         |
| `glob`        | ^13.0.6 | 构建脚本文件匹配   |

---

## 4. 目录结构详解

```
FANDEX-vue/
├── .github/
│   ├── codeql/
│   │   └── codeql-config.yml        # CodeQL 安全扫描配置
│   └── workflows/
│       ├── codeql.yml                # 安全扫描工作流
│       ├── content-update.yml        # 内容更新工作流
│       └── deploy.yml                # 部署到 GitHub Pages
├── .husky/
│   └── pre-commit                    # Git pre-commit 钩子
├── public/
│   ├── data/
│   │   ├── glossary-index.json       # 术语索引（构建生成）
│   │   └── search-index.json         # 搜索索引（构建生成）
│   ├── fonts/
│   │   ├── fonts.css                 # 字体声明
│   │   ├── jetbrains-mono-400.woff2  # 代码字体 Regular
│   │   └── jetbrains-mono-700.woff2  # 代码字体 Bold
│   ├── .nojekyll                     # GitHub Pages 配置
│   ├── robots.txt                    # SEO 爬虫配置
│   └── sw.js                         # Service Worker
├── scripts/
│   ├── build-glossary-index.mjs      # 术语索引构建脚本
│   ├── build-search-index.mjs        # 搜索索引构建脚本
│   ├── clean-true-prefix.mjs         # 清理 True 前缀脚本
│   ├── content-audit.mjs             # 内容质量审计脚本
│   └── qa-check.mjs                  # 预发布质量检查脚本
├── src/
│   ├── components/                   # Astro 组件
│   │   ├── Breadcrumb.astro          # 面包屑导航
│   │   ├── DocNav.astro              # 文档上下篇导航
│   │   ├── HomeLayout.astro          # 首页布局
│   │   ├── Layout.astro              # 文档页布局
│   │   ├── ModuleCard.astro          # 模块卡片（接收 color prop）
│   │   ├── SEO.astro                 # SEO 元数据
│   │   └── Sidebar.astro             # 侧边栏
│   ├── content/
│   │   ├── docs/                     # 文档内容（45 模块 / 1511 篇）
│   │   │   ├── agent/                # AI Agent
│   │   │   ├── algorithm/            # 算法与数据结构
│   │   │   ├── big-data/             # 大数据
│   │   │   ├── c/                    # C 语言
│   │   │   ├── calculus/             # 高等数学
│   │   │   ├── career/               # 职业发展
│   │   │   ├── cloud-computing/      # 云计算
│   │   │   ├── cpp/                  # C++
│   │   │   ├── csharp/               # C#
│   │   │   ├── cs-fundamentals/      # 计算机基础
│   │   │   ├── css/                  # CSS
│   │   │   ├── cybersecurity/        # 网络安全
│   │   │   ├── data-analysis/        # 数据分析
│   │   │   ├── deep-learning/        # 深度学习
│   │   │   ├── devops/               # 运维
│   │   │   ├── discrete-math/        # 离散数学
│   │   │   ├── engineering-practices/ # 工程实践
│   │   │   ├── english/              # 英语
│   │   │   ├── getting-started/      # 入门指南
│   │   │   ├── git/                  # Git
│   │   │   ├── github/               # GitHub
│   │   │   ├── go/                   # Go
│   │   │   ├── harmonyos/            # 鸿蒙开发
│   │   │   ├── html5/                # HTML5
│   │   │   ├── iot/                  # 物联网
│   │   │   ├── java/                 # Java
│   │   │   ├── javascript/           # JavaScript
│   │   │   ├── kotlin/               # Kotlin
│   │   │   ├── linear-algebra/       # 线性代数
│   │   │   ├── lua/                  # Lua
│   │   │   ├── machine-learning/     # 机器学习
│   │   │   ├── markdown/             # Markdown
│   │   │   ├── mysql/                # MySQL
│   │   │   ├── networking/           # 网络技术
│   │   │   ├── postgresql/           # PostgreSQL
│   │   │   ├── probability-statistics/ # 概率论与数理统计
│   │   │   ├── python/               # Python
│   │   │   ├── react/                # React
│   │   │   ├── redis/                # Redis
│   │   │   ├── software-architecture/ # 软件架构
│   │   │   ├── software-engineering/ # 软件工程
│   │   │   ├── software-testing/     # 软件测试
│   │   │   ├── sql/                  # SQL
│   │   │   ├── typescript/           # TypeScript
│   │   │   └── vue3/                 # Vue 3
│   │   └── config.ts                 # Zod Schema 定义
│   ├── islands/                      # Vue 3 岛屿组件
│   │   ├── ThemeToggle.vue           # 暗色模式切换
│   │   ├── ProgressToggle.vue        # 进度追踪
│   │   └── QuizBlock.vue             # 交互测验
│   ├── lib/                          # 工具函数库
│   │   ├── animations.ts             # 微交互动画
│   │   ├── code-runner.ts            # 代码运行器
│   │   ├── constants.ts              # 全局常量
│   │   ├── modules.ts                # 模块定义与前置关系
│   │   ├── progress.ts               # 进度追踪逻辑
│   │   ├── progress.test.ts          # 进度追踪测试
│   │   ├── rehype-lazy-images.ts     # 图片懒加载 rehype 插件
│   │   ├── remark-admonition.ts      # 提示框 remark 插件
│   │   ├── store.ts                  # Vue 全局状态
│   │   └── term-tooltip.ts           # 术语悬浮提示
│   ├── pages/                        # 路由页面
│   │   ├── [module]/                 # 动态模块路由
│   │   │   ├── [slug].astro          # 文档详情页
│   │   │   ├── glossary.astro        # 术语表页
│   │   │   ├── index.astro           # 模块首页
│   │   │   └── map.astro             # 知识地图页
│   │   ├── tags/                     # 标签路由
│   │   │   ├── [tag].astro           # 标签详情页
│   │   │   └── index.astro           # 标签索引页
│   │   ├── 404.astro                 # 404 页面
│   │   ├── index.astro               # 站点首页
│   │   ├── roadmap.astro             # 学习路线图
│   │   ├── rss.xml.js                # RSS 订阅
│   │   └── search.astro              # 搜索页
│   ├── styles/                       # 全局样式
│   │   ├── code.css                  # 代码块样式
│   │   ├── components.css            # 组件样式
│   │   ├── global.css                # 全局样式（含 admonition）
│   │   ├── typography.css            # 排版样式
│   │   └── variables.css             # CSS 变量
│   ├── workers/
│   │   └── search-worker.ts         # 搜索 Web Worker
│   └── env.d.ts                      # 环境类型声明
├── astro.config.ts                   # Astro 配置
├── package.json                       # 项目配置
├── tsconfig.json                      # TypeScript 配置
└── vitest.config.ts                   # 测试配置
```

---

## 5. 核心模块职责

### 5.1 Astro 组件 (`src/components/`)

| 组件           | 文件               | 职责                                                                                                                           |
| :------------- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Layout**     | `Layout.astro`     | 文档页主布局：导航栏 + 侧边栏 + 主内容区 + 移动端导航。初始化所有客户端增强功能（术语提示、代码运行、Mermaid、Service Worker） |
| **HomeLayout** | `HomeLayout.astro` | 首页专用布局：简化导航栏（含 GitHub 链接），无侧边栏                                                                           |
| **SEO**        | `SEO.astro`        | 生成 `<title>`、`<meta>`、Open Graph、Twitter Card、JSON-LD 结构化数据                                                         |
| **Sidebar**    | `Sidebar.astro`    | 模块侧边栏：章节列表 + 大纲导航 + 术语表/知识地图入口 + 全部模块切换。颜色使用 categoryColors 统一体系                         |
| **Breadcrumb** | `Breadcrumb.astro` | 面包屑导航，移动端自动折叠中间层级                                                                                             |
| **ModuleCard** | `ModuleCard.astro` | 首页模块卡片，接收 `color` prop（来自分类颜色），使用 `mod.icon` 显示图标                                                      |
| **DocNav**     | `DocNav.astro`     | 文档底部上下篇导航，按 `order` 字段排序                                                                                        |

### 5.2 Vue 岛屿组件 (`src/islands/`)

| 组件               | 文件                 | 水合策略         | 职责                                                                           |
| :----------------- | :------------------- | :--------------- | :----------------------------------------------------------------------------- |
| **ThemeToggle**    | `ThemeToggle.vue`    | `client:load`    | 暗色/亮色模式切换，读写 `localStorage('fandex-theme')`，设置 `data-theme` 属性 |
| **ProgressToggle** | `ProgressToggle.vue` | `client:load`    | 文档阅读进度切换（未读→在读→已读），支持导出/导入 JSON 进度文件                |
| **QuizBlock**      | `QuizBlock.vue`      | `client:visible` | 交互测验组件，支持填空(fill)、选择(choice)、代码修正(fix) 三种题型             |

### 5.3 工具函数库 (`src/lib/`)

| 模块                   | 文件                    | 职责                                                                                     |
| :--------------------- | :---------------------- | :--------------------------------------------------------------------------------------- |
| **constants**          | `constants.ts`          | 站点元信息常量（标题、URL、作者、语言）                                                  |
| **modules**            | `modules.ts`            | 45 个模块定义、categories 数组、categoryColors 颜色体系、icon 字段、前置关系图、查询函数 |
| **progress**           | `progress.ts`           | 阅读进度管理：localStorage 主存储 + IndexedDB 备份，支持导出/导入/跨标签同步             |
| **store**              | `store.ts`              | Vue reactive 全局状态（进度、搜索、移动端检测），BroadcastChannel 跨标签同步             |
| **animations**         | `animations.ts`         | 微交互：卡片悬浮阴影、锚点平滑滚动、侧边栏过渡动画                                       |
| **code-runner**        | `code-runner.ts`        | 代码运行器：为 JS/TS 代码块添加运行按钮，Web Worker 沙箱执行，5 秒超时                   |
| **term-tooltip**       | `term-tooltip.ts`       | 术语悬浮提示：加载术语索引，TreeWalker 遍历文本节点，正则匹配术语，生成 tooltip/modal    |
| **remark-admonition**  | `remark-admonition.ts`  | Remark 插件：将 `[!NOTE]` 等语法转换为 admonition div                                    |
| **rehype-lazy-images** | `rehype-lazy-images.ts` | Rehype 插件：为所有 `<img>` 添加 `loading="lazy"` 和 `decoding="async"`                  |

---

## 6. 关键类与函数说明

### 6.1 `src/lib/modules.ts`

```typescript
// 分类标签映射
export const categoryLabels: Record<string, string>;
// { toolchain: '工具链', 'dev-lang': '开发语言', database: '数据库', 'comp-sci': '计算机科学', 'eng-infra': '工程与基础设施', data: '数据技术' }

// 分类颜色 — 每个分类一种高饱和颜色，全站统一
export const categoryColors: Record<string, string>;
// { toolchain: '#4f5bd5', 'dev-lang': '#d63031', database: '#00b894', 'comp-sci': '#8854d0', 'eng-infra': '#e05a2b', data: '#f9a825' }

// 模块定义数组，包含 id、title、icon、description、categories（支持多分类）
export const modules: readonly Module[];

// 分类排序顺序
export const categoryOrder: string[];
// ['toolchain', 'dev-lang', 'database', 'comp-sci', 'eng-infra', 'data']

// 模块前置关系图（有向无环图）
export const modulePrerequisites: Record<string, string[]>;

// 根据 id 查找模块
export function getModule(id: string): Module | undefined;

// 按分类筛选模块（模块可属于多个分类）
export function getModulesByCategory(category: string): Module[];

// 获取模块的主分类（categories 数组第一个元素）
export function getPrimaryCategory(mod: Module): string;

// 从 content collection id 中提取 slug
export function docSlug(id: string): string;
```

**模块类型定义：**

```typescript
interface Module {
  id: string; // 目录名，如 'getting-started'
  title: string; // 显示名称，如 '入门指南'
  icon: string; // 卡片图标文本，如 '入门'、'JS'、'算法'
  description: string; // 模块描述
  categories: string[]; // 分类数组，支持多分类，第一个为主分类
}
```

**多分类颜色规则：** 模块在不同分类下展示时，颜色跟随当前展示的分类。主分类由 `categories[0]` 决定，用于 sidebar/header-bar 等固定位置的颜色。

### 6.2 `src/lib/progress.ts`

```typescript
// 阅读状态类型
type DocStatus = 'unread' | 'reading' | 'done';

// 单条进度记录
interface ReadingProgress {
  status: DocStatus;
  lastRead: number; // 时间戳
  scrollPos: number; // 滚动位置
}

// 进度映射表
type ProgressMap = Record<string, ReadingProgress>;

// 核心函数
function getAllProgress(): ProgressMap;
function getProgress(slug: string): ReadingProgress | null;
function setProgress(slug: string, status: DocStatus, scrollPos?: number): void;
function toggleStatus(slug: string): DocStatus;
function getModuleProgress(
  moduleId: string,
  slugs: string[]
): { done: number; total: number; percent: number };
function exportProgress(): string;
function importProgress(json: string): boolean;
async function restoreFromIndexedDB(): Promise<boolean>;
```

**存储策略：**

- 主存储：`localStorage` (key: `fandex-progress`)
- 备份存储：`IndexedDB` (DB: `fandex-progress-db`, Store: `progress`)
- 跨标签同步：`BroadcastChannel('fandex-sync')` + `storage` 事件

### 6.3 `src/lib/term-tooltip.ts`

```typescript
async function initTermTooltip(): Promise<void>;
async function loadGlossary(): Promise<Record<string, TermData> | null>;
function createTermRegex(terms: string[]): RegExp;
function createTooltip(term: string, data: TermData): HTMLElement;
function showTermModal(term: string, data: TermData): void;
function walkTextNodes(root: Node, regex: RegExp, termsData: Map, limit: number): number;
function processTextNode(textNode: Text, regex: RegExp, termsData: Map): void;
```

**限制：** 最多匹配 50 个术语，跳过 `<code>`、`<pre>`、`<a>`、`<abbr>` 等标签内的文本。

### 6.4 `src/lib/code-runner.ts`

```typescript
function initCodeRunners(): void;
```

**安全策略：** 仅对满足以下条件的 JS/TS 代码块添加运行按钮：

- 不含 `export`、`import`、`document.write`、`fetch`、`XMLHttpRequest`、`eval`
- 包含 `console.log`
- 位于 `.code-block` 容器内

**执行方式：** Blob URL 创建 Web Worker，5 秒超时自动终止。

### 6.5 `src/content/config.ts`

```typescript
const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    module: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    order: z.number().default(0),
    created: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    author: z.string().default('fanquanpp'),
    description: z.string().optional(),
    readingTime: z.number().optional(),
    related: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
    quiz: z.array(z.union([FillQuiz, ChoiceQuiz, FixQuiz])).default([]),
  }),
});
```

### 6.6 `src/lib/store.ts`

```typescript
const globalState = reactive({
  progress: {} as ProgressMap,
  activeModule: '',
  searchQuery: '',
  isMobile: false,
  initialized: false,
});

async function initGlobalState(): Promise<void>;
```

**跨标签同步：** 使用 `BroadcastChannel('fandex-sync')` 广播进度变更。

---

## 7. 路由与页面系统

### 7.1 路由表

| 路径                  | 页面文件                  | 说明                             |
| :-------------------- | :------------------------ | :------------------------------- |
| `/`                   | `index.astro`             | 站点首页，按分类展示模块卡片     |
| `/[module]/`          | `[module]/index.astro`    | 模块首页，展示该模块所有文档列表 |
| `/[module]/[slug]/`   | `[module]/[slug].astro`   | 文档详情页，渲染 Markdown 内容   |
| `/[module]/glossary/` | `[module]/glossary.astro` | 模块术语表                       |
| `/[module]/map/`      | `[module]/map.astro`      | 模块知识地图（Mermaid）          |
| `/search/`            | `search.astro`            | 全文搜索页（Pagefind UI）        |
| `/roadmap/`           | `roadmap.astro`           | 学习路线图（11 阶段 · 10 路径）  |
| `/tags/`              | `tags/index.astro`        | 标签索引页                       |
| `/tags/[tag]/`        | `tags/[tag].astro`        | 标签详情页                       |
| `/rss.xml`            | `rss.xml.js`              | RSS 订阅源                       |
| `/404`                | `404.astro`               | 404 页面                         |

### 7.2 静态路径生成

文档详情页通过 `getStaticPaths()` 在构建时生成所有静态路径：

```typescript
// src/pages/[module]/[slug].astro
export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({
    params: { module: doc.data.module, slug: docSlug(doc.id) },
    props: { doc },
  }));
}
```

---

## 8. 内容系统 (Content Collections)

### 8.1 文档集合 (`docs`)

45 个模块目录，每个包含多篇 Markdown 文档，frontmatter 遵循 Zod Schema：

```yaml
---
title: '文档标题'
module: '模块ID'
category: '分类'
tags: ['标签1', '标签2']
difficulty: beginner | intermediate | advanced
order: 1
created: 2024-01-01
updated: 2024-06-01
author: fanquanpp
description: '文档描述'
readingTime: 10
related: ['module/slug']
prerequisites: ['module/slug']
quiz:
  - type: fill
    question: '问题'
    answer: '答案'
    hint: '提示'
  - type: choice
    question: '问题'
    options: ['选项A', '选项B', '选项C']
    answer: 0
    explanation: '解释'
  - type: fix
    question: '问题'
    code: '有bug的代码'
    answer: '修正后的代码'
    explanation: '解释'
---
```

### 8.2 模块分类

| 分类 ID     | 中文名         | 颜色      | 包含模块                                                                                                             |
| :---------- | :------------- | :-------- | :------------------------------------------------------------------------------------------------------------------- |
| `toolchain` | 工具链         | `#4f5bd5` | 入门指南 · Markdown · Git · GitHub                                                                                   |
| `dev-lang`  | 开发语言       | `#d63031` | HTML5 · CSS · JavaScript · TypeScript · Vue 3 · React · C · C++ · Java · Kotlin · C# · Python · Go · Lua · HarmonyOS |
| `database`  | 数据库         | `#00b894` | SQL · MySQL · PostgreSQL · Redis                                                                                     |
| `comp-sci`  | 计算机科学     | `#8854d0` | 算法与数据结构 · 计算机基础 · 高等数学 · 离散数学 · 线性代数 · 概率论与数理统计 · 英语                               |
| `eng-infra` | 工程与基础设施 | `#e05a2b` | 运维 · 网络技术 · 网络安全 · 云计算 · 物联网 · 软件测试 · AI Agent · 软件工程 · 软件架构 · 工程实践 · 职业发展       |
| `data`      | 数据技术       | `#f9a825` | 数据分析 · 大数据 · 机器学习 · 深度学习 · 概率论与数理统计                                                           |

> 部分模块属于多个分类：C/C++ 同时属于开发语言和计算机科学；Python 同时属于开发语言和数据技术；Go 同时属于开发语言和工程与基础设施；Redis 同时属于数据库和工程与基础设施；网络技术 同时属于工程与基础设施和计算机科学；AI Agent 同时属于工程与基础设施和数据技术；概率论与数理统计 同时属于计算机科学和数据技术。

---

## 9. 交互功能

### 9.1 暗色模式

- **ThemeToggle.vue** (`client:load`)：切换 `data-theme` 属性
- **闪烁防护**：`Layout.astro`、`HomeLayout.astro`、`404.astro` 中内联脚本在 `<head>` 中读取 `localStorage` 并设置主题，使用 `raw === 'dark'` 直接字符串比较（不使用 JSON.parse）
- **CSS 变量**：`:root[data-theme="dark"]` 覆盖所有颜色变量
- **颜色一致性**：所有页面的 `data-theme` 和 `colorScheme` 同步设置，确保辅助色一致

### 9.2 进度追踪

- **ProgressToggle.vue** (`client:load`)：文档标题旁的状态切换按钮
- **状态循环**：`unread → reading → done → unread`
- **视觉反馈**：保存中→已保存→恢复原状，带动画
- **导出/导入**：JSON 文件格式，合并策略保留较新记录
- **侧边栏进度**：`Sidebar.astro` 读取 localStorage 显示进度指示

### 9.3 交互测验

- **QuizBlock.vue** (`client:visible`)：文档底部测验区域
- **三种题型**：填空（fill）、选择（choice）、代码修正（fix）
- **即时反馈**：提交后显示正确/错误，附参考答案和解释

### 9.4 术语悬浮提示

- **term-tooltip.ts**：页面加载后异步初始化
- **匹配逻辑**：加载 `glossary-index.json`，构建正则，TreeWalker 遍历文本节点
- **桌面端**：悬浮显示 tooltip，定位自适应
- **移动端**：点击弹出模态框

### 9.5 代码运行器

- **code-runner.ts**：为 JS/TS 代码块添加运行按钮
- **安全沙箱**：Web Worker 执行，5 秒超时
- **输出捕获**：重写 `console.log`，捕获输出并显示

### 9.6 全文搜索

- **Pagefind**：构建后生成搜索索引，`search.astro` 中初始化 Pagefind UI
- **Fuse.js**：`search-worker.ts` 中 Web Worker 执行模糊搜索
- **筛选**：支持按模块和难度筛选

### 9.7 知识地图

- **Mermaid**：`Layout.astro` 中动态加载 Mermaid 11，渲染 `language-mermaid` 代码块
- **主题适配**：根据 `data-theme` 切换 Mermaid 主题

### 9.8 数学公式渲染

- **remark-math**：解析 `$...$`（行内）和 `$$...$$`（块级）LaTeX 语法
- **rehype-katex**：将数学语法节点渲染为 KaTeX HTML
- **CSS**：`global.css` 中引入 `katex/dist/katex.min.css`

### 9.9 Admonition 提示框

- **remark-admonition**：将 `[!NOTE]`、`[!TIP]`、`[!WARNING]`、`[!DANGER]`、`[!CAUTION]`、`[!INFO]`、`[!IMPORTANT]` 语法转换为带样式的 div
- **样式**：`global.css` 中定义 7 种 admonition 样式，支持亮色和暗色主题

---

## 10. 构建与部署

### 10.1 构建流程

```bash
npm run build
# 等价于：
# 1. node scripts/build-glossary-index.mjs  → 生成 public/data/glossary-index.json
# 2. node scripts/build-search-index.mjs    → 生成 public/data/search-index.json
# 3. astro build                            → 生成 dist/ 静态文件
# 4. pagefind --site dist                   → 生成 dist/pagefind/ 搜索索引
```

### 10.2 GitHub Actions 部署 (`.github/workflows/deploy.yml`)

**触发条件：** push 到 `main` 分支 或 手动触发

**三阶段流水线：**

1. **setup**：检出代码 → 安装 Node 22 → 缓存 `node_modules`
2. **build**：恢复缓存 → 缓存 Astro 构建缓存 → `npm run build` → QA 检查 → 上传产物
3. **deploy**：部署到 GitHub Pages

**环境变量：** `NODE_OPTIONS: --max-old-space-size=4096`

### 10.3 Service Worker (`public/sw.js`)

- **缓存名**：`fandex-v5`
- **基础路径**：`/FANDEX/`
- **缓存策略**：
  - 哈希文件（.css, .js, .woff2）：Cache First（长期缓存）
  - HTML 页面：Network First（确保用户始终看到最新版本，离线回退缓存）
  - JSON 数据文件（/data/）：Network First（确保数据新鲜）
  - 图片/其他：Stale While Revalidate（后台更新）
- **预缓存**：首页 + `glossary-index.json`
- **更新通知**：后台更新后通过 `postMessage` 通知客户端

---

## 11. 工具脚本

### 11.1 `scripts/build-glossary-index.mjs`

**功能：** 扫描 `src/content/glossary/` 下所有 Markdown 文件，提取术语定义，生成 `public/data/glossary-index.json`。

**术语提取逻辑：**

1. 匹配 `### X.Y 术语名` 格式的标题
2. 查找 `**定义**：` 或 `定义：` 后的定义文本
3. 遇到 `**详解**`、`**名称**`、`**首次**`、`---`、`###` 时停止捕获
4. 定义长度限制 < 200 字符

**输出格式：**

```json
{
  "术语名": {
    "module": "模块ID",
    "def": "定义文本",
    "slug": "模块ID/glossary"
  }
}
```

### 11.2 `scripts/build-search-index.mjs`

**功能：** 扫描 `src/content/docs/` 下所有 Markdown 文件，解析 frontmatter，生成 `public/data/search-index.json`。

**大小控制：** 超过 100KB 时压缩字段名为短名（s/t/d/g/m/o/f/u）。

### 11.3 `scripts/qa-check.mjs`

**功能：** 构建后预发布质量检查，6 个维度：

1. **文件审计**：.nojekyll、robots.txt、大文件检测
2. **Web 架构**：index.html、404.html、base href、绝对链接、viewport、暗色模式、preconnect、懒加载
3. **内容处理**：页面数量、Pagefind 索引
4. **阅读体验**：Shiki 高亮、JSON-LD
5. **CI/CD**：sitemap
6. **质量控制**：100vh 使用、console.log

### 11.4 `scripts/content-audit.mjs`

**功能：** 源码级内容质量审计，检查：

- 缺少 frontmatter
- 标题/模块/排序/难度缺失
- 文档正文过短 (<30 字符)
- 过时关键词
- 长文档缺少前置知识/学习目标
- 内部链接和 Wiki 链接

### 11.5 `scripts/clean-true-prefix.mjs`

**功能：** 清理文档中行首的 `True` 前缀（AI 生成痕迹）。

---

## 12. 样式系统

### 12.1 CSS 变量 (`src/styles/variables.css`)

定义全局设计令牌：

- 颜色系统：`--color-primary`、`--color-text`、`--color-bg` 等
- 间距系统：`--spacing-xs` ~ `--spacing-2xl`
- 字体系统：`--font-display`、`--font-mono`
- 过渡系统：`--transition-fast`
- 布局变量：`--nav-height`、`--content-width`

**主题色：**

```css
:root {
  --color-primary: #3366cc;
  --color-primary-hover: #264da8;
  --color-secondary: #00b894;
  --color-tertiary: #e05a2b;
  --color-success: #00b894;
}
[data-theme='dark'] {
  --color-primary: #6ea8fe;
  --color-primary-hover: #93c0ff;
  --color-secondary: #55efc4;
  --color-tertiary: #f09070;
  --color-success: #55efc4;
}
```

### 12.2 暗色模式

通过 `:root[data-theme="dark"]` 选择器覆盖所有颜色变量，实现主题切换。

### 12.3 分类颜色体系

6 大分类各一种高饱和颜色，全站统一使用 `categoryColors[getPrimaryCategory(meta)]`：

| 分类           | 颜色      |
| :------------- | :-------- |
| 工具链         | `#4f5bd5` |
| 开发语言       | `#d63031` |
| 数据库         | `#00b894` |
| 计算机科学     | `#8854d0` |
| 工程与基础设施 | `#e05a2b` |
| 数据技术       | `#f9a825` |

**使用位置：** sidebar-module-color-bar、header-bar、doc-list-icon、ModuleCard、roadmap 阶段颜色。

### 12.4 样式文件

| 文件             | 职责                                             |
| :--------------- | :----------------------------------------------- |
| `variables.css`  | CSS 变量/设计令牌                                |
| `global.css`     | 全局重置与基础样式 + KaTeX CSS + Admonition 样式 |
| `typography.css` | 排版（标题、段落、列表）                         |
| `code.css`       | 代码块样式（Shiki 主题）                         |
| `components.css` | 组件通用样式（导航栏、logo、移动端导航等）       |

---

## 13. 依赖关系图

### 13.1 模块前置关系

```
getting-started (无前置)
markdown (无前置)
git (无前置)
  └── github
  └── devops
html5 ← markdown
  └── css
       └── javascript ← html5, css
            └── typescript
            └── vue3 ← javascript, html5, css
            └── react ← javascript, html5, css
            └── harmonyos ← javascript, typescript
python (无前置)
  └── data-analysis
  └── agent
sql (无前置)
  └── postgresql
mysql (无前置)
c (无前置)
  └── cpp
  └── iot ← c, python
java (无前置)
  └── kotlin
go (无前置)
lua (无前置)
algorithm (无前置)
cs-fundamentals (无前置)
discrete-math (无前置)
calculus (无前置)
networking (无前置)
  └── cybersecurity
devops ← git
  └── cloud-computing
redis (无前置)
software-testing (无前置)
```

### 13.2 代码依赖关系

```
Layout.astro
  ├── ThemeToggle.vue ← store.ts ← progress.ts
  ├── Sidebar.astro ← modules.ts (categoryColors, getPrimaryCategory)
  ├── term-tooltip.ts ← glossary-index.json
  ├── code-runner.ts
  ├── animations.ts
  └── sw.js

[module]/[slug].astro
  ├── Layout.astro
  ├── SEO.astro ← constants.ts
  ├── Sidebar.astro ← modules.ts
  ├── Breadcrumb.astro
  ├── ProgressToggle.vue ← progress.ts
  ├── QuizBlock.vue
  └── DocNav.astro

index.astro (首页)
  ├── HomeLayout.astro
  ├── SEO.astro
  └── ModuleCard.astro ← modules.ts (categoryColors, getModulesByCategory)

roadmap.astro
  ├── Layout.astro
  └── modules.ts (categoryColors, categoryOrder)

search.astro
  ├── Layout.astro
  └── Pagefind UI

search-worker.ts ← fuse.js
```

---

## 14. 项目运行方式

### 14.1 环境要求

- Node.js >= 18 (推荐 22)
- npm >= 9

### 14.2 常用命令

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

# 监听模式测试
npm run test:watch

# 预发布质量检查（需先构建）
npm run qa

# 内容质量审计（源码级）
node scripts/content-audit.mjs

# 清理 True 前缀
node scripts/clean-true-prefix.mjs
```

### 14.3 开发注意事项

- **搜索功能**：开发模式下 Pagefind 索引未生成，搜索不可用。需 `npm run build` 后再 `npm run preview`
- **快捷键**：`Ctrl+K` / `Cmd+K` 跳转搜索页
- **路径别名**：`@/*` 映射到 `src/*`
- **Base URL**：`/FANDEX/`（GitHub Pages 部署路径）
- **站点 URL**：`https://fanquanpp.github.io/FANDEX`
- **主题检测**：`localStorage('fandex-theme')` 存储纯字符串 `'dark'`/`'light'`，内联脚本使用 `raw === 'dark'` 判断
- **分类颜色**：所有颜色统一使用 `categoryColors[getPrimaryCategory(meta)]`，不使用模块级 color 字段

---

## 15. 开发规范

### 15.1 代码规范

- **格式化**：Prettier（pre-commit 钩子自动格式化）
- **Lint-staged**：暂存区 `.astro/.ts/.js/.mjs/.css/.json/.md` 文件自动格式化
- **TypeScript**：严格模式 (`astro/tsconfigs/strict`)

### 15.2 Git 规范

- **Husky**：pre-commit 钩子触发 lint-staged
- **分支策略**：`main` 分支自动触发部署

### 15.3 内容规范

- 每篇文档必须包含 `title` 和 `module` frontmatter
- 推荐填写 `difficulty`、`order`、`description`
- 长文档（>10000 字符）应包含 `## 前置知识` 或 `## 学习目标`
- Markdown 文件名不包含模块前缀（如 `Java概述.md` → `概述.md`）
- 增量更新时创建新文件，不修改已有文件内容

### 15.4 安全

- **CodeQL**：自动安全扫描（`.github/workflows/codeql.yml`）
- **代码运行器**：Web Worker 沙箱，禁止 `import/export/fetch/eval` 等
- **.gitignore**：排除 `.env`、`node_modules`、`dist`、`.astro` 等

---

> FANDEX v4.0.0 | 45 模块 · 1511 篇文档
