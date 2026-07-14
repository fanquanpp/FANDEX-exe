/**
 * 搜索服务
 *
 * 提供语义搜索和关键词搜索两种模式：
 * - 语义搜索：使用嵌入向量计算文档与查询的相似度
 * - 关键词搜索：基于 search-index.json 的全文搜索
 *
 * 输入：搜索查询字符串
 * 输出：搜索结果列表（按相关度排序）
 * 流程：
 *   语义搜索：查询 -> 生成嵌入 -> 计算余弦相似度 -> 排序返回
 *   关键词搜索：查询 -> 分词 -> 匹配索引 -> 排序返回
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';

/** 搜索结果项 */
export interface SearchResult {
  slug: string;
  title: string;
  module: string;
  score: number;
  snippet?: string;
}

/** 搜索模式 */
export type SearchMode = 'semantic' | 'keyword';

/** 文档嵌入索引条目 */
interface DocEmbedding {
  slug: string;
  title: string;
  module: string;
  embedding: number[];
}

/** search-index.json 中的文档条目结构（标签搜索与客户端搜索的基础数据） */
export interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  module: string;
  order: number;
  difficulty: string;
  updated: string;
}

/** 模块文档索引条目（data/module-docs.json 中的单条文档记录） */
export interface ModuleDocEntry {
  slug: string;
  title: string;
  order: number;
}

/** 搜索服务类 */
export class SearchService {
  private adapter = createAIAdapter();
  private embeddingIndex: DocEmbedding[] = [];
  private indexLoaded = false;
  /** 搜索索引缓存（search-index.json，标签搜索与关键词搜索共用） */
  private searchIndexCache: SearchEntry[] | null = null;
  /** 模块文档索引缓存（module-docs.json，侧边栏懒加载共用） */
  private moduleDocsCache: Record<string, ModuleDocEntry[]> | null = null;

  /**
   * 执行搜索
   *
   * 输入：查询字符串、搜索模式、最大结果数
   * 输出：搜索结果数组
   * 流程：根据模式选择搜索策略 -> 执行搜索 -> 排序返回
   */
  async search(
    query: string,
    mode: SearchMode = 'keyword',
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    /* 输入校验：空查询直接返回空结果 */
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (mode === 'semantic' && isAIAvailable()) {
      return this.semanticSearch(query, maxResults);
    }
    return this.keywordSearch(query, maxResults);
  }

  /**
   * 语义搜索
   *
   * 输入：查询字符串、最大结果数
   * 输出：按相似度排序的搜索结果
   * 流程：加载嵌入索引 -> 生成查询嵌入 -> 计算余弦相似度 -> 排序
   */
  private async semanticSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      await this.loadEmbeddingIndex();
      if (this.embeddingIndex.length === 0) {
        return this.keywordSearch(query, maxResults);
      }

      const queryEmbedding = await this.adapter.embedding({ input: query });
      const queryVec = queryEmbedding.embeddings[0];

