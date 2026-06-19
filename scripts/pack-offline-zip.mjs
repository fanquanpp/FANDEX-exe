/**
 * 离线包打包脚本
 *
 * 功能概述：
 * 将 apps/web/dist 目录打包为 zip 文件，包含全部站点资源和启动脚本。
 * 用户解压后双击 start.bat / start.sh 即可使用。
 *
 * 输入：apps/web/dist/ 目录
 * 输出：apps/web/fandex-offline-{version}.zip
 *
 * zip 包内容：
 * - 全部 HTML/CSS/JS/JSON/图片/字体资源
 * - start.bat（Windows 启动脚本）
 * - start.sh（Linux/macOS 启动脚本）
 * - README-offline.txt（使用说明）
 */

import { stat, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'apps', 'web', 'dist');
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web');

/** 读取 package.json 版本号 */
async function getVersion() {
  const pkgPath = join(__dirname, '..', 'apps', 'web', 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  return pkg.version;
}

/**
 * 主函数：打包 dist 目录为 zip
 */
async function main() {
  const version = await getVersion();
  const zipName = `fandex-offline-v${version}.zip`;
  const zipPath = join(OUTPUT_DIR, zipName);

  console.log(`开始打包离线包...`);
  console.log(`  源目录: ${DIST_DIR}`);
  console.log(`  输出: ${zipPath}`);

  /** 使用系统命令打包 zip（跨平台兼容） */
  try {
    /** 优先使用 PowerShell 的 Compress-Archive（Windows） */
    if (process.platform === 'win32') {
      execSync(
        `powershell -Command "Compress-Archive -Path '${DIST_DIR}/*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'inherit' }
      );
    } else {
      /** Linux/macOS 使用 zip 命令 */
      execSync(`cd "${DIST_DIR}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
    }

    /** 验证 zip 文件 */
    const stats = await stat(zipPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`\n打包完成: ${zipName}`);
    console.log(`  文件大小: ${sizeMB} MB`);
    console.log(`  路径: ${zipPath}`);
  } catch (error) {
    console.error('打包失败:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
