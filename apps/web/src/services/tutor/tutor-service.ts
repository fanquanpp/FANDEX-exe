/**
 * 学习推荐服务
 *
 * 基于用户学习进度和 AI 能力，提供个性化学习推荐。
 * AI 不可用时返回基于模块前置关系的规则推荐。
 *
 * 输入：用户学习进度、当前模块、学习目标
 * 输出：推荐学习内容列表、学习统计
 * 流程：分析进度 -> 识别知识缺口 -> AI 推荐 / 规则推荐
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';
import type { ChatMessage } from '../ai/types';

/* ========== 类型定义 ========== */

/** 学习推荐项 */
export interface TutorRecommendation {
  /** 推荐模块 ID */
  moduleId: string;
  /** 推荐文档 slug */
  slug: string;
  /** 推荐原因 */
  reason: string;
  /** 优先级（1-5，5 最高） */
  priority: number;
}

/** 学习推荐请求 */
export interface TutorRequest {
  /** 已完成文档 slug 列表 */
  completedSlugs: string[];
  /** 当前模块 */
  currentModule: string;
  /** 可用模块列表 */
  availableModules: string[];
  /** 学习目标（可选，用于 AI 个性化推荐） */
  learningGoal?: string;
}

/** 学习统计数据 */
export interface LearningStats {
  /** 已学模块数 */
  completedModules: number;
  /** 总模块数 */
  totalModules: number;
  /** 完成率（0-100） */
  completionRate: number;
  /** 已学文档数 */
  completedDocs: number;
  /** 总文档数 */
  totalDocs: number;
  /** 知识覆盖率（0-100） */
  coverageRate: number;
}

/** 模块前置关系映射（外部注入） */
export interface ModulePrerequisiteMap {
  [moduleId: string]: string[];
}

/* ========== 服务类 ========== */

/** 学习推荐服务类 */
export class TutorService {
  private adapter = createAIAdapter();

  /**
   * 获取学习推荐
   *
   * 输入：TutorRequest（已完成列表、当前模块、可用模块、学习目标）
   * 输出：TutorRecommendation 数组
   * 流程：检查 AI -> 构建提示词 -> 调用 AI -> 解析结果
   *       AI 不可用时调用基于前置关系的规则推荐
   */
  async getRecommendations(request: TutorRequest): Promise<TutorRecommendation[]> {
    if (!isAIAvailable()) {
      return this.fallbackRecommendations(request);
    }

    try {
      const messages = this.buildPrompt(request);
      const response = await this.adapter.chatCompletion({ messages, temperature: 0.3 });
      const parsed = this.parseRecommendations(response.content);

      if (parsed.length > 0) {
        return parsed;
      }
      return this.fallbackRecommendations(request);
    } catch (error) {
      console.error('学习推荐生成失败:', error);
      return this.fallbackRecommendations(request);
    }
  }

  /**
   * 分析学习状态
   *
   * 输入：用户进度数据（localStorage 中的 fandex-progress）、模块前置关系、模块文档数映射
   * 输出：LearningStats 学习统计
   * 流程：读取进度 -> 统计已完成模块和文档 -> 计算覆盖率和完成率 -> 返回
   */
  analyzeLearningStatus(
    progressData: Record<string, { status: string }>,
    moduleDocCounts: Record<string, number>,
    totalModuleCount: number
  ): LearningStats {
    /* 统计已完成文档数 */
    let completedDocs = 0;
    let totalDocs = 0;
    const completedModuleSet = new Set<string>();

    for (const [slug, progress] of Object.entries(progressData)) {
      if (progress.status === 'done') {
        completedDocs++;
        /* 从 slug 中提取模块 ID（格式：moduleId/docSlug） */
        const moduleId = slug.split('/')[0];
        if (moduleId) {
          completedModuleSet.add(moduleId);
        }
      }
    }

    /* 统计总文档数 */
    for (const count of Object.values(moduleDocCounts)) {
      totalDocs += count;
    }

    /* 判断模块是否完成：该模块下所有文档均已标记为 done */
    let completedModules = 0;
    for (const [moduleId, docCount] of Object.entries(moduleDocCounts)) {
      if (docCount === 0) continue;
      let doneInModule = 0;
      for (const [slug, progress] of Object.entries(progressData)) {
        if (slug.startsWith(moduleId + '/') && progress.status === 'done') {
          doneInModule++;
        }
      }
      if (doneInModule >= docCount) {
        completedModules++;
      }
    }

    const completionRate = totalModuleCount > 0
      ? Math.round((completedModules / totalModuleCount) * 100)
      : 0;
    const coverageRate = totalDocs > 0
      ? Math.round((completedDocs / totalDocs) * 100)
      : 0;

    return {
      completedModules,
      totalModules: totalModuleCount,
      completionRate,
      completedDocs,
      totalDocs,
      coverageRate,
    };
  }

