# 安全政策

## 支持的版本

FANDEX-exe 是一个持续更新的开源项目。安全修复仅针对最新的稳定版本发布。

| 版本 | 支持状态 |
| :--- | :--- |
| 最新Release | 接收安全更新 |
| 旧版本     | 不再支持    |

## 报告漏洞

发现安全漏洞时，请勿公开提交 Issue。请通过以下方式私密报告：

- 提交 [GitHub Security Advisory](https://github.com/fanquanpp/FANDEX-exe/security/advisories/new)
- 或发送邮件至仓库维护者（通过 GitHub 个人主页获取联系方式）

报告时请包含以下信息，以便我们快速定位和修复：

- 漏洞的类型和严重程度
- 复现步骤（详细描述触发条件）
- 受影响的版本号
- 漏洞的影响范围与潜在风险
- 建议的修复方案（如有）

我们承诺：

- 在收到报告后 72 小时内确认收到
- 在 14 天内评估并反馈处理意见
- 修复完成后在 Release 说明中致谢报告者（如报告者同意）

## 桌面应用安全说明

FANDEX-exe 是基于 Electron 的 Windows 桌面应用，已采取以下安全措施：

- `contextIsolation` 启用，隔离渲染进程与 Node.js 上下文
- `nodeIntegration` 禁用，防止渲染进程直接访问 Node.js API
- `sandbox` 启用，限制渲染进程的权限
- 外部链接在系统默认浏览器中打开，避免在应用内执行外部脚本
- 代码执行采用 Web Worker 沙箱，5 秒超时保护

## AI 功能安全说明

FANDEX-exe 提供可选的 AI 辅助学习功能，需通过环境变量 `AI_API_KEY` 启用：

- AI 功能默认关闭，未配置时不影响基础学习流程
- AI 服务密钥仅在本地使用，不会上传或共享
- 使用 AI 功能时，相关请求由使用者配置的 AI 服务处理，本仓库不对 AI 服务的安全性负责

## 免责声明

本仓库基于 MIT 许可证开源，不提供任何明示或暗示的保证。详见 [LICENSE](./LICENSE) 与 [DISCLAIMER.md](./DISCLAIMER.md)。

---

最后更新日期：2026-07-16