      const results = this.embeddingIndex.map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        module: doc.module,
        score: this.cosineSimilarity(queryVec, doc.embedding),
      }));

      return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
    } catch (error) {
      console.error('语义搜索失败，回退到关键词搜索:', error);
      return this.keywordSearch(query, maxResults);
    }
  }

  /**
   * 关键词搜索
   *
   * 输入：查询字符串、最大结果数
   * 输出：匹配的搜索结果
   * 流程：fetch search-index.json -> 关键词匹配 -> 排序
   */
  private async keywordSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      const index = await this.loadSearchIndex();
      const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 0);

      const results = index.map((doc) => {
        const text = `${doc.title} ${doc.description} ${doc.tags.join(' ')}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (text.includes(term)) score += 1;
          if (doc.title.toLowerCase().includes(term)) score += 2;
          if (doc.tags.some((tag) => tag.toLowerCase().includes(term))) score += 1.5;
        }
        return {
          slug: doc.slug,
          title: doc.title,
          module: doc.module,
          score,
        };
      });

      return results
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
    } catch (error) {
      console.error('关键词搜索失败:', error);
      return [];
    }
  }

  /**
   * 获取指定模块的文档列表
   *
   * 封装对 data/module-docs.json 的加载逻辑，避免 UI 层直接 fetch。
   * 首次调用加载完整索引并缓存，后续直接从缓存按模块取值。
   *
   * 输入：moduleId - 模块标识
   * 输出：该模块下的文档列表
   * 流程：加载模块文档索引 -> 按 moduleId 取值 -> 返回文档数组
   */
  async getModuleDocs(moduleId: string): Promise<ModuleDocEntry[]> {
    try {
      const docs = await this.loadModuleDocs();
      return docs[moduleId] ?? [];
    } catch (error) {
      console.error('加载模块文档索引失败:', error);
      return [];
    }
  }

  /**
   * 按标签检索文档
   *
   * 封装对 data/search-index.json 的加载与 tag 维度检索逻辑，避免 UI 层直接 fetch。
   * 支持可选的关键词二次过滤。当 tag 为空字符串时返回完整索引，供客户端 Fuse.js 等模糊搜索使用。
   *
   * 输入：tag - 标签名（空字符串表示不限标签）、query - 可选关键词
   * 输出：匹配的文档条目数组
   * 流程：加载搜索索引 -> 按 tag 过滤 -> 按 query 过滤 -> 返回结果
   */
  async searchByTag(tag: string, query?: string): Promise<SearchEntry[]> {
    try {
      const index = await this.loadSearchIndex();
      let results = tag ? index.filter((entry) => entry.tags.includes(tag)) : index;
      if (query) {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        results = results.filter((entry) => {
          const text = `${entry.title} ${entry.description} ${entry.tags.join(' ')}`.toLowerCase();
          return terms.some((term) => text.includes(term));
        });
      }
      return results;
    } catch (error) {
      console.error('标签搜索失败:', error);
      return [];
    }
  }

  /**
   * 加载搜索索引（带内存缓存）
   *
   * 输入：无
   * 输出：SearchEntry[] 搜索索引数组
   * 流程：检查缓存 -> fetch search-index.json -> 解析 -> 缓存并返回
   */
  private async loadSearchIndex(): Promise<SearchEntry[]> {
    if (this.searchIndexCache) return this.searchIndexCache;
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/search-index.json`);
    if (!response.ok) {
      throw new Error(`搜索索引请求失败: ${response.status}`);
    }
    this.searchIndexCache = (await response.json()) as SearchEntry[];
    return this.searchIndexCache;
  }

  /**
   * 加载模块文档索引（带内存缓存）
   *
   * 输入：无
   * 输出：Record<string, ModuleDocEntry[]> 模块文档索引对象
   * 流程：检查缓存 -> fetch module-docs.json -> 解析 -> 缓存并返回
   */
  private async loadModuleDocs(): Promise<Record<string, ModuleDocEntry[]>> {
    if (this.moduleDocsCache) return this.moduleDocsCache;
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/module-docs.json`);
    if (!response.ok) {
      throw new Error(`模块文档索引请求失败: ${response.status}`);
    }
    this.moduleDocsCache = (await response.json()) as Record<string, ModuleDocEntry[]>;
    return this.moduleDocsCache;
  }

  /**
   * 加载嵌入索引
   *
   * 输入：无
   * 输出：void（加载到内存）
   * 流程：fetch embedding-index.json -> 解析 -> 缓存
   */
  private async loadEmbeddingIndex(): Promise<void> {
    if (this.indexLoaded) return;
    try {
      const base = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${base}data/embedding-index.json`);
      if (!response.ok) {
        throw new Error(`嵌入索引请求失败: ${response.status}`);
      }
      this.embeddingIndex = await response.json();
      this.indexLoaded = true;
    } catch {
      this.embeddingIndex = [];
      this.indexLoaded = true;
    }
  }

  /**
   * 计算余弦相似度
   *
   * 输入：两个等长向量
   * 输出：相似度值（-1 到 1，0 表示无相关）
   * 流程：点积 / (范数A * 范数B)
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

/** 搜索服务单例 */
let searchServiceInstance: SearchService | null = null;

/**
 * 获取搜索服务实例
 *
 * 输入：无
 * 输出：SearchService 实例（单例）
 * 流程：检查缓存 -> 创建实例 -> 缓存并返回
 */
export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
}
