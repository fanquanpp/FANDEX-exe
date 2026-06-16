/**
 * Quiz 生成服务
 *
 * 基于 AI 能力生成知识测验题目，支持填空题、选择题、代码修复题三种题型。
 * AI 不可用时返回文档 frontmatter 中已有的 quiz 数据作为降级方案。
 *
 * 输入：模块 ID、文档 slug、文档标题、内容摘要、题目类型、数量
 * 输出：Quiz 题目数组
 * 流程：构建 prompt -> 调用 AI -> 解析响应 -> 校验格式 -> 返回
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';
import type { ChatMessage } from '../ai/types';

/* ========== 类型定义 ========== */

/** Quiz 题目类型：填空 / 选择 / 代码修复 */
export type QuizType = 'fill' | 'choice' | 'fix';

/** 填空题：用户输入文本答案，忽略大小写精确匹配 */
export interface FillQuiz {
  /** 题型标识 */
  type: 'fill';
  /** 题目文字 */
  question: string;
  /** 正确答案 */
  answer: string;
  /** 答错时显示的提示 */
  hint?: string;
}

/** 选择题：从多个选项中选择一个正确答案 */
export interface ChoiceQuiz {
  /** 题型标识 */
  type: 'choice';
  /** 题目文字 */
  question: string;
  /** 选项列表 */
  options: string[];
  /** 正确答案的选项索引（从 0 开始） */
  answer: number;
  /** 提交后显示的解析说明 */
  explanation?: string;
}

/** 代码修复题：展示有错误的代码，用户输入修正后的代码或说明 */
export interface FixQuiz {
  /** 题型标识 */
  type: 'fix';
  /** 题目文字 */
  question: string;
  /** 待修复的原始代码 */
  code?: string;
  /** 参考答案（修复后的代码或说明） */
  answer: string;
  /** 提交后显示的解析说明 */
  explanation?: string;
}

/** Quiz 联合类型：三种题型的联合 */
export type Quiz = FillQuiz | ChoiceQuiz | FixQuiz;

/** Quiz 生成请求 */
export interface QuizRequest {
  /** 模块 ID */
  moduleId: string;
  /** 文档 slug */
  slug: string;
  /** 文档标题 */
  title: string;
  /** 内容摘要 */
  summary: string;
  /** 题目数量，默认 3 */
  count?: number;
  /** 题目类型，默认 choice */
  quizType?: QuizType;
  /** 降级数据：文档 frontmatter 中已有的 quiz 数据 */
  fallbackQuiz?: Quiz[];
}

/* ========== Prompt 模板 ========== */

/**
 * 填空题 prompt 模板
 *
 * 输入：标题、摘要、数量
 * 输出：ChatMessage 数组
 */
function buildFillPrompt(title: string, summary: string, count: number): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一个知识测验生成器。根据用户提供的文档内容生成 ${count} 道填空题。
输出严格的 JSON 数组格式，不要包含任何其他文本或 markdown 代码块标记。
每道题格式：{"type":"fill","question":"题目文字，用___表示空白处","answer":"正确答案","hint":"提示文字（可选）"}
要求：
1. 题目应基于文档核心知识点
2. 空白处应填写关键词或核心概念
3. 答案应简洁明确
4. hint 字段可选，用于在用户答错时提供引导`,
    },
    {
      role: 'user',
      content: `文档标题：${title}\n内容摘要：${summary}`,
    },
  ];
}

/**
 * 选择题 prompt 模板
 *
 * 输入：标题、摘要、数量
 * 输出：ChatMessage 数组
 */
function buildChoicePrompt(title: string, summary: string, count: number): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一个知识测验生成器。根据用户提供的文档内容生成 ${count} 道选择题。
输出严格的 JSON 数组格式，不要包含任何其他文本或 markdown 代码块标记。
每道题格式：{"type":"choice","question":"题目文字","options":["选项A","选项B","选项C","选项D"],"answer":0,"explanation":"解析说明（可选）"}
要求：
1. 每题必须有 4 个选项
2. answer 为正确选项的索引（从 0 开始）
3. 干扰项应具有合理迷惑性，但不产生歧义
4. explanation 字段可选，用于解释为什么该选项正确`,
    },
    {
      role: 'user',
      content: `文档标题：${title}\n内容摘要：${summary}`,
    },
  ];
}

/**
 * 代码修复题 prompt 模板
 *
 * 输入：标题、摘要、数量
 * 输出：ChatMessage 数组
 */
