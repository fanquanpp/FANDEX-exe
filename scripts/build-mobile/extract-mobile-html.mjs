/**
 * FANDEX 移动端 HTML 预渲染提取脚本
 *
 * 功能概述：
 * 1. 从 Astro 构建产物 (apps/web/dist/) 中提取每篇文档的 HTML 内容
 * 2. 提取 <article class="prose"> 区域内的正文 HTML
 * 3. 提取文档标题
 * 4. 移除交互脚本（导航、侧边栏、搜索等），仅保留纯文档内容
 * 5. 保留代码高亮（Shiki 内联样式）、KaTeX 渲染结果、Mermaid SVG、术语标记
 * 6. 输出自包含 HTML 文件到 dist-mobile/modules/{moduleId}/{docSlug}.html
 * 7. 提取并合并关键 CSS 到 dist-mobile/css/article.css
 * 8. 生成亮色/暗色/护眼主题 CSS 文件
 *
 * 依赖：Astro 构建完成后执行（需要 dist/ 产物）
 * 实现：零外部依赖，使用正则提取 HTML 内容
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 项目根目录 */
const ROOT_DIR = join(__dirname, '..', '..');
/** Astro 构建产物目录 */
const DIST_DIR = join(ROOT_DIR, 'apps', 'web', 'dist');
/** 移动端产物输出目录 */
const OUTPUT_DIR = join(ROOT_DIR, 'dist-mobile');
/** CSS 产物输出目录 */
const CSS_OUTPUT_DIR = join(OUTPUT_DIR, 'css');

/**
 * 递归遍历目录，收集所有匹配扩展名的文件路径
 *
 * @param {string} dir - 要遍历的目录路径
 * @param {string[]} exts - 文件扩展名数组（如 ['.html']）
 * @returns {Promise<string[]>} 匹配文件的绝对路径数组
 */
async function collectFiles(dir, exts) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      const subResults = await collectFiles(fullPath, exts);
      results.push(...subResults);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 从 Astro 构建产物的 HTML 中提取文档正文
 * 使用正则匹配 <article class="prose"> 区域
 *
 * @param {string} html - 完整的 HTML 字符串
 * @returns {{ content: string, title: string } | null} 提取结果，失败返回 null
 */
