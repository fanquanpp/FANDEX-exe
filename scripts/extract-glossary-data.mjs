/**
 * FANDEX 术语数据抽取脚本
 *
 * 功能概述：
 * 扫描 src/content/glossary 下各模块目录中的 .md 文件，
 * 解析两种格式的术语定义（表格格式和标题格式），
 * 为每个模块生成一个 JSON 文件到 metadata/glossary/{moduleId}.json。
 *
 * 支持的 Markdown 格式：
 * 1. 表格格式：| 术语 | 英文 | 释义 | （大多数模块使用）
 * 2. 标题格式：### 序号.术语名 + **定义**： （git、markdown 模块使用）
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 术语表源文件目录 */
const GLOSSARY_DIR = join(__dirname, '..', 'apps', 'web', 'src', 'content', 'glossary');
/** JSON 输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'metadata', 'glossary');

/**
 * 递归遍历目录，对匹配扩展名的文件执行回调
 * @param {string} dir - 要遍历的目录路径
 * @param {string} ext - 文件扩展名（如 '.md'）
 * @param {Function} fn - 对每个匹配文件执行的异步回调
 */
async function walkDir(dir, ext, fn) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(full, ext, fn);
    } else if (entry.name.endsWith(ext)) {
      await fn(full);
    }
  }
}

/**
 * 从表格格式的 Markdown 内容中提取术语定义
 * 解析 | 术语 | 英文 | 释义 | 格式的表格行
 *
 * @param {string} content - Markdown 文件完整内容
 * @param {string} moduleId - 所属模块标识
 * @returns {Array<{name: string, definition: string, slug: string}>} 术语数组
 */
function extractFromTable(content, moduleId) {
  const terms = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // 跳过非表格行和表头分隔行
    if (!trimmed.startsWith('|')) continue;
    if (/^\|\s*[-:]+/.test(trimmed)) continue;

    // 解析表格列：| 术语 | 英文 | 释义 |
    const cells = trimmed.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length < 3) continue;

    // 第一列为术语名，第三列为释义
    const name = cells[0].trim();
    const definition = cells[2].trim();

    // 过滤表头行（包含"术语"、"英文"、"释义"等列标题）
    if (name === '术语' || name === '英文' || name === '释义') continue;
    // 过滤空值
    if (!name || !definition) continue;
    // 过滤过长的定义（可能解析异常）
    if (definition.length > 500) continue;

    terms.push({
      name,
      definition,
      slug: `${moduleId}/glossary`,
    });
  }

  return terms;
}

/**
 * 从标题格式的 Markdown 内容中提取术语定义
 * 解析三级标题（### 序号.术语名）和 **定义**： 标记后的定义段落
 *
 * @param {string} content - Markdown 文件完整内容
 * @param {string} moduleId - 所属模块标识
 * @returns {Array<{name: string, definition: string, slug: string}>} 术语数组
 */
