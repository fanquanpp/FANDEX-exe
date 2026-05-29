# CODEX 资料库

综合技术自学资料库 -- 覆盖编程语言、Web 前端、数据库、数据分析、算法与计算机基础。

在线阅读: [fanquanpp.github.io/MyNotebook](https://fanquanpp.github.io/MyNotebook/)

---

## 学习路径

```
入门:  Markdown --> Git --> GitHub --> HTML5 --> CSS --> JavaScript
前端:  JavaScript --> TypeScript --> Vue3
数据:  Python --> 数据分析 | MySQL
系统:  C --> C++ | Java
进阶:  算法与数据结构 --> 计算机基础
```

---

## 模块总览

### 基础工具

| 模块     | 内容                                         |
| :------- | :------------------------------------------- |
| 入门指南 | 环境搭建、学习规划、终端基础                 |
| Git      | 版本控制、分支管理、远程操作、内部原理       |
| GitHub   | 账户安全、PR 协作、Actions CI/CD、Pages 部署 |
| Markdown | 语法基础、高级语法、文档自动化               |

### 编程语言

| 模块       | 内容                                      |
| :--------- | :---------------------------------------- |
| C          | 语法、指针、结构体、文件 IO、系统编程     |
| C++        | 模板、STL、智能指针、OOP、内存管理        |
| Java       | OOP、集合、多线程、JVM、Spring Boot/Cloud |
| JavaScript | 原型链、异步、DOM、模块化、Node.js        |
| TypeScript | 类型系统、泛型、装饰器、工程化配置        |
| Python     | 语法、OOP、推导式、模块、数据分析基础     |
| Lua        | 语法、Table、闭包、协程、元表             |

### Web 前端

| 模块  | 内容                                       |
| :---- | :----------------------------------------- |
| HTML5 | 语义化、表单验证、Canvas、Web API、PWA     |
| CSS   | 选择器、Flex/Grid、定位、响应式、动画      |
| Vue3  | 组合式 API、响应式、Router、Pinia、TS 集成 |

### 数据技术

| 模块     | 内容                                       |
| :------- | :----------------------------------------- |
| MySQL    | SQL 语法、索引优化、事务锁、SQL 注入防御   |
| 数据分析 | NumPy、Pandas、Matplotlib、Seaborn、统计学 |

### 计算机科学

| 模块           | 内容                                         |
| :------------- | :------------------------------------------- |
| 算法与数据结构 | 排序、搜索、DP、贪心、图论、LeetCode 指南    |
| 计算机基础     | 体系结构、操作系统、网络、编译原理、设计模式 |

---

## 功能特性

- 学习进度追踪 (localStorage + IndexedDB 备份，支持导出/导入)
- 术语悬浮解释 (自动匹配文档中的专业术语)
- 交互式测验 (填空/选择/代码修正三种题型)
- 知识地图 (Mermaid 可视化概念关联)
- 前置知识提示 (模块间依赖关系展示)
- 搜索筛选 (按模块/难度/分类过滤)
- 离线可用 (Service Worker 缓存)
- 暗色模式切换

---

## 技术栈

基于 Astro 5 SSG + Vue 3 Islands 构建的静态文档站点。

- Astro 5 静态站点生成 (SSG)
- Vue 3 交互式岛屿组件
- Shiki 双主题代码高亮 (构建时零 JS)
- Pagefind 全文搜索 + 标签筛选
- Mermaid 知识地图渲染
- Dark/Light 主题切换
- 响应式布局 (移动端抽屉侧边栏 + 底部导航)
- JSON-LD 结构化数据 (SEO)
- Service Worker 离线缓存

本地开发:

```bash
npm install
npm run dev
```

构建:

```bash
npm run build
```

---

## GitHub Pages 部署

仓库已配置 GitHub Actions 自动部署工作流 (`.github/workflows/deploy.yml`)。

1. 进入仓库 **Settings** --> **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存后，每次 push 到 main 分支会自动构建部署

---

## 项目结构

```
MyNotebook-main/
├── .github/workflows/deploy.yml   # GitHub Actions 自动部署
├── .husky/pre-commit               # Git pre-commit 钩子
├── public/                         # 静态资源
│   ├── fonts/fonts.css             # 字体声明
│   ├── data/glossary-index.json    # 术语索引
│   ├── sw.js                       # Service Worker
│   └── robots.txt                  # SEO
├── scripts/                        # 工具脚本
│   ├── build-glossary-index.mjs    # 术语索引构建
│   └── qa-check.mjs                # 质量检查
├── src/                            # Astro 项目源码
│   ├── components/                 # Astro 组件
│   ├── content/                    # 内容集合 (唯一数据源)
│   │   ├── docs/{18 modules}/      # 文档内容
│   │   ├── glossary/{17 modules}/  # 术语表
│   │   └── config.ts               # Zod schema
│   ├── islands/                    # Vue 岛屿组件
│   │   ├── ThemeToggle.vue         # 主题切换
│   │   ├── ProgressToggle.vue      # 学习进度
│   │   └── QuizBlock.vue           # 交互测验
│   ├── lib/                        # 工具函数
│   │   ├── modules.ts              # 模块定义与依赖
│   │   ├── progress.ts             # 进度管理
│   │   └── term-tooltip.ts         # 术语悬浮
│   ├── pages/                      # 路由页面
│   └── styles/                     # 全局样式
├── astro.config.ts                 # Astro 配置
├── package.json                    # 依赖声明
└── tsconfig.json                   # TypeScript 配置
```

---

## 许可证

本项目仅供个人学习使用。
