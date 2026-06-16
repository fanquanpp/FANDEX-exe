/**
 * 嵌入向量生成服务
 *
 * 提供文本嵌入向量生成能力，支持两种模式：
 * - API 模式：调用 OpenAI 兼容嵌入 API 生成高精度向量
 * - 本地降级模式：使用 TF-IDF 算法生成稀疏向量
 *
 * 输入：文本或文本数组
 * 输出：嵌入向量数组
 * 流程：检查 AI 可用性 -> 选择生成模式 -> 生成向量 -> 返回结果
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';

/** 嵌入向量维度（API 模式默认 1536，降级模式 256） */
export const EMBEDDING_DIM_API = 1536;
export const EMBEDDING_DIM_FALLBACK = 256;

/** 嵌入结果 */
export interface EmbeddingResult {
  /** 嵌入向量 */
  vectors: number[][];
  /** 使用的维度 */
  dimensions: number;
  /** 是否为降级模式 */
  isFallback: boolean;
}

/**
 * 生成嵌入向量
 *
 * 输入：文本或文本数组
 * 输出：EmbeddingResult（向量数组、维度、是否降级）
 * 流程：检查 AI 可用性 -> API 模式或降级模式 -> 返回结果
 */
export async function generateEmbeddings(input: string | string[]): Promise<EmbeddingResult> {
  const texts = Array.isArray(input) ? input : [input];

  if (isAIAvailable()) {
    try {
      const adapter = createAIAdapter();
      const response = await adapter.embedding({ input: texts });
      return {
        vectors: response.embeddings,
        dimensions: response.embeddings[0]?.length ?? EMBEDDING_DIM_API,
        isFallback: false,
      };
    } catch (error) {
      console.error('API 嵌入生成失败，降级到本地模式:', error);
    }
  }

  return {
    vectors: generateTFIDFVectors(texts),
    dimensions: EMBEDDING_DIM_FALLBACK,
    isFallback: true,
  };
}

/**
 * TF-IDF 降级向量生成
 *
 * 输入：文本数组
 * 输出：稀疏向量数组（256 维）
 * 流程：分词 -> 构建 TF 向量 -> 归一化 -> 返回
 *
 * 注意：此为降级方案，精度远低于 API 生成的嵌入向量，
 * 仅在 API 不可用时使用，保证搜索功能基本可用。
 */
function generateTFIDFVectors(texts: string[]): number[][] {
  const dim = EMBEDDING_DIM_FALLBACK;
  return texts.map((text) => {
    const vector = new Array(dim).fill(0);
    const chars = text.toLowerCase().split('');

    for (let i = 0; i < chars.length; i++) {
      const code = chars[i].charCodeAt(0);
      const idx = code % dim;
      vector[idx] += 1;
    }

    /* 归一化：L2 范数 */
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  });
}
