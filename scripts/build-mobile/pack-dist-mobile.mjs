/**
 * FANDEX 移动端产物打包脚本
 *
 * 功能概述：
 * 将 dist-mobile/ 目录打包为 dist-mobile.zip，
 * 供 FANDEX-App 仓库下载并解压到 assets/dist-mobile/。
 *
 * 实现方案：
 * 使用纯 Node.js 实现 ZIP 文件格式（无外部依赖）。
 * ZIP 格式由三部分组成：本地文件头 + 文件数据 + 中央目录。
 * 文件数据使用 STORE 方法（无压缩），因为 JSON/HTML 本身压缩率有限，
 * 且避免引入 zlib 压缩的复杂性。如需压缩，可后续集成 archiver。
 *
 * 流程：
 * 1. 检查 dist-mobile/ 目录是否存在
 * 2. 递归遍历目录，收集所有文件
 * 3. 写入 ZIP 本地文件头和文件数据
 * 4. 写入 ZIP 中央目录
 * 5. 写入中央目录结束记录
 * 6. 输出文件大小统计
 */

import { readdir, stat, unlink, readFile } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createWriteStream } from 'node:fs';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 项目根目录 */
const ROOT_DIR = join(__dirname, '..', '..');
/** 移动端产物目录 */
const DIST_MOBILE_DIR = join(ROOT_DIR, 'dist-mobile');
/** 输出压缩包路径 */
const OUTPUT_FILE = join(ROOT_DIR, 'dist-mobile.zip');

/** ZIP 本地文件头签名 */
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
/** ZIP 中央目录文件头签名 */
const CENTRAL_DIR_HEADER_SIGNATURE = 0x02014b50;
/** ZIP 中央目录结束记录签名 */
const END_OF_CENTRAL_DIR_SIGNATURE = 0x06054b50;
/** ZIP 版本号（2.0） */
const ZIP_VERSION = 0x0014;
/** 压缩方法：STORE（无压缩） */
const COMPRESSION_METHOD_STORE = 0;

/**
 * 格式化文件大小为人类可读字符串
 *
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的大小字符串（如 "1.23 MB"）
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 计算 CRC32 校验值
 * 使用标准 CRC32 多项式 0xEDB88320
 *
 * @param {Buffer} buffer - 输入数据
 * @returns {number} CRC32 校验值
 */
function crc32(buffer) {
  /** CRC32 查找表 */
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * 将路径分隔符统一为正斜杠（ZIP 规范要求）
 *
 * @param {string} filePath - 文件路径
 * @returns {string} 使用正斜杠的路径
 */
function normalizeZipPath(filePath) {
  return filePath.split(sep).join('/');
}

/**
 * 递归收集目录下所有文件的相对路径
 *
 * @param {string} dir - 目录路径
 * @param {string} baseDir - 基准目录（用于计算相对路径）
 * @returns {Promise<string[]>} 相对路径数组
 */
async function collectFiles(dir, baseDir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      files.push(relative(baseDir, fullPath));
    }
  }

  return files;
}

/**
 * 向 Buffer 写入 Uint16（小端序）
 *
 * @param {Buffer} buf - 目标 Buffer
 * @param {number} offset - 写入偏移
 * @param {number} value - 要写入的值
 */
function writeUint16LE(buf, offset, value) {
  buf.writeUInt16LE(value, offset);
}

/**
 * 向 Buffer 写入 Uint32（小端序）
 *
 * @param {Buffer} buf - 目标 Buffer
 * @param {number} offset - 写入偏移
 * @param {number} value - 要写入的值
 */
function writeUint32LE(buf, offset, value) {
  buf.writeUInt32LE(value, offset);
}

/**
 * 主函数：打包 dist-mobile/ 为 dist-mobile.zip
 *
 * 流程：
 * 1. 检查源目录
 * 2. 收集所有文件
 * 3. 逐个写入 ZIP 条目（本地文件头 + 数据）
 * 4. 写入中央目录
 * 5. 写入中央目录结束记录
 * 6. 输出统计
 */
