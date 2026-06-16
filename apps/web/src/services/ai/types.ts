/**
 * AI 服务类型定义
 *
 * 定义 AI 提供商适配器接口、请求/响应类型。
 * 所有 AI 相关的类型均在此文件中定义，确保类型单一来源。
 */

/** AI 提供商类型 */
export type AIProvider = 'openai' | 'deepseek' | 'custom';

/** 聊天消息角色 */
export type ChatRole = 'system' | 'user' | 'assistant';

/** 聊天消息 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** 聊天完成请求 */
export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/** 聊天完成响应 */
export interface ChatCompletionResponse {
  content: string;
  usage?: TokenUsage;
}

/** Token 用量统计 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** 嵌入请求 */
export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

/** 嵌入响应 */
export interface EmbeddingResponse {
  embeddings: number[][];
  usage?: EmbeddingUsage;
}

/** 嵌入用量统计 */
export interface EmbeddingUsage {
  promptTokens: number;
  totalTokens: number;
}

/** AI 适配器接口 */
export interface AIAdapter {
  /** 聊天完成 */
  chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  /** 嵌入向量生成 */
  embedding(request: EmbeddingRequest): Promise<EmbeddingResponse>;
}
