/**
 * rehype-image-optimize 插件
 *
 * 功能概述：
 * 优化 HTML 中的图片元素，提升性能和用户体验。
 *
 * 处理流程：
 * 1. 遍历 HAST 中所有 <img> 元素
 * 2. 为本地图片读取实际尺寸，设置 width/height 属性（防止 CLS）
 * 3. 添加 loading="lazy" 和 decoding="async" 属性
 * 4. 添加响应式样式 max-width:100%;height:auto
 *
 * 注意：
 * - 仅处理本地图片（src 不以 http 开头）
 * - 远程图片无法读取尺寸，仅添加 lazy/async 属性
 * - 图片尺寸通过解析文件二进制头部获取，无需 native 依赖
 * - 如果图片文件不存在，跳过尺寸设置
 */

import { closeSync, existsSync, openSync, readSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { Element, Properties, Root } from 'hast';
import { visit } from 'unist-util-visit';

/** 插件配置选项接口 */
interface RehypeImageOptimizeOptions {
  /** 项目根目录，用于解析本地图片路径 */
  baseDir?: string;
}

/**
 * 从文件二进制头部读取 JPEG 图片尺寸
 *
 * 输入：文件 Buffer
 * 输出：{ width, height } 或 null（解析失败时）
 * 流程：遍历 JPEG 段标记，查找 SOF0/SOF2 段获取尺寸
 */
function getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  /* JPEG 文件必须以 FFD8 开头 */
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length - 1) {
    /* 查找段标记 0xFF */
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];

    /* SOF0 (Baseline) 或 SOF2 (Progressive) 段包含尺寸信息 */
    if (marker === 0xc0 || marker === 0xc2) {
      /* SOF 段结构：标记(2) + 长度(2) + 精度(1) + 高度(2) + 宽度(2) */
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    /* SOS (Start of Scan) 段后为压缩数据，不再有段标记 */
    if (marker === 0xda) return null;

    /* 其他段：跳过段内容，读取段长度后移动偏移 */
    if ((marker >= 0xd0 && marker <= 0xd9) || marker === 0x00) {
      /* 无长度的标记（RST0-RST7、SOI、EOI、TEM） */
      offset += 2;
    } else {
      const segLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLength;
    }
  }

  return null;
}

/**
 * 从文件二进制头部读取 PNG 图片尺寸
 *
 * 输入：文件 Buffer
 * 输出：{ width, height } 或 null（解析失败时）
 * 流程：PNG IHDR 块固定在偏移 16 处，直接读取宽高
 */
function getPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  /* PNG 文件必须以 89504E47 签名开头 */
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4e || buffer[3] !== 0x47) {
    return null;
  }

  /* IHDR 块：宽度在偏移 16，高度在偏移 20（各 4 字节大端序） */
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

/**
 * 从文件二进制头部读取 GIF 图片尺寸
 *
 * 输入：文件 Buffer
 * 输出：{ width, height } 或 null（解析失败时）
 * 流程：GIF 逻辑屏幕描述符固定在偏移 6 处，直接读取宽高
 */
function getGifDimensions(buffer: Buffer): { width: number; height: number } | null {
  /* GIF 文件必须以 GIF87a 或 GIF89a 签名开头 */
  const signature = buffer.subarray(0, 6).toString('ascii');
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null;

  /* 逻辑屏幕描述符：宽度在偏移 6，高度在偏移 8（各 2 字节小端序） */
  const width = buffer.readUInt16LE(6);
  const height = buffer.readUInt16LE(8);
  return { width, height };
}

/**
 * 从文件二进制头部读取 WebP 图片尺寸
 *
 * 输入：文件 Buffer
 * 输出：{ width, height } 或 null（解析失败时）
 * 流程：解析 RIFF 容器，查找 VP8/VP8L/VP8X 块获取尺寸
 */
