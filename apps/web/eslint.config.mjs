/**
 * ESLint 扁平配置文件
 *
 * 功能概述：
 * 定义 FANDEX 项目的代码静态分析规则，覆盖 JavaScript、TypeScript、
 * Astro 组件和 Vue SFC 四种文件类型。使用 ESLint 扁平配置格式（v9+）。
 *
 * 配置层级：
 * 1. 全局基础规则（JS 推荐规则）
 * 2. TypeScript 文件规则（类型感知 lint）
 * 3. Astro 组件规则
 * 4. Vue SFC 规则
 * 5. Prettier 兼容规则（关闭与 Prettier 冲突的格式化规则）
 *
 * 忽略目录：
 * - dist/ — 构建产物
 * - .astro/ — Astro 缓存
 * - node_modules/ — 依赖
 * - public/pagefind/ — 搜索引擎生成文件
 * - content/ — 内容文档（由 remark-lint 单独检查）
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  /* 全局忽略目录 */
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'public/pagefind/**',
      'public/data/**',
      '../../content/**',
    ],
  },

  /* 基础 JavaScript 推荐规则 */
  js.configs.recommended,

  /* TypeScript 配置：类型感知 lint */
  ...tseslint.configs.recommended,

  /* Astro 组件规则（扁平配置格式） */
  astroPlugin.configs['flat/recommended'],

  /* Vue SFC 规则（扁平配置格式，仅应用于 .vue 文件） */
  ...vuePlugin.configs['flat/recommended'],

  /* 全局自定义规则 */
  {
    rules: {
      /* 禁止 console 调用（生产代码中应使用统一日志工具） */
      'no-console': 'warn',
      /* 禁止 debugger 语句 */
      'no-debugger': 'error',
      /* 关闭 no-undef（TypeScript 编译器已覆盖此检查，避免误报 Astro/Vue 全局变量） */
      'no-undef': 'off',
      /* 关闭 no-unused-expressions（Astro/Vue 模板中大量使用 JSX 表达式） */
      'no-unused-expressions': 'off',
      /* 禁止 var 声明（渐进式收紧，先设为 warn） */
      'no-var': 'warn',
      /* 无用赋值检查（渐进式收紧，先设为 warn） */
      'no-useless-assignment': 'warn',
      /* switch 穿透检查（渐进式收紧，先设为 warn） */
      'no-fallthrough': 'warn',
      /* 空块检查（渐进式收紧，先设为 warn） */
      'no-empty': 'warn',
      /* 条件赋值检查（渐进式收紧，先设为 warn） */
      'no-cond-assign': 'warn',
      /* 无用转义检查（渐进式收紧，先设为 warn） */
      'no-useless-escape': 'warn',
      /* getter 必须有 return（渐进式收紧，先设为 warn） */
      'getter-return': 'warn',
      /* 原型链内置方法检查（渐进式收紧，先设为 warn） */
      'no-prototype-builtins': 'warn',
      /* TypeScript：禁止 any 类型（渐进式收紧，先设为 warn） */
      '@typescript-eslint/no-explicit-any': 'warn',
      /* TypeScript：禁止未使用的变量（允许 _ 前缀占位符，渐进式收紧先设为 warn） */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      /* TypeScript：关闭未使用表达式检查（Astro/Vue 模板需要） */
      '@typescript-eslint/no-unused-expressions': 'off',
      /* TypeScript：允许 require 导入（构建脚本中使用） */
      '@typescript-eslint/no-require-imports': 'off',
      /* TypeScript：允许 this 别名 */
      '@typescript-eslint/no-this-alias': 'off',
      /* Astro：允许 Astro 组件中使用 set:html */
      'astro/no-set-html-directive': 'off',
    },
  },

  /* Vue 文件专用覆盖规则（启用 TypeScript 解析器以支持 lang="ts"） */
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      /* Vue：不要求组件名称为多词 */
      'vue/multi-word-component-names': 'off',
      /* Vue：不要求 defineProps 默认值 */
      'vue/require-default-prop': 'off',
    },
  },

  /* 构建脚本覆盖规则（允许 var、宽松检查） */
  {
    files: ['**/scripts/**/*.{js,mjs,ts}'],
    rules: {
      'no-var': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  /* Prettier 兼容：关闭与 Prettier 冲突的格式化规则（必须放在最后） */
  prettierConfig
);
