# FANDEX-exe Code Wiki

> Windows 桌面端离线学习平台技术文档
> 基于 Astro 5 SSG 构建的四层分离架构，集成静态搜索、交互测验、进度追踪、知识地图与路线规划等学习辅助能力。

## 项目定位

FANDEX-exe 是 FANDEX 系列三个仓库之一，定位为 Windows 桌面端离线学习平台。其核心目标是将完整的知识体系封装为独立桌面程序，为自学者提供无需浏览器、无需网络、双击即可使用的离线学习体验。

本项目**不内置任何 AI 功能**。项目的核心理念是：在 AI 时代，学习者应当学会运用外部 AI 工具进行自主学习。

| 仓库       | 定位                                                         |
| :--------- | :----------------------------------------------------------- |
| FANDEX-web | 线上学习平台，内容基准仓库，面向零基础学习者的完整自学教程   |
| FANDEX-exe | Windows 桌面端离线学习平台，四层分离架构，完全离线访问       |
| FANDEX-App | 离线移动速查应用，Android 原生应用，聚焦编程语言语法格式查阅 |

内容源约束：FANDEX-exe 内容来源于 FANDEX-web 仓库，仅允许只读引用，不得直接修改上游内容源。

## 技术栈

| 层级  | 技术                           | 说明                                      |
| :---- | :----------------------------- | :---------------------------------------- |
| 框架  | Astro 5                        | SSG，岛屿架构                             |
| 交互  | Vue 3                          | `client:load` / `client:visible` 按需水合 |
| 高亮  | Shiki                          | 双主题代码高亮，构建时零 JS               |
| 数学  | KaTeX + remark-math            | 构建时渲染，font-display:swap             |
| 图表  | Mermaid 11                     | 构建时预渲染为 SVG                        |
| 搜索  | Pagefind + Fuse.js             | 构建后索引 + Web Worker                   |
| 离线  | Service Worker                 | Cache First + Network First + SWR         |
| 质量  | Husky + lint-staged + Prettier | Pre-commit 自动格式化                     |
| CI/CD | GitHub Actions                 | 三阶段流水线                              |

## 四层分离架构

项目采用严格的四层分离架构，各层职责明确，依赖方向单向向下。

### 架构总览

```
FANDEX-exe/
  content/               # 内容层（51 模块，8 分类）
  metadata/              # 知识工程层
    modules.json         #   模块注册表
    glossary/            #   术语 JSON（27 个模块）
    roadmap/             #   路线图数据
    tags/                #   标签索引
    review/              #   复习卡片 YAML
  packages/              # 能力层
    markdown/            #   Remark/Rehype 插件
    shared/              #   共享数据（constants/modules）
    search/              #   术语搜索/提示
  apps/web/              # 应用层（Astro 5 SSG 项目）
    src/                 #   页面、组件、布局、服务层
    astro.config.ts      #   Astro 配置入口
    tsconfig.json        #   TypeScript 配置
    package.json         #   依赖与脚本
    public/              #   静态资源
  generated/             # 生成物（.gitignore）
    cards/               #   复习卡片 JSON
    graph/               #   知识图谱 JSON
  scripts/               # 构建脚本
  dist-mobile/           # 移动端产物（.gitignore）
  package.json           # monorepo 入口（npm workspaces）
```

### 内容层（content/）

存放全部 Markdown 文档源文件，按 8 大分类组织：

| 分类标识 | 中文名       | 代表模块                                         |
| :------- | :----------- | :----------------------------------------------- |
| tools    | 工具链       | 入门指南、Markdown、Git、GitHub                  |
| frontend | 前端技术     | HTML5、CSS、JavaScript、TypeScript、Vue 3、React |
| backend  | 后端技术     | Go、Java、Kotlin、C#、Lua                        |
| database | 数据库       | SQL、MySQL、PostgreSQL、Redis                    |
| cs       | 计算机科学   | C、C++、算法与数据结构、计算机基础               |
| math     | 数学         | 微积分、线性代数、概率论、离散数学               |
| cloud    | 云与基础设施 | 云计算、IoT、运维、网络、安全、软件工程          |
| ai       | 人工智能     | AI Agent、LLM、NLP、深度学习、机器学习           |

文档 frontmatter schema 定义于 [config.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/content/config.ts)，核心字段包括：title、module、category、tags、difficulty、order、prerequisites、related、keyTerms、quiz。

