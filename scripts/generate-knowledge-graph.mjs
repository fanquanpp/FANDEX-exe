/**
 * FANDEX 知识图谱生成脚本
 *
 * 功能概述：
 * 从 metadata/modules.json、content/ 下所有文档的 frontmatter、
 * metadata/glossary/*.json 中提取节点和边数据，生成知识图谱 JSON 文件，
 * 输出到 generated/graph/knowledge-graph.json。
 *
 * 节点类型：
 * - module：模块节点，来源于 metadata/modules.json
 * - doc：文档节点，来源于 content/ 下所有 .md 文件的 frontmatter
 * - term：术语节点，来源于 metadata/glossary/*.json
 *
 * 边类型：
 * - prerequisite：前置依赖关系（A 是 B 的前置知识）
 * - related：关联关系（A 和 B 相互关联）
 * - contains：包含关系（模块包含文档，文档包含术语）
 *
 * 数据来源：
 * - 模块前置关系：metadata/modules.json 的 modulePrerequisites
 * - 文档前置关系：frontmatter 的 prerequisites 字段
 * - 文档关联关系：frontmatter 的 related 字段
 * - 术语关系：metadata/glossary/*.json
 * - 文档-术语边：frontmatter 的 keyTerms 字段
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 文档源文件目录 */
const DOCS_DIR = join(__dirname, '..', 'content');
/** 模块元数据文件路径 */
const MODULES_FILE = join(__dirname, '..', 'metadata', 'modules.json');
/** 术语数据目录 */
const GLOSSARY_DIR = join(__dirname, '..', 'metadata', 'glossary');
/** 知识图谱输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'generated', 'graph');
/** 知识图谱输出文件路径 */
const OUTPUT_FILE = join(OUTPUT_DIR, 'knowledge-graph.json');

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
    if (entry.name.startsWith('.')) continue; // 跳过隐藏文件
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
  let key = null; // 当前正在解析的键名
  let inArray = false; // 是否正在解析数组
  let arrayVals = []; // 数组值收集器

  for (const line of raw.split('\n')) {
    if (inArray) {
      // 尝试匹配数组项 "  - value"
      const itemMatch = line.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/);
      if (itemMatch) {
        arrayVals.push(itemMatch[1]);
        continue;
      }
      // 数组结束，保存收集到的值
      data[key] = arrayVals;
      inArray = false;
      key = null;
      arrayVals = [];
    }
    // 匹配键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const k = kvMatch[1];
      const v = kvMatch[2].trim();
      if (v === '' || v === '[]') {
        // 空值或空数组表示数组开始
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
 * 从文件路径提取文档 slug（模块/文件名 格式）
 *
 * @param {string} filePath - 文件绝对路径
 * @param {string} docsDir - 文档根目录
 * @returns {string} 文档 slug（如 "git/Git基础概念与核心特点"）
 */
function slugFromPath(filePath, docsDir) {
  const relative = filePath.replace(docsDir, '').replace(/[/\\]/g, '/');
  // 去除开头的斜杠和扩展名
  return relative.replace(/^\//, '').replace(/\.md$/, '').replace(/\.mdx$/, '');
}

/**
 * 读取模块元数据
 * @returns {Promise<Object>} 模块元数据对象
 */
async function loadModulesData() {
  const content = await readFile(MODULES_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * 读取所有术语数据
 * @returns {Promise<Array<{moduleId: string, terms: Array<{name: string, definition: string, slug: string}>}>>}
 */
async function loadGlossaryData() {
  const glossaryData = [];
  const files = await readdir(GLOSSARY_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const filePath = join(GLOSSARY_DIR, file);
    const content = await readFile(filePath, 'utf-8');
    const moduleData = JSON.parse(content);
    glossaryData.push(moduleData);
  }

  return glossaryData;
}

/**
 * 扫描所有文档，提取文档元数据
 * @returns {Promise<Array<{slug: string, title: string, module: string, order: number, prerequisites: string[], related: string[], keyTerms: string[]}>>}
 */
async function scanDocuments() {
  const documents = [];

  await walkDir(DOCS_DIR, '.md', async (filePath) => {
    const content = await readFile(filePath, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.module) return; // 跳过无标题或无模块的文件

    const slug = slugFromPath(filePath, DOCS_DIR);

    documents.push({
      slug,
      title: fm.title || '',
      module: fm.module || '',
      order: Number(fm.order) || 0,
      prerequisites: Array.isArray(fm.prerequisites) ? fm.prerequisites : [],
      related: Array.isArray(fm.related) ? fm.related : [],
      keyTerms: Array.isArray(fm.keyTerms) ? fm.keyTerms : [],
    });
  });

  // 同时扫描 .mdx 文件
  await walkDir(DOCS_DIR, '.mdx', async (filePath) => {
    const content = await readFile(filePath, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.module) return;

    const slug = slugFromPath(filePath, DOCS_DIR);

    documents.push({
      slug,
      title: fm.title || '',
      module: fm.module || '',
      order: Number(fm.order) || 0,
      prerequisites: Array.isArray(fm.prerequisites) ? fm.prerequisites : [],
      related: Array.isArray(fm.related) ? fm.related : [],
      keyTerms: Array.isArray(fm.keyTerms) ? fm.keyTerms : [],
    });
  });

  return documents;
}

/**
 * 主函数：生成知识图谱
 *
 * 流程：
 * 1. 读取模块元数据，生成模块节点和模块间前置依赖边
 * 2. 扫描文档，生成文档节点、模块-文档包含边、文档间关联边
 * 3. 读取术语数据，生成术语节点和文档-术语包含边
 * 4. 汇总统计信息并输出 JSON
 */
async function main() {
  console.log('开始生成知识图谱...');

  // 用于去重的集合
  const nodeIds = new Set();
  const edgeKeys = new Set();

  /** @type {Array<Object>} 所有节点 */
  const nodes = [];
  /** @type {Array<Object>} 所有边 */
  const edges = [];

  /**
   * 安全添加节点，保证 ID 全局唯一
   * @param {Object} node - 节点对象
   */
  function addNode(node) {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  }

  /**
   * 安全添加边，保证不重复
   * @param {string} source - 源节点 ID
   * @param {string} target - 目标节点 ID
   * @param {string} type - 边类型
   */
  function addEdge(source, target, type) {
    const key = `${source}|${target}|${type}`;
    if (edgeKeys.has(key)) return;
    // 跳过源和目标相同的边
    if (source === target) return;
    edgeKeys.add(key);
    edges.push({ source, target, type });
  }

  // ========== 第一步：处理模块数据 ==========
  console.log('  读取模块元数据...');
  const modulesData = await loadModulesData();
  const { modules, modulePrerequisites, categoryLabels } = modulesData;

  // 统计每个模块的文档数量（先初始化为 0，后续扫描时累加）
  /** @type {Object<string, number>} 模块ID -> 文档数量 */
  const moduleDocCounts = {};
  for (const mod of modules) {
    moduleDocCounts[mod.id] = 0;
  }

  // 生成模块节点
  for (const mod of modules) {
    const category = Array.isArray(mod.categories) ? mod.categories[0] : '';
    addNode({
      id: `module:${mod.id}`,
      type: 'module',
      label: mod.title,
      category,
      description: mod.description || '',
      docCount: 0, // 后续更新
    });
  }

  // 生成模块间前置依赖边
  for (const [moduleId, prereqs] of Object.entries(modulePrerequisites)) {
    if (!Array.isArray(prereqs)) continue;
    for (const prereq of prereqs) {
      // 仅在两个模块都存在时才添加边
      const sourceId = `module:${prereq}`;
      const targetId = `module:${moduleId}`;
      if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
        addEdge(sourceId, targetId, 'prerequisite');
      }
    }
  }

  // ========== 第二步：处理文档数据 ==========
  console.log('  扫描文档 frontmatter...');
  const documents = await scanDocuments();
  console.log(`  找到 ${documents.length} 篇文档`);

  // 构建文档 slug 到节点 ID 的映射，用于后续边生成
  /** @type {Object<string, string>} 文档slug -> 节点ID */
  const docSlugToNodeId = {};

  for (const doc of documents) {
    const nodeId = `doc:${doc.slug}`;
    docSlugToNodeId[doc.slug] = nodeId;

    addNode({
      id: nodeId,
      type: 'doc',
      label: doc.title,
      module: doc.module,
      order: doc.order,
    });

    // 模块-文档包含边
    const moduleNodeId = `module:${doc.module}`;
    if (nodeIds.has(moduleNodeId)) {
      addEdge(moduleNodeId, nodeId, 'contains');
      // 累加文档计数
      moduleDocCounts[doc.module] = (moduleDocCounts[doc.module] || 0) + 1;
    }

    // 文档间前置依赖边
    for (const prereq of doc.prerequisites) {
      const prereqNodeId = `doc:${prereq}`;
      // 即使目标节点尚未在 nodes 中，也添加边（前端可按需过滤）
      addEdge(prereqNodeId, nodeId, 'prerequisite');
    }

    // 文档间关联边
    for (const related of doc.related) {
      const relatedNodeId = `doc:${related}`;
      addEdge(nodeId, relatedNodeId, 'related');
    }
  }

  // 更新模块节点的文档计数
  for (const node of nodes) {
    if (node.type === 'module') {
      const moduleId = node.id.replace('module:', '');
      node.docCount = moduleDocCounts[moduleId] || 0;
    }
  }

  // ========== 第三步：处理术语数据 ==========
  console.log('  读取术语数据...');
  const glossaryData = await loadGlossaryData();

  // 构建术语名称到节点 ID 的映射
  /** @type {Object<string, string>} 术语名 -> 节点ID */
  const termNameToNodeId = {};

  for (const moduleGlossary of glossaryData) {
    const { moduleId, terms } = moduleGlossary;
    if (!Array.isArray(terms)) continue;

    for (const term of terms) {
      // 术语节点 ID 使用 "term:{moduleId}:{termName}" 格式保证唯一性
      const termNodeId = `term:${moduleId}:${term.name}`;
      termNameToNodeId[`${moduleId}:${term.name}`] = termNodeId;

      addNode({
        id: termNodeId,
        type: 'term',
        label: term.name,
        module: moduleId,
        definition: term.definition || '',
      });

      // 模块-术语包含边
      const moduleNodeId = `module:${moduleId}`;
      if (nodeIds.has(moduleNodeId)) {
        addEdge(moduleNodeId, termNodeId, 'contains');
      }
    }
  }

  // ========== 第四步：处理文档-术语关联（keyTerms） ==========
  for (const doc of documents) {
    if (!Array.isArray(doc.keyTerms) || doc.keyTerms.length === 0) continue;

    const docNodeId = `doc:${doc.slug}`;
    for (const termName of doc.keyTerms) {
      // 尝试匹配同模块下的术语
      const termKey = `${doc.module}:${termName}`;
      const termNodeId = termNameToNodeId[termKey];
      if (termNodeId) {
        addEdge(docNodeId, termNodeId, 'contains');
      }
    }
  }

  // ========== 第五步：汇总统计信息 ==========
  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    moduleNodes: nodes.filter((n) => n.type === 'module').length,
    docNodes: nodes.filter((n) => n.type === 'doc').length,
    termNodes: nodes.filter((n) => n.type === 'term').length,
    prerequisiteEdges: edges.filter((e) => e.type === 'prerequisite').length,
    relatedEdges: edges.filter((e) => e.type === 'related').length,
    containsEdges: edges.filter((e) => e.type === 'contains').length,
  };

  // 构建最终输出
  const graph = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    nodes,
    edges,
    stats,
  };

  // 确保输出目录存在
  await mkdir(OUTPUT_DIR, { recursive: true });

  // 写入 JSON 文件
  const json = JSON.stringify(graph, null, 2);
  await writeFile(OUTPUT_FILE, json, 'utf-8');

  // 同时复制到 public/data/ 目录，供客户端 fetch 使用
  const PUBLIC_DATA_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data');
  await mkdir(PUBLIC_DATA_DIR, { recursive: true });
  const PUBLIC_FILE = join(PUBLIC_DATA_DIR, 'knowledge-graph.json');
  await writeFile(PUBLIC_FILE, json, 'utf-8');

  const sizeKB = (Buffer.byteLength(json, 'utf-8') / 1024).toFixed(1);
  console.log(`\n知识图谱生成完成:`);
  console.log(`  节点总数: ${stats.totalNodes} (模块: ${stats.moduleNodes}, 文档: ${stats.docNodes}, 术语: ${stats.termNodes})`);
  console.log(`  边总数: ${stats.totalEdges} (前置: ${stats.prerequisiteEdges}, 关联: ${stats.relatedEdges}, 包含: ${stats.containsEdges})`);
  console.log(`  文件大小: ${sizeKB} KB`);
  console.log(`  输出路径: ${OUTPUT_FILE}`);
  console.log(`  公共路径: ${PUBLIC_FILE}`);
}

main().catch((err) => {
  console.error('知识图谱生成失败:', err);
  process.exit(1);
});
