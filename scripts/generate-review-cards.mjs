/**
 * FANDEX 复习卡片生成脚本
 *
 * 功能概述：
 * 扫描 content/ 下所有 .md/.mdx 文件，解析 frontmatter 中的
 * reviewPoints、examPoints、keyTerms 字段，按模块生成间隔重复
 * 复习卡片 JSON，输出到 generated/cards/{moduleId}.json。
 *
 * 卡片生成规则：
 * - reviewPoints 中的每个要点 -> type: "review" 复习卡片
 * - examPoints 中的每个要点 -> type: "exam" 考点卡片
 * - keyTerms 中的每个术语 -> type: "term" 术语卡片
 * - 卡片 ID 格式：{moduleId}-{sanitizedTerm}
 * - difficulty 从文档 frontmatter 的 difficulty 字段继承
 *
 * 数据来源：
 * content/ 目录下的 Markdown 文件，frontmatter 中包含
 * reviewPoints、examPoints、keyTerms 字段（均为字符串数组）
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 文档源文件目录 */
const DOCS_DIR = join(__dirname, '..', 'content');
/** 复习卡片 YAML 元数据目录 */
const REVIEW_DIR = join(__dirname, '..', 'metadata', 'review');
/** 卡片 JSON 输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'generated', 'cards');

/**
 * 递归遍历目录，对匹配扩展名的文件执行回调
 *
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
 * 解析 Markdown 文件的 frontmatter
 * 简易 YAML 解析器，支持键值对和数组格式
 *
 * @param {string} content - Markdown 文件完整内容
 * @returns {Object} 解析后的 frontmatter 键值对对象
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const raw = match[1];
  const data = {};
  let key = null;
  let inArray = false;
  let arrayVals = [];

  for (const line of raw.split('\n')) {
    if (inArray) {
      // 尝试匹配数组项 "  - value"
      const itemMatch = line.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/);
      if (itemMatch) {
        arrayVals.push(itemMatch[1]);
        continue;
      }
      // 数组结束，保存收集到的值
      if (key) data[key] = arrayVals;
      inArray = false;
      key = null;
      arrayVals = [];
    }
    // 匹配键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const k = kvMatch[1];
      const v = kvMatch[2].trim();
      if (v === '') {
        // 空值表示数组开始
        key = k;
        inArray = true;
        arrayVals = [];
      } else {
        // 有值则直接存储，去除引号
        data[k] = v.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  // 处理文件末尾仍在解析的数组
  if (inArray && key) data[key] = arrayVals;
  return data;
}

/**
 * 从文件路径提取 slug（文件名去除扩展名）
 *
 * @param {string} filePath - 文件绝对路径
 * @returns {string} slug 字符串（如 "Go与Redis"）
 */
function slugFromPath(filePath) {
  const parts = filePath.replace(/[/\\]/g, '/').split('/');
  const name = parts[parts.length - 1];
  return name.replace(/\.mdx?$/, '');
}

/**
 * 将术语文本转换为安全的 URL/ID 片段
 * 仅保留字母、数字、中文和连字符，其余替换为连字符
 *
 * @param {string} text - 原始术语文本
 * @returns {string} 安全的 ID 片段
 */
