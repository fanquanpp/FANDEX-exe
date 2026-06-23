/**
 * 知识图谱增强生成服务（GraphRAG）
 *
 * 结合知识图谱和 RAG 技术，提供基于文档关系的增强问答。
 * AI 不可用时返回相关节点列表（无生成式回答）。
 *
 * 输入：用户问题
 * 输出：结构化回答（含引用来源）
 * 流程：加载知识图谱 -> 检索相关节点 -> 构建上下文 -> AI 生成回答
 *
 * 性能策略：
 * - 知识图谱数据量大（8800 节点 + 18183 边），采用分片加载
 * - 首次仅加载节点索引（轻量），按需加载完整图谱
 * - 检索在客户端执行（Astro SSG，无服务端）
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';
import type { ChatMessage } from '../ai/types';

/** 知识图谱节点 */
export interface GraphNode {
  /** 节点 ID */
  id: string;
  /** 节点标签/名称 */
  label: string;
  /** 节点类型（module | doc | term） */
  type: string;
}

/** 知识图谱边 */
export interface GraphEdge {
  /** 边的源节点 ID */
  source: string;
  /** 边的目标节点 ID */
  target: string;
  /** 边的关系类型（prerequisite | related | contains） */
  relation: string;
}

/** GraphRAG 回答 */
export interface GraphRAGAnswer {
  /** 回答内容 */
  content: string;
  /** 引用来源 slug 列表 */
  sources: string[];
  /** 相关节点 */
  relatedNodes: GraphNode[];
  /** 是否由 AI 生成 */
  aiGenerated: boolean;
}

/** GraphRAG 请求 */
export interface GraphRAGRequest {
  /** 用户问题 */
  question: string;
}

/** 图谱查询条件 */
export interface GraphQuery {
  /** 模块 ID 过滤 */
  moduleId?: string;
  /** 术语关键词 */
  term?: string;
  /** 关系类型过滤 */
  relationType?: string;
  /** 最大返回节点数 */
  limit?: number;
}

/** 图谱子图结果 */
export interface SubGraph {
  /** 匹配的节点 */
  nodes: GraphNode[];
  /** 匹配的边 */
  edges: GraphEdge[];
}

/** 检索相关度评分节点 */
interface ScoredNode {
  node: GraphNode;
  score: number;
}

/** 知识图谱索引（轻量，仅含节点摘要） */
interface GraphIndex {
  /** 节点列表（仅含 id、label、type） */
  nodes: GraphNode[];
  /** 边列表（仅含 source、target、relation） */
  edges: GraphEdge[];
}

/** Top-K 检索数量默认值 */
const DEFAULT_TOP_K = 10;

/** 1 跳扩展最大节点数 */
const MAX_EXPANSION_NODES = 30;

/**
 * 知识图谱增强生成服务类
 *
 * 职责：
 * 1. 知识图谱增强问答（AI + 降级）
 * 2. 图谱查询（子图检索）
 * 3. 图谱数据按需加载
 */
