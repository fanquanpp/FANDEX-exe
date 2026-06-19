/**
 * PWA 图标生成脚本
 *
 * 功能概述：
 * 从 SVG 源文件生成多尺寸 PNG 图标，用于 PWA 安装。
 * 使用 sharp 库进行 SVG -> PNG 转换，支持普通图标和 maskable 图标。
 *
 * 输入：apps/web/public/icons/icon.svg
 * 输出：
 *   - apps/web/public/icons/icon-192.png
 *   - apps/web/public/icons/icon-512.png
 *   - apps/web/public/icons/icon-maskable-192.png
 *   - apps/web/public/icons/icon-maskable-512.png
 *
 * maskable 图标说明：
 * maskable 图标需要更大的安全区域（内容仅占 80%），
 * 因此在 SVG 外围添加白色边距，确保裁剪后内容完整。
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));

/** 图标源文件路径 */
const SVG_PATH = join(__dirname, '..', 'apps', 'web', 'public', 'icons', 'icon.svg');
/** 图标输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'icons');

/** 需要生成的图标尺寸 */
const SIZES = [192, 512];

/**
 * 生成普通 PNG 图标
 *
 * 输入：SVG 文件内容
 * 输出：多尺寸 PNG 文件
 * 流程：读取 SVG -> 按尺寸转换 -> 写入文件
 */
async function generateNormalIcons(svgBuffer) {
  for (const size of SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-${size}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
    console.log(`  生成: icon-${size}.png`);
  }
}

/**
 * 生成 maskable PNG 图标
 *
 * maskable 图标需要内容仅占 80% 区域，外围留白。
 * 通过在 SVG 外围添加白色背景边距实现。
 *
 * 输入：SVG 文件内容
 * 输出：多尺寸 maskable PNG 文件
 */
async function generateMaskableIcons(svgBuffer) {
  for (const size of SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-maskable-${size}.png`);
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round((size - innerSize) / 2);

    /** 创建白色背景画布，将原图标缩放后居中放置 */
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 250, g: 250, b: 250, alpha: 1 },
      },
    })
      .composite([
        {
          input: await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer(),
          top: padding,
          left: padding,
        },
      ])
      .png()
      .toFile(outputPath);
    console.log(`  生成: icon-maskable-${size}.png`);
  }
}

/**
 * 主函数：生成全部 PWA 图标
 */
async function main() {
  console.log('开始生成 PWA 图标...');

  try {
    const svgBuffer = await readFile(SVG_PATH);
    await mkdir(OUTPUT_DIR, { recursive: true });

    await generateNormalIcons(svgBuffer);
    await generateMaskableIcons(svgBuffer);

    console.log('PWA 图标生成完成。');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('sharp')) {
      console.warn('警告: sharp 未安装，跳过 PNG 图标生成。');
      console.warn('PWA 将仅使用 SVG 图标（现代浏览器支持）。');
      console.warn('如需 PNG 图标，请运行: npm install -D sharp');
      return;
    }
    console.error('图标生成失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);
