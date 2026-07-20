# 贡献指南

感谢你关注 FANDEX 项目并愿意为其做出贡献。本指南统一约定本仓库的开发流程、分支策略、Commit 规范、PR 流程、代码风格与测试要求。在提交任何 Issue 或 PR 之前，请先完整阅读本文件。

## 环境要求

为确保贡献流程顺畅，请确认本地已具备以下工具链：

| 工具 | 版本 | 用途 |
| :--- | :--- | :--- |
| Node.js | >= 24.0.0 | 构建 / 开发环境 |
| pnpm | >= 10.0.0 | 包管理（workspace monorepo） |
| Rust | stable | Tauri 2 桌面端构建 |
| Git | latest | 代码管理，Windows 下建议 `core.autocrlf=true` |
| GitHub CLI（`gh`） | latest | 已通过 `gh auth login` 完成认证，scope 至少包含 `repo` 与 `workflow` |
| IDE | VS Code / JetBrains | 推荐安装 Biome 插件以获得 lint/format 实时反馈 |

### 启用 pnpm

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## 开发流程

本仓库采用 **Fork + Pull Request** 协作模型，所有外部贡献者统一通过 Fork 提交变更：

1. 在 GitHub 上 Fork 本仓库到自己的账号下
2. 将 Fork 后的仓库克隆到本地：`git clone https://github.com/<你的用户名>/FANDEX-exe.git`
3. 关联上游仓库：`git remote add upstream https://github.com/fanquanpp/FANDEX-exe.git`
4. 同步上游最新代码：`git fetch upstream && git checkout main && git merge upstream/main`
5. 基于最新 `main` 分支创建特性分支：`git checkout -b feat/<短描述>`
6. 安装依赖：`pnpm install`
7. 在特性分支上完成代码修改、单元测试与本地自测
8. 提交变更：`git commit -m "<type>(<scope>): <subject>"`（详见 Commit 规范）
9. 推送分支到自己的 Fork：`git push origin feat/<短描述>`
10. 在 GitHub 上发起 Pull Request，目标分支为 `fanquanpp/FANDEX-exe:main`，并按 PR 模板填写信息
11. 等待 Code Review 与 CI 校验，根据反馈迭代修改并持续 push 到同一分支

仓库维护者拥有直接写入权限，仍建议遵循相同的分支与 PR 流程，仅在紧急修复场景下允许直接提交至 `main`，且需在事后补 PR 回溯说明。

## 分支策略

- `main`：受保护分支，始终处于可发布状态，所有变更必须通过 PR 合入，禁止直接 push
- 特性分支：按变更类型命名，使用小写英文与中划线分隔，命名前缀如下：
  - `feat/<短描述>`：新增功能或增强既有功能
  - `fix/<短描述>`：修复 Bug
  - `docs/<短描述>`：文档类变更（README、注释、规范文档等）
  - `refactor/<短描述>`：不改变外部行为的代码重构
  - `chore/<短描述>`：构建、依赖、CI、工具链等杂项变更
  - `perf/<短描述>`：性能优化类变更
  - `test/<短描述>`：补充或修复测试用例
  - `ci/<短描述>`：CI / CD 流水线相关变更
  - `revert/<短描述>`：回滚某次变更
- 分支命名应简洁、可读，单分支生命周期不超过 30 天；长期未合入的分支应及时 rebase 或清理

## Commit 规范

本仓库严格遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范，所有提交信息必须满足以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `type` 必填，取值范围：
  - `feat`：新增功能
  - `fix`：修复 Bug
  - `docs`：文档变更
  - `style`：代码格式调整（不影响功能）
  - `refactor`：重构，不新增功能也不修复 Bug
  - `perf`：性能优化
  - `test`：测试用例变更
  - `chore`：构建、依赖、工具链等杂项
  - `build`：构建系统或依赖变更
  - `ci`：CI 配置变更
  - `revert`：回滚某次提交