### 知识工程层（metadata/）

存放结构化元数据，为知识图谱、术语预编译、路线规划等能力提供数据基础。

| 文件/目录                 | 职责                                                                     |
| :------------------------ | :----------------------------------------------------------------------- |
| modules.json              | 模块注册表，包含分类标签、分类颜色、分类顺序、模块列表、模块前置依赖关系 |
| glossary/\*.json          | 27 个模块的术语表 JSON，每模块含 moduleId 和 terms 数组                  |
| roadmap/career-paths.json | 10 条职业方向路径数据                                                    |
| roadmap/phases.json       | 路线图阶段数据                                                           |
| tags/tag-index.json       | 1648 个标签的跨模块索引                                                  |
| review/\*.yaml            | 复习卡片 YAML 源数据                                                     |

### 能力层（packages/）

封装可复用的 Markdown 处理插件和共享数据，供应用层引用。

#### packages/markdown/

自定义 Remark/Rehype 插件，扩展 Markdown 渲染管线。统一导出于 [index.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/markdown/index.ts)。

| 插件                | 文件                                                                                                                      | 职责                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------- |
| remarkAdmonition    | [remark-admonition.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/markdown/remark-admonition.ts)         | 解析 `[!note]` `[!tip]` `[!warning]` 等提示块语法，转换为带样式的 div       |
| remarkMermaid       | [remark-mermaid.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/markdown/remark-mermaid.ts)               | 构建时将 Mermaid 代码块预渲染为双主题 SVG，消除客户端 200KB+ JS 依赖        |
| remarkTermLink      | [remark-term-link.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/markdown/remark-term-link.ts)           | 构建时扫描文本节点，匹配术语表中的术语，替换为带 data 属性的 HTML span 元素 |
| rehypeImageOptimize | [rehype-image-optimize.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/markdown/rehype-image-optimize.ts) | 优化 img 元素：读取本地图片尺寸防 CLS、添加 lazy/async、响应式样式          |

#### packages/shared/

共享数据包，统一导出于 [index.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/shared/index.ts)。

| 导出项                 | 文件                                                                                            | 说明                                    |
| :--------------------- | :---------------------------------------------------------------------------------------------- | :-------------------------------------- |
| SITE                   | [constants.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/shared/constants.ts) | 站点常量（title、url、author、lang）    |
| modules                | [modules.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/shared/modules.ts)     | 从 metadata/modules.json 加载的模块列表 |
| categoryLabels         | modules.ts                                                                                      | 分类中文标签映射                        |
| categoryColors         | modules.ts                                                                                      | 分类颜色映射                            |
| modulePrerequisites    | modules.ts                                                                                      | 模块前置依赖关系                        |
| getModule()            | modules.ts                                                                                      | 根据 id 查找模块                        |
| getModulesByCategory() | modules.ts                                                                                      | 根据分类筛选模块                        |
| docSlug()              | modules.ts                                                                                      | 从 content collection id 提取 slug      |

#### packages/search/

搜索能力包，统一导出于 [index.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/search/index.ts)。

| 导出项            | 文件                                                                                                  | 说明                                                                              |
| :---------------- | :---------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| initTermTooltip() | [term-tooltip.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/packages/search/term-tooltip.ts) | 术语提示运行时交互，为构建时标记的 `.term-tip` 元素绑定 hover/click/keyboard 事件 |

### 应用层（apps/web/）

Astro 5 SSG 项目主体，包含页面、组件、布局、服务层和工具库。

#### 目录结构

```
apps/web/src/
  components/          # Astro 组件
  content/             # Content Collections 配置与术语表
  data/                # 静态 JSON 数据（速查表）
  islands/             # Vue 3 岛屿组件（按需水合）
  lib/                 # 工具库（纯函数）
  pages/               # 路由页面
  services/            # 服务层（业务逻辑）
  styles/              # 全局样式
  workers/             # Web Worker
  env.d.ts             # 环境变量类型声明
```

## 服务层架构

服务层是 UI 层与数据层之间的唯一桥梁。UI 层禁止直接调用 API，所有业务逻辑必须通过服务层实现。

### 分层规则

```
UI 层（components/pages/islands）
  |  仅允许从 services/index.ts 导入
  v
Service 层（services/）
  |  业务逻辑实现，可引用 AI 适配器和数据层
  v
Data 层（fetch JSON / AI API）
```

