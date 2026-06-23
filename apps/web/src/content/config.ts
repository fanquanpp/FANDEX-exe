import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: '../../content',
    /**
     * 自定义 ID 生成函数
     *
     * 问题：部分文件名包含 '#' 字符（如 C#12与C#13新特性.md），
     * 在 Linux 上 '#' 会被 URL 解析器误认为片段标识符，
     * 导致 glob-loader 生成的 ID 在路由匹配时被截断。
     *
     * 解决：将文件路径中的 '#' 替换为 '-'，生成安全的 content collection ID。
     * 文件本身不重命名，仅影响内部 ID 和 URL slug。
     *
     * 参数类型由 Astro 的 GenerateIdOptions 自动推断（entry: string, base: URL, data: Record<string, unknown>）。
     */
    generateId: ({ entry }) => entry.replace(/#/g, '-'),
  }),
  schema: z.object({
    title: z.string(),
    module: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    order: z.number().default(0),
    created: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    author: z.string().default('fanquanpp'),
    description: z.string().optional(),
    readingTime: z.number().optional(),
    related: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
    summary: z.string().optional(),
    reviewPoints: z.array(z.string()).default([]),
    examPoints: z.array(z.string()).default([]),
    keyTerms: z.array(z.string()).default([]),
    quiz: z
      .array(
        z.union([
          z.object({
            type: z.literal('fill'),
            question: z.string(),
            answer: z.string(),
            hint: z.string().optional(),
          }),
          z.object({
            type: z.literal('choice'),
            question: z.string(),
            options: z.array(z.string()),
            answer: z.number(),
            explanation: z.string().optional(),
          }),
          z.object({
            type: z.literal('fix'),
            question: z.string(),
            code: z.string().optional(),
            answer: z.string(),
            explanation: z.string().optional(),
          }),
        ])
      )
      .default([]),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossary' }),
  schema: z.object({
    title: z.string(),
    module: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { docs, glossary };
