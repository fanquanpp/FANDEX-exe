/**
 * 离线包构建脚本
 *
 * 功能概述：
 * 设置 BASE_PATH 环境变量为相对路径，执行完整构建流程。
 * 构建产物用于打包为离线 zip 包，用户解压后通过 start.bat/start.sh 启动。
 *
 * 与 npm run build 的区别：
 * - build：使用默认 BASE_PATH=/FANDEX/，部署到 GitHub Pages
 * - build:offline：使用 BASE_PATH=./，用于离线包分发
 *
 * 输入：无
 * 输出：apps/web/dist/ 目录（相对路径构建产物）
 */

import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = join(__dirname, '..', 'apps', 'web');

/** 构建步骤（与 package.json build 一致，但设置 BASE_PATH=./） */
const steps = [
  'node ../../scripts/copy-metadata-to-public.mjs',
  'node ../../scripts/build-glossary-index.mjs',
  'node ../../scripts/build-module-docs-index.mjs',
  'node ../../scripts/build-tag-index.mjs',
  'node ../../scripts/build-search-index.mjs',
  'node ../../scripts/generate-knowledge-graph.mjs',
  'node ../../scripts/generate-embedding-index.mjs',
  'astro build',
  'pagefind --site dist',
  'node ../../scripts/generate-sw-precache.mjs',
];

console.log('开始构建离线包（BASE_PATH=./）...');

/** 设置环境变量后依次执行构建步骤 */
for (const step of steps) {
  console.log(`\n> ${step}`);
  execSync(step, {
    cwd: webDir,
    stdio: 'inherit',
    env: { ...process.env, BASE_PATH: './' },
  });
}

console.log('\n离线包构建完成。');
console.log('产物目录：apps/web/dist/');
console.log('可执行 scripts/pack-offline-zip.mjs 打包为 zip。');
