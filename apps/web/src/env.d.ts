/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * 环境变量类型声明
 *
 * 声明 AI 相关环境变量，确保 TypeScript 类型安全。
 * 所有密钥均从环境变量读取，禁止硬编码。
 */
interface ImportMetaEnv {
  /** AI 提供商（openai | deepseek | custom） */
  readonly AI_PROVIDER?: string;
  /** AI API 密钥（必须设置才能启用 AI 功能） */
  readonly AI_API_KEY?: string;
  /** AI API 基础 URL（可选，用于自定义端点） */
  readonly AI_BASE_URL?: string;
  /** AI 聊天模型名称 */
  readonly AI_CHAT_MODEL?: string;
  /** AI 嵌入模型名称 */
  readonly AI_EMBEDDING_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