统一导出入口：[services/index.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/index.ts)

### AI 适配器（services/ai/）

可选 AI 能力的基础设施层，封装 OpenAI 兼容 API 调用，支持 OpenAI / DeepSeek / 自定义端点。AI 功能默认关闭，需用户自行配置环境变量后方可启用。

| 文件                                                                                                               | 职责                                                                                                         |
| :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| [types.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/ai/types.ts)                   | 类型定义：AIProvider、ChatMessage、ChatCompletionRequest/Response、EmbeddingRequest/Response、AIAdapter 接口 |
| [config.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/ai/config.ts)                 | 配置管理：从环境变量读取 AI_PROVIDER、AI_API_KEY、AI_BASE_URL、AI_CHAT_MODEL、AI_EMBEDDING_MODEL             |
| [adapter.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/ai/adapter.ts)               | 适配器工厂：createAIAdapter() 单例模式，resetAIAdapter() 重置缓存                                            |
| [openai-adapter.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/ai/openai-adapter.ts) | OpenAI 兼容适配器实现：chatCompletion() 和 embedding() 方法                                                  |

关键设计：

- 禁止硬编码密钥，全部从环境变量读取
- 适配器单例缓存，避免重复创建
- 所有 API 请求统一封装在适配器内
- 异步方法均包含 try-catch 错误处理

### 搜索服务（services/search/）

提供语义搜索和关键词搜索双模式，AI 未配置时自动降级为关键词搜索。

| 文件                                                                                                                   | 职责                                                                                                                          |
| :--------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| [search-service.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/search/search-service.ts) | SearchService 类：search() 统一入口，semanticSearch() 语义搜索，keywordSearch() 关键词搜索，cosineSimilarity() 余弦相似度计算 |
| [embedding.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/search/embedding.ts)           | 嵌入向量生成：generateEmbeddings() 支持 API 模式（1536 维）和 TF-IDF 降级模式（256 维）                                       |

搜索流程：

1. 语义搜索：查询 -> 生成嵌入 -> 加载 embedding-index.json -> 计算余弦相似度 -> 排序返回
2. 关键词搜索：查询 -> fetch search-index.json -> 分词匹配 -> 加权评分 -> 排序返回
3. 降级策略：API 未配置或不可用时自动从语义搜索降级到关键词搜索

### Quiz 服务（services/quiz/）

基于可选 AI 能力生成知识测验题目，支持三种题型。AI 未配置时使用 frontmatter 中的 fallbackQuiz。

文件：[quiz-service.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/quiz/quiz-service.ts)

| 题型   | 接口       | 说明                                           |
| :----- | :--------- | :--------------------------------------------- |
| fill   | FillQuiz   | 填空题，用户输入文本答案，忽略大小写精确匹配   |
| choice | ChoiceQuiz | 选择题，4 选项，answer 为正确选项索引          |
| fix    | FixQuiz    | 代码修复题，展示有错误的代码，用户输入修正方案 |

核心方法：

- `generateQuiz(request: QuizRequest): Promise<Quiz[]>` -- 生成题目，AI 未配置时返回 frontmatter 中的 fallbackQuiz
- `buildPrompt()` -- 根据题型构建 system/user 消息
- `parseQuizResponse()` -- 提取 JSON 并校验字段完整性

### 学习推荐服务（services/tutor/）

基于用户学习进度和可选 AI 能力，提供个性化学习推荐。AI 未配置时降级为规则推荐。

文件：[tutor-service.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/tutor/tutor-service.ts)

核心方法：

- `getRecommendations(request: TutorRequest): Promise<TutorRecommendation[]>` -- 获取推荐，AI 未配置时调用 fallbackRecommendations()
- `analyzeLearningStatus()` -- 分析学习状态，计算完成率和覆盖率
- `fallbackRecommendations()` -- 基于模块前置关系的规则推荐降级方案

### 路线规划服务（services/roadmap/）

基于可选 AI 能力生成个性化学习路线图，支持路线持久化。AI 未配置时降级为规则规划。

文件：[roadmap-service.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/roadmap/roadmap-service.ts)

核心方法：