async function main() {
  console.log('=== FANDEX 移动端产物打包 ===');

  // 步骤 1：检查源目录
  if (!existsSync(DIST_MOBILE_DIR)) {
    console.error('错误: dist-mobile/ 目录不存在，请先运行 export-mobile-content');
    process.exit(1);
  }

  // 步骤 2：删除已有的 zip 文件
  if (existsSync(OUTPUT_FILE)) {
    console.log('删除已有的 dist-mobile.zip...');
    await unlink(OUTPUT_FILE);
  }

  // 步骤 3：收集所有文件
  const relativeFiles = await collectFiles(DIST_MOBILE_DIR, DIST_MOBILE_DIR);
  console.log(`收集到 ${relativeFiles.length} 个文件`);

  if (relativeFiles.length === 0) {
    console.error('错误: dist-mobile/ 目录为空');
    process.exit(1);
  }

  // 步骤 4：创建 ZIP 文件
  const writeStream = createWriteStream(OUTPUT_FILE);

  /** 中央目录条目列表 */
  const centralDirEntries = [];
  /** 当前写入偏移 */
  let offset = 0;

  /**
   * 向输出流写入 Buffer 并更新偏移
   *
   * @param {Buffer} buf - 要写入的数据
   */
  function writeBuffer(buf) {
    writeStream.write(buf);
    offset += buf.length;
  }

  // 步骤 5：逐个写入文件条目
  for (const relPath of relativeFiles) {
    const fullPath = join(DIST_MOBILE_DIR, relPath);
    const fileContent = await readFile(fullPath);
    const zipPath = normalizeZipPath(relPath);
    const pathBuffer = Buffer.from(zipPath, 'utf-8');
    const crcValue = crc32(fileContent);
    const fileSize = fileContent.length;

    // 写入本地文件头（30 字节固定头 + 文件名）
    const localHeader = Buffer.alloc(30 + pathBuffer.length);
    writeUint32LE(localHeader, 0, LOCAL_FILE_HEADER_SIGNATURE);   // 签名
    writeUint16LE(localHeader, 4, 0x0014);                         // 解压所需版本
    writeUint16LE(localHeader, 6, 0);                              // 通用位标志
    writeUint16LE(localHeader, 8, COMPRESSION_METHOD_STORE);       // 压缩方法
    writeUint16LE(localHeader, 10, 0);                              // 最后修改时间
    writeUint16LE(localHeader, 12, 0);                              // 最后修改日期
    writeUint32LE(localHeader, 14, crcValue);                       // CRC-32
    writeUint32LE(localHeader, 18, fileSize);                       // 压缩大小
    writeUint32LE(localHeader, 22, fileSize);                       // 原始大小
    writeUint16LE(localHeader, 26, pathBuffer.length);              // 文件名长度
    writeUint16LE(localHeader, 28, 0);                              // 额外字段长度
    pathBuffer.copy(localHeader, 30);                               // 文件名

    const localHeaderOffset = offset;

    writeBuffer(localHeader);
    writeBuffer(fileContent);

    // 保存中央目录条目信息
    centralDirEntries.push({
      zipPath: pathBuffer,
      crcValue,
      fileSize,
      localHeaderOffset,
    });
  }

  // 步骤 6：写入中央目录
  const centralDirStart = offset;

  for (const entry of centralDirEntries) {
    const centralHeader = Buffer.alloc(46 + entry.zipPath.length);
    writeUint32LE(centralHeader, 0, CENTRAL_DIR_HEADER_SIGNATURE); // 签名
    writeUint16LE(centralHeader, 4, ZIP_VERSION);                    // 制作版本
    writeUint16LE(centralHeader, 6, 0x0014);                        // 解压所需版本
    writeUint16LE(centralHeader, 8, 0);                              // 通用位标志
    writeUint16LE(centralHeader, 10, COMPRESSION_METHOD_STORE);     // 压缩方法
    writeUint16LE(centralHeader, 12, 0);                             // 最后修改时间
    writeUint16LE(centralHeader, 14, 0);                             // 最后修改日期
    writeUint32LE(centralHeader, 16, entry.crcValue);                // CRC-32
    writeUint32LE(centralHeader, 20, entry.fileSize);                // 压缩大小
    writeUint32LE(centralHeader, 24, entry.fileSize);                // 原始大小
    writeUint16LE(centralHeader, 28, entry.zipPath.length);          // 文件名长度
    writeUint16LE(centralHeader, 30, 0);                             // 额外字段长度
    writeUint16LE(centralHeader, 32, 0);                             // 文件注释长度
    writeUint16LE(centralHeader, 34, 0);                             // 磁盘号起始
    writeUint16LE(centralHeader, 36, 0);                             // 内部文件属性
    writeUint32LE(centralHeader, 38, 0);                             // 外部文件属性
    writeUint32LE(centralHeader, 42, entry.localHeaderOffset);       // 本地文件头偏移
    entry.zipPath.copy(centralHeader, 46);                           // 文件名

    writeBuffer(centralHeader);
  }

  const centralDirSize = offset - centralDirStart;

  // 步骤 7：写入中央目录结束记录
  const endRecord = Buffer.alloc(22);
  writeUint32LE(endRecord, 0, END_OF_CENTRAL_DIR_SIGNATURE);       // 签名
  writeUint16LE(endRecord, 4, 0);                                    // 磁盘号
  writeUint16LE(endRecord, 6, 0);                                    // 中央目录起始磁盘号
  writeUint16LE(endRecord, 8, centralDirEntries.length);             // 本磁盘中央目录记录数
  writeUint16LE(endRecord, 10, centralDirEntries.length);            // 中央目录总记录数
  writeUint32LE(endRecord, 12, centralDirSize);                      // 中央目录大小
  writeUint32LE(endRecord, 16, centralDirStart);                     // 中央目录偏移
  writeUint16LE(endRecord, 20, 0);                                   // 注释长度

  writeBuffer(endRecord);

  // 等待写入完成
  await new Promise((resolve, reject) => {
    writeStream.end((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // 步骤 8：输出统计
  const zipStat = await stat(OUTPUT_FILE);
  let sourceSize = 0;
  for (const relPath of relativeFiles) {
    const fullPath = join(DIST_MOBILE_DIR, relPath);
    const fStat = await stat(fullPath);
    sourceSize += fStat.size;
  }

  const compressionRatio = ((1 - zipStat.size / sourceSize) * 100).toFixed(1);
  console.log('\n=== 打包完成 ===');
  console.log(`文件数: ${relativeFiles.length}`);
  console.log(`源目录大小: ${formatFileSize(sourceSize)}`);
  console.log(`压缩包大小: ${formatFileSize(zipStat.size)}`);
  console.log(`压缩率: ${compressionRatio}%`);
  console.log(`输出路径: ${OUTPUT_FILE}`);
}

main().catch(console.error);
