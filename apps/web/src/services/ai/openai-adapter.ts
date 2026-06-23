/**
 * OpenAI 兼容适配器
 *
 * 实现 AIAdapter 接口，支持 OpenAI / DeepSeek / 其他兼容 API。
 * 所有 API 请求统一封装，UI 层禁止直接调用。
 *
 * 输入：ChatCompletionRequest 或 EmbeddingRequest
 * 输出：ChatCompletionResponse 或 EmbeddingResponse
 * 流程：构建请求 -> 发送 HTTP -> 解析响应 -> 返回结果
 */

import type {
  AIAdapter,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from './types';
import { getAIConfig } from './config';

/** OpenAI API 聊天响应结构（仅提取必要字段） */
interface OpenAIChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** OpenAI API 嵌入响应结构（仅提取必要字段） */
interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[] }>;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIAdapter implements AIAdapter {
  private config = getAIConfig();

  /**
   * 聊天完成
   *
   * 输入：ChatCompletionRequest（消息列表、模型、温度等）
   * 输出：ChatCompletionResponse（生成内容、token 用量）
   * 流程：构建请求体 -> POST /chat/completions -> 解析响应
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const url = `${this.config.baseUrl}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.chatModel,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API 请求失败: ${response.status} ${errorText}`);
      }

      const data: OpenAIChatResponse = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(`聊天完成失败: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * 嵌入向量生成
   *
   * 输入：EmbeddingRequest（文本或文本数组）
   * 输出：EmbeddingResponse（嵌入向量数组）
   * 流程：构建请求体 -> POST /embeddings -> 解析响应
   */
  async embedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    try {
      const url = `${this.config.baseUrl}/embeddings`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.embeddingModel,
          input: request.input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`嵌入 API 请求失败: ${response.status} ${errorText}`);
      }

      const data: OpenAIEmbeddingResponse = await response.json();
      return {
        embeddings: data.data.map((item) => item.embedding),
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(`嵌入生成失败: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }
}