- `generateRoadmap(request: RoadmapRequest): Promise<PersonalizedRoadmap>` -- 生成路线，AI 未配置时降级为规则规划
- `aiGenerateRoadmap()` -- AI 规划，构建提示词并解析分阶段路线
- `ruleBasedRoadmap()` -- 规则规划降级，基于 career-paths.json 匹配最接近的职业路径
- `topologicalSort()` -- Kahn 算法拓扑排序，按前置依赖排序模块
- `evaluateRoadmap()` -- 评估路线进度，计算完成百分比和剩余时间
- `saveRoadmap()` / `loadRoadmap()` / `deleteRoadmap()` -- localStorage 持久化

### GraphRAG 服务（services/graphrag/）

知识图谱增强生成服务，结合知识图谱和 RAG 技术提供增强问答。AI 未配置时降级为节点列表返回。

文件：[graphrag-service.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/graphrag/graphrag-service.ts)

核心方法：

- `answer(request: GraphRAGRequest): Promise<GraphRAGAnswer>` -- 知识图谱增强问答
- `loadGraph()` -- 加载知识图谱（带并发控制，多次调用共享同一个 Promise）
- `retrieveRelatedNodes()` -- 检索相关节点：关键词提取 -> 匹配评分 -> Top-K -> 1 跳扩展
- `queryGraph(query: GraphQuery): Promise<SubGraph>` -- 图谱查询，按模块/术语/关系类型过滤
- `buildContext()` -- 构建知识图谱上下文文本
- `fallbackAnswer()` -- AI 未配置时的降级回答（仅返回节点列表）

性能策略：知识图谱数据量大（8800 节点 + 18183 边），采用分片加载，首次仅加载节点索引。

## 工具库（lib/）

纯函数工具库，不包含业务逻辑。

| 文件                                                                                                     | 职责                                                                                         |
| :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| [progress.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/progress.ts)           | 阅读进度管理：localStorage 主存储 + IndexedDB 备份，支持导出/导入 JSON、跨标签页同步         |
| [store.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/store.ts)                 | Vue 3 reactive 全局状态：进度、活跃模块、搜索查询、移动端检测，BroadcastChannel 跨标签页同步 |
| [code-runner.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/code-runner.ts)     | 代码运行器：为 JS/TS 代码块添加运行按钮，Web Worker 沙盒执行，5 秒超时保护，unsafe 模式过滤  |
| [reading-mode.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/reading-mode.ts)   | 阅读模式管理：standard/focus/study 三模式切换，localStorage 持久化，CSS 类驱动显隐           |
| [animations.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/animations.ts)       | 动画初始化：卡片 hover 效果、锚点平滑滚动、侧边栏过渡                                        |
| [progress.test.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/lib/progress.test.ts) | 进度管理单元测试（Vitest）                                                                   |

### 进度管理核心函数

| 函数                   | 输入                    | 输出                   | 说明                                              |
| :--------------------- | :---------------------- | :--------------------- | :------------------------------------------------ |
| getAllProgress()       | 无                      | ProgressMap            | 读取全部进度（localStorage）                      |
| setProgress()          | slug, status, scrollPos | void                   | 设置单篇文档进度并备份到 IndexedDB                |
| toggleStatus()         | slug                    | DocStatus              | 循环切换状态：unread -> reading -> done -> unread |
| getModuleProgress()    | moduleId, slugs         | {done, total, percent} | 计算模块完成百分比                                |
| exportProgress()       | 无                      | string                 | 导出进度 JSON                                     |
| importProgress()       | json                    | boolean                | 导入进度 JSON（按 lastRead 合并）                 |
| restoreFromIndexedDB() | 无                      | Promise<boolean>       | 从 IndexedDB 恢复到 localStorage                  |

## 页面路由（pages/）

基于 Astro 文件路由系统，支持动态路由参数。

