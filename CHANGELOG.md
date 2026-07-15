# 更新日志

## v2.0.0（2026-07-16）小更新

### 文本勘误与完善

- 确认 LICENSE 版权年份为 2026（仓库新建于 2026 年）
- 校对 README.md，确认文档数（1996 篇）、Electron 版本（33）、GitHub Pages 与 Releases 链接、关联项目描述、AI 辅助学习说明、参赛信息、创意展示 HTML 引用等关键内容准确无误
- 校对 DISCLAIMER.md，确认桌面应用安装风险条款（Windows 10+ 要求、.exe 与 .zip 分发形式、官方 Releases 下载提示）与 AI 功能说明（AI_API_KEY 环境变量、默认关闭、降级模式）完整，所有 GitHub 链接指向 fanquanpp/FANDEX-exe 仓库
- 校对 CODE_OF_CONDUCT.md，确认 GitHub Issues 链接指向 fanquanpp/FANDEX-exe，最后更新日期为 2026-07-16
- 完善 CONTRIBUTING.md，补充 GitHub Issues 与 Pull Requests 链接指向 fanquanpp/FANDEX-exe 仓库，补充最后更新日期为 2026-07-16
- 校对 SECURITY.md，确认 GitHub Security Advisory 链接指向 fanquanpp/FANDEX-exe，最后更新日期为 2026-07-16

---

## v2.0.0（2026-07-14）

### 跨项目统一重构：packages 真包化、UI 越层修复、类型安全强化、测试基线建立

#### packages 真包化

- 为三个能力层 package 新增独立 `package.json`，确立真包化结构：
  - `packages/shared/package.json` 包名 `@fandex/shared`，包含 `version`、`main`、`types`、`type: "module"` 字段
  - `packages/search/package.json` 包名 `@fandex/search`
  - `packages/markdown/package.json` 包名 `@fandex/markdown`
- `apps/web/tsconfig.json` 的 `paths` 配置映射 `@fandex/*` 到 `../../packages/*`
- `apps/web/astro.config.ts` 相对路径导入改为包名导入（`@fandex/markdown`、`@fandex/shared`）
- `apps/web/src/pages/index.astro` 中 `from '@packages/shared/modules'` 改为 `from '@fandex/shared'`
- 全项目搜索 `@packages/` 与 `../../packages/` 无结果（仅 packages 内部相互引用除外）
- `npm install` 后 `npm ls @fandex/shared @fandex/search @fandex/markdown` 正确显示软链

#### UI 越层 fetch 修复

- `apps/web/src/services/search/search-service.ts` 新增 `getModuleDocs(moduleId)` 与 `searchByTag(tag, query?)` 方法
- `apps/web/src/components/Sidebar.astro` 移除直接 `fetch(${baseUrl}data/module-docs.json)`，改为 `searchService.getModuleDocs(moduleId)`
- `apps/web/src/pages/tags/index.astro` 移除直接 `fetch(${base}data/search-index.json)`，改为 `searchService.searchByTag(tag, query)`
- 全项目在 `apps/web/src/components/` 与 `apps/web/src/pages/` 下搜索 `fetch(` 仅出现在字符串字面量中

#### tags/index.astro any 类型修复

- 新增 `apps/web/src/types/dompurify.d.ts`，声明 DOMPurify 全局类型
- `tags/index.astro` 中 `(window as any).DOMPurify` 改为通过类型声明访问
- `let index: any[]` 改为具体 `SearchEntry[]` 类型
- `let fuse: any` 改为 `Fuse<SearchEntry>` 类型
- `function fallbackToFuse(FuseClass: any)` 改为具体 `typeof Fuse` 类型
- 多处 `(r: any)` / `(d: any)` / `(a: any, b: any)` 改为具体类型
- `apps/web/eslint.config.mjs` 中 `@typescript-eslint/no-explicit-any` 已改为 `'error'`
- `npm run lint` 在 `tags/index.astro` 中无 `any` 警告

#### CI 与配置修复

- 删除根目录 `.lintstagedrc` 文件，统一 lint-staged 配置至 `apps/web/package.json`
- 修正 `.prettierignore` 第 10 行为 `public/data/`
- `apps/web/src/lib/store.ts` 的 `initGlobalState` 函数用 try-catch 包裹 `getAllProgress()` 调用，异常路径回退为空进度对象
- 修正 `README.md`「关于 AI 学习」章节，说明 AI 为可选能力及降级行为，与代码中实际存在的 AI 组件（AIGraphRAG、AIQuiz、AIRoadmap、AITutor、ai-assistant 页面）一致

#### 测试基线建立

- 新增 74 个单元测试，覆盖核心服务：
  - `apps/web/src/services/search/search-service.test.ts` 覆盖 `keywordSearch`、`semanticSearch` 降级链、`loadEmbeddingIndex` 异常回退、`getModuleDocs`、`searchByTag`
  - `apps/web/src/services/quiz/quiz-service.test.ts` 覆盖 `isAIAvailable` 检查、`generateQuiz` 降级链、`parseQuizResponse` 异常、`validateQuizItem` 字段校验
  - `apps/web/src/services/ai/config.test.ts` 覆盖环境变量读取、`isAIAvailable()` 检查、缺失环境变量时的降级
  - `apps/web/src/lib/progress.test.ts` 学习进度持久化
- `apps/web/package.json` 包含 `vitest` 依赖与 `"test": "vitest run"` 脚本
- CI 中新增 test Job 执行 `npm run test`，作为 deploy Job 的前置依赖

---

## v1.1.0（2026-06-24）

### 正式发行版

Windows 桌面端离线学习平台，基于 Electron + Astro 5 构建。

#### 新增

- 51 模块 1996 篇文档，完全离线访问
- 内置静态服务器，双击即可使用
- 深色/浅色双模式
- 交互测验与知识地图
- 桌面级系统集成（菜单、多窗口、全屏）
- 可选 AI 能力（需用户自行配置环境变量）
- NSIS 安装程序，支持一键安装与卸载
- 离线 ZIP 包导出功能
- 移动端导出产物生成功能
- 程序图标字母 F（path 绘制，统一品牌视觉）
- logo-mark 样式统一为字母 F 方块

#### 技术栈

- Electron 33 桌面应用框架
- Astro 5 静态站点生成
- Pagefind + Fuse.js 搜索引擎
- Service Worker 离线缓存
- TypeScript 严格模式
