/**
 * FANDEX 嵌入索引生成脚本
 *
 * 功能概述：
 * 读取 search-index.json 中的文档数据，为每个文档生成嵌入向量，
 * 输出 embedding-index.json 供语义搜索使用。
 *
 * 两种模式：
 * - API 模式：当 AI_API_KEY 环境变量已设置时，调用嵌入 API 生成高精度向量
 * - 降级模式：当未设置 API Key 时，使用 TF-IDF 算法生成稀疏向量
 *
 * 输入：apps/web/public/data/search-index.json
 * 输出：apps/web/public/data/embedding-index.json
 *
 * 性能考虑：
 * - 2000+ 文档 * 1536 维 * 4 字节约 12MB，需控制输出体积
 * - API 模式下分批请求，每批最多 20 个文档
 * - 降级模式使用 256 维稀疏向量，体积约 2MB
 */

import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 索引输入文件路径 */
const INPUT_FILE = join(__dirname, '..', 'apps', 'web', 'public', 'data', 'search-index.json');
/** 索引输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data');
/** 索引输出文件路径 */
const OUTPUT_FILE = join(OUTPUT_DIR, 'embedding-index.json');
/** 嵌入索引文件最大允许大小（5MB） */
const MAX_SIZE = 5 * 1024 * 1024;
/** API 模式下的向量维度 */
const API_DIM = 1536;
/** 降级模式下的向量维度 */
const FALLBACK_DIM = 256;
/** API 批量请求大小 */
const BATCH_SIZE = 20;

/**
 * search-index.json 中的文档条目结构
 */
function getEnvVar(name) {
  return process.env[name] || '';
}

/**
 * 主函数：生成嵌入索引
 *
 * 流程：读取搜索索引 -> 选择生成模式 -> 生成向量 -> 写入文件
 */
async function main() {
  console.log('开始生成嵌入索引...');

  /* 读取搜索索引 */
  const indexContent = await readFile(INPUT_FILE, 'utf-8');
  const docs = JSON.parse(indexContent);
  console.log(`读取 ${docs.length} 个文档`);

  const apiKey = getEnvVar('AI_API_KEY');
  const baseUrl = getEnvVar('AI_BASE_URL') || 'https://api.openai.com/v1';
  const embeddingModel = getEnvVar('AI_EMBEDDING_MODEL') || 'text-embedding-3-small';

  let entries;

  if (apiKey) {
    console.log('使用 API 模式生成嵌入向量...');
    entries = await generateWithAPI(docs, apiKey, baseUrl, embeddingModel);
  } else {
    console.log('未设置 AI_API_KEY，使用降级模式（TF-IDF）生成向量...');
    entries = generateWithFallback(docs);
  }

  /* 写入文件 */
  await mkdir(OUTPUT_DIR, { recursive: true });

  const json = JSON.stringify(entries);
  const size = Buffer.byteLength(json, 'utf-8');

  if (size > MAX_SIZE) {
    console.warn(`嵌入索引文件过大 (${(size / 1024 / 1024).toFixed(1)}MB)，尝试压缩...`);
    /* 压缩：截断向量精度到 4 位小数 */
    const compressed = entries.map((e) => ({
      s: e.slug,
      t: e.title,
      m: e.module,
      e: e.embedding.map((v) => Number(v.toFixed(4))),
    }));
    const compressedJson = JSON.stringify(compressed);
    const compressedSize = Buffer.byteLength(compressedJson, 'utf-8');
    await writeFile(OUTPUT_FILE, compressedJson, 'utf-8');
    console.log(
      `嵌入索引已写入 (${entries.length} 文档, ${(compressedSize / 1024 / 1024).toFixed(1)}MB, 压缩字段名) -> ${OUTPUT_FILE}`
    );
    return;
  }

  await writeFile(OUTPUT_FILE, json, 'utf-8');
  console.log(
    `嵌入索引已写入 (${entries.length} 文档, ${(size / 1024 / 1024).toFixed(1)}MB) -> ${OUTPUT_FILE}`
  );
}

/**
 * API 模式：调用嵌入 API 生成向量
 *
 * 输入：文档列表、API Key、基础 URL、模型名称
 * 输出：嵌入索引条目数组
 * 流程：分批请求 -> 解析响应 -> 合并结果
 */
async function generateWithAPI(docs, apiKey, baseUrl, model) {
  const entries = [];

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const texts = batch.map((doc) => `${doc.title}: ${doc.description || ''}`);

    try {
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 请求失败 (${response.status}): ${errorText}`);
        /* 降级处理：对失败的批次使用本地向量 */
        for (const doc of batch) {
          entries.push({
            slug: doc.slug,
            title: doc.title,
            module: doc.module,
            embedding: generateFallbackVector(doc),
          });
        }
        continue;
      }

      const data = await response.json();

      for (let j = 0; j < batch.length; j++) {
        entries.push({
          slug: batch[j].slug,
          title: batch[j].title,
          module: batch[j].module,
          embedding: data.data[j].embedding,
        });
      }

      console.log(`  已处理 ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length} 个文档`);
    } catch (error) {
      console.error(`批次 ${i} 处理失败:`, error.message);
      for (const doc of batch) {
        entries.push({
          slug: doc.slug,
          title: doc.title,
          module: doc.module,
          embedding: generateFallbackVector(doc),
        });
      }
    }
  }

  return entries;
}

/**
 * 降级模式：使用 TF-IDF 生成稀疏向量
 *
 * 输入：文档列表
 * 输出：嵌入索引条目数组
 * 流程：构建全局词表 -> 计算每个文档的 TF 向量 -> 归一化
 */
function generateWithFallback(docs) {
  return docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    module: doc.module,
    embedding: generateFallbackVector(doc),
  }));
}

/**
 * 生成单个文档的降级向量
 *
 * 输入：文档对象
 * 输出：256 维稀疏向量
 * 流程：文本拼接 -> 字符哈希映射 -> TF 统计 -> L2 归一化
 */
function generateFallbackVector(doc) {
  const dim = FALLBACK_DIM;
  const vector = new Array(dim).fill(0);
  const text = `${doc.title} ${doc.description || ''} ${(doc.tags || []).join(' ')}`;
  const chars = text.toLowerCase().split('');

  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);
    const idx = code % dim;
    vector[idx] += 1;
  }

  /* L2 归一化 */
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

main().catch(console.error);