- `scope` 选填，表示本次变更影响的模块或包名，如 `ui` / `api` / `auth` / `cli` 等，使用小写英文
- `subject` 必填，使用祈使句、现在时，首字母不大写，结尾不加句号，长度建议不超过 50 个字符。中文提交信息同样以动词开头，如「新增用户登录校验逻辑」
- `body` 选填，详细说明本次变更的动机、与旧行为的差异、注意事项等，每行不超过 72 个字符
- `footer` 选填，用于标记 BREAKING CHANGE、关闭 Issue（如 `Closes #123`）或关联其他提交

示例：

```
feat(auth): 新增基于 JWT 的访问令牌签发接口

- 新增 `/api/auth/token` 端点，支持用户名密码换取 access_token
- access_token 默认有效期 2 小时，refresh_token 默认 7 天
- 失败响应统一返回 401 状态码与结构化错误信息

Closes #42
```

如本次变更引入破坏性变更，必须在 `footer` 中以 `BREAKING CHANGE:` 开头说明，并在 PR 描述中显著标注：

```
feat(api): 重构用户信息返回结构

BREAKING CHANGE: 用户信息接口返回字段由 `user_name` 调整为 `username`，调用方需同步适配。
```

不符合 Conventional Commits 规范的提交将被 `.husky/commit-msg` 钩子拦截，Code Review 阶段也会驳回。

## PR 流程

PR（Pull Request）是合入变更的唯一通道，请严格按以下流程提交与迭代：

1. **关联 Issue**：如存在对应 Issue，请在 PR 描述中以 `Closes #<issue-number>` 或 `Refers #<issue-number>` 关联，便于自动关闭与追溯
2. **PR 描述**：按仓库根目录 `.github/pull_request_template.md` 中的模板逐项填写，包括变更目的、变更范围、影响说明、自测结果、回归风险
3. **自检清单**：提交前请逐项确认：
   - 已在本地完整运行单元测试：`pnpm test`
   - 已运行 lint 与 format 检查，无新增告警：`pnpm lint && pnpm format`
   - 已运行类型检查：`pnpm --filter web typecheck`
   - 已构建验证：`pnpm build`
   - 已更新相关文档（如涉及 API、配置、行为变更）
   - 已补充或更新测试用例（如涉及功能变更）
   - Commit 信息符合 Conventional Commits 规范
   - PR 分支已与目标分支 rebase 或 merge 至最新
4. **Code Review**：PR 提交后将由 Maintainer 或指定 Reviewer 进行审查，可能在 GitHub 上直接留下评论或建议修改，请根据反馈在原分支上提交新 commit 并 push，不要关闭并重建 PR
5. **CI 通过**：CI 流水线（含 lint、type-check、单元测试、构建、E2E、安全扫描）必须全部通过方可合入；如 CI 失败，请优先排查自身变更引入的问题，而非直接重试
6. **Squash Merge**：默认采用 Squash Merge 策略合入，PR 中的所有 commit 将被压缩为单个 commit 写入 `main`，commit message 以 PR 标题为准
7. **分支清理**：PR 合入后，contributor 侧的 Fork 分支可由 contributor 自行清理；维护者侧的远程分支将由仓库自动清理策略处理

## 代码规范

### Biome 配置

