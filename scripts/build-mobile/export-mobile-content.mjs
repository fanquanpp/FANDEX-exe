/**
 * FANDEX 移动端内容导出脚本
 *
 * 功能概述：
 * 1. 读取 metadata/modules.json 获取模块列表
 * 2. 扫描 content/ 下所有文档，提取 frontmatter 中的模块归属和标题
 * 3. 为每个模块创建目录 dist-mobile/modules/{moduleId}/
 * 4. 生成 dist-mobile/index.json（全局内容索引）
 * 5. 复制 generated/cards/*.json 到 dist-mobile/cards/
 * 6. 复制速查表数据到 dist-mobile/cheatsheets/
 *
 * 注意：当前阶段同时调用 HTML 预渲染提取脚本（extract-mobile-html.mjs），
 * 将 Astro 构建产物中的文档 HTML 提取到 dist-mobile/modules/ 中。
 */

import { readdir, readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 项目根目录 */
const ROOT_DIR = join(__dirname, '..', '..');
/** 文档源文件目录 */
const CONTENT_DIR = join(ROOT_DIR, 'content');
/** 元数据目录 */
const METADATA_DIR = join(ROOT_DIR, 'metadata');
/** 复习卡片生成产物目录 */
const CARDS_DIR = join(ROOT_DIR, 'generated', 'cards');
/** 速查表数据目录 */
const CHEATSHEETS_DIR = join(ROOT_DIR, 'apps', 'web', 'src', 'data', 'cheatsheets');
/** 移动端产物输出目录 */
const OUTPUT_DIR = join(ROOT_DIR, 'dist-mobile');

/**
 * 递归遍历目录，对匹配扩展名的文件执行回调
 *
 * @param {string} dir - 要遍历的目录路径
 * @param {string[]} exts - 文件扩展名数组（如 ['.md', '.mdx']）
 * @param {Function} fn - 对每个匹配文件执行的异步回调
 */
async function walkDir(dir, exts, fn) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      await walkDir(full, exts, fn);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
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
      const itemMatch = line.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/);
      if (itemMatch) {
        arrayVals.push(itemMatch[1]);
        continue;
      }
      if (key) data[key] = arrayVals;
      inArray = false;
      key = null;
      arrayVals = [];
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const k = kvMatch[1];
      const v = kvMatch[2].trim();
      if (v === '') {
        key = k;
        inArray = true;
        arrayVals = [];
      } else {
        data[k] = v.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  if (inArray && key) data[key] = arrayVals;
  return data;
}

/**
 * 从文件路径提取 slug（去除扩展名的文件名）
 *
 * @param {string} filePath - 文件绝对路径
 * @returns {string} slug 字符串
 */
function slugFromPath(filePath) {
  const parts = filePath.replace(/[/\\]/g, '/').split('/');
  const name = parts[parts.length - 1];
  return name.replace(/\.mdx?$/, '');
}

/**
 * 从文件路径提取模块 ID
 * 路径格式：content/{category}/{moduleId}/{docName}.md
 * 需要跳过 category 层级，取 moduleId
 *
 * @param {string} filePath - 文件绝对路径
 * @returns {string|null} 模块 ID，无法解析时返回 null
 */
function moduleIdFromPath(filePath) {
  const normalized = filePath.replace(/[/\\]/g, '/');
  const contentIdx = normalized.indexOf('/content/');
  if (contentIdx === -1) return null;
  const relative = normalized.substring(contentIdx + '/content/'.length);
  const segments = relative.split('/');
  // 至少需要 category/moduleId/docName.md
  if (segments.length < 3) return null;
  return segments[1];
}

/**
 * 扫描 content/ 下所有文档，按模块分组收集文章信息
 *
 * @returns {Map<string, Array<{slug: string, title: string}>>} 按模块 ID 分组的文章列表
 */
async function scanContentDocuments() {
  /** 按模块 ID 分组的文章列表 */
  const moduleArticles = new Map();

  await walkDir(CONTENT_DIR, ['.md', '.mdx'], async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf-8');
      const fm = parseFrontmatter(content);

      // 优先使用 frontmatter 中的 module 字段，其次从路径推断
      const moduleId = fm.module || moduleIdFromPath(filePath);
      if (!moduleId) return;

      // 优先使用 frontmatter 中的 title，其次使用文件名
      const title = fm.title || slugFromPath(filePath);
      const slug = `${moduleId}/${slugFromPath(filePath)}`;

      if (!moduleArticles.has(moduleId)) {
        moduleArticles.set(moduleId, []);
      }
      moduleArticles.get(moduleId).push({ slug, title });
    } catch {
      // 单个文件解析失败不影响整体流程
    }
  });

  return moduleArticles;
}