function getWebpDimensions(buffer: Buffer): { width: number; height: number } | null {
  /* WebP 文件必须以 RIFF 签名开头 */
  const riff = buffer.subarray(0, 4).toString('ascii');
  if (riff !== 'RIFF') return null;

  const webp = buffer.subarray(8, 12).toString('ascii');
  if (webp !== 'WEBP') return null;

  const chunkType = buffer.subarray(12, 16).toString('ascii');

  if (chunkType === 'VP8 ') {
    /* 有损格式：宽度/高度各 2 字节小端序，偏移 26/28 */
    if (buffer.length < 30) return null;
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }

  if (chunkType === 'VP8L') {
    /* 无损格式：宽高打包在 4 字节中 */
    if (buffer.length < 25) return null;
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  if (chunkType === 'VP8X') {
    /* 扩展格式：宽高各 3 字节，偏移 24/27 */
    if (buffer.length < 30) return null;
    const width = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1;
    const height = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1;
    return { width, height };
  }

  return null;
}

/** 需要读取的最大字节数（覆盖所有图片格式的头部尺寸信息） */
const HEADER_BYTES = 64;

/**
 * 读取文件头部指定字节数
 *
 * 输入：文件绝对路径、读取字节数
 * 输出：Buffer 或 null（文件不存在或读取失败时）
 * 流程：使用 openSync/readSync 仅读取文件头部，避免大文件的内存开销
 */
function readFileHeader(filePath: string, bytes: number): Buffer | null {
  try {
    if (!existsSync(filePath)) return null;

    const fd = openSync(filePath, 'r');
    const buffer = Buffer.alloc(bytes);
    try {
      readSync(fd, buffer, 0, bytes, 0);
      return buffer;
    } finally {
      closeSync(fd);
    }
  } catch {
    return null;
  }
}

/**
 * 根据文件扩展名读取图片尺寸
 *
 * 输入：文件绝对路径
 * 输出：{ width, height } 或 null（文件不存在或格式不支持时）
 * 流程：
 * 1. 读取文件前 64 字节（足够获取所有格式的尺寸信息）
 * 2. 根据扩展名调用对应的解析函数
 */
function getImageDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buffer = readFileHeader(filePath, HEADER_BYTES);
    if (!buffer) return null;

    const ext = extname(filePath).toLowerCase();

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return getJpegDimensions(buffer);
      case '.png':
        return getPngDimensions(buffer);
      case '.gif':
        return getGifDimensions(buffer);
      case '.webp':
        return getWebpDimensions(buffer);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * 创建 rehype-image-optimize 插件
 *
 * 输入：可选配置对象 { baseDir: string }
 * 输出：unified 插件函数（遍历 HAST 并优化 img 元素）
 * 流程：
 * 1. 遍历 HAST 中所有 <img> 元素
 * 2. 为本地图片读取实际尺寸，设置 width/height 属性（防止 CLS）
 * 3. 添加 loading="lazy" 和 decoding="async" 属性
 * 4. 添加响应式样式 max-width:100%;height:auto
 */
export function rehypeImageOptimize(options?: RehypeImageOptimizeOptions) {
  const baseDir = options?.baseDir ?? '';

  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;

      const props: Properties = node.properties ?? {};
      const src = typeof props.src === 'string' ? props.src : '';
      if (!src) return;

      /* 添加 lazy loading 和 async decoding（不覆盖已有属性） */
      if (!props.loading) {
        props.loading = 'lazy';
      }
      if (!props.decoding) {
        props.decoding = 'async';
      }

      /* 为本地图片读取实际尺寸，防止布局偏移（CLS） */
      const isRemoteImage = src.startsWith('http://') || src.startsWith('https://');
      if (!isRemoteImage && baseDir) {
        const imagePath = join(baseDir, src.startsWith('/') ? src.slice(1) : src);
        const dimensions = getImageDimensions(imagePath);
        if (dimensions) {
          if (!props.width) {
            props.width = dimensions.width;
          }
          if (!props.height) {
            props.height = dimensions.height;
          }
        }
      }

      /* 添加响应式样式（不覆盖已有样式） */
      if (!props.style) {
        props.style = 'max-width:100%;height:auto';
      }

      node.properties = props;
    });
  };
}
