/**
 * 搜索服务单元测试
 *
 * 覆盖范围：
 * - keywordSearch 关键词搜索与排序逻辑（含空查询、命中评分、无匹配场景）
 * - semanticSearch 语义搜索降级链（嵌入索引为空、AI 异常、fetch 失败均降级到关键词搜索）
 * - loadEmbeddingIndex 异常回退（HTTP 错误与网络异常时回退为空索引）
 * - getModuleDocs 模块文档加载（含模块不存在与 fetch 失败的兜底）
 * - searchByTag 标签检索（含 tag 为空、query 二次过滤、fetch 失败兜底）
 *
 * 测试策略：
 * - 通过 vi.mock 模拟 AI 适配器与 isAIAvailable，避免依赖真实网络
 * - 通过 vi.stubGlobal 模拟 fetch，覆盖正常与异常路径
 * - 通过 vi.stubEnv 模拟 import.meta.env.BASE_URL，避免依赖运行时配置
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * vi.hoisted 用于声明在 vi.mock 工厂内部可访问的变量。
 * vitest 会将 vi.mock 调用提升至 import 之前执行，
 * 因此工厂函数内不能引用外部作用域的普通变量，必须通过 vi.hoisted 声明。
 */
const { fakeAdapter, isAIAvailableMock, fakeEmbedding } = vi.hoisted(() => {
  /** 生成与目标文档同维度的"伪嵌入"，仅 index=n 处为 1，其余为 0 */
  const fakeEmbedding = (n: number): number[] =>
    Array.from({ length: 4 }, (_, i) => (i === n ? 1 : 0));
  return {
    fakeAdapter: {
      chatCompletion: vi.fn(),
      embedding: vi.fn().mockResolvedValue({
        embeddings: [fakeEmbedding(0)],
      }),
    },
    isAIAvailableMock: vi.fn().mockReturnValue(true),
    fakeEmbedding,
  };
});

/* Mock AI 适配器：返回受控的 fake adapter，避免真实网络请求 */
vi.mock('../ai/adapter', () => ({
  createAIAdapter: () => fakeAdapter,
}));

/* Mock isAIAvailable：默认返回 true，单测中可按用例改写返回值 */
vi.mock('../ai/config', () => ({
  isAIAvailable: () => isAIAvailableMock(),
}));

import { SearchService } from './search-service';

/* 构造模拟搜索索引（search-index.json 数据形态） */
const sampleSearchIndex = [
  {
    slug: 'doc-a',
    title: 'Transformer 架构详解',
    description: '介绍自注意力机制',
    tags: ['deep-learning', 'attention'],
    module: 'ai-engineering',
    order: 1,
    difficulty: 'intermediate',
    updated: '2025-01-01',
  },
  {
    slug: 'doc-b',
    title: 'CNN 卷积网络',
    description: '介绍卷积操作与池化层',
    tags: ['deep-learning', 'cnn'],
    module: 'ai-engineering',
    order: 2,
    difficulty: 'beginner',
    updated: '2025-01-02',
  },
];

/* 构造模拟嵌入索引（embedding-index.json 数据形态） */
const sampleEmbeddingIndex = [
  {
    slug: 'doc-a',
    title: 'Transformer 架构详解',
    module: 'ai-engineering',
    embedding: fakeEmbedding(0),
  },
  {
    slug: 'doc-b',
    title: 'CNN 卷积网络',
    module: 'ai-engineering',
    embedding: fakeEmbedding(1),
  },
];

/* 构造模拟模块文档索引（module-docs.json 数据形态） */
const sampleModuleDocs: Record<string, Array<{ slug: string; title: string; order: number }>> = {
  'ai-engineering': [
    { slug: 'doc-a', title: 'Transformer 架构详解', order: 1 },
    { slug: 'doc-b', title: 'CNN 卷积网络', order: 2 },
  ],
};