export class GraphRAGService {
  private adapter = createAIAdapter();
  private graphNodes: GraphNode[] = [];
  private graphEdges: GraphEdge[] = [];
  private graphLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * 加载知识图谱（带并发控制）
   *
   * 输入：无
   * 输出：Promise<void>（加载到内存）
   * 流程：检查缓存 -> fetch knowledge-graph.json -> 解析 -> 缓存
   * 并发控制：多次调用共享同一个加载 Promise
   */
  async loadGraph(): Promise<void> {
    if (this.graphLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.doLoadGraph();
    await this.loadPromise;
  }

  /**
   * 实际加载知识图谱数据
   *
   * 输入：无
   * 输出：void
   * 流程：fetch -> 解析 JSON -> 缓存节点和边
   */
  private async doLoadGraph(): Promise<void> {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${base}data/knowledge-graph.json`);
      if (!response.ok) {
        throw new Error(`知识图谱请求失败: ${response.status}`);
      }
      const data: GraphIndex = await response.json();
      this.graphNodes = data.nodes ?? [];
      this.graphEdges = data.edges ?? [];
      this.graphLoaded = true;
    } catch (error) {
      console.error('知识图谱加载失败:', error);
      this.graphNodes = [];
      this.graphEdges = [];
      this.graphLoaded = true;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * 知识图谱增强问答
   *
   * 输入：GraphRAGRequest（用户问题）
   * 输出：GraphRAGAnswer（结构化回答，含引用来源）
   * 流程：加载图谱 -> 检索相关节点 -> 构建上下文 -> AI 生成 / 降级
   */
  async answer(request: GraphRAGRequest): Promise<GraphRAGAnswer> {
    try {
      await this.loadGraph();
      const relatedNodes = this.retrieveRelatedNodes(request.question);

      if (isAIAvailable()) {
        try {
          const messages = this.buildPrompt(request.question, relatedNodes);
          const response = await this.adapter.chatCompletion({
            messages,
            temperature: 0.3,
          });

          /** 从回答中提取引用来源 */
          const sources = this.extractSources(response.content, relatedNodes);

          return {
            content: response.content,
            sources,
            relatedNodes,
            aiGenerated: true,
          };
        } catch (error) {
          console.error('GraphRAG AI 生成失败，降级为节点列表:', error);
        }
      }

      /** AI 不可用时的降级：返回相关节点列表（无生成式回答） */
      return this.fallbackAnswer(request.question, relatedNodes);
    } catch (error) {
      console.error('GraphRAG 回答生成失败:', error);
      return {
        content: '',
        sources: [],
        relatedNodes: [],
        aiGenerated: false,
      };
    }
  }

  /**
   * 检索与问题相关的图谱节点
   *
   * 输入：问题文本
   * 输出：相关节点数组（按相关度排序，取 Top-K）
   * 流程：
   * a. 从问题中提取关键词
   * b. 在知识图谱中查找匹配的术语/文档/模块节点
   * c. 扩展到相邻节点（1 跳）
   * d. 按相关度排序，取 Top-K 节点
   */
  private retrieveRelatedNodes(question: string): GraphNode[] {
    /** 提取关键词 */
    const keywords = this.extractKeywords(question);
    if (keywords.length === 0) return [];

    /** 关键词匹配节点并评分 */
    const scoredNodes: ScoredNode[] = [];

    for (const node of this.graphNodes) {
      let score = 0;
      const nodeLabelLower = node.label.toLowerCase();
      const nodeIdLower = node.id.toLowerCase();

      for (const keyword of keywords) {
        const kwLower = keyword.toLowerCase();

        /** 精确匹配标签（最高分） */
        if (nodeLabelLower === kwLower) {
          score += 10;
        } else if (nodeLabelLower.includes(kwLower)) {
          /** 标签包含关键词 */
          score += 5;
        } else if (nodeIdLower.includes(kwLower)) {
          /** ID 包含关键词 */
          score += 3;
        } else if (kwLower.includes(nodeLabelLower) && nodeLabelLower.length >= 2) {
          /** 关键词包含标签（反向包含） */
          score += 2;
        }
      }

      if (score > 0) {
        /** 模块节点加权（模块比术语更重要） */
        if (node.type === 'module') score += 3;
        else if (node.type === 'doc') score += 1;

        scoredNodes.push({ node, score });
      }
    }

    /** 按分数降序排序 */
    scoredNodes.sort((a, b) => b.score - a.score);

    /** 取 Top-K 直接匹配节点 */
    const topDirect = scoredNodes.slice(0, DEFAULT_TOP_K);
    const topNodeIds = new Set(topDirect.map((s) => s.node.id));

    /** 1 跳扩展：从直接匹配节点扩展到相邻节点 */
    const expandedNodeIds = new Set(topNodeIds);
    for (const scored of topDirect) {
      const neighbors = this.getNeighborNodeIds(scored.node.id);
      for (const neighborId of neighbors) {
        if (!expandedNodeIds.has(neighborId)) {
          expandedNodeIds.add(neighborId);
        }
        if (expandedNodeIds.size >= MAX_EXPANSION_NODES) break;
      }
      if (expandedNodeIds.size >= MAX_EXPANSION_NODES) break;
    }

    /** 从扩展 ID 集合中构建结果，保持排序 */
    const result: GraphNode[] = [];
    /** 先添加直接匹配节点 */
    for (const scored of topDirect) {
      result.push(scored.node);
    }
    /** 再添加扩展节点 */
    for (const nodeId of expandedNodeIds) {
      if (!topNodeIds.has(nodeId)) {
        const node = this.graphNodes.find((n) => n.id === nodeId);
        if (node) result.push(node);
      }
    }

    return result;
  }

  /**
   * 获取节点的相邻节点 ID（1 跳）
   *
   * 输入：节点 ID
   * 输出：相邻节点 ID 数组
   * 流程：遍历边列表 -> 匹配 source 或 target -> 收集对端节点 ID
   */
  private getNeighborNodeIds(nodeId: string): string[] {
    const neighborIds: string[] = [];
    for (const edge of this.graphEdges) {
      if (edge.source === nodeId) {
        neighborIds.push(edge.target);
      } else if (edge.target === nodeId) {
        neighborIds.push(edge.source);
      }
    }
    return neighborIds;
  }

  /**
   * 从问题中提取关键词
   *
   * 输入：问题文本
   * 输出：关键词数组
   * 流程：分词 -> 过滤停用词 -> 返回
   */
  private extractKeywords(question: string): string[] {
    /** 中文停用词列表 */
    const stopWords = new Set([
      '的',
      '了',
      '在',
      '是',
      '我',
      '有',
      '和',
      '就',
      '不',
      '人',
      '都',
      '一',
      '一个',
      '上',
      '也',
      '很',
      '到',
      '说',
      '要',
      '去',
      '你',
      '会',
      '着',
      '没有',
      '看',
      '好',
      '自己',
      '这',
      '他',
      '她',
      '什么',
      '怎么',
      '如何',
      '为什么',
      '哪',
      '哪些',
      '吗',
      '呢',
      '啊',
      '吧',
      '嗯',
      '那',
      '那么',
      '可以',
      '能',
      '应该',
      '需要',
      '请',
      '告诉',
      '解释',
      '说明',
      '介绍',
      '了解',
      '知道',
      '学习',
      '掌握',
    ]);

    /** 按空格和标点分词 */
    const rawWords = question
      .replace(/[，。？！、；：""''（）【】《》\[\]{},.?!;:'"()]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    /** 过滤停用词和单字符（中文单字可能有意义，保留） */
    const keywords: string[] = [];
    for (const word of rawWords) {
      if (stopWords.has(word)) continue;
      if (word.length === 1 && /[a-zA-Z0-9]/.test(word)) continue;
      keywords.push(word);
    }

    /** 中文文本分词补充：提取 2-4 字的子串 */
    if (keywords.length < 2) {
      const chineseChars = question.replace(/[^\u4e00-\u9fff]/g, '');
      if (chineseChars.length >= 2) {
        for (let len = Math.min(4, chineseChars.length); len >= 2; len--) {
          for (let i = 0; i <= chineseChars.length - len; i++) {
            const sub = chineseChars.substring(i, i + len);
            if (!stopWords.has(sub)) {
              keywords.push(sub);
            }
          }
        }
      }
    }

    return [...new Set(keywords)];
  }

  /**
   * 构建增强提示词
   *
   * 输入：用户问题、相关节点
   * 输出：ChatMessage 数组
   */
  private buildPrompt(question: string, relatedNodes: GraphNode[]): ChatMessage[] {
    /** 构建知识图谱上下文 */
    const context = this.buildContext(relatedNodes);

    return [
      {
        role: 'system',
        content: `你是 FANDEX 知识库的 AI 助手。根据以下知识图谱上下文回答用户问题。

知识图谱上下文：
${context}

请提供准确、结构化的回答，并标注信息来源。如果上下文中没有足够信息，请明确说明。`,
      },
      {
        role: 'user',
        content: question,
      },
    ];
  }

  /**
   * 构建知识图谱上下文文本
   *
   * 输入：相关节点列表
   * 输出：上下文文本
   * 流程：遍历节点 -> 附加节点标签 + 边关系 -> 格式化输出
   */
  private buildContext(relatedNodes: GraphNode[]): string {
    if (relatedNodes.length === 0) return '（无相关知识图谱数据）';

    const nodeIdSet = new Set(relatedNodes.map((n) => n.id));
    const lines: string[] = [];

    /** 添加节点信息 */
    for (const node of relatedNodes) {
      const typeLabel =
        node.type === 'module'
          ? '模块'
          : node.type === 'doc'
            ? '文档'
            : node.type === 'term'
              ? '术语'
              : node.type;
      lines.push(`[${typeLabel}] ${node.label} (${node.id})`);
    }

    /** 添加相关边信息 */
    const relevantEdges = this.graphEdges.filter(
      (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target)
    );

    if (relevantEdges.length > 0) {
      lines.push('');
      lines.push('关系：');
      for (const edge of relevantEdges.slice(0, 50)) {
        const sourceNode = relatedNodes.find((n) => n.id === edge.source);
        const targetNode = relatedNodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          const relationLabel =
            edge.relation === 'prerequisite'
              ? '前置知识'
              : edge.relation === 'related'
                ? '关联'
                : edge.relation === 'contains'
                  ? '包含'
                  : edge.relation;
          lines.push(`- ${sourceNode.label} --[${relationLabel}]--> ${targetNode.label}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * 从 AI 回答中提取引用来源
   *
   * 输入：AI 回答内容、相关节点
   * 输出：来源 slug 列表
   * 流程：匹配回答中出现的节点 ID -> 返回
   */
  private extractSources(content: string, relatedNodes: GraphNode[]): string[] {
    const sources: string[] = [];
    for (const node of relatedNodes) {
      if (content.includes(node.id) || content.includes(node.label)) {
        sources.push(node.id);
      }
    }
    return [...new Set(sources)];
  }

  /**
   * AI 不可用时的降级回答
   *
   * 输入：问题文本、相关节点
   * 输出：GraphRAGAnswer（仅含节点列表，无生成式回答）
   */
  private fallbackAnswer(question: string, relatedNodes: GraphNode[]): GraphRAGAnswer {
    if (relatedNodes.length === 0) {
      return {
        content: '未找到与您问题相关的知识节点。请尝试使用更具体的关键词。',
        sources: [],
        relatedNodes: [],
        aiGenerated: false,
      };
    }

    /** 构建降级回答：列出相关节点及其关系 */
    const lines: string[] = ['以下是与您问题相关的知识节点：'];
    for (const node of relatedNodes.slice(0, 15)) {
      const typeLabel =
        node.type === 'module'
          ? '模块'
          : node.type === 'doc'
            ? '文档'
            : node.type === 'term'
              ? '术语'
              : node.type;
      lines.push(`- [${typeLabel}] ${node.label}`);
    }

    return {
      content: lines.join('\n'),
      sources: relatedNodes.slice(0, 15).map((n) => n.id),
      relatedNodes: relatedNodes.slice(0, 15),
      aiGenerated: false,
    };
  }

  /**
   * 图谱查询：根据条件检索子图
   *
   * 输入：GraphQuery（模块、术语、关系类型）
   * 输出：SubGraph（匹配的节点 + 边）
   * 流程：加载图谱 -> 过滤节点 -> 过滤边 -> 返回子图
   */
  async queryGraph(query: GraphQuery): Promise<SubGraph> {
    try {
      await this.loadGraph();

      const limit = query.limit ?? 50;
      let filteredNodes = this.graphNodes;

      /** 按模块 ID 过滤 */
      if (query.moduleId) {
        const moduleIdLower = query.moduleId.toLowerCase();
        filteredNodes = filteredNodes.filter(
          (n) =>
            n.id.toLowerCase().startsWith(moduleIdLower) || n.id.toLowerCase() === moduleIdLower
        );
      }

      /** 按术语关键词过滤 */
      if (query.term) {
        const termLower = query.term.toLowerCase();
        filteredNodes = filteredNodes.filter(
          (n) => n.label.toLowerCase().includes(termLower) || n.id.toLowerCase().includes(termLower)
        );
      }

      /** 按节点类型过滤 */
      if (query.relationType) {
        /** 查找与指定关系类型相关的节点 */
        const relevantEdges = this.graphEdges.filter((e) => e.relation === query.relationType);
        const relevantNodeIds = new Set<string>();
        for (const edge of relevantEdges) {
          relevantNodeIds.add(edge.source);
          relevantNodeIds.add(edge.target);
        }
        filteredNodes = filteredNodes.filter((n) => relevantNodeIds.has(n.id));
      }

      /** 限制返回数量 */
      const resultNodes = filteredNodes.slice(0, limit);
      const resultNodeIds = new Set(resultNodes.map((n) => n.id));

      /** 过滤相关边（两端节点都在结果集中） */
      const resultEdges = this.graphEdges.filter(
        (e) => resultNodeIds.has(e.source) || resultNodeIds.has(e.target)
      );

      return {
        nodes: resultNodes,
        edges: resultEdges.slice(0, limit * 2),
      };
    } catch (error) {
      console.error('图谱查询失败:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * 获取图谱统计信息
   *
   * 输入：无
   * 输出：节点数量和边数量的统计
   */
  async getGraphStats(): Promise<{ nodeCount: number; edgeCount: number }> {
    try {
      await this.loadGraph();
      return {
        nodeCount: this.graphNodes.length,
        edgeCount: this.graphEdges.length,
      };
    } catch {
      return { nodeCount: 0, edgeCount: 0 };
    }
  }
}

/** GraphRAG 服务单例 */
let graphragServiceInstance: GraphRAGService | null = null;

/**
 * 获取 GraphRAG 服务实例
 *
 * 输入：无
 * 输出：GraphRAGService 实例（单例）
 */
export function getGraphRAGService(): GraphRAGService {
  if (!graphragServiceInstance) {
    graphragServiceInstance = new GraphRAGService();
  }
  return graphragServiceInstance;
}