function extractArticleContent(html) {
  // 提取 <article class="prose"> 区域内容
  // 匹配 class 属性中包含 prose 的 article 标签
  const articleRegex = /<article[^>]*class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/article>/;
  const articleMatch = html.match(articleRegex);
  if (!articleMatch) {
    return null;
  }

  let content = articleMatch[1];

  // 提取文档标题：从 <h1 class="doc-title"> 中获取
  const titleRegex = /<h1[^>]*class="[^"]*doc-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/;
  const titleMatch = content.match(titleRegex);
  let title = '';
  if (titleMatch) {
    // 移除标题中的 HTML 标签，保留纯文本
    title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // 移除 astro-island 组件（Vue 交互组件：进度追踪、主题切换等）
  content = content.replace(/<astro-island[\s\S]*?<\/astro-island>/g, '');

  // 移除阅读模式切换按钮
  content = content.replace(/<div[^>]*class="[^"]*reading-mode-btns[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');
  content = content.replace(/<button[^>]*class="[^"]*reading-mode-exit[^"]*"[^>]*>[\s\S]*?<\/button>/g, '');
  content = content.replace(/<div[^>]*class="[^"]*study-timer[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');

  // 移除进度追踪按钮区域（doc-title-actions）
  content = content.replace(/<div[^>]*class="[^"]*doc-title-actions[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');

  // 移除前置知识提示（prereq-notice）- 移动端不需要
  content = content.replace(/<div[^>]*class="[^"]*prereq-notice[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');

  // 移除文档元信息区域的交互部分，保留文本信息
  // 保留 doc-meta 中的阅读时间、难度、更新日期
  // 移除 doc-tags 中的链接（改为纯文本）
  content = content.replace(
    /<a[^>]*href="[^"]*tags\/[^"]*"[^>]*class="[^"]*doc-tag[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
    '<span class="doc-tag">$1</span>'
  );

  // 移除 data-astro-cid-* 属性（减少文件大小）
  content = content.replace(/\s+data-astro-cid-[a-z0-9]+/g, '');
  // 移除 data-v-* 属性
  content = content.replace(/\s+data-v-[a-z0-9]+/g, '');

  // 移除 data-pagefind-* 属性（搜索相关，移动端不需要）
  content = content.replace(/\s+data-pagefind-body/g, '');
  content = content.replace(/\s+data-pagefind-filter="[^"]*"/g, '');
  content = content.replace(/\s+data-progress-slug="[^"]*"/g, '');
  content = content.replace(/\s+data-outline-slug="[^"]*"/g, '');

  // 移除内部导航链接的 href（移动端离线不可用）
  // 将 /FANDEX/ 开头的链接改为 javascript:void(0)
  content = content.replace(/href="\/FANDEX\/[^"]*"/g, 'href="#"');

  // 清理多余空行
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  return { content, title };
}

/**
 * 从 HTML 文件路径中提取模块 ID 和文档 slug
 * 路径格式：dist/{moduleId}/{docSlug}/index.html
 *
 * @param {string} filePath - HTML 文件的绝对路径
 * @param {string} distDir - dist 目录的绝对路径
 * @returns {{ moduleId: string, docSlug: string } | null} 解析结果
 */
function parseHtmlPath(filePath, distDir) {
  const normalized = filePath.replace(/[/\\]/g, '/');
  const distIdx = normalized.indexOf('/dist/');
  if (distIdx === -1) return null;

  const relative = normalized.substring(distIdx + '/dist/'.length);
  const segments = relative.split('/');

  // 至少需要 moduleId/docSlug/index.html
  if (segments.length < 3) return null;

  // 排除非文档路径（如 map、glossary、assets 等）
  const moduleId = segments[0];
  const docSlug = segments[1];

  // 跳过特殊路径
  if (moduleId === '_astro' || moduleId === 'pagefind' || moduleId === 'fonts') return null;
  if (docSlug === 'map' || docSlug === 'glossary') return null;
  if (segments[segments.length - 1] !== 'index.html') return null;

  return { moduleId, docSlug };
}

/**
 * 生成自包含的移动端 HTML 文件
 *
 * @param {string} title - 文档标题
 * @param {string} content - 正文 HTML 内容
 * @returns {string} 完整的 HTML 文件字符串
 */
function generateMobileHtml(title, content) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../css/article.css">
  <link rel="stylesheet" href="../css/theme-light.css" data-theme-stylesheet>
</head>
<body>
  <article class="prose">
${content}
  </article>
</body>
</html>`;
}

/**
 * HTML 特殊字符转义
 *
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的字符串
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 从 CSS 文本中提取与文章内容相关的规则
 * 筛选条件：选择器包含文章内容相关的类名或标签
 *
 * @param {string} cssText - 原始 CSS 文本
 * @returns {string} 筛选后的 CSS 文本
 */
function extractArticleCss(cssText) {
  /** 需要保留的选择器关键词 */
  const keepPatterns = [
    ':root',
    '[data-theme=dark]',
    '[data-theme=sepia]',
    '.prose',
    '.katex',
    '.astro-code',
    '.admonition',
    '.term-tip',
    '.term-abbr',
    '.term-popup',
    '.mermaid-output',
    '.mermaid-svg',
    '.mermaid-error',
    '.doc-title',
    '.doc-meta',
    '.doc-meta-item',
    '.doc-tags',
    '.doc-tag',
    '.doc-description',
    '.doc-header',
    '.doc-difficulty',
    '.diff-beginner',
    '.diff-intermediate',
    '.diff-advanced',
    '.code-block',
    '.copy-btn',
    '.quiz-block',
    '.quiz-title',
    '.quiz-list',
    '.quiz-item',
    '.quiz-question',
    '.quiz-option',
    '.quiz-submit-btn',
    '.quiz-feedback',
    '.feedback-',
    '.quiz-number',
    '.quiz-type-badge',
    '.quiz-answer-area',
    '.quiz-input',
    '.quiz-textarea',
    '.quiz-code',
    '.option-letter',
    '.review-points',
    '.exam-points',
    '@font-face',
    'body',
    'html',
    'a ',
    'a{',
    'a:',
    'code',
    'pre',
    'table',
    'img',
    'hr',
    'strong',
    'mark',
    'details',
    'summary',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p{',
    '::selection',
  ];

  /** 需要排除的选择器关键词（布局、导航、侧边栏等） */
  const excludePatterns = [
    '.app-layout',
    '.app-nav',
    '.app-sidebar',
    '.app-main',
    '.sidebar-',
    '.nav-',
    '.mobile-nav',
    '.breadcrumb',
    '.module-grid',
    '.module-card',
    '.logo-',
    '.pagefind',
    '.roadmap',
    '.cheatsheet',
    '.reading-mode-',
    '.focus-mode-',
    '.mode-focus',
    '.mode-study',
    '.study-timer',
    '.progress-toggle',
    '.progress-btn',
    '.progress-dot',
    '.progress-export',
    '.progress-import',
    '.progress-default',
    '.progress-saved',
    '.progress-error',
    '.progress-spin',
    '.theme-toggle',
    '.nav-toggle',
    '.nav-back-to-top',
    '.sidebar-backdrop',
    '.prereq-notice',
    '.doc-nav',
    '.nav-btn',
    '.nav-label',
    '.nav-title',
    '.doc-title-row',
    '.doc-title-actions',
  ];

  /**
   * 判断一个 CSS 规则是否应该保留
   *
   * @param {string} selector - CSS 选择器文本
   * @returns {boolean} 是否保留
   */
  function shouldKeepRule(selector) {
    // 排除布局/导航/交互相关选择器
    for (const pattern of excludePatterns) {
      if (selector.includes(pattern)) return false;
    }

    // 保留文章内容相关选择器
    for (const pattern of keepPatterns) {
      if (selector.includes(pattern)) return true;
    }

    return false;
  }

  // 简单的 CSS 规则解析：按 } 分割
  const rules = [];
  let depth = 0;
  let currentRule = '';

  for (let i = 0; i < cssText.length; i++) {
    const char = cssText[i];
    currentRule += char;

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        rules.push(currentRule.trim());
        currentRule = '';
      }
    }
  }

  // 如果还有未闭合的规则
  if (currentRule.trim()) {
    rules.push(currentRule.trim());
  }

  // 筛选规则
  const keptRules = rules.filter((rule) => {
    // 提取选择器部分（第一个 { 之前的内容）
    const braceIdx = rule.indexOf('{');
    if (braceIdx === -1) return false;
    const selector = rule.substring(0, braceIdx);
    return shouldKeepRule(selector);
  });

  return keptRules.join('\n');
}

/**
 * 从 CSS 文本中提取 CSS 自定义属性（变量定义）
 * 用于生成主题 CSS 文件
 *
 * @param {string} cssText - 原始 CSS 文本
 * @returns {{ lightVars: string, darkVars: string }} 亮色和暗色变量定义
 */
function extractThemeVariables(cssText) {
  // 提取 :root 中的变量定义
  const rootMatch = cssText.match(/:root\s*\{([\s\S]*?)\}/);
  const lightVars = rootMatch ? rootMatch[1].trim() : '';

  // 提取 [data-theme=dark] 中的变量定义
  const darkMatch = cssText.match(/\[data-theme=dark\]\s*\{([\s\S]*?)\}/);
  const darkVars = darkMatch ? darkMatch[1].trim() : '';

  return { lightVars, darkVars };
}

/**
 * 生成亮色主题 CSS
 *
 * @param {string} lightVars - 亮色变量定义
 * @returns {string} 亮色主题 CSS 内容
 */
function generateLightThemeCss(lightVars) {
  return `/**
 * FANDEX 移动端亮色主题
 * 基于 Astro 构建产物的 :root 变量定义
 */
:root {
${lightVars}
}

/* 亮色模式下的代码高亮 */
html[data-theme="light"] .astro-code,
html[data-theme="light"] .astro-code span {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg) !important;
}
`;
}

/**
 * 生成暗色主题 CSS
 *
 * @param {string} darkVars - 暗色变量定义
 * @returns {string} 暗色主题 CSS 内容
 */
function generateDarkThemeCss(darkVars) {
  return `/**
 * FANDEX 移动端暗色主题
 * 基于 Astro 构建产物的 [data-theme=dark] 变量定义
 */
:root {
${darkVars}
}

/* 暗色模式下的代码高亮 */
html[data-theme="dark"] .astro-code,
html[data-theme="dark"] .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

/* 暗色模式下的 Mermaid 图表 */
[data-theme="dark"] .mermaid-svg[data-theme="dark"] {
  display: block;
}
[data-theme="dark"] .mermaid-svg[data-theme="light"] {
  display: none;
}

/* 暗色模式下的提示框 */
[data-theme="dark"] .admonition-note {
  --admonition-border: #6ea8fe;
  --admonition-bg: #1a2744;
  --admonition-title-text: #93b5ff;
}
[data-theme="dark"] .admonition-tip {
  --admonition-border: #55efc4;
  --admonition-bg: #122e20;
  --admonition-title-text: #6ee7b7;
}
[data-theme="dark"] .admonition-warning {
  --admonition-border: #ffb74d;
  --admonition-bg: #2e2214;
  --admonition-title-text: #ffcc80;
}
[data-theme="dark"] .admonition-danger {
  --admonition-border: #ef5350;
  --admonition-bg: #2e1416;
  --admonition-title-text: #ff8a80;
}
[data-theme="dark"] .admonition-info {
  --admonition-border: #64b5f6;
  --admonition-bg: #142438;
  --admonition-title-text: #90caf9;
}
[data-theme="dark"] .admonition-important {
  --admonition-border: #ce93d8;
  --admonition-bg: #261430;
  --admonition-title-text: #e1bee7;
}
`;
}

/**
 * 生成护眼主题 CSS
 * 基于暖色调的护眼配色方案
 *
 * @returns {string} 护眼主题 CSS 内容
 */
function generateSepiaThemeCss() {
  return `/**
 * FANDEX 移动端护眼主题
 * 暖色调护眼配色方案，降低蓝光刺激
 */
:root {
  --color-primary: #8b6914;
  --color-primary-hover: #6d5210;
  --color-secondary: #7a8450;
  --color-tertiary: #b87333;
  --color-bg: #f5ecd7;
  --color-bg-card: #ede2c8;
  --color-bg-code: #e8dcc0;
  --color-bg-hover: #ddd0b5;
  --color-bg-sidebar: #f0e6cf;
  --color-text: #3e2f1c;
  --color-text-secondary: #5c4a30;
  --color-text-tertiary: #8a7560;
  --color-text-inverse: #f5ecd7;
  --color-border: #8a7560;
  --color-border-light: #c4b598;
  --color-success: #7a8450;
  --color-nav-bg: rgba(245, 236, 215, 0.95);
  --content-width: 720px;
  --shadow-sm: 0 1px 2px rgba(62, 47, 28, 0.08);
  --shadow-md: 0 4px 6px rgba(62, 47, 28, 0.12);
  --shadow-lg: 0 10px 15px rgba(62, 47, 28, 0.15);
  --cheatsheet-bg: #f5ecd7;
  --cheatsheet-border: #c4b598;
  --cheatsheet-text: #3e2f1c;
  --cheatsheet-guide-bg: #ede2c8;
  --cheatsheet-guide-border: #8b6914;
  --cheatsheet-error-bg: rgba(180, 60, 30, 0.08);
  --cheatsheet-error-border: #b43c1e;
  --cheatsheet-copy-bg: var(--color-bg-card);
  --cheatsheet-copy-border: var(--color-border-light);
}

/* 护眼模式下的代码块 */
.astro-code {
  background-color: #e8dcc0 !important;
}

/* 护眼模式下的提示框 */
.admonition-note {
  --admonition-border: #8b6914;
  --admonition-bg: #f0e6cf;
  --admonition-title-text: #6d5210;
}
.admonition-tip {
  --admonition-border: #7a8450;
  --admonition-bg: #e8edda;
  --admonition-title-text: #5c6b3a;
}
.admonition-warning {
  --admonition-border: #b87333;
  --admonition-bg: #f5e6d0;
  --admonition-title-text: #8a5a28;
}
.admonition-danger {
  --admonition-border: #b43c1e;
  --admonition-bg: #f5ddd5;
  --admonition-title-text: #8a2e18;
}
`;
}

/**
 * 提取并合并 CSS 文件
 * 从 Astro 构建产物中提取与文章内容相关的 CSS 规则
 *
 * @returns {Promise<void>}
 */
async function extractAndMergeCss() {
  console.log('\n--- CSS 提取与合并 ---');

  const astroCssDir = join(DIST_DIR, '_astro');
  if (!existsSync(astroCssDir)) {
    console.error('  错误: _astro/ CSS 目录不存在，请先运行 Astro 构建');
    process.exit(1);
  }

  // 收集所有 CSS 文件
  const cssFiles = await collectFiles(astroCssDir, ['.css']);
  console.log(`  发现 ${cssFiles.length} 个 CSS 文件`);

  // 读取并合并所有 CSS 内容
  let allCss = '';
  for (const cssFile of cssFiles) {
    try {
      const content = await readFile(cssFile, 'utf-8');
      allCss += content + '\n';
    } catch {
      // 单个文件读取失败不影响整体流程
    }
  }

  // 提取主题变量
  const { lightVars, darkVars } = extractThemeVariables(allCss);

  // 生成主题 CSS 文件
  await mkdir(CSS_OUTPUT_DIR, { recursive: true });

  const lightThemeCss = generateLightThemeCss(lightVars);
  await writeFile(join(CSS_OUTPUT_DIR, 'theme-light.css'), lightThemeCss, 'utf-8');
  console.log('  已生成 theme-light.css');

  const darkThemeCss = generateDarkThemeCss(darkVars);
  await writeFile(join(CSS_OUTPUT_DIR, 'theme-dark.css'), darkThemeCss, 'utf-8');
  console.log('  已生成 theme-dark.css');

  const sepiaThemeCss = generateSepiaThemeCss();
  await writeFile(join(CSS_OUTPUT_DIR, 'theme-sepia.css'), sepiaThemeCss, 'utf-8');
  console.log('  已生成 theme-sepia.css');

  // 提取文章内容相关的 CSS 规则
  const articleCss = extractArticleCss(allCss);

  // 生成 article.css（包含排版、代码高亮、KaTeX、Mermaid 等样式）
  const articleCssContent = `/**
 * FANDEX 移动端文章样式
 * 包含：排版、代码高亮、KaTeX 公式、Mermaid 图表、提示框、术语标记等
 * 从 Astro 构建产物中自动提取生成
 */

/* 基础重置 */
*, *:before, *:after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.85;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-wrap: break-word;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  color: var(--color-primary-hover);
}

::selection {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

code, pre, input, textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  user-select: text;
}

/* 移动端文章容器 */
.prose {
  max-width: 100%;
  margin: 0 auto;
  padding: var(--spacing-md);
  line-height: 1.9;
}

${articleCss}
`;

  await writeFile(join(CSS_OUTPUT_DIR, 'article.css'), articleCssContent, 'utf-8');
  console.log('  已生成 article.css');
}

/**
 * 提取所有文档的 HTML 内容并输出到 dist-mobile/modules/
 *
 * @returns {Promise<{ totalFiles: number, successCount: number, failCount: number }>} 处理统计
 */
async function extractAllHtmlFiles() {
  console.log('\n--- HTML 文档提取 ---');

  // 收集所有 HTML 文件
  const htmlFiles = await collectFiles(DIST_DIR, ['.html']);
  console.log(`  发现 ${htmlFiles.length} 个 HTML 文件`);

  let successCount = 0;
  let failCount = 0;
  /** 按模块统计 */
  const moduleStats = new Map();

  for (const htmlFile of htmlFiles) {
    // 解析路径获取 moduleId 和 docSlug
    const parsed = parseHtmlPath(htmlFile, DIST_DIR);
    if (!parsed) continue;

    const { moduleId, docSlug } = parsed;

    try {
      // 读取 HTML 文件
      const html = await readFile(htmlFile, 'utf-8');

      // 提取文章内容
      const result = extractArticleContent(html);
      if (!result) {
        failCount++;
        continue;
      }

      const { content, title } = result;

      // 创建模块目录
      const moduleDir = join(OUTPUT_DIR, 'modules', moduleId);
      await mkdir(moduleDir, { recursive: true });

      // 生成并写入移动端 HTML 文件
      const mobileHtml = generateMobileHtml(title, content);
      const outputPath = join(moduleDir, `${docSlug}.html`);
      await writeFile(outputPath, mobileHtml, 'utf-8');

      // 统计
      successCount++;
      if (!moduleStats.has(moduleId)) {
        moduleStats.set(moduleId, 0);
      }
      moduleStats.set(moduleId, moduleStats.get(moduleId) + 1);
    } catch {
      failCount++;
    }
  }

  // 输出统计信息
  console.log(`  成功提取: ${successCount} 篇文档`);
  if (failCount > 0) {
    console.log(`  提取失败: ${failCount} 篇文档`);
  }
  console.log(`  覆盖模块: ${moduleStats.size} 个`);

  return { totalFiles: htmlFiles.length, successCount, failCount };
}

/**
 * 主函数：执行移动端 HTML 预渲染提取
 *
 * 流程：
 * 1. 检查 Astro 构建产物是否存在
 * 2. 提取并合并 CSS 文件
 * 3. 提取所有文档的 HTML 内容
 * 4. 输出统计信息
 */
async function main() {
  console.log('=== FANDEX 移动端 HTML 预渲染提取 ===');
  console.log(`项目根目录: ${ROOT_DIR}`);
  console.log(`构建产物: ${DIST_DIR}`);
  console.log(`输出目录: ${OUTPUT_DIR}`);

  // 步骤 1：检查构建产物
  if (!existsSync(DIST_DIR)) {
    console.error('错误: Astro 构建产物不存在，请先运行 npm run build');
    process.exit(1);
  }

  // 检查 dist 目录下是否有 HTML 文件
  const htmlCheck = await collectFiles(DIST_DIR, ['.html']);
  if (htmlCheck.length === 0) {
    console.error('错误: dist/ 目录下未发现 HTML 文件，请先运行 npm run build');
    process.exit(1);
  }
  console.log(`构建产物检查通过: 发现 ${htmlCheck.length} 个 HTML 文件`);

  // 步骤 2：创建输出目录
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'modules'), { recursive: true });
  await mkdir(CSS_OUTPUT_DIR, { recursive: true });

  // 步骤 3：提取并合并 CSS
  await extractAndMergeCss();

  // 步骤 4：提取 HTML 文档
  const stats = await extractAllHtmlFiles();

  // 步骤 5：输出总结
  console.log('\n=== 提取完成 ===');
  console.log(`HTML 文件: ${stats.successCount} 篇成功, ${stats.failCount} 篇失败`);
  console.log(`CSS 文件: article.css, theme-light.css, theme-dark.css, theme-sepia.css`);
  console.log(`产物目录: ${OUTPUT_DIR}`);
}

main().catch(console.error);