function sanitizeTerm(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 从 frontmatter 的复习/考点/术语字段生成卡片列表
 *
 * @param {Object} fm - 解析后的 frontmatter 对象
 * @param {string} moduleId - 模块标识
 * @param {string} slug - 文档 slug
 * @returns {Array<Object>} 生成的卡片数组
 */
function generateCardsFromFrontmatter(fm, moduleId, slug) {
  const cards = [];
  const difficulty = fm.difficulty || 'intermediate';

  // 从 reviewPoints 生成复习卡片
  const reviewPoints = Array.isArray(fm.reviewPoints) ? fm.reviewPoints : [];
  for (const point of reviewPoints) {
    const sanitized = sanitizeTerm(point);
    cards.push({
      id: `${moduleId}-${sanitized}`,
      type: 'review',
      term: '',
      question: point,
      answer: '',
      difficulty,
      source: slug,
    });
  }

  // 从 examPoints 生成考点卡片
  const examPoints = Array.isArray(fm.examPoints) ? fm.examPoints : [];
  for (const point of examPoints) {
    const sanitized = sanitizeTerm(point);
    cards.push({
      id: `${moduleId}-${sanitized}`,
      type: 'exam',
      term: '',
      question: point,
      answer: '',
      difficulty,
      source: slug,
    });
  }

  // 从 keyTerms 生成术语卡片
  const keyTerms = Array.isArray(fm.keyTerms) ? fm.keyTerms : [];
  for (const term of keyTerms) {
    const sanitized = sanitizeTerm(term);
    cards.push({
      id: `${moduleId}-${sanitized}`,
      type: 'term',
      term,
      question: `什么是 ${term}？`,
      answer: '',
      difficulty,
      source: slug,
    });
  }

  return cards;
}

/**
 * 解析 metadata/review/ 下的 YAML 文件，提取人工补充的卡片数据
 * YAML 格式示例：
 *   module: redis
 *   cards:
 *     - term: RDB
 *       question: "Redis RDB 持久化的触发条件有哪些？"
 *       answer: "save 配置触发、BGSAVE 命令、SHUTDOWN 时触发、主从复制时触发"
 *       difficulty: intermediate
 *       interval: 3
 *
 * @returns {Map<string, Array<Object>>} 按模块 ID 分组的人工补充卡片映射
 */
async function loadReviewYamlFiles() {
  const reviewCards = new Map();

  try {
    const files = await readdir(REVIEW_DIR);
    const yamlFiles = files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of yamlFiles) {
      const filePath = join(REVIEW_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      const parsed = parseSimpleYaml(content);
      const moduleId = parsed.module || file.replace(/\.ya?ml$/, '');

      if (Array.isArray(parsed.cards)) {
        const cards = parsed.cards.map((card) => ({
          id: card.id || `${moduleId}-${sanitizeTerm(card.term || card.question || '')}`,
          type: card.type || 'review',
          term: card.term || '',
          question: card.question || '',
          answer: card.answer || '',
          difficulty: card.difficulty || 'intermediate',
          source: card.source || moduleId,
          interval: card.interval || 0,
        }));

        if (!reviewCards.has(moduleId)) {
          reviewCards.set(moduleId, []);
        }
        reviewCards.get(moduleId).push(...cards);
      }
    }
  } catch {
    // metadata/review/ 目录不存在或为空，跳过
  }

  return reviewCards;
}

/**
 * 简易 YAML 解析器，支持嵌套对象数组
 * 用于解析 metadata/review/ 下的 YAML 文件
 *
 * @param {string} content - YAML 文件内容
 * @returns {Object} 解析后的对象
 */
function parseSimpleYaml(content) {
  const result = {};
  let currentKey = null;
  let inArray = false;
  let arrayVals = [];
  let inObjectArray = false;
  let currentObj = null;

  for (const line of content.split('\n')) {
    // 跳过空行和注释
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

    // 匹配对象数组中的键值对 "    term: RDB"
    const objKvMatch = line.match(/^\s{4,}(\w[\w-]*):\s*(.*)$/);
    if (inObjectArray && objKvMatch && currentObj) {
      const k = objKvMatch[1];
      const v = objKvMatch[2].trim().replace(/^['"]|['"]$/g, '');
      currentObj[k] = v;
      continue;
    }

    // 匹配数组对象项 "  - term: RDB" 或 "  - "
    const objItemMatch = line.match(/^\s+-\s+(.*)$/);
    if (inArray && objItemMatch) {
      const val = objItemMatch[1].trim();
      // 判断是否为对象数组（以 key: value 格式开头）
      const kvInItem = val.match(/^(\w[\w-]*):\s*(.*)$/);
      if (kvInItem) {
        // 保存上一个对象
        if (currentObj) {
          arrayVals.push(currentObj);
        }
        currentObj = {};
        currentObj[kvInItem[1]] = kvInItem[2].trim().replace(/^['"]|['"]$/g, '');
        inObjectArray = true;
        continue;
      }
      // 普通数组项
      if (currentObj) {
        arrayVals.push(currentObj);
        currentObj = null;
        inObjectArray = false;
      }
      arrayVals.push(val.replace(/^['"]|['"]$/g, ''));
      continue;
    }

    // 如果在对象数组中但缩进回退，保存当前对象
    if (inObjectArray && currentObj && !/^\s{4,}/.test(line) && !/^\s+-/.test(line)) {
      arrayVals.push(currentObj);
      currentObj = null;
      inObjectArray = false;
    }

    // 匹配顶层键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      // 保存之前的数组
      if (inArray && currentKey) {
        if (currentObj) {
          arrayVals.push(currentObj);
          currentObj = null;
          inObjectArray = false;
        }
        result[currentKey] = arrayVals;
        inArray = false;
        currentKey = null;
        arrayVals = [];
      }

      const k = kvMatch[1];
      const v = kvMatch[2].trim();
      if (v === '') {
        currentKey = k;
        inArray = true;
        arrayVals = [];
      } else {
        result[k] = v.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  // 处理文件末尾未保存的数据
  if (inArray && currentKey) {
    if (currentObj) {
      arrayVals.push(currentObj);
    }
    result[currentKey] = arrayVals;
  }

  return result;
}

/**
 * 合并自动生成卡片与人工补充卡片，去重（以卡片 ID 为准）
 * 人工补充卡片的 answer 字段优先级更高
 *
 * @param {Array<Object>} autoCards - 自动生成的卡片列表
 * @param {Array<Object>} manualCards - 人工补充的卡片列表
 * @returns {Array<Object>} 合并去重后的卡片列表
 */
function mergeCards(autoCards, manualCards) {
  const cardMap = new Map();

  // 先放入自动生成的卡片
  for (const card of autoCards) {
    cardMap.set(card.id, card);
  }

  // 人工补充卡片覆盖自动生成的（answer 等字段更完整）
  for (const card of manualCards) {
    const existing = cardMap.get(card.id);
    if (existing) {
      // 合并：人工补充的 answer 优先
      cardMap.set(card.id, {
        ...existing,
        ...card,
        // 保留自动生成的 source 如果人工未指定
        source: card.source !== existing.source && card.source === existing.source.split('/')[0]
          ? existing.source
          : card.source || existing.source,
      });
    } else {
      cardMap.set(card.id, card);
    }
  }

  return Array.from(cardMap.values());
}

/**
 * 主函数：扫描文档并生成复习卡片 JSON
 *
 * 流程：
 * 1. 扫描 content/ 下所有 .md/.mdx 文件
 * 2. 解析 frontmatter 中的 reviewPoints、examPoints、keyTerms
 * 3. 加载 metadata/review/ 下的人工补充 YAML
 * 4. 合并自动生成与人工补充的卡片
 * 5. 按模块输出到 generated/cards/{moduleId}.json
 */
async function main() {
  console.log('Generating review cards...');
  console.log(`Content dir: ${DOCS_DIR}`);
  console.log(`Review dir: ${REVIEW_DIR}`);
  console.log(`Output dir: ${OUTPUT_DIR}`);

  /** 按模块分组的自动生成卡片 */
  const moduleAutoCards = new Map();

  // 遍历 .md 文件
  await walkDir(DOCS_DIR, '.md', async (filePath) => {
    await processFile(filePath, moduleAutoCards);
  });

  // 遍历 .mdx 文件
  await walkDir(DOCS_DIR, '.mdx', async (filePath) => {
    await processFile(filePath, moduleAutoCards);
  });

  // 加载人工补充的复习卡片 YAML
  const manualCards = await loadReviewYamlFiles();

  // 收集所有涉及的模块 ID（自动 + 人工）
  const allModuleIds = new Set([
    ...moduleAutoCards.keys(),
    ...manualCards.keys(),
  ]);

  // 确保输出目录存在
  await mkdir(OUTPUT_DIR, { recursive: true });

  let totalCards = 0;
  let modulesWithCards = 0;

  for (const moduleId of allModuleIds) {
    const autoCards = moduleAutoCards.get(moduleId) || [];
    const manual = manualCards.get(moduleId) || [];
    const cards = mergeCards(autoCards, manual);

    if (cards.length === 0) continue;

    const output = {
      module: moduleId,
      generatedAt: new Date().toISOString(),
      cards,
    };

    const outputPath = join(OUTPUT_DIR, `${moduleId}.json`);
    await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    totalCards += cards.length;
    modulesWithCards++;

    console.log(`  [${moduleId}] ${cards.length} cards (${autoCards.length} auto + ${manual.length} manual)`);
  }

  if (modulesWithCards === 0) {
    console.log('No review cards generated (no documents with reviewPoints/examPoints/keyTerms found).');
    console.log('Tip: Add reviewPoints, examPoints, or keyTerms to document frontmatter, or create metadata/review/*.yaml files.');
  } else {
    console.log(`Review cards: ${totalCards} cards across ${modulesWithCards} modules written to ${OUTPUT_DIR}`);
  }
}

/**
 * 处理单个文档文件，提取卡片数据并归入对应模块
 *
 * @param {string} filePath - 文档文件绝对路径
 * @param {Map<string, Array<Object>>} moduleAutoCards - 按模块分组的卡片收集器
 */
async function processFile(filePath, moduleAutoCards) {
  const content = await readFile(filePath, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm.module) return;

  const moduleId = fm.module;
  const slug = `${moduleId}/${slugFromPath(filePath)}`;

  // 检查是否有可生成卡片的字段
  const hasReviewPoints = Array.isArray(fm.reviewPoints) && fm.reviewPoints.length > 0;
  const hasExamPoints = Array.isArray(fm.examPoints) && fm.examPoints.length > 0;
  const hasKeyTerms = Array.isArray(fm.keyTerms) && fm.keyTerms.length > 0;

  if (!hasReviewPoints && !hasExamPoints && !hasKeyTerms) return;

  const cards = generateCardsFromFrontmatter(fm, moduleId, slug);
  if (cards.length === 0) return;

  if (!moduleAutoCards.has(moduleId)) {
    moduleAutoCards.set(moduleId, []);
  }
  moduleAutoCards.get(moduleId).push(...cards);
}

main().catch(console.error);
