/**
 * AI 配置服务单元测试
 *
 * 覆盖范围：
 * - 环境变量读取逻辑：AI_PROVIDER / AI_API_KEY / AI_BASE_URL / AI_CHAT_MODEL / AI_EMBEDDING_MODEL
 * - isAIAvailable() 检查：API Key 已配置返回 true，未配置返回 false
 * - 缺失环境变量时的降级行为：provider 非法值降级为 custom；baseUrl 缺失时使用预设 URL 或空字符串
 *
 * 测试策略：
 * - 通过 vi.stubEnv 修改 import.meta.env 中的环境变量
 * - 每个 describe 块在 beforeEach 中重置所有环境变量，避免用例间污染
 * - 通过 afterEach 调用 vi.unstubAllEnvs 恢复初始状态
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAIConfig, isAIAvailable } from './config';

/* 需要在测试中操作的环境变量键列表 */
const ENV_KEYS = [
  'AI_PROVIDER',
  'AI_API_KEY',
  'AI_BASE_URL',
  'AI_CHAT_MODEL',
  'AI_EMBEDDING_MODEL',
] as const;

describe('AI 配置服务', () => {
  beforeEach(() => {
    /* 每个用例前清空所有 AI 相关环境变量，确保从干净状态开始 */
    for (const key of ENV_KEYS) {
      vi.stubEnv(key, '');
    }
  });

  afterEach(() => {
    /* 用例结束后恢复所有 stub，避免影响其他测试 */
    vi.unstubAllEnvs();
  });

  describe('环境变量读取逻辑', () => {
    it('未设置任何环境变量时使用默认值', () => {
      const config = getAIConfig();
      expect(config.provider).toBe('openai');
      expect(config.apiKey).toBe('');
      expect(config.baseUrl).toBe('https://api.openai.com/v1');
      expect(config.chatModel).toBe('gpt-4o-mini');
      expect(config.embeddingModel).toBe('text-embedding-3-small');
    });

    it('AI_PROVIDER=openai 时使用 OpenAI 默认 URL', () => {
      vi.stubEnv('AI_PROVIDER', 'openai');
      const config = getAIConfig();
      expect(config.provider).toBe('openai');
      expect(config.baseUrl).toBe('https://api.openai.com/v1');
    });

    it('AI_PROVIDER=deepseek 时使用 DeepSeek 默认 URL', () => {
      vi.stubEnv('AI_PROVIDER', 'deepseek');
      const config = getAIConfig();
      expect(config.provider).toBe('deepseek');
      expect(config.baseUrl).toBe('https://api.deepseek.com/v1');
    });

    it('AI_PROVIDER=custom 且未设置 AI_BASE_URL 时 baseUrl 为空字符串', () => {
      vi.stubEnv('AI_PROVIDER', 'custom');
      const config = getAIConfig();
      expect(config.provider).toBe('custom');
      expect(config.baseUrl).toBe('');
    });

    it('AI_PROVIDER 为非法值时降级为 custom', () => {
      vi.stubEnv('AI_PROVIDER', 'unknown-provider');
      const config = getAIConfig();
      expect(config.provider).toBe('custom');
      /* custom 时没有预设 URL，因此 baseUrl 为空 */
      expect(config.baseUrl).toBe('');
    });

    it('AI_BASE_URL 显式设置时覆盖预设 URL', () => {
      vi.stubEnv('AI_PROVIDER', 'openai');
      vi.stubEnv('AI_BASE_URL', 'https://custom.example.com/v1');
      const config = getAIConfig();
      expect(config.baseUrl).toBe('https://custom.example.com/v1');
    });

    it('AI_BASE_URL 显式设置对 custom provider 同样生效', () => {
      vi.stubEnv('AI_PROVIDER', 'custom');
      vi.stubEnv('AI_BASE_URL', 'https://my-llm.example.com/v1');
      const config = getAIConfig();
      expect(config.provider).toBe('custom');
      expect(config.baseUrl).toBe('https://my-llm.example.com/v1');
    });

    it('AI_CHAT_MODEL 显式设置时覆盖默认值', () => {
      vi.stubEnv('AI_CHAT_MODEL', 'gpt-4o');
      const config = getAIConfig();
      expect(config.chatModel).toBe('gpt-4o');
    });

    it('AI_EMBEDDING_MODEL 显式设置时覆盖默认值', () => {
      vi.stubEnv('AI_EMBEDDING_MODEL', 'text-embedding-3-large');
      const config = getAIConfig();
      expect(config.embeddingModel).toBe('text-embedding-3-large');
    });

    it('AI_API_KEY 显式设置时返回配置中的 apiKey', () => {
      vi.stubEnv('AI_API_KEY', 'sk-test-key-123');
      const config = getAIConfig();
      expect(config.apiKey).toBe('sk-test-key-123');
    });

    it('所有字段同时设置时全部正确读取', () => {
      vi.stubEnv('AI_PROVIDER', 'deepseek');
      vi.stubEnv('AI_API_KEY', 'sk-deepseek');
      vi.stubEnv('AI_BASE_URL', 'https://api.deepseek.com/v2');
      vi.stubEnv('AI_CHAT_MODEL', 'deepseek-chat');
      vi.stubEnv('AI_EMBEDDING_MODEL', 'deepseek-embed');
      const config = getAIConfig();
      expect(config).toEqual({
        provider: 'deepseek',
        apiKey: 'sk-deepseek',
        baseUrl: 'https://api.deepseek.com/v2',
        chatModel: 'deepseek-chat',
        embeddingModel: 'deepseek-embed',
      });
    });
  });

  describe('isAIAvailable() 检查', () => {
    it('AI_API_KEY 未设置时返回 false', () => {
      vi.stubEnv('AI_API_KEY', '');
      expect(isAIAvailable()).toBe(false);
    });

    it('AI_API_KEY 设置非空值时返回 true', () => {
      vi.stubEnv('AI_API_KEY', 'sk-real-key');
      expect(isAIAvailable()).toBe(true);
    });

    it('AI_API_KEY 为空白字符串时返回 false（length === 0 判定）', () => {
      vi.stubEnv('AI_API_KEY', '');
      expect(isAIAvailable()).toBe(false);
    });
  });

  describe('缺失环境变量时的降级行为', () => {
    it('provider 校验失败时降级为 custom 且不抛异常', () => {
      vi.stubEnv('AI_PROVIDER', 'invalid-value');
      expect(() => getAIConfig()).not.toThrow();
      const config = getAIConfig();
      expect(config.provider).toBe('custom');
    });

    it('provider 为空字符串时使用默认值 openai', () => {
      /* import.meta.env.AI_PROVIDER || 'openai'：空字符串走 || 分支 */
      vi.stubEnv('AI_PROVIDER', '');
      const config = getAIConfig();
      expect(config.provider).toBe('openai');
    });

    it('apiKey 缺失时 isAIAvailable 返回 false，调用方应据此降级', () => {
      vi.stubEnv('AI_API_KEY', '');
      /* 模拟调用方根据 isAIAvailable 决定是否使用 AI 功能 */
      const useAI = isAIAvailable();
      expect(useAI).toBe(false);
    });

    it('apiKey 缺失但其他配置完整时仍能返回配置对象（不阻断配置读取）', () => {
      vi.stubEnv('AI_PROVIDER', 'openai');
      vi.stubEnv('AI_API_KEY', '');
      vi.stubEnv('AI_CHAT_MODEL', 'gpt-4o');
      const config = getAIConfig();
      /* 配置可正常读取，仅 isAIAvailable 返回 false */
      expect(config.provider).toBe('openai');
      expect(config.apiKey).toBe('');
      expect(config.chatModel).toBe('gpt-4o');
      expect(isAIAvailable()).toBe(false);
    });
  });
});