| 路由文件                                                                                                                         | 路径                | 说明           |
| :------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------------- |
| [index.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/index.astro)                                 | /                   | 首页，模块总览 |
| [\[module\]/index.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/%5Bmodule%5D/index.astro)         | /{module}/          | 模块详情页     |
| [\[module\]/\[slug\].astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/%5Bmodule%5D/%5Bslug%5D.astro) | /{module}/{slug}/   | 文档详情页     |
| [\[module\]/glossary.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/%5Bmodule%5D/glossary.astro)   | /{module}/glossary/ | 模块术语表     |
| [\[module\]/map.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/%5Bmodule%5D/map.astro)             | /{module}/map/      | 模块知识地图   |
| [tags/index.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/tags/index.astro)                       | /tags/              | 标签索引页     |
| [tags/\[tag\].astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/tags/%5Btag%5D.astro)                 | /tags/{tag}/        | 标签详情页     |
| [search.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/search.astro)                               | /search/            | 全文搜索页     |
| [roadmap.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/roadmap.astro)                             | /roadmap/           | 学习路线图     |
| [ai-assistant.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/ai-assistant.astro)                   | /ai-assistant/      | AI 助手页      |
| [404.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/404.astro)                                     | \*                  | 404 页面       |
| [rss.xml.js](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/pages/rss.xml.js)                                   | /rss.xml            | RSS 订阅       |

## 组件层（components/）

Astro 组件，构建时渲染为静态 HTML。

| 组件       | 文件                                                                                                            | 职责                                                                               |
| :--------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| Layout     | [Layout.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/Layout.astro)         | 文档页主布局：顶部导航、侧边栏、主内容区、移动端底部导航、CSP 策略、暗色模式初始化 |
| HomeLayout | [HomeLayout.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/HomeLayout.astro) | 首页布局                                                                           |
| Sidebar    | [Sidebar.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/Sidebar.astro)       | 侧边栏导航，模块视图懒加载                                                         |
| Breadcrumb | [Breadcrumb.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/Breadcrumb.astro) | 面包屑导航                                                                         |
| DocNav     | [DocNav.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/DocNav.astro)         | 文档上下篇导航                                                                     |
| ModuleCard | [ModuleCard.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/ModuleCard.astro) | 模块卡片                                                                           |
| SEO        | [SEO.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/SEO.astro)               | SEO 元数据                                                                         |
| AIQuiz     | [AIQuiz.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/AIQuiz.astro)         | AI 测验组件                                                                        |
| AITutor    | [AITutor.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/AITutor.astro)       | AI 学习推荐组件                                                                    |
| AIRoadmap  | [AIRoadmap.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/AIRoadmap.astro)   | AI 路线规划组件                                                                    |
| AIGraphRAG | [AIGraphRAG.astro](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/components/AIGraphRAG.astro) | GraphRAG 问答组件                                                                  |

## 岛屿组件（islands/）

Vue 3 组件，按需水合（client:load / client:visible）。

| 组件           | 文件                                                                                                             | 水合策略       | 职责                                             |
| :------------- | :--------------------------------------------------------------------------------------------------------------- | :------------- | :----------------------------------------------- |
| ThemeToggle    | [ThemeToggle.vue](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/islands/ThemeToggle.vue)       | client:load    | Dark/Light/Sepia 三主题切换，localStorage 持久化 |
| ProgressToggle | [ProgressToggle.vue](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/islands/ProgressToggle.vue) | client:visible | 文档进度切换按钮（unread/reading/done）          |
| QuizBlock      | [QuizBlock.vue](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/islands/QuizBlock.vue)           | client:visible | 交互测验块，支持填空/选择/代码修复               |
| CheatSheet     | [CheatSheet.vue](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/islands/CheatSheet.vue)         | client:visible | 语法速查表组件                                   |

## 构建管线

### 构建脚本（scripts/）

构建前脚本在 `npm run build` 中按顺序执行，生成各类索引和数据文件。