/* 模拟 fetch 响应句柄：每个用例可重新设置返回值 */
let fetchMock: ReturnType<typeof vi.fn>;

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    /* 每个用例使用全新的 service 实例，避免缓存污染 */
    service = new SearchService();

    /* 重置 mock 状态 */
    fakeAdapter.embedding.mockReset();
    fakeAdapter.embedding.mockResolvedValue({ embeddings: [fakeEmbedding(0)] });
    isAIAvailableMock.mockReturnValue(true);

    /* 默认 fetch 行为：按 URL 返回对应数据 */
    fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('data/search-index.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => sampleSearchIndex,
        };
      }
      if (typeof url === 'string' && url.includes('data/embedding-index.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => sampleEmbeddingIndex,
        };
      }
      if (typeof url === 'string' && url.includes('data/module-docs.json')) {
        return {
          ok: true,
          status: 200,
          json: async () => sampleModuleDocs,
        };
      }
      return { ok: false, status: 404, json: async () => null };
    });

    /* 替换全局 fetch 与 BASE_URL，避免触发真实网络请求 */
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('BASE_URL', '/');
  });

  afterEach(() => {
    /* 恢复全局状态，避免污染后续用例 */
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('search 入口与 keywordSearch 降级链', () => {
    it('空查询直接返回空数组，不触发 fetch', async () => {
      const result = await service.search('', 'keyword', 10);
      expect(result).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('空白查询同样返回空数组', async () => {
      const result = await service.search('   ', 'keyword', 10);
      expect(result).toEqual([]);
    });

    it('关键词命中 title 时得分更高，并按得分倒序返回', async () => {
      const result = await service.search('transformer', 'keyword', 10);
      /* 仅 doc-a 命中 */
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
      expect(result[0].score).toBeGreaterThan(0);
    });

    it('多词查询时累加得分，且过滤掉 0 分项', async () => {
      const result = await service.search('transformer cnn', 'keyword', 10);
      /* 两条均命中（一条命中 transformer，一条命中 cnn） */
      expect(result).toHaveLength(2);
      /* 排序：得分高的在前 */
      const scores = result.map((r) => r.score);
      expect(scores).toHaveLength(2);
      expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
    });

    it('无任何匹配时返回空数组', async () => {
      const result = await service.search('zzznomatch', 'keyword', 10);
      expect(result).toEqual([]);
    });

    it('keyword 模式 fetch 抛异常时返回空数组（兜底）', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network error'));
      const result = await service.search('transformer', 'keyword', 10);
      expect(result).toEqual([]);
    });

    it('keyword 模式 fetch 返回非 2xx 时返回空数组', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => null });
      const result = await service.search('transformer', 'keyword', 10);
      expect(result).toEqual([]);
    });
  });

  describe('semanticSearch 降级链', () => {
    it('AI 可用且嵌入索引正常时返回按相似度排序的结果', async () => {
      /* 查询嵌入与 doc-a 相同方向，应得最高分 */
      fakeAdapter.embedding.mockResolvedValueOnce({ embeddings: [fakeEmbedding(0)] });
      const result = await service.search('transformer', 'semantic', 10);
      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('doc-a');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('嵌入索引为空时降级到关键词搜索', async () => {
      fetchMock.mockImplementationOnce(async (url: string) => {
        if (typeof url === 'string' && url.includes('data/embedding-index.json')) {
          return { ok: true, status: 200, json: async () => [] };
        }
        return { ok: false, status: 404, json: async () => null };
      });
      /* 关键词搜索会再次 fetch search-index.json */
      const result = await service.search('transformer', 'semantic', 10);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
    });

    it('AI 适配器 embedding 抛异常时降级到关键词搜索', async () => {
      fakeAdapter.embedding.mockRejectedValueOnce(new Error('ai error'));
      const result = await service.search('transformer', 'semantic', 10);
      /* 降级后命中关键词搜索 */
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
    });

    it('AI 不可用时强制走关键词搜索（即使 mode=semantic）', async () => {
      isAIAvailableMock.mockReturnValue(false);
      const result = await service.search('transformer', 'semantic', 10);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
      /* AI 适配器未被调用 */
      expect(fakeAdapter.embedding).not.toHaveBeenCalled();
    });
  });

  describe('loadEmbeddingIndex 异常回退', () => {
    it('embedding-index fetch 返回 500 时回退为空索引（语义搜索降级）', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('data/embedding-index.json')) {
          return { ok: false, status: 500, json: async () => null };
        }
        if (typeof url === 'string' && url.includes('data/search-index.json')) {
          return { ok: true, status: 200, json: async () => sampleSearchIndex };
        }
        return { ok: false, status: 404, json: async () => null };
      });
      /* 语义搜索应降级到关键词搜索，且不抛出 */
      const result = await service.search('transformer', 'semantic', 10);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
    });

    it('embedding-index fetch 抛异常时回退为空索引（语义搜索降级）', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('data/embedding-index.json')) {
          throw new Error('network failure');
        }
        if (typeof url === 'string' && url.includes('data/search-index.json')) {
          return { ok: true, status: 200, json: async () => sampleSearchIndex };
        }
        return { ok: false, status: 404, json: async () => null };
      });
      const result = await service.search('transformer', 'semantic', 10);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('doc-a');
    });
  });

  describe('getModuleDocs 模块文档加载', () => {
    it('返回指定模块的文档列表', async () => {
      const docs = await service.getModuleDocs('ai-engineering');
      expect(docs).toHaveLength(2);
      expect(docs[0].slug).toBe('doc-a');
      expect(docs[1].slug).toBe('doc-b');
    });

    it('模块不存在时返回空数组', async () => {
      const docs = await service.getModuleDocs('non-existent-module');
      expect(docs).toEqual([]);
    });

    it('fetch 抛异常时返回空数组（兜底）', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network error'));
      const docs = await service.getModuleDocs('ai-engineering');
      expect(docs).toEqual([]);
    });

    it('fetch 返回非 2xx 时返回空数组', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => null });
      const docs = await service.getModuleDocs('ai-engineering');
      expect(docs).toEqual([]);
    });

    it('后续调用命中内存缓存，fetch 仅被调用一次', async () => {
      await service.getModuleDocs('ai-engineering');
      await service.getModuleDocs('ai-engineering');
      /* 仅 module-docs.json 被加载一次 */
      const moduleDocsCalls = fetchMock.mock.calls.filter((args) =>
        String(args[0]).includes('data/module-docs.json')
      );
      expect(moduleDocsCalls).toHaveLength(1);
    });
  });

  describe('searchByTag 标签检索', () => {
    it('按 tag 过滤返回匹配文档', async () => {
      const results = await service.searchByTag('attention');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('doc-a');
    });

    it('tag 为空字符串时返回完整索引（供客户端模糊搜索）', async () => {
      const results = await service.searchByTag('');
      expect(results).toHaveLength(2);
    });

    it('带 query 参数时进行关键词二次过滤', async () => {
      const results = await service.searchByTag('deep-learning', 'cnn');
      /* deep-learning 标签下两条文档，仅 doc-b 包含 cnn 关键词 */
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('doc-b');
    });

    it('不存在的 tag 返回空数组', async () => {
      const results = await service.searchByTag('no-such-tag');
      expect(results).toEqual([]);
    });

    it('fetch 抛异常时返回空数组（兜底）', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network error'));
      const results = await service.searchByTag('attention');
      expect(results).toEqual([]);
    });

    it('fetch 返回非 2xx 时返回空数组', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => null });
      const results = await service.searchByTag('attention');
      expect(results).toEqual([]);
    });
  });
});
