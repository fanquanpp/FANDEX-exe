/**
 * FANDEX 移动端复习卡片生成脚本
 *
 * 功能概述：
 * 调用已有的 scripts/generate-review-cards.mjs 生成复习卡片数据，
 * 确认 generated/cards/ 目录中的数据可用。
 * 实际的复制到 dist-mobile/cards/ 由 export-mobile-content.mjs 完成。
 *
 * 流程：
 * 1. 执行 scripts/generate-review-cards.mjs 生成卡片数据到 generated/cards/
 * 2. 验证生成结果
 */

import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 项目根目录 */
const ROOT_DIR = join(__dirname, '..', '..');
/** 复习卡片生成脚本路径 */
const GENERATE_SCRIPT = join(ROOT_DIR, 'scripts', 'generate-review-cards.mjs');
/** 卡片生成产物目录 */
const CARDS_DIR = join(ROOT_DIR, 'generated', 'cards');

/**
 * 主函数：调用卡片生成脚本并验证结果
 *
 * 流程：
 * 1. 执行 generate-review-cards.mjs
 * 2. 检查 generated/cards/ 目录中的文件
 */
async function main() {
  console.log('=== FANDEX 移动端复习卡片生成 ===');

  // 步骤 1：执行卡片生成脚本
  console.log(`执行卡片生成脚本: ${GENERATE_SCRIPT}`);
  try {
    execSync(`node "${GENERATE_SCRIPT}"`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('卡片生成脚本执行失败:', error.message);
    process.exit(1);
  }

  // 步骤 2：验证生成结果
  if (!existsSync(CARDS_DIR)) {
    console.log('警告: generated/cards/ 目录不存在，可能没有文档包含复习卡片字段');
    return;
  }

  const files = await readdir(CARDS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  console.log(`已生成 ${jsonFiles.length} 个模块的复习卡片数据`);

  if (jsonFiles.length === 0) {
    console.log('提示: 在文档 frontmatter 中添加 reviewPoints/examPoints/keyTerms 字段以生成复习卡片');
  }
}

main().catch(console.error);
