/**
 * AI 配置管理
 *
 * 从环境变量读取 AI 服务配置，禁止硬编码任何密钥。
 *
 * 环境变量：
 * - AI_PROVIDER: AI 提供商（openai | deepseek | custom），默认 openai
 * - AI_API_KEY: API 密钥（必须设置）
 * - AI_BASE_URL: API 基础 URL（可选，用于自定义端点）
 * - AI_CHAT_MODEL: 聊天模型名称，默认 gpt-4o-mini
 * - AI_EMBEDDING_MODEL: 嵌入模型名称，默认 text-embedding-3-small
 */

import type { AIProvider } from './types';

/** AI 配置接口 */
export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  embeddingModel: string;
}

/** 预设提供商基础 URL */
const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
};

/**
 * 获取 AI 配置
 *
 * 输入：无（从环境变量读取）
 * 输出：AIConfig 对象
 * 流程：读取环境变量 -> 校验必填项 -> 合并默认值 -> 返回配置
 */
export function getAIConfig(): AIConfig {
  const rawProvider = import.meta.env.AI_PROVIDER || 'openai';
  const provider = validateProvider(rawProvider);
  const apiKey = import.meta.env.AI_API_KEY || '';
  const defaultBaseUrl = PROVIDER_URLS[provider] || '';
  const baseUrl = import.meta.env.AI_BASE_URL || defaultBaseUrl;
  const chatModel = import.meta.env.AI_CHAT_MODEL || 'gpt-4o-mini';
  const embeddingModel = import.meta.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small';

  return {
    provider,
    apiKey,
    baseUrl,
    chatModel,
    embeddingModel,
  };
}

/**
 * 校验提供商类型
 *
 * 输入：原始提供商字符串
 * 输出：合法的 AIProvider 值
 * 流程：检查是否在允许列表中 -> 返回合法值或降级为 custom
 */
function validateProvider(raw: string): AIProvider {
  const allowed: AIProvider[] = ['openai', 'deepseek', 'custom'];
  if (allowed.includes(raw as AIProvider)) {
    return raw as AIProvider;
  }
  return 'custom';
}

/**
 * 检查 AI 服务是否可用
 *
 * 输入：无
 * 输出：boolean（API Key 已配置时返回 true）
 */
export function isAIAvailable(): boolean {
  const config = getAIConfig();
  return config.apiKey.length > 0;
}
