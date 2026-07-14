/**
 * Quiz 服务单元测试
 *
 * 覆盖范围：
 * - isAIAvailable 检查：AI 不可用时直接返回降级数据
 * - generateQuiz 降级链：AI 可用 / 不可用 / 生成空结果 / 抛异常时的不同分支
 * - parseQuizResponse 异常处理：JSON 解析失败、无 JSON 数组、字段缺失时返回空数组
 * - validateQuizItem 字段校验：fill / choice / fix 三种题型的合法与非法判定
 *
 * 测试策略：
 * - 通过 vi.mock 模拟 AI 适配器，控制 chatCompletion 返回内容
 * - 通过 vi.mock 模拟 isAIAvailable，控制 AI 可用性分支
 * - 通过传入不同 AI 响应内容，覆盖 parseQuizResponse 与 validateQuizItem 的所有分支
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatCompletionResponse } from '../ai/types';

/**
 * vi.hoisted 用于声明在 vi.mock 工厂内部可访问的变量。
 * vitest 会将 vi.mock 调用提升至 import 之前执行，
 * 因此工厂函数内不能引用外部作用域的普通变量，必须通过 vi.hoisted 声明。
 */
const { fakeChatCompletion, isAIAvailableMock } = vi.hoisted(() => {
  return {
    fakeChatCompletion: vi.fn(),
    isAIAvailableMock: vi.fn().mockReturnValue(true),
  };
});

/* Mock AI 适配器：chatCompletion 行为可按用例改写 */
vi.mock('../ai/adapter', () => ({
  createAIAdapter: () => ({
    chatCompletion: fakeChatCompletion,
    embedding: vi.fn(),
  }),
}));

/* Mock isAIAvailable：默认返回 true，单测中可按用例改写返回值 */
vi.mock('../ai/config', () => ({
  isAIAvailable: () => isAIAvailableMock(),
}));

import { QuizService } from './quiz-service';
import type { QuizRequest } from './quiz-service';

/* 构造合法的 QuizRequest 基础数据 */
function buildRequest(overrides: Partial<QuizRequest> = {}): QuizRequest {
  return {
    moduleId: 'ai-engineering',
    slug: 'doc-a',
    title: 'Transformer 架构详解',
    summary: '自注意力机制是 Transformer 的核心',
    count: 2,
    quizType: 'choice',
    fallbackQuiz: [
      {
        type: 'choice',
        question: '降级选择题',
        options: ['A', 'B', 'C', 'D'],
        answer: 0,
        explanation: '降级解析',
      },
    ],
    ...overrides,
  };
}