function extractFromHeading(content, moduleId) {
  const terms = [];
  const lines = content.split('\n');
  let currentTerm = null; // 当前正在处理的术语名
  let state = 'seek_heading'; // 状态机当前状态
  let defLines = []; // 定义文本行收集器

  /**
   * 保存当前术语的定义到结果数组
   */
  function saveCurrentTerm() {
    if (currentTerm && defLines.length > 0) {
      const def = defLines.join(' ').trim();
      // 仅保留长度合理的定义（过长可能解析错误）
      if (def.length > 0 && def.length < 500) {
        terms.push({
          name: currentTerm,
          definition: def,
          slug: `${moduleId}/glossary`,
        });
      }
    }
    currentTerm = null;
    defLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 匹配三级标题格式：### 序号.术语名
    const headingMatch = trimmed.match(/^###\s+\d+\.\d+\s+(.+)$/);
    if (headingMatch) {
      // 遇到新标题时，先保存上一个术语的定义
      saveCurrentTerm();

      // 提取术语名，去除括号内的英文/别名
      let termName = headingMatch[1].trim();
      const parenMatch = termName.match(/^(.+?)\s*[（(]/);
      if (parenMatch) termName = parenMatch[1].trim();
      currentTerm = termName;
      state = 'seek_def'; // 切换到寻找定义状态
      defLines = [];
      continue;
    }

    // 寻找定义标记（**定义**： 或 定义：）
    if (state === 'seek_def' && /(\*\*定义\*\*[：:]|定义[：:])\s*/.test(trimmed)) {
      state = 'capture_def'; // 切换到捕获定义状态
      // 提取定义标记之后的文本
      const afterDef = trimmed.replace(/.*?(?:\*\*定义\*\*[：:]|定义[：:])\s*/, '').trim();
      if (afterDef) defLines.push(afterDef);
      continue;
    }

    // 捕获定义文本，遇到特定标记时停止
    if (state === 'capture_def') {
      if (
        trimmed.startsWith('**详解') ||
        trimmed.startsWith('**名称') ||
        trimmed.startsWith('**首次') ||
        trimmed === '---' ||
        trimmed.startsWith('###')
      ) {
        // 定义结束，保存当前术语
        saveCurrentTerm();
        state = 'seek_heading'; // 回到寻找标题状态
        if (trimmed.startsWith('###')) {
          i--; // 回退一行，让外层循环重新处理这个标题
        }
        continue;
      }
      // 收集定义文本行
      if (trimmed && !trimmed.startsWith('**首次') && !trimmed.startsWith('**名称')) {
        defLines.push(trimmed);
      }
    }
  }

  // 处理文件末尾最后一个术语的定义
  saveCurrentTerm();

  return terms;
}

/**
 * 检测 Markdown 文件使用的术语格式
 * 通过检查是否包含 ### 序号.术语名 格式的标题来判断
 *
 * @param {string} content - Markdown 文件完整内容
 * @returns {'table' | 'heading'} 检测到的格式类型
 */
function detectFormat(content) {
  // 检查是否存在 ### 序号.术语名 格式的标题
  if (/^###\s+\d+\.\d+\s+/m.test(content)) {
    return 'heading';
  }
  return 'table';
}

/**
 * 从单个 Markdown 文件中提取术语数据
 * 自动检测格式并调用对应的解析函数
 *
 * @param {string} filePath - Markdown 文件路径
 * @param {string} moduleId - 所属模块标识
 * @returns {Promise<Array<{name: string, definition: string, slug: string}>>} 术语数组
 */
async function extractFromFile(filePath, moduleId) {
  const content = await readFile(filePath, 'utf-8');
  const format = detectFormat(content);

  if (format === 'heading') {
    return extractFromHeading(content, moduleId);
  }
  return extractFromTable(content, moduleId);
}

/**
 * 主函数：扫描所有模块目录，提取术语数据并生成 JSON 文件
 */
async function main() {
  // 确保输出目录存在
  await mkdir(OUTPUT_DIR, { recursive: true });

  let totalTerms = 0;
  let moduleCount = 0;

  // 遍历术语表目录下的各模块子目录
  const dirs = await readdir(GLOSSARY_DIR, { withFileTypes: true });

  for (const entry of dirs) {
    if (!entry.isDirectory()) continue;
    const moduleId = entry.name; // 目录名即为模块标识
    const moduleDir = join(GLOSSARY_DIR, moduleId);
    const allTerms = [];

    // 遍历模块目录下的所有 .md 文件
    await walkDir(moduleDir, '.md', async (filePath) => {
      const terms = await extractFromFile(filePath, moduleId);
      allTerms.push(...terms);
    });

    // 去重：同一模块内可能存在重复术语名（如 CSS 多个子文件）
    const seen = new Set();
    const uniqueTerms = allTerms.filter((term) => {
      if (seen.has(term.name)) return false;
      seen.add(term.name);
      return true;
    });

    // 生成模块 JSON 数据
    const moduleData = {
      moduleId,
      terms: uniqueTerms,
    };

    // 写入 JSON 文件
    const outputPath = join(OUTPUT_DIR, `${moduleId}.json`);
    const json = JSON.stringify(moduleData, null, 2);
    await writeFile(outputPath, json, 'utf-8');

    totalTerms += uniqueTerms.length;
    moduleCount++;
    console.log(`[${moduleId}] ${uniqueTerms.length} terms -> ${outputPath}`);
  }

  console.log(`\nTotal: ${moduleCount} modules, ${totalTerms} terms written to ${OUTPUT_DIR}`);
}

main().catch(console.error);
