<div align="center">

# FANDEX-Web

**AI 驱动的知识学习平台** · fanquanpp + memex

基于 Astro 5 SSG 构建的四层分离架构知识平台，集成语义搜索、智能测验、学习推荐、路线规划与知识图谱增强等 AI 能力。覆盖 8 大领域 51 个模块 1993+ 篇文档，提供三种阅读模式、离线缓存与移动端导出，为自学者打造从入门到精通的全链路学习体验。

[![在线阅读](https://img.shields.io/badge/在线阅读-fanquanpp.github.io%2FFANDEX-Web-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://fanquanpp.github.io/FANDEX-Web/)
[![Astro 5](https://img.shields.io/badge/Astro-5-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![文档数](https://img.shields.io/badge/文档-1993+-0ea5e9?style=flat-square)](https://fanquanpp.github.io/FANDEX-Web/)
[![模块数](https://img.shields.io/badge/模块-51-8b5cf6?style=flat-square)](https://fanquanpp.github.io/FANDEX-Web/)
[![AI](https://img.shields.io/badge/AI-5能力-f59e0b?style=flat-square)](https://fanquanpp.github.io/FANDEX-Web/)

</div>

---

> 桌面端浏览器可获得最佳阅读体验，移动端亦可正常访问，部分交互细节仍在持续打磨中。

## 关联项目

FANDEX 系列由三个仓库组成，各司其职、互相配合：

| 仓库           | 定位                                                                                       | 地址                                                            |
| :------------- | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **FANDEX**     | 基于 GitHub Pages 构建的云端在线查阅平台，为最早建立的内容仓库，文档体系最为完善           | [fanquanpp/FANDEX](https://github.com/fanquanpp/FANDEX)         |
| **FANDEX-Web** | Astro 5 SSG 知识学习平台，四层分离架构，具备 AI 能力、三种阅读模式、知识图谱与复习卡片系统 | [fanquanpp/FANDEX-Web](https://github.com/fanquanpp/FANDEX-Web) |
| **FANDEX-App** | Android 平台完全离线查阅应用，内容来源于 FANDEX-Web 的 dist-mobile.zip                     | [fanquanpp/FANDEX-App](https://github.com/fanquanpp/FANDEX-App) |

## 内容源约束

[FANDEX](https://github.com/fanquanpp/FANDEX.git) 仓库为全部项目的根本内容源，FANDEX-Web 仅允许只读引用。如需变更内容，须从 FANDEX 仓库复制后在本仓库内进行适配与优化，不得直接修改上游内容源。

## 关于

FANDEX-Web 在 FANDEX 基础上构建了四层分离架构（内容层 / 知识工程层 / 能力层 / 应用层），将知识从静态文档升级为可交互、可推理、可追踪的学习系统。通过 AI 能力（语义搜索、智能测验、学习推荐、路线规划、GraphRAG）与知识工程（知识图谱、术语预编译、复习卡片、标签索引），为自学者提供从"读文档"到"学知识"的完整闭环。

八大领域环环相扣：工具链奠定操作基础，前端与后端技术打开编程世界，数据库承载持久化能力，计算机科学构建理论根基，数学提供形式化工具，云与基础设施连接理论与实践，人工智能延伸至前沿应用。各模块之间通过前置知识关系自然衔接，学习者可按需跳转，亦可循序渐进。

## 模块总览

| 类别         | 模块                                                                                                               |
| :----------- | :----------------------------------------------------------------------------------------------------------------- |
| 工具链       | 入门指南 · Markdown · Git · GitHub                                                                                 |
| 前端技术     | HTML5 · CSS · JavaScript · TypeScript · Vue 3 · React                                                              |
| 后端技术     | Go · Java · Kotlin · C# · Lua                                                                                      |
| 数据库       | SQL · MySQL · PostgreSQL · Redis                                                                                   |
| 计算机科学   | C · C++ · 算法与数据结构 · 计算机基础 · 高等数学 · 离散数学 · 线性代数 · 概率论与数理统计 · 英语                   |
| 数学         | 微积分 · 线性代数 · 概率论 · 离散数学 · 数据分析                                                                   |
| 云与基础设施 | 云计算 · IoT · 鸿蒙开发 · 运维 · 网络技术 · 网络安全 · 软件测试 · 软件工程 · 软件架构 · 工程实践                   |
| 人工智能     | AI Agent · LLM · NLP · 深度学习 · 机器学习 · 生成式 AI · 多模态 AI · AI 伦理与安全 · 计算机视觉 · 大数据 · AI 工程 |

> 1993+ 篇文档 · 51 个模块 · 8 大分类 · 27 篇术语表 · 交互式测验 · 知识地图 · AI 能力

## 功能特性

### 核心功能

| 特性       | 说明                                                            |
| :--------- | :-------------------------------------------------------------- |
| 进度追踪   | localStorage + IndexedDB 双存储备份，支持导出/导入 JSON         |
| 术语预编译 | remark-term-link 构建时标记，运行时仅绑定事件，零客户端 JS 开销 |
| 交互测验   | 填空 / 选择 / 代码修正三种题型，即时反馈                        |
| 知识地图   | Mermaid 构建时预渲染为 SVG，零客户端 JS                         |
| 前置知识   | 模块间依赖关系展示，自动渲染前置模块链接                        |
| 全文搜索   | Pagefind + Fuse.js + 语义搜索双模，支持按模块/难度筛选          |
| 标签索引   | 1648 个标签，跨模块知识检索                                     |
| 学习路线   | 10 条职业方向路径可视化（11 阶段递进）                          |
| 离线可用   | Service Worker 缓存（Cache First + Network First + SWR）        |
| 暗色模式   | Dark / Light / Sepia 三主题切换，localStorage 持久化 + 闪烁防护 |
| 响应式     | 桌面端侧边栏 + 移动端抽屉导航 + 底部导航栏                      |

### 阅读模式

| 模式     | 说明                           | 切换方式        |
| :------- | :----------------------------- | :-------------- |
| 标准模式 | 完整功能，所有交互元素可见     | 默认            |
| 专注模式 | 隐藏干扰元素，聚焦内容         | 快捷键 F        |
| 学习模式 | 高亮学习辅助信息，强化知识吸收 | 快捷键 Esc 退出 |

### AI 能力

| 能力       | 说明                                               |
| :--------- | :------------------------------------------------- |
| AI Search  | 语义搜索 + TF-IDF 降级，自然语言查询知识库         |
| AI Quiz    | 自动生成填空/选择/代码修复题，针对性检测知识盲区   |
| AI Tutor   | 学习推荐 + 进度分析，个性化学习路径建议            |
| AI Roadmap | 个性化学习路线规划，基于当前进度动态调整           |
| GraphRAG   | 知识图谱增强问答，8800 节点 + 18183 边的结构化推理 |

### 知识工程

| 能力       | 说明                                                          |
| :--------- | :------------------------------------------------------------ |
| 知识图谱   | 8800 节点 + 18183 边，模块间概念关联可视化                    |
| 复习卡片   | 自动从 frontmatter 生成，间隔重复算法                         |
| 移动端导出 | dist-mobile.zip（1991 篇 HTML + CSS），供 FANDEX-App 离线使用 |

### 性能优化

| 优化项         | 说明                                                   |
| :------------- | :----------------------------------------------------- |
| Mermaid 静态化 | 构建时预渲染为 SVG，消除 200KB+ 客户端 JS              |
| 术语预编译     | remark-term-link 构建时嵌入术语 HTML，运行时零解析开销 |
| Sidebar 懒加载 | 模块视图动态加载，减少首屏体积                         |
| 图片优化       | rehype-image-optimize，lazy/async/防 CLS/响应式        |
| KaTeX 优化     | output:html + font-display:swap，构建时渲染数学公式    |

## 技术栈

| 层级  | 技术                           | 说明                                      |
| :---- | :----------------------------- | :---------------------------------------- |
| 框架  | Astro 5                        | SSG，岛屿架构                             |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合 |
| 高亮  | Shiki                          | 双主题代码高亮，构建时零 JS               |
| 数学  | KaTeX + remark-math            | 构建时渲染，font-display:swap             |
| 图表  | Mermaid 11                     | 构建时预渲染为 SVG                        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker                   |
| AI    | OpenAI 兼容 API                | 语义搜索/Quiz/Tutor/Roadmap/GraphRAG      |
| 离线  | Service Worker                 | Cache First + Network First + SWR         |
| 质量  | Husky + lint-staged + Prettier | Pre-commit 自动格式化                     |
| CI/CD | GitHub Actions                 | 三阶段流水线                              |

## 架构

### 四层分离

```
FANDEX-Web/
  content/               # 内容层（52 模块，8 分类：tools/frontend/backend/database/cs/math/cloud/ai）
  metadata/              # 知识工程层
    modules.json         #   模块注册表
    glossary/            #   术语 JSON
    roadmap/             #   路线图数据
    tags/                #   标签索引
    review/              #   复习卡片 YAML
  packages/              # 能力层
    markdown/            #   Remark/Rehype 插件（admonition/mermaid/term-link/image-optimize）
    shared/              #   共享数据（constants/modules）
    search/              #   术语搜索/提示
  apps/web/              # 应用层（Astro 5 SSG 项目）
    src/                 #   页面、组件、布局、服务层
    astro.config.ts
    tsconfig.json
    package.json
    public/
  generated/             # 生成物（.gitignore）
    cards/               #   复习卡片 JSON
    graph/               #   知识图谱 JSON
  scripts/               # 构建脚本
  dist-mobile/           # 移动端产物（.gitignore）
  package.json           # monorepo 入口（npm workspaces）
```

### 服务层架构

```
apps/web/src/services/
  ai/                    # AI 适配器（OpenAI 兼容，环境变量配置）
  search/                # 搜索服务（语义 + 关键词双模）
  quiz/                  # Quiz 生成服务
  tutor/                 # 学习推荐服务
  roadmap/               # 路线规划服务
  graphrag/              # 知识图谱增强生成服务
  index.ts               # 统一导出（UI 层唯一入口）
```

> UI 层禁止直接调用 API，所有业务逻辑必须通过服务层实现，服务层为 UI 层唯一入口。

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
```

> **注意：** 开发模式下 Pagefind 搜索索引未生成，搜索功能不可用。需 `npm run build` 后 `npm run preview` 才能使用搜索。AI 功能需配置环境变量后方可使用。

## 部署

仓库已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`），push 到 `main` 分支即自动构建发布。

**流水线三阶段：**

1. **setup** -- 安装依赖，缓存 `node_modules`
2. **build** -- 构建站点，运行 QA 检查，上传产物
3. **deploy** -- 部署到 GitHub Pages

Settings -> Pages -> Source 选择 **GitHub Actions** 即可。

## 更新日志

本仓库记录每一次更新日志，须附带详细日期与内容，无论版本大小，保持完整的版本迭代历史可追溯性。更新日志遵循以下规则：

- 每次有效变更必须记录，不得遗漏
- 须附带精确日期与变更内容摘要
- 版本号遵循语义化版本规范（SemVer）
- 变更类型分为：新增（feat）、修复（fix）、重构（refactor）、文档（docs）、性能（perf）

## 内容说明

本仓库所有内容均由人工与人工智能（AI）共同编写、搜集、整理与编排。受限于编撰方式与知识更新速度，内容可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。

本仓库鼓励学习者在学习过程中培养自主运用 AI 工具进行自学与信息辨别的能力。在人工智能时代，学会高效检索、交叉验证与批判性思考，是每一位自学者应当重视和提升的核心素养。本仓库力求为零基础学习者提供可用的入门资料，同时希望学习者逐步建立独立判断与自我完善的能力。

## 免责声明

本仓库所有内容以开放共享为目的，不主张知识产权保护。任何个人或机构均可自由获取、使用、修改和分发，包括但不限于商业用途。因使用本仓库内容所产生的一切后果，由使用者自行承担，与本仓库及其作者、维护者无关。

本仓库所有内容均由人工与 AI 共同编写、搜集、整理与编排，可能存在遗漏、过时或错误之处，使用者应结合官方文档与权威资料进行独立验证。
