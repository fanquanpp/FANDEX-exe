/**
 * Astro 7 Content Layer API 内容集合定义（FANDEX Phase 5）
 *
 * 功能概述：
 * - 使用 Astro 7 最新 Content Layer API 与 `glob` loader 定义内容集合
 * - docs 集合：加载项目根 `content/` 目录下的所有 .md/.mdx 文档（约 1996 篇）
 * - glossary 集合：加载 `apps/web/src/content/glossary/` 下的术语表（27 个模块）
 * - Schema 使用 Zod v4 latest 语法，quiz 字段采用 discriminatedUnion 实现类型安全
 * - 新增 readingTime（阅读时长，分钟）与 difficulty（难度等级）字段
 * - 保留所有原字段（title、description、module、tags、date、author、order、quiz 等）
 *
 * 设计要点：
 * - Astro 7 要求内容配置文件位于 `src/content.config.ts`（非旧版 `src/content/config.ts`）
 * - glob loader 的 `base` 选项相对于 Astro 项目根目录解析（即 `apps/web/`）
 * - docs 集合 base 路径 `../../content` 从 `apps/web/` 解析为项目根的 `content/` 目录
 * - glossary 集合 base 路径 `./src/content/` 从 `apps/web/` 解析为 `apps/web/src/content/`
 * - generateId 自定义函数将文件名中的 `#` 替换为 `-`，避免 URL 片段标识符冲突
 * - discriminatedUnion 相比 union 的优势：TypeScript 可基于 `type` 字段进行类型收窄
 *
 * 使用示例：
 *   import { getCollection, getEntry } from 'astro:content';
 *   const allDocs = await getCollection('docs');
 *   const doc = await getEntry('docs', 'frontend/javascript/概述');
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * docs 内容集合定义
 *
 * 数据源：项目根 `content/` 目录下的所有 .md / .mdx 文档
 * 路径解析：本文件位于 `apps/web/src/content.config.ts`，
 *           `base` 相对于 Astro 项目根 `apps/web/` 解析，
 *           `../../content` 解析为项目根的 `content/` 目录
 */
const docs = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: '../../content',
    /**
     * 自定义 ID 生成函数
     *
     * 问题：部分文件名包含 `#` 字符（如 `C#12与C#13新特性.md`），
     * 在 Linux 上 `#` 会被 URL 解析器误认为片段标识符，
     * 导致 glob-loader 生成的 ID 在路由匹配时被截断。
     *
     * 解决：将文件路径中的 `#` 替换为 `-`，生成安全的 content collection ID。
     * 文件本身不重命名，仅影响内部 ID 和 URL slug。
     *
     * @param entry - 文件相对路径（相对于 base）
     * @returns 安全的集合 ID（不含 `#`）
     */
    generateId: ({ entry }) => entry.replace(/#/g, '-'),
  }),
  schema: z.object({
    /** 文档标题（必填） */
    title: z.string(),
    /** 所属模块 ID（如 `frontend/javascript`） */
    module: z.string(),
    /** 所属分类（可选，用于二次分组） */
    category: z.string().optional(),
    /** 标签列表（默认空数组） */
    tags: z.array(z.string()).default([]),
    /** 难度等级：beginner（入门）/ intermediate（进阶）/ advanced（高级） */
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    /** 同模块内的排序权重（默认 0，升序排列） */
    order: z.number().default(0),
    /** 创建日期（可选，frontmatter 中通常为 YYYY-MM-DD 字符串） */
    created: z.coerce.date().optional(),
    /** 最近更新日期（可选） */
    updated: z.coerce.date().optional(),
    /** 作者（默认 fanquanpp） */
    author: z.string().default('fanquanpp'),
    /** 文档描述（用于 SEO 与列表预览） */
    description: z.string().optional(),
    /** 阅读时长（单位：分钟，可选，由构建脚本或作者手动填写） */
    readingTime: z.number().optional(),
    /** 相关文档 ID 列表（默认空数组） */
    related: z.array(z.string()).default([]),
    /** 前置知识文档 ID 列表（默认空数组） */
    prerequisites: z.array(z.string()).default([]),
    /** 文档摘要（可选，用于学习卡片展示） */
    summary: z.string().optional(),
    /** 复习要点列表（默认空数组） */
    reviewPoints: z.array(z.string()).default([]),
    /** 考点列表（默认空数组） */
    examPoints: z.array(z.string()).default([]),
    /** 关键术语列表（默认空数组，用于术语提示高亮） */
    keyTerms: z.array(z.string()).default([]),
    /**
     * 测验题列表
     *
     * 使用 discriminatedUnion 基于 `type` 字段进行类型收窄：
     * - `fill`：填空题，包含 question、answer、hint
     * - `choice`：选择题，包含 question、options、answer（索引）、explanation
     * - `correct`：纠错题，包含 question、code、answer、explanation
     */
    quiz: z
      .array(
        z.discriminatedUnion('type', [
          /** 填空题 */
          z.object({
            type: z.literal('fill'),
            question: z.string(),
            answer: z.string(),
            hint: z.string().optional(),
          }),
          /** 选择题（answer 为正确选项的索引，从 0 开始） */
          z.object({
            type: z.literal('choice'),
            question: z.string(),
            options: z.array(z.string()),
            answer: z.number(),
            explanation: z.string().optional(),
          }),
          /** 纠错题（提供错误代码，给出正确答案与解释） */
          z.object({
            type: z.literal('correct'),
            question: z.string(),
            code: z.string().optional(),
            answer: z.string(),
            explanation: z.string().optional(),
          }),
        ]),
      )
      .default([]),
  }),
});

/**
 * glossary 术语表集合定义
 *
 * 数据源：`apps/web/src/content/glossary/<module>/glossary.md`
 * 路径解析：本文件位于 `apps/web/src/content.config.ts`，
 *           `base` 相对于 Astro 项目根 `apps/web/` 解析，
 *           `./src/content/` 解析为 `apps/web/src/content/`
 *           配合 pattern `./glossary/<module>/glossary.md` 解析为对应术语表文件
 */
const glossary = defineCollection({
  loader: glob({ pattern: './glossary/*/glossary.md', base: './src/content/' }),
  schema: z.object({
    /** 术语表标题（如 "JavaScript 术语表"） */
    title: z.string(),
    /** 所属模块 ID */
    module: z.string(),
    /** 最近更新日期（可选） */
    updated: z.coerce.date().optional(),
  }),
});

/** 导出所有集合（Astro Content Layer API 入口） */
export const collections = { docs, glossary };
