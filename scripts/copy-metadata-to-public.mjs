/**
 * 复制元数据文件到 public/data/ 目录
 *
 * 将 metadata/roadmap/ 和 metadata/ 下的 JSON 文件复制到
 * apps/web/public/data/ 目录，供客户端 fetch 使用。
 *
 * 输入：metadata/roadmap/career-paths.json、metadata/modules.json
 * 输出：public/data/career-paths.json、public/data/modules.json
 */

import { copyFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DATA_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data');
const METADATA_DIR = join(__dirname, '..', 'metadata');
const ROADMAP_DIR = join(METADATA_DIR, 'roadmap');

async function main() {
  await mkdir(PUBLIC_DATA_DIR, { recursive: true });

  const files = [
    {
      src: join(ROADMAP_DIR, 'career-paths.json'),
      dest: join(PUBLIC_DATA_DIR, 'career-paths.json'),
    },
    {
      src: join(METADATA_DIR, 'modules.json'),
      dest: join(PUBLIC_DATA_DIR, 'modules.json'),
    },
  ];

  for (const { src, dest } of files) {
    try {
      await copyFile(src, dest);
      console.log(`已复制: ${src} -> ${dest}`);
    } catch (err) {
      console.error(`复制失败: ${src}`, err);
    }
  }

  console.log('元数据文件复制完成');
}

main().catch((err) => {
  console.error('元数据复制失败:', err);
  process.exit(1);
});
