/**
 * AI 适配器工厂
 *
 * 根据配置创建对应的 AI 适配器实例。
 * 当前仅支持 OpenAI 兼容 API，后续可扩展其他提供商。
 *
 * 输入：无（从配置读取提供商类型）
 * 输出：AIAdapter 实例
 * 流程：读取配置 -> 根据提供商类型创建适配器 -> 返回实例
 */

import type { AIAdapter } from './types';
import { getAIConfig } from './config';
import { OpenAIAdapter } from './openai-adapter';

/** 适配器单例缓存 */
let cachedAdapter: AIAdapter | null = null;

/**
 * 创建 AI 适配器
 *
 * 输入：无（从配置读取提供商类型）
 * 输出：AIAdapter 实例（单例）
 * 流程：检查缓存 -> 读取配置 -> 创建适配器 -> 缓存并返回
 */
export function createAIAdapter(): AIAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }

  const config = getAIConfig();
  switch (config.provider) {
    case 'openai':
    case 'deepseek':
    case 'custom':
    default:
      cachedAdapter = new OpenAIAdapter();
      return cachedAdapter;
  }
}

/**
 * 重置适配器单例
 *
 * 输入：无
 * 输出：void
 * 流程：清空缓存引用
 * 用途：配置变更后需要重新创建适配器时调用
 */
export function resetAIAdapter(): void {
  cachedAdapter = null;
}
