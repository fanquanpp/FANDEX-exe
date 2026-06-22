/**
 * Service Worker 预缓存清单生成脚本
 *
 * 功能概述：
 * 在 Astro 构建完成后，扫描 dist 目录下的全部静态资源，
 * 生成预缓存 URL 列表，注入到 sw.js 中。
 * 安装时 Service Worker 将预缓存全部资源，实现完全离线可用。
 *
 * 输入：apps/web/dist/ 目录下的全部静态文件
 * 输出：修改后的 apps/web/dist/sw.js（注入 PRECACHE_URLS 数组）
 *
 * 跳过规则：
 * - pagefind 索引文件（体积大，按需加载即可）
 * - 超大文件（> 2MB，避免预缓存超时）
 *
 * 路径处理：
 * 扫描到的文件路径相对于 dist 目录，加上 base path 前缀。
 * 例如 dist/search/index.html -> /FANDEX-exe/search/index.html
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));

/** Astro 构建输出目录 */
const DIST_DIR = join(__dirname, '..', 'apps', 'web', 'dist');
/** Service Worker 文件路径（构建输出目录中） */
const SW_FILE = join(DIST_DIR, 'sw.js');

/** GitHub Pages 基础路径 */
const DEFAULT_BASE_PATH = '/FANDEX-exe/';
/** 离线包基础路径（相对路径） */
const OFFLINE_BASE_PATH = './';

/**
 * 从构建产物中检测 base path
 *
 * 输入：无
 * 输出：base path 字符串
 * 流程：读取 manifest.webmanifest 中的 start_url，提取 base path
 */
async function detectBasePath() {
  try {
    const manifestPath = join(DIST_DIR, 'manifest.webmanifest');
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    const startUrl = manifest.start_url || '';
    /** start_url 为 "./" 时是离线包，否则提取路径前缀 */
    if (startUrl === './' || startUrl === '.') {
      return OFFLINE_BASE_PATH;
    }
    /** 从 start_url 提取 base path，如 "/FANDEX-exe/" */
    const match = startUrl.match(/^(\/[^/]+\/)/);
    return match ? match[1] : DEFAULT_BASE_PATH;
  } catch {
    return DEFAULT_BASE_PATH;
  }
}

/** 预缓存文件大小上限（2MB），超过则跳过 */
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/** 跳过预缓存的目录/文件模式 */
const SKIP_PATTERNS = [
  /[/\\]pagefind[/\\]/, // pagefind 索引目录（体积大，按需加载）
];

/**
 * 递归遍历目录，收集全部文件路径
 *
 * 输入：目录路径
 * 输出：文件绝对路径数组
 * 流程：递归遍历 -> 跳过目录和模式匹配 -> 收集文件
 */
async function walkDir(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 判断文件是否应跳过预缓存
 *
 * 输入：文件相对路径
 * 输出：是否跳过
 * 流程：检查文件大小和路径模式
 */
async function shouldSkip(filePath) {
  /** 检查路径模式 */
  const relativePath = relative(DIST_DIR, filePath).split(sep).join('/');
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(relativePath)) return true;
  }

  /** 检查文件大小 */
  const stats = await stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    console.warn(
      `  跳过（体积超限）: ${relativePath} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
    );
    return true;
  }

  return false;
}

/**
 * 将文件路径转换为 SW 预缓存 URL
 *
 * 输入：文件绝对路径，base path
 * 输出：相对于 base path 的 URL
 * 流程：计算相对路径 -> 拼接 base path -> 规范化分隔符
 */
function filePathToUrl(filePath, basePath) {
  const relativePath = relative(DIST_DIR, filePath).split(sep).join('/');
  /** 离线包模式使用相对路径，GitHub Pages 模式使用绝对路径 */
  if (basePath === OFFLINE_BASE_PATH) {
    return './' + relativePath;
  }
  return basePath + relativePath;
}

/**
 * 主函数：生成预缓存清单并注入 sw.js
 */
async function main() {
  console.log('开始生成 Service Worker 预缓存清单...');

  /** 检测构建产物的 base path */
  const basePath = await detectBasePath();
  console.log(`  检测到 base path: ${basePath}`);

  /** 收集全部文件 */
  const allFiles = await walkDir(DIST_DIR);
  console.log(`  扫描到 ${allFiles.length} 个文件`);

  /** 过滤需要预缓存的文件 */
  const precacheUrls = [];
  for (const file of allFiles) {
    if (await shouldSkip(file)) continue;
    precacheUrls.push(filePathToUrl(file, basePath));
  }

  console.log(`  预缓存资源: ${precacheUrls.length} 个`);

  /** 读取 sw.js 并注入预缓存清单 */
  let swContent = await readFile(SW_FILE, 'utf-8');

  /** 替换 PRECACHE_URLS 占位符 */
  const precacheArray = JSON.stringify(precacheUrls, null, 2);
  swContent = swContent.replace(
    /const PRECACHE_URLS\s*=\s*\[[\s\S]*?\];/,
    `const PRECACHE_URLS = ${precacheArray};`
  );

  /** 注入 base path */
  swContent = swContent.replace(
    /const BASE\s*=\s*['"][^'"]*['"];/,
    `const BASE = ${JSON.stringify(basePath)};`
  );

  /** 注入缓存版本号（使用时间戳确保每次构建更新版本） */
  const version = `v${Date.now()}`;
  swContent = swContent.replace(
    /const CACHE_NAME\s*=\s*['"][^'"]*['"];/,
    `const CACHE_NAME = 'fandex-${version}';`
  );

  await writeFile(SW_FILE, swContent, 'utf-8');

  console.log(`  预缓存清单已注入 sw.js`);
  console.log(`  缓存版本: fandex-${version}`);
  console.log('Service Worker 预缓存清单生成完成。');
}

main().catch((err) => {
  console.error('预缓存清单生成失败:', err);
  process.exit(1);
});