/* 构造一个合法的 AI 响应（含 JSON 数组） */
function buildAIResponse(content: string): ChatCompletionResponse {
  return { content };
}

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(() => {
    /* 每个用例使用全新的 service 实例，避免内部状态污染 */
    service = new QuizService();
    fakeChatCompletion.mockReset();
    isAIAvailableMock.mockReturnValue(true);
  });

  describe('isAIAvailable 检查与降级数据', () => {
    it('AI 不可用时直接返回 fallbackQuiz 降级数据，不调用 AI', async () => {
      isAIAvailableMock.mockReturnValue(false);
      const fallback = [
        {
          type: 'choice' as const,
          question: '降级题',
          options: ['A', 'B', 'C', 'D'],
          answer: 1,
        },
      ];
      const result = await service.generateQuiz(buildRequest({ fallbackQuiz: fallback }));
      expect(result).toEqual(fallback);
      expect(fakeChatCompletion).not.toHaveBeenCalled();
    });

    it('AI 不可用且未提供 fallbackQuiz 时返回空数组', async () => {
      isAIAvailableMock.mockReturnValue(false);
      const result = await service.generateQuiz(buildRequest({ fallbackQuiz: undefined }));
      expect(result).toEqual([]);
    });
  });

  describe('generateQuiz 降级链', () => {
    it('AI 可用且返回合法 JSON 数组时返回 AI 生成结果', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: 'AI 生成选择题',
          options: ['A', 'B', 'C', 'D'],
          answer: 2,
          explanation: 'AI 解析',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));

      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('AI 生成选择题');
    });

    it('AI 返回空 JSON 数组时降级到 fallbackQuiz', async () => {
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse('[]'));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('AI 适配器抛异常时降级到 fallbackQuiz', async () => {
      fakeChatCompletion.mockRejectedValueOnce(new Error('ai error'));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('AI 异常且无 fallbackQuiz 时返回空数组', async () => {
      fakeChatCompletion.mockRejectedValueOnce(new Error('ai error'));
      const result = await service.generateQuiz(buildRequest({ fallbackQuiz: undefined }));
      expect(result).toEqual([]);
    });

    it('AI 返回非数组 JSON 时降级到 fallbackQuiz', async () => {
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse('{"key": "value"}'));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('未指定 count 与 quizType 时使用默认值 3 与 choice', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: '默认参数题',
          options: ['A', 'B', 'C', 'D'],
          answer: 0,
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));

      const request = buildRequest();
      delete request.count;
      delete request.quizType;

      const result = await service.generateQuiz(request);
      expect(result).toHaveLength(1);
      /* 验证 AI 适配器被调用且参数包含 messages */
      expect(fakeChatCompletion).toHaveBeenCalledTimes(1);
      const callArgs = fakeChatCompletion.mock.calls[0][0];
      expect(callArgs.messages).toBeInstanceOf(Array);
      expect(callArgs.messages.length).toBeGreaterThan(0);
      /* 默认 temperature 为 0.5 */
      expect(callArgs.temperature).toBe(0.5);
    });
  });

  describe('parseQuizResponse 异常处理', () => {
    it('AI 返回内容中无 JSON 数组时返回降级数据', async () => {
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse('纯文本无 JSON'));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('AI 返回内容包含 markdown 代码块包裹的 JSON 时能正确解析', async () => {
      const aiContent = `\`\`\`json
[
  {
    "type": "choice",
    "question": "Markdown 包裹题",
    "options": ["A", "B", "C", "D"],
    "answer": 1
  }
]
\`\`\``;
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('Markdown 包裹题');
    });

    it('AI 返回 JSON 解析失败时返回降级数据', async () => {
      /* JSON 格式错误：缺少结束括号 */
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse('[{"type":"choice"'));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('AI 返回合法 JSON 但全部条目字段非法时降级', async () => {
      const aiContent = JSON.stringify([
        { type: 'unknown', question: '未知题型' },
        { type: 'choice', question: '缺少 options' },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });
  });

  describe('validateQuizItem 字段校验', () => {
    it('fill 题型：合法条目通过校验', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'fill',
          question: '填空题：___ 是 Transformer 的核心',
          answer: '自注意力',
          hint: '提示',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'fill' }));
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('fill');
    });

    it('fill 题型：answer 为空字符串时被过滤', async () => {
      const aiContent = JSON.stringify([
        { type: 'fill', question: '填空题', answer: '' },
        { type: 'fill', question: '合法填空题', answer: '答案' },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'fill' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('合法填空题');
    });

    it('fill 题型：answer 非 string 时被过滤', async () => {
      const aiContent = JSON.stringify([{ type: 'fill', question: '填空题', answer: 123 }]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'fill' }));
      /* 全部被过滤，降级到 fallbackQuiz */
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('choice 题型：合法条目通过校验', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: '选择题',
          options: ['A', 'B', 'C', 'D'],
          answer: 2,
          explanation: '解析',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('choice');
    });

    it('choice 题型：options 不是数组时被过滤', async () => {
      const aiContent = JSON.stringify([
        { type: 'choice', question: '选择题', options: 'not array', answer: 0 },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('choice 题型：options 少于 2 项时被过滤', async () => {
      const aiContent = JSON.stringify([
        { type: 'choice', question: '选择题', options: ['仅一项'], answer: 0 },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('choice 题型：answer 越界时被过滤', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: '选择题',
          options: ['A', 'B', 'C', 'D'],
          answer: 5,
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('choice 题型：answer 为负数时被过滤', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: '选择题',
          options: ['A', 'B', 'C', 'D'],
          answer: -1,
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('choice 题型：answer 非 number 时被过滤', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'choice',
          question: '选择题',
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'choice' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('fix 题型：合法条目通过校验', async () => {
      const aiContent = JSON.stringify([
        {
          type: 'fix',
          question: '修复以下代码',
          code: 'const a = ;',
          answer: 'const a = 1;',
          explanation: '语法错误',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'fix' }));
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('fix');
    });

    it('fix 题型：answer 为空字符串时被过滤', async () => {
      const aiContent = JSON.stringify([{ type: 'fix', question: '修复代码', answer: '' }]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest({ quizType: 'fix' }));
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('缺失 question 字段时条目被过滤', async () => {
      const aiContent = JSON.stringify([{ type: 'choice', options: ['A', 'B'], answer: 0 }]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('缺失 type 字段时条目被过滤', async () => {
      const aiContent = JSON.stringify([{ question: '无类型题', options: ['A', 'B'], answer: 0 }]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('降级选择题');
    });

    it('AI 返回多条混合合法与非法条目时仅保留合法条目', async () => {
      const aiContent = JSON.stringify([
        { type: 'unknown', question: '未知题型' },
        {
          type: 'choice',
          question: '合法选择题 1',
          options: ['A', 'B', 'C', 'D'],
          answer: 0,
        },
        { type: 'choice', question: '非法选择题', options: ['A'], answer: 0 },
        {
          type: 'fill',
          question: '合法填空题',
          answer: '答案',
        },
      ]);
      fakeChatCompletion.mockResolvedValueOnce(buildAIResponse(aiContent));
      const result = await service.generateQuiz(buildRequest());
      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('合法选择题 1');
      expect(result[1].question).toBe('合法填空题');
    });
  });
});