  /**
   * 构建推荐提示词
   *
   * 输入：TutorRequest
   * 输出：ChatMessage 数组
   * 流程：组装系统提示和用户上下文 -> 返回消息数组
   */
  private buildPrompt(request: TutorRequest): ChatMessage[] {
    const goalContext = request.learningGoal
      ? `\n学习目标：${request.learningGoal}`
      : '';

    return [
      {
        role: 'system',
        content: `你是一个学习路径推荐助手。根据用户已完成的学习内容和当前模块，推荐下一步应该学习的内容。
输出严格的 JSON 数组格式，不要包含任何其他文本或 markdown 代码块标记。
每项格式：{"moduleId":"模块ID","slug":"文档slug","reason":"推荐原因","priority":1-5}
要求：
1. 优先推荐当前模块的后续文档
2. 如果当前模块已学完，推荐前置知识未掌握的相关模块
3. priority 范围 1-5，5 为最高优先级
4. 推荐数量不超过 5 个
5. reason 应简明扼要，说明为什么推荐这个内容`,
      },
      {
        role: 'user',
        content: `已完成：${request.completedSlugs.join(', ') || '无'}\n当前模块：${request.currentModule}\n可用模块：${request.availableModules.join(', ')}${goalContext}`,
      },
    ];
  }

  /**
   * 解析推荐结果
   *
   * 输入：AI 返回的文本
   * 输出：TutorRecommendation 数组
   * 流程：提取 JSON -> 解析 -> 校验必要字段 -> 返回
   */
  private parseRecommendations(content: string): TutorRecommendation[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(
          (item: Record<string, string | number>) =>
            item.moduleId && item.slug !== undefined && item.reason
        )
        .map((item: Record<string, string | number>) => ({
          moduleId: String(item.moduleId),
          slug: String(item.slug),
          reason: String(item.reason),
          priority: typeof item.priority === 'number'
            ? Math.min(5, Math.max(1, item.priority))
            : 3,
        }))
        .slice(0, 5) as TutorRecommendation[];
    } catch {
      return [];
    }
  }

  /**
   * 降级推荐（基于模块前置关系规则）
   *
   * 输入：TutorRequest
   * 输出：TutorRecommendation 数组
   * 流程：
   *   1. 识别当前模块的前置模块中未学习的部分
   *   2. 推荐当前模块的下一个文档
   *   3. 按优先级排序返回
   */
  private fallbackRecommendations(request: TutorRequest): TutorRecommendation[] {
    const recommendations: TutorRecommendation[] = [];
    const completedSet = new Set(request.completedSlugs);

    /* 推荐当前模块下未完成的文档 */
    const currentModulePrefix = request.currentModule + '/';
    const hasCurrentModuleProgress = request.completedSlugs.some(
      (slug) => slug.startsWith(currentModulePrefix)
    );

    if (hasCurrentModuleProgress) {
      recommendations.push({
        moduleId: request.currentModule,
        slug: '',
        reason: '继续当前模块的学习，完成剩余文档',
        priority: 5,
      });
    }

    /* 推荐前置模块中未学习的模块 */
    for (const modId of request.availableModules) {
      if (modId === request.currentModule) continue;
      const modPrefix = modId + '/';
      const hasProgress = request.completedSlugs.some(
        (slug) => slug.startsWith(modPrefix)
      );
      if (!hasProgress) {
        recommendations.push({
          moduleId: modId,
          slug: '',
          reason: `${modId} 模块尚未开始学习`,
          priority: 2,
        });
      }
    }

    /* 按优先级降序排序，最多返回 5 条 */
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
  }
}

/* ========== 单例管理 ========== */

/** 学习推荐服务单例缓存 */
let tutorServiceInstance: TutorService | null = null;

/**
 * 获取学习推荐服务实例
 *
 * 输入：无
 * 输出：TutorService 实例（单例）
 */
export function getTutorService(): TutorService {
  if (!tutorServiceInstance) {
    tutorServiceInstance = new TutorService();
  }
  return tutorServiceInstance;
}