| 脚本                                                                                                                              | 职责                         | 输出                                                                    |
| :-------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- | :---------------------------------------------------------------------- |
| [copy-metadata-to-public.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/copy-metadata-to-public.mjs)             | 复制 metadata 到 public/data | public/data/modules.json 等                                             |
| [build-glossary-index.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-glossary-index.mjs)                   | 构建术语索引                 | public/data/glossary-index.json                                         |
| [build-module-docs-index.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-module-docs-index.mjs)             | 构建模块文档索引             | public/data/module-docs-index.json                                      |
| [build-tag-index.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-tag-index.mjs)                             | 构建标签索引                 | public/data/tag-index.json                                              |
| [build-search-index.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-search-index.mjs)                       | 构建搜索索引                 | public/data/search-index.json                                           |
| [generate-knowledge-graph.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/generate-knowledge-graph.mjs)           | 生成知识图谱                 | generated/graph/knowledge-graph.json + public/data/knowledge-graph.json |
| [generate-embedding-index.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/generate-embedding-index.mjs)           | 生成嵌入向量索引             | public/data/embedding-index.json                                        |
| [generate-review-cards.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/generate-review-cards.mjs)                 | 生成复习卡片                 | generated/cards/\*.json                                                 |
| [generate-cheatsheet-highlights.js](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/generate-cheatsheet-highlights.js) | 生成速查表高亮               | 速查表数据                                                              |
| [qa-check.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/qa-check.mjs)                                           | QA 检查                      | 控制台报告                                                              |
| [content-audit.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/content-audit.mjs)                                 | 内容审计                     | 审计报告                                                                |
| [add-doc-relations.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/add-doc-relations.mjs)                         | 添加文档关系                 | 更新 frontmatter                                                        |
| [extract-glossary-data.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/extract-glossary-data.mjs)                 | 提取术语数据                 | metadata/glossary/\*.json                                               |
| [analyze-katex-usage.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/analyze-katex-usage.mjs)                     | 分析 KaTeX 使用情况          | 分析报告                                                                |

#### 移动端构建（scripts/build-mobile/）

| 脚本                                                                                                                           | 职责                       |
| :----------------------------------------------------------------------------------------------------------------------------- | :------------------------- |
| [export-mobile-content.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-mobile/export-mobile-content.mjs) | 导出移动端内容             |
| [extract-mobile-html.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-mobile/extract-mobile-html.mjs)     | 提取移动端 HTML            |
| [pack-dist-mobile.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-mobile/pack-dist-mobile.mjs)           | 打包为 dist-mobile.zip     |
| [generate-review-cards.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/scripts/build-mobile/generate-review-cards.mjs) | 生成复习卡片（移动端版本） |

### 构建流程

`npm run build` 执行顺序：

1. `prebuild` -- generate-cheatsheet-highlights.js
2. `copy-metadata-to-public.mjs` -- 复制元数据
3. `build-glossary-index.mjs` -- 术语索引
4. `build-module-docs-index.mjs` -- 模块文档索引
5. `build-tag-index.mjs` -- 标签索引
6. `build-search-index.mjs` -- 搜索索引（超 100KB 自动压缩字段名）
7. `generate-knowledge-graph.mjs` -- 知识图谱（8800 节点 + 18183 边）
8. `generate-embedding-index.mjs` -- 嵌入向量索引
9. `astro build` -- Astro SSG 构建（含 Markdown 渲染管线）
10. `pagefind --site dist` -- Pagefind 搜索索引

### Markdown 渲染管线

配置于 [astro.config.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/astro.config.ts)：

**Remark 插件（Markdown -> MDAST）：**

1. remarkGfm -- GFM 语法（表格、任务列表、删除线）
2. remarkEmoji -- Emoji 短代码转换
3. remarkMath -- 数学公式语法解析
4. remarkMermaid -- Mermaid 图表构建时预渲染为双主题 SVG
5. remarkAdmonition -- 自定义提示块
6. remarkTermLink -- 术语预编译标记

**Rehype 插件（MDAST -> HAST -> HTML）：**

1. rehypeSlug -- 标题添加 id
2. rehypeAutolinkHeadings -- 标题锚点链接
3. rehypeKatex -- KaTeX 数学公式渲染为 HTML
4. rehypeImageOptimize -- 图片优化

**代码高亮：** Shiki 双主题（github-light / github-dark），通过 CSS 变量切换，不输出内联 color 属性。

## 依赖关系

### 运行时依赖

| 依赖                     | 版本    | 用途                          |
| :----------------------- | :------ | :---------------------------- |
| astro                    | ^5.5.0  | SSG 框架核心                  |
| @astrojs/mdx             | ^4.2.0  | MDX 支持                      |
| @astrojs/rss             | ^4.0.11 | RSS 订阅生成                  |
| @astrojs/sitemap         | ^3.3.0  | 站点地图生成                  |
| @astrojs/vue             | ^5.0.0  | Vue 3 集成                    |
| vue                      | ^3.5.0  | 响应式 UI 框架                |
| fuse.js                  | ^7.3.0  | 模糊搜索（Web Worker 内使用） |
| remark-gfm               | ^4.0.1  | GFM 语法支持                  |
| remark-math              | ^6.0.0  | 数学公式语法解析              |
| remark-emoji             | ^5.0.2  | Emoji 短代码转换              |
| rehype-katex             | ^7.0.1  | KaTeX 数学公式渲染            |
| rehype-slug              | ^6.0.0  | 标题 id 生成                  |
| rehype-autolink-headings | ^7.1.0  | 标题锚点链接                  |
| dompurify                | ^3.4.10 | XSS 防护（Mermaid 渲染）      |