本仓库使用 [Biome v2](https://biomejs.dev) 作为统一的 lint + format 工具链，替代传统的 ESLint + Prettier 组合。

- 配置文件：根目录 `biome.json` 与 `apps/web/biome.json`
- 主要规则：
  - 缩进：2 空格
  - 行宽：100 字符
  - 引号：单引号
  - 分号：始终
  - 尾随逗号：all
  - `useImportType`：error（必须使用 `import type`）
  - `useNodejsImportProtocol`：error（必须使用 `node:` 协议）
  - `noExplicitAny`：warn
  - `noUnusedVariables` / `noUnusedImports`：warn

```bash
# 检查
pnpm lint

# 自动修复
pnpm --filter web lint:fix

# 仅格式化
pnpm format
```

### TypeScript 严格模式

- 全项目启用 TypeScript 严格模式
- 禁止滥用 `any`，必要时使用 `unknown` 并通过类型守卫收窄
- 第三方库类型缺失时谨慎使用 `any`，并标注 `// FIXME: 待补充类型`
- 所有异步函数建议通过 try-catch 或等效错误处理机制包裹

### Tailwind v4 CSS-first

- 使用 `@theme` 块定义设计令牌（颜色、间距、字体等）
- 严禁使用 v3 时代的 `tailwind.config.js` 与 `@tailwind` 指令
- 组件样式优先使用 utility class，避免内联样式

### Rust（Tauri 后端）

- 遵循 `rustfmt` 默认配置
- 使用 `cargo fmt --check` 与 `cargo clippy -- -D warnings` 检查
- IPC 命令使用 `#[tauri::command]` 宏标注
- 权限声明集中于 `src-tauri/capabilities/`，遵循最小权限原则

## 测试要求

- 新增功能必须同步补充对应的单元测试，覆盖率不低于仓库基线
- Bug 修复需先复现 Bug 的失败测试用例，再提交修复，确保修复可被测试守护
- 涉及外部依赖或副作用的逻辑，应通过依赖注入或 mock 进行隔离测试，避免在 CI 中依赖真实外部服务
- CI 流水线中的全部测试必须通过，方允许合入 `main`；如某项测试因环境问题间歇性失败，应优先排查根因，禁止屏蔽或跳过测试
- 提交大规模重构 PR 时，应在 PR 描述中说明对既有测试的影响与适配策略

### 测试命令

```bash
# 单元测试（Vitest）
pnpm test

# E2E 测试（Playwright）
pnpm test:e2e

# 覆盖率报告
pnpm --filter web test:coverage
```

## Git 钩子

本仓库通过 Husky 配置两个 Git 钩子：

### pre-commit

位于 `.husky/pre-commit`，在 `git commit` 前自动执行 `lint-staged`：

- 对暂存的 `.ts/.tsx/.js/.mjs/.astro` 文件执行 `biome check --write`
- 对暂存的 `.json/.css` 文件执行 `biome format --write`

如钩子未正确加载，请运行 `pnpm install` 触发 `prepare: husky` 脚本重新初始化。

### commit-msg

位于 `.husky/commit-msg`，校验提交信息是否符合 Conventional Commits 规范：

- 允许 type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore` / `build` / `ci` / `revert` / `merge`
- 期望格式：`<type>(<scope>): <subject>`
- 校验失败将拒绝提交并给出修复示例

如需绕过钩子（仅紧急场景，不推荐），可使用 `git commit --no-verify`，但 CI 仍会执行同等校验。

## Issue 模板

仓库提供以下 Issue 模板（位于 `.github/ISSUE_TEMPLATE/`）：

- Bug 报告：复现步骤 / 期望行为 / 实际行为 / 环境信息
- 功能请求：使用场景 / 期望方案 / 替代方案
- 问题咨询：上下文 / 已尝试方案 / 阻塞点

提交 Issue 时请选择对应模板并完整填写，便于维护者快速理解与定位问题。

## 行为准则

参与本仓库的所有贡献者、Reviewer、Maintainer 与使用者，均需遵守以下基本行为准则：

- **友好**：以解决问题为目标，对事不对人，避免使用攻击性、嘲讽性或贬低性的语言
- **尊重**：尊重不同背景、不同技术水平的参与者，不以经验差异作为评价依据
- **专业**：在 Issue、PR、讨论区中保持工程化、结构化的沟通，提供充分的上下文与可复现信息，避免情绪化表达
- **透明**：所有决策、变更、流程应通过公开渠道讨论与记录，禁止私下交易或承诺
- **聚焦**：讨论应围绕当前 Issue 或 PR 的主题展开，避免跑题或扩散到无关话题

如发现违反本行为准则的情况，可邮件至 `fanquanpangpiing@163.com` 反馈，维护者将在 7 天内回复并视情况采取处置措施。