/**
 * 复制目录下所有 JSON 文件到目标目录
 * 如果源目录不存在则跳过
 *
 * @param {string} srcDir - 源目录路径
 * @param {string} destDir - 目标目录路径
 * @param {string} label - 日志标签
 * @returns {number} 复制的文件数量
 */
async function copyJsonFiles(srcDir, destDir, label) {
  if (!existsSync(srcDir)) {
    console.log(`  [${label}] 源目录不存在，跳过: ${srcDir}`);
    return 0;
  }

  await mkdir(destDir, { recursive: true });

  const files = await readdir(srcDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const srcPath = join(srcDir, file);
    const destPath = join(destDir, file);
    await cp(srcPath, destPath);
  }

  console.log(`  [${label}] 复制 ${jsonFiles.length} 个文件`);
  return jsonFiles.length;
}

/**
 * 生成全局内容索引 index.json
 *
 * @param {Object} modulesConfig - modules.json 的模块配置
 * @param {Map<string, Array<{slug: string, title: string}>>} moduleArticles - 按模块分组的文章
 * @returns {Object} index.json 数据对象
 */
function buildIndexJson(modulesConfig, moduleArticles) {
  const modules = modulesConfig.modules
    .map((mod) => {
      const articles = moduleArticles.get(mod.id) || [];
      return {
        id: mod.id,
        title: mod.title,
        icon: mod.icon,
        category: mod.categories ? mod.categories[0] : '',
        articles,
      };
    })
    .filter((mod) => mod.articles.length > 0);

  return {
    version: modulesConfig.version || '4.0.0',
    buildTime: new Date().toISOString(),
    modules,
  };
}

/**
 * 主函数：执行移动端内容导出
 *
 * 流程：
 * 1. 读取模块配置
 * 2. 扫描文档并按模块分组
 * 3. 生成 index.json
 * 4. 创建模块目录
 * 5. 复制复习卡片和速查表数据
 */
async function main() {
  console.log('=== FANDEX 移动端内容导出 ===');
  console.log(`项目根目录: ${ROOT_DIR}`);
  console.log(`产物目录: ${OUTPUT_DIR}`);

  // 步骤 1：读取模块配置
  const modulesConfigPath = join(METADATA_DIR, 'modules.json');
  const modulesConfig = JSON.parse(await readFile(modulesConfigPath, 'utf-8'));
  console.log(`已加载模块配置: ${modulesConfig.modules.length} 个模块`);

  // 步骤 2：扫描文档
  const moduleArticles = await scanContentDocuments();
  const totalArticles = Array.from(moduleArticles.values()).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`已扫描文档: ${totalArticles} 篇，覆盖 ${moduleArticles.size} 个模块`);

  // 步骤 3：创建产物目录结构
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'modules'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'cards'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'cheatsheets'), { recursive: true });

  // 步骤 4：为每个有文章的模块创建目录
  for (const moduleId of moduleArticles.keys()) {
    const moduleDir = join(OUTPUT_DIR, 'modules', moduleId);
    await mkdir(moduleDir, { recursive: true });
  }
  console.log(`已创建 ${moduleArticles.size} 个模块目录`);

  // 步骤 5：生成 index.json
  const indexData = buildIndexJson(modulesConfig, moduleArticles);
  const indexJsonPath = join(OUTPUT_DIR, 'index.json');
  await writeFile(indexJsonPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`已生成 index.json: ${indexData.modules.length} 个模块，${totalArticles} 篇文章`);

  // 步骤 6：复制复习卡片数据
  const cardsCount = await copyJsonFiles(CARDS_DIR, join(OUTPUT_DIR, 'cards'), '复习卡片');

  // 步骤 7：复制速查表数据
  const cheatsheetsCount = await copyJsonFiles(
    CHEATSHEETS_DIR,
    join(OUTPUT_DIR, 'cheatsheets'),
    '速查表'
  );

  // 输出统计
  console.log('\n=== 导出完成 ===');
  console.log(`模块数: ${indexData.modules.length}`);
  console.log(`文章数: ${totalArticles}`);
  console.log(`复习卡片: ${cardsCount} 个模块`);
  console.log(`速查表: ${cheatsheetsCount} 个模块`);
  console.log(`产物目录: ${OUTPUT_DIR}`);
}

main().catch(console.error);