function buildFixPrompt(title: string, summary: string, count: number): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一个知识测验生成器。根据用户提供的文档内容生成 ${count} 道代码修复题。
输出严格的 JSON 数组格式，不要包含任何其他文本或 markdown 代码块标记。
每道题格式：{"type":"fix","question":"题目描述，说明代码中存在什么问题","code":"有错误的代码片段","answer":"修复后的正确代码或修复说明","explanation":"解析说明（可选）"}
要求：
1. 代码片段应包含与文档知识点相关的常见错误
2. question 应清楚描述需要修复的问题
3. answer 应给出正确的修复方案
4. code 和 answer 中的代码应使用合理的语法`,
    },
    {
      role: 'user',
      content: `文档标题：${title}\n内容摘要：${summary}`,
    },
  ];
}

/* ========== 服务类 ========== */

/** Quiz 生成服务类 */
export class QuizService {
  private adapter = createAIAdapter();

  /**
   * 生成 Quiz 题目
   *
   * 输入：QuizRequest（模块 ID、slug、标题、摘要、数量、类型、降级数据）
   * 输出：Quiz 数组
   * 流程：检查 AI 可用性 -> 构建提示词 -> 调用 AI -> 解析 JSON -> 校验格式 -> 返回
   *       AI 不可用或生成失败时，返回 fallbackQuiz 降级数据
   */
  async generateQuiz(request: QuizRequest): Promise<Quiz[]> {
    /* AI 不可用时直接返回降级数据 */
    if (!isAIAvailable()) {
      return request.fallbackQuiz ?? [];
    }

    try {
      const count = request.count ?? 3;
      const quizType = request.quizType ?? 'choice';
      const messages = this.buildPrompt(request.title, request.summary, count, quizType);

      const response = await this.adapter.chatCompletion({ messages, temperature: 0.5 });
      const parsed = this.parseQuizResponse(response.content);

      /* 解析成功且非空则返回 AI 生成结果，否则降级 */
      if (parsed.length > 0) {
        return parsed;
      }
      return request.fallbackQuiz ?? [];
    } catch (error) {
      console.error('Quiz 生成失败:', error);
      return request.fallbackQuiz ?? [];
    }
  }

  /**
   * 构建提示词
   *
   * 输入：标题、摘要、数量、类型
   * 输出：ChatMessage 数组
   * 流程：根据题型选择对应 prompt 模板 -> 返回消息数组
   */
  private buildPrompt(
    title: string,
    summary: string,
    count: number,
    quizType: QuizType
  ): ChatMessage[] {
    switch (quizType) {
      case 'fill':
        return buildFillPrompt(title, summary, count);
      case 'fix':
        return buildFixPrompt(title, summary, count);
      case 'choice':
      default:
        return buildChoicePrompt(title, summary, count);
    }
  }

  /**
   * 解析 Quiz 响应
   *
   * 输入：AI 返回的文本
   * 输出：Quiz 数组
   * 流程：提取 JSON -> 解析 -> 按类型校验字段 -> 返回合法题目
   */
  private parseQuizResponse(content: string): Quiz[] {
    try {
      /* 提取 JSON 部分（AI 可能返回 markdown 代码块包裹的内容） */
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((item: Record<string, unknown>) => {
        if (!item.question || !item.type) return false;
        return this.validateQuizItem(item);
      }) as Quiz[];
    } catch {
      return [];
    }
  }

  /**
   * 校验单个 Quiz 条目的字段完整性
   *
   * 输入：待校验的对象
   * 输出：是否合法
   * 流程：根据 type 字段检查必要字段是否存在
   */
  private validateQuizItem(item: Record<string, unknown>): boolean {
    const type = item.type as string;
    switch (type) {
      case 'fill':
        return typeof item.answer === 'string' && item.answer.length > 0;
      case 'choice':
        return (
          Array.isArray(item.options) &&
          item.options.length >= 2 &&
          typeof item.answer === 'number' &&
          item.answer >= 0 &&
          item.answer < (item.options as string[]).length
        );
      case 'fix':
        return typeof item.answer === 'string' && item.answer.length > 0;
      default:
        return false;
    }
  }
}

/* ========== 单例管理 ========== */

/** Quiz 服务单例缓存 */
let quizServiceInstance: QuizService | null = null;

/**
 * 获取 Quiz 服务实例
 *
 * 输入：无
 * 输出：QuizService 实例（单例）
 */
export function getQuizService(): QuizService {
  if (!quizServiceInstance) {
    quizServiceInstance = new QuizService();
  }
  return quizServiceInstance;
}