### 开发时依赖

| 依赖        | 版本     | 用途                     |
| :---------- | :------- | :----------------------- |
| mermaid     | ^11.15.0 | 图表渲染（构建时）       |
| pagefind    | ^1.5.2   | 静态搜索索引生成         |
| typescript  | ^5.7.0   | 类型系统                 |
| vitest      | ^4.1.7   | 单元测试框架             |
| eslint      | ^10.5.0  | 代码检查                 |
| prettier    | ^3.8.3   | 代码格式化               |
| husky       | ^9.1.7   | Git 钩子                 |
| lint-staged | ^17.0.5  | 暂存区检查               |
| jsdom       | ^29.1.1  | DOM 环境（Mermaid 渲染） |
| svgdom      | ^0.1.23  | SVG 环境（Mermaid 渲染） |
| remark-cli  | ^12.0.1  | Markdown 格式检查        |

### 内部包依赖

应用层通过 `@packages/*` 路径别名引用能力层：

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@packages/*": ["../../packages/*"]
  }
}
```

依赖方向：`apps/web` -> `packages/*` -> `metadata/` + `content/`

## 环境变量

AI 功能为可选能力，需用户自行配置以下环境变量后方可启用（禁止硬编码）：

| 变量名             | 说明                                    | 默认值                 |
| :----------------- | :-------------------------------------- | :--------------------- |
| AI_PROVIDER        | AI 提供商（openai / deepseek / custom） | openai                 |
| AI_API_KEY         | API 密钥（必须设置）                    | 空                     |
| AI_BASE_URL        | API 基础 URL                            | 按 provider 自动选择   |
| AI_CHAT_MODEL      | 聊天模型名称                            | gpt-4o-mini            |
| AI_EMBEDDING_MODEL | 嵌入模型名称                            | text-embedding-3-small |

配置读取逻辑见 [config.ts](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/src/services/ai/config.ts)。

## 项目运行方式

### 环境要求

- Node.js >= 22
- npm（monorepo workspaces）

### 快速开始

```bash
# 安装依赖（monorepo workspaces）
npm install

# 本地开发（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

注意事项：

- 开发模式下 Pagefind 搜索索引未生成，搜索功能不可用。需 `npm run build` 后 `npm run preview` 才能使用搜索
- AI 功能为可选能力，需配置环境变量后方可使用
- 构建时 Mermaid 渲染需要 jsdom + svgdom 双 DOM 环境

### 脚本命令

| 命令                 | 说明                           |
| :------------------- | :----------------------------- |
| npm run dev          | 启动开发服务器（端口 3000）    |
| npm run build        | 构建生产版本（含全部索引生成） |
| npm run preview      | 预览构建结果                   |
| npm run lint         | ESLint 代码检查                |
| npm run lint:fix     | ESLint 自动修复                |
| npm run lint:docs    | remark 文档格式检查            |
| npm run typecheck    | astro check 类型检查           |
| npm run format       | Prettier 格式化                |
| npm run format:check | Prettier 格式检查              |
| npm run test         | Vitest 单元测试                |
| npm run test:watch   | Vitest 监听模式                |
| npm run qa           | QA 检查                        |
| npm run build:mobile | 构建移动端产物                 |

### 部署

仓库配置 GitHub Actions 自动部署，流水线定义于 [deploy.yml](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/.github/workflows/deploy.yml)。

三阶段流水线：

1. **setup** -- 安装依赖，缓存 node_modules
2. **build** -- 文档格式检查 -> 构建 -> QA 检查 -> 验证 Pagefind 索引 -> 上传产物
3. **deploy** -- 部署到 GitHub Pages

触发条件：push 到 main 分支或手动触发。

Settings -> Pages -> Source 选择 GitHub Actions 即可。

## 性能优化策略

| 优化项         | 实现方式                             | 效果                          |
| :------------- | :----------------------------------- | :---------------------------- |
| Mermaid 静态化 | 构建时预渲染为双主题 SVG             | 消除客户端 200KB+ JS          |
| 术语预编译     | remark-term-link 构建时嵌入术语 HTML | 运行时零解析开销              |
| Shiki 零 JS    | 构建时代码高亮，CSS 变量切换主题     | 无客户端高亮 JS               |
| KaTeX 优化     | output:html + font-display:swap      | 避免 FOIT，减少 HTML 体积     |
| 图片优化       | rehype-image-optimize 读取尺寸防 CLS | 懒加载 + 响应式               |
| Sidebar 懒加载 | 模块视图动态加载                     | 减少首屏体积                  |
| Pagefind 索引  | 构建后生成静态搜索索引               | Web Worker 搜索，不阻塞主线程 |
| 预取策略       | hover 时预加载页面                   | 提升页面切换速度              |
| Service Worker | Cache First + Network First + SWR    | 离线可用                      |

## AI 能力降级策略

所有 AI 服务均为可选能力，默认关闭。AI 未配置时功能自动降级，确保基础功能仍可正常使用。

| 服务     | AI 模式                              | 降级模式                                       |
| :------- | :----------------------------------- | :--------------------------------------------- |
| Search   | 语义搜索（嵌入向量 + 余弦相似度）    | 关键词搜索（TF-IDF 评分）                      |
| Quiz     | AI 生成题目（填空/选择/代码修复）    | 返回 frontmatter 中的 fallbackQuiz             |
| Tutor    | AI 个性化推荐                        | 基于模块前置关系的规则推荐                     |
| Roadmap  | AI 规划分阶段路线                    | 基于 career-paths.json 匹配职业路径 + 拓扑排序 |
| GraphRAG | AI 增强问答（知识图谱上下文 + 生成） | 返回相关节点列表（无生成式回答）               |

## 代码质量保障

| 工具        | 配置文件                                                                                                  | 触发时机        |
| :---------- | :-------------------------------------------------------------------------------------------------------- | :-------------- |
| ESLint      | [eslint.config.mjs](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/eslint.config.mjs)        | pre-commit + CI |
| Prettier    | [.prettierrc](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/.prettierrc)                             | pre-commit + CI |
| remark      | [.remarkrc.js](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/.remarkrc.js)                           | pre-commit + CI |
| TypeScript  | [tsconfig.json](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/apps/web/tsconfig.json)（strict 模式） | typecheck + CI  |
| Husky       | [.husky/pre-commit](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/.husky/pre-commit)                 | git commit      |
| lint-staged | [.lintstagedrc](file:///c:/Atian/Project/Trae/FANDEX-pj/FANDEX-exe/.lintstagedrc)                         | git commit      |
| Vitest      | progress.test.ts                                                                                          | npm test        |

## 安全策略

| 策略     | 实现位置                  | 说明                                      |
| :------- | :------------------------ | :---------------------------------------- |
| CSP      | Layout.astro meta 标签    | 限制 script/style/font/img/connect 来源   |
| Referrer | Layout.astro meta 标签    | strict-origin-when-cross-origin           |
| 密钥管理 | config.ts 环境变量        | 禁止硬编码，从环境变量读取                |
| XSS 防护 | dompurify + escapeHtml    | Mermaid SVG sanitize，术语 HTML 转义      |
| 代码沙盒 | code-runner.ts Web Worker | unsafe 模式过滤，5 秒超时，Worker 隔离    |
| 输入校验 | 各服务层方法              | 空查询校验、JSON 格式校验、字段完整性校验 |

## 编码规范

| 规范             | 说明                                           |
| :--------------- | :--------------------------------------------- |
| 分层架构         | UI 层 -> Service 层 -> Data 层，单向依赖       |
| UI 层约束        | 禁止直接调用 API，必须通过 services/index.ts   |
| 函数注释         | 所有函数必须包含中文注释，说明输入、输出、流程 |
| 单一职责         | 每个模块/类/函数仅承担一个职责                 |
| 禁止循环依赖     | 模块间依赖单向                                 |
| 禁止 any/unknown | TypeScript strict 模式                         |
| 异步错误处理     | 所有 async 方法必须 try-catch                  |
| API 统一封装     | 所有外部请求通过 AI 适配器统一封装             |
| utils 纯函数     | lib/ 目录仅允许纯函数工具                      |
