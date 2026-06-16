/**
 * FANDEX 模块文档索引构建脚本
 *
 * 功能概述：
 * 扫描 content 下所有 .md/.mdx 文件，提取 frontmatter 中的元数据
 * （模块标识、标题、排序号），按模块分组生成 JSON 索引文件，
 * 输出到 apps/web/public/data/module-docs.json。
 * 供 Sidebar 模块视图懒加载使用，客户端按需 fetch 对应模块的文档列表。
 *
 * 数据来源：
 * content/ 目录下的 Markdown 文件，frontmatter 中包含 module、title、order 字段
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url))
/** 文档源文件目录 */
const DOCS_DIR = join(__dirname, '..', 'content')
/** 索引输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'data')
/** 索引输出文件路径 */
const OUTPUT_FILE = join(OUTPUT_DIR, 'module-docs.json')

/**
 * 递归遍历目录，对匹配扩展名的文件执行回调
 * @param {string} dir - 要遍历的目录路径
 * @param {string} ext - 文件扩展名（如 '.md'）
 * @param {Function} fn - 对每个匹配文件执行的异步回调
 */
async function walkDir(dir, ext, fn) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkDir(full, ext, fn)
    } else if (entry.name.endsWith(ext)) {
      await fn(full)
    }
  }
}

/**
 * 解析 Markdown 文件的 frontmatter
 * 简易 YAML 解析器，支持键值对和数组格式
 *
 * @param {string} content - Markdown 文件完整内容
 * @returns {Object} 解析后的 frontmatter 键值对对象
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const raw = match[1]
  const data = {}
  let key = null
  let inArray = false
  let arrayVals = []

  for (const line of raw.split('\n')) {
    if (inArray) {
      // 尝试匹配数组项 "  - value"
      const itemMatch = line.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/)
      if (itemMatch) {
        arrayVals.push(itemMatch[1])
        continue
      }
      // 数组结束，保存收集到的值
      if (key) data[key] = arrayVals
      inArray = false
      key = null
      arrayVals = []
    }
    // 匹配键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (kvMatch) {
      const k = kvMatch[1]
      const v = kvMatch[2].trim()
      if (v === '') {
        // 空值表示数组开始
        key = k
        inArray = true
        arrayVals = []
      } else {
        // 有值则直接存储，去除引号
        data[k] = v.replace(/^['"]|['"]$/g, '')
      }
    }
  }
  // 处理文件末尾仍在解析的数组
  if (inArray && key) data[key] = arrayVals
  return data
}

/**
 * 从文件路径提取 slug（文件名去除扩展名）
 *
 * @param {string} filePath - 文件绝对路径
 * @returns {string} slug 字符串（如 "概述与核心特性"）
 */
function slugFromPath(filePath) {
  const parts = filePath.replace(/[/\\]/g, '/').split('/')
  const name = parts[parts.length - 1]
  return name.replace(/\.mdx?$/, '')
}

/**
 * 主函数：构建模块文档索引
 * 输出格式：{ "redis": [{ slug, title, order }, ...], "git": [...] }
 */
async function main() {
  /** 按模块分组的文档列表 */
  const moduleDocs = {}

  // 遍历所有 .md 文件
  await walkDir(DOCS_DIR, '.md', async (filePath) => {
    const content = await readFile(filePath, 'utf-8')
    const fm = parseFrontmatter(content)
    if (!fm.title || !fm.module) return // 跳过无标题或无模块的文件

    const moduleId = typeof fm.module === 'string' ? fm.module : ''
    const title = typeof fm.title === 'string' ? fm.title : ''
    const order = typeof fm.order === 'string' ? Number(fm.order) || 0 : 0
    const slug = `${moduleId}/${slugFromPath(filePath)}`

    if (!moduleId) return

    if (!moduleDocs[moduleId]) {
      moduleDocs[moduleId] = []
    }
    moduleDocs[moduleId].push({ slug, title, order })
  })

  // 遍历所有 .mdx 文件
  await walkDir(DOCS_DIR, '.mdx', async (filePath) => {
    const content = await readFile(filePath, 'utf-8')
    const fm = parseFrontmatter(content)
    if (!fm.title || !fm.module) return

    const moduleId = typeof fm.module === 'string' ? fm.module : ''
    const title = typeof fm.title === 'string' ? fm.title : ''
    const order = typeof fm.order === 'string' ? Number(fm.order) || 0 : 0
    const slug = `${moduleId}/${slugFromPath(filePath)}`

    if (!moduleId) return

    if (!moduleDocs[moduleId]) {
      moduleDocs[moduleId] = []
    }
    moduleDocs[moduleId].push({ slug, title, order })
  })

  // 对每个模块内的文档按 order 排序
  for (const moduleId of Object.keys(moduleDocs)) {
    moduleDocs[moduleId].sort((a, b) => a.order - b.order)
  }

  // 确保输出目录存在并写入索引文件
  await mkdir(OUTPUT_DIR, { recursive: true })
  const json = JSON.stringify(moduleDocs)
  await writeFile(OUTPUT_FILE, json, 'utf-8')

  const moduleCount = Object.keys(moduleDocs).length
  const docCount = Object.values(moduleDocs).reduce((sum, docs) => sum + docs.length, 0)
  console.log(`Module docs index: ${moduleCount} modules, ${docCount} docs written to ${OUTPUT_FILE}`)
}

main().catch(console.error)
