/**
 * FANDEX 术语表索引构建脚本
 *
 * 功能概述：
 * 读取 metadata/glossary/ 下各模块的 JSON 文件，
 * 合并所有术语为一个索引对象（键为术语名，值为 { module, def, slug }），
 * 输出到 public/data/glossary-index.json。供前端术语提示/弹窗功能使用。
 *
 * 数据来源：
 * 术语数据由 scripts/extract-glossary-data.mjs 从 Markdown 源文件抽取生成，
 * 存储在 metadata/glossary/{moduleId}.json 中。
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 术语数据 JSON 目录（由 extract-glossary-data.mjs 生成） */
const GLOSSARY_DATA_DIR = join(__dirname, '..', 'metadata', 'glossary');
/** 索引输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data');
/** 索引输出文件路径 */
const OUTPUT_FILE = join(OUTPUT_DIR, 'glossary-index.json');

/**
 * 主函数：从 metadata/glossary/*.json 读取术语数据，合并为索引
 */
async function main() {
  const allTerms = {};

  // 读取术语数据目录下的所有 .json 文件
  const files = await readdir(GLOSSARY_DATA_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const filePath = join(GLOSSARY_DATA_DIR, file);
    const content = await readFile(filePath, 'utf-8');

    /** @type {{ moduleId: string, terms: Array<{name: string, definition: string, slug: string}> }} */
    const moduleData = JSON.parse(content);
    const { moduleId, terms } = moduleData;

    // 将每个术语转换为索引格式并合并
    for (const term of terms) {
      allTerms[term.name] = {
        module: moduleId,
        def: term.definition,
        slug: term.slug,
      };
    }
  }

  // 确保输出目录存在并写入索引文件
  await mkdir(OUTPUT_DIR, { recursive: true });
  const json = JSON.stringify(allTerms);
  await writeFile(OUTPUT_FILE, json, 'utf-8');

  const count = Object.keys(allTerms).length;
  console.log(`Glossary index: ${count} terms written to ${OUTPUT_FILE}`);
}

main().catch(console.error);
