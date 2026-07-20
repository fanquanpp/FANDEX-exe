/**
 * remark-term-link 插件
 *
 * 功能概述：
 * 在 Markdown 构建时扫描文本节点，匹配术语表中的术语，
 * 将匹配到的术语文本替换为带有 data 属性的 HTML span 元素。
 * 运行时仅需绑定交互事件，无需再扫描 DOM 或加载术语数据。
 *
 * 处理流程：
 * 1. 构建时读取 metadata/glossary/*.json 的术语数据
 * 2. 递归遍历 Markdown AST 的文本节点
 * 3. 跳过链接、标题、代码块内的文本
 * 4. 使用正则匹配术语（长词优先）
 * 5. 将匹配到的术语替换为 <span class="term-tip"> HTML 节点
 * 6. 限制每篇文档最多标记 50 个术语
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HTML, Node, Parent, Root, Text } from 'mdast';

/** 术语数据接口 */
interface TermData {
  /** 术语所属模块 ID */
  module: string;
  /** 术语定义 */
  def: string;
  /** 术语页面 slug */
  slug: string;
}

/** 术语数据模块接口（对应 metadata/glossary/*.json 格式） */
interface GlossaryModule {
  /** 模块 ID */
  moduleId: string;
  /** 术语列表 */
  terms: Array<{
    /** 术语名称 */
    name: string;
    /** 术语定义 */
    definition: string;
    /** 术语页面 slug */
    slug: string;
  }>;
}

/** 每篇文档最多标记的术语数量 */
const MAX_MATCHES = 50;

/** 允许标记术语的 MDAST 短语容器类型（文本节点的直接父节点） */
const PHRASING_CONTAINER_TYPES = new Set(['paragraph', 'tableCell']);

/**
 * 从 metadata/glossary/ 目录加载术语数据
 *
 * 输入：项目根目录路径
 * 输出：术语名到术语数据的 Map
 * 流程：读取目录下所有 .json 文件，解析并合并为统一索引
 *
 * @param baseDir - 项目根目录路径
 * @returns 术语名到术语数据的映射
 */
function loadGlossaryData(baseDir: string): Map<string, TermData> {
  const glossaryDir = join(baseDir, 'metadata', 'glossary');
  const glossaryMap = new Map<string, TermData>();

  if (!existsSync(glossaryDir)) {
    return glossaryMap;
  }

  const files = readdirSync(glossaryDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = join(glossaryDir, file);
    const content = readFileSync(filePath, 'utf-8');
    const moduleData: GlossaryModule = JSON.parse(content);

    for (const term of moduleData.terms) {
      /* 保留首次出现的术语（与 build-glossary-index.mjs 去重逻辑一致） */
      if (!glossaryMap.has(term.name)) {
        glossaryMap.set(term.name, {
          module: moduleData.moduleId,
          def: term.definition,
          slug: term.slug,
        });
      }
    }
  }

  return glossaryMap;
}

/**
 * 构建术语匹配正则表达式（长词优先匹配）
 *
 * 输入：术语名列表
 * 输出：匹配术语的正则表达式
 * 流程：按长度降序排列术语，转义特殊字符，拼接为交替匹配模式
 *
 * @param terms - 术语名列表
 * @returns 匹配术语的正则表达式
 */
function buildTermRegex(terms: string[]): RegExp {
  if (terms.length === 0) {
    /* 空正则，永不匹配 */
    return /(?:)/;
  }

  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const pattern = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`(?:^|\\W)(${pattern})(?:$|\\W)`, 'g');
}

/**
 * 转义 HTML 文本中的特殊字符
 *
 * 输入：原始字符串
 * 输出：转义后的安全 HTML 字符串
 *
 * @param str - 原始字符串
 * @returns 转义后的字符串
 */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 转义 HTML 属性值中的特殊字符
 *
 * 输入：原始字符串
 * 输出：转义后可安全用于 HTML 属性值的字符串
 *
 * @param str - 原始字符串
 * @returns 转义后的字符串
 */
function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 递归遍历上下文：跟踪当前是否在链接/标题/段落内 */
interface WalkContext {
  /** 是否在链接节点内 */
  inLink: boolean;
  /** 是否在标题节点内 */
  inHeading: boolean;
  /** 是否在允许标记术语的短语容器内（paragraph / tableCell） */
  inParagraph: boolean;
}

/**
 * 处理文本节点中的术语匹配，生成替换节点列表
 *
 * 输入：文本节点、术语数据映射、匹配正则、当前匹配计数
 * 输出：替换节点列表（text + html 交替），若无需替换则返回 null
 * 流程：
 * 1. 使用正则在文本中查找所有术语匹配
 * 2. 按位置排序，去除重叠匹配
 * 3. 将文本拆分为 [普通文本, 术语HTML, 普通文本, ...] 序列
 *
 * @param textNode - 待处理的文本节点
 * @param glossaryMap - 术语数据映射
 * @param regex - 术语匹配正则
 * @param matchCount - 当前匹配计数（引用传递）
 * @returns 替换节点列表，或 null 表示无需替换
 */
function processTextMatch(
  textNode: Text,
  glossaryMap: Map<string, TermData>,
  regex: RegExp,
  matchCount: { value: number },
): Array<Text | HTML> | null {
  const text = textNode.value;
  if (!text || text.trim().length < 2) return null;

  /* 重置正则状态 */
  regex.lastIndex = 0;

  /* 收集所有匹配结果 */
  const matches: Array<{
    /** 术语名 */
    term: string;
    /** 术语在文本中的起始位置 */
    start: number;
    /** 术语在文本中的结束位置 */
    end: number;
    /** 术语数据 */
    data: TermData;
  }> = [];

  let match: RegExpExecArray | null = regex.exec(text);
  while (match !== null) {
    if (matchCount.value + matches.length >= MAX_MATCHES) break;

    const term = match[1];
    const termOffset = match[0].indexOf(term);
    const start = match.index + termOffset;
    const end = start + term.length;

    const data = glossaryMap.get(term);
    if (!data) {
      match = regex.exec(text);
      continue;
    }

    /* 跳过重叠匹配（与前一个匹配的结束位置重叠） */
    if (matches.length > 0 && start < matches[matches.length - 1].end) {
      match = regex.exec(text);
      continue;
    }

    matches.push({ term, start, end, data });

    /* 调整 lastIndex 到术语结束位置，避免吞没后续可匹配的字符 */
    regex.lastIndex = end;
    match = regex.exec(text);
  }

  if (matches.length === 0) return null;

  /* 构建替换节点列表 */
  const nodes: Array<Text | HTML> = [];
  let lastIndex = 0;

  for (const { term, start, end, data } of matches) {
    /* 匹配前的普通文本 */
    if (start > lastIndex) {
      nodes.push({
        type: 'text',
        value: text.substring(lastIndex, start),
      });
    }

    /* 术语 HTML 节点：包含 abbr 子元素以兼容现有 CSS 样式 */
    nodes.push({
      type: 'html',
      value:
        `<span class="term-tip" data-term="${escapeAttr(term)}" data-module="${escapeAttr(data.module)}" data-def="${escapeAttr(data.def)}" data-slug="${escapeAttr(data.slug)}" tabindex="0">` +
        `<abbr class="term-abbr">${escapeHtml(term)}</abbr></span>`,
    });

    lastIndex = end;
    matchCount.value++;
  }

  /* 最后一个匹配后的普通文本 */
  if (lastIndex < text.length) {
    nodes.push({
      type: 'text',
      value: text.substring(lastIndex),
    });
  }

  return nodes;
}

/**
 * 递归遍历 MDAST 节点树，标记术语
 *
 * 输入：节点子数组、遍历上下文、术语数据、正则、匹配计数
 * 输出：无（直接修改节点树）
 * 流程：
 * 1. 反向遍历子节点（避免 splice 导致索引偏移）
 * 2. 对文本节点：检查上下文，若允许则执行术语匹配
 * 3. 对容器节点：递归遍历其子节点，传递更新后的上下文
 *
 * @param children - 当前层级的子节点数组
 * @param ctx - 遍历上下文
 * @param glossaryMap - 术语数据映射
 * @param regex - 术语匹配正则
 * @param matchCount - 当前匹配计数（引用传递）
 */
function walkAndMark(
  children: Node[],
  ctx: WalkContext,
  glossaryMap: Map<string, TermData>,
  regex: RegExp,
  matchCount: { value: number },
): void {
  /* 反向遍历，避免 splice 导致索引偏移 */
  for (let i = children.length - 1; i >= 0; i--) {
    if (matchCount.value >= MAX_MATCHES) return;

    const node = children[i];

    if (node.type === 'text') {
      /* 跳过链接内、标题内、非段落内的文本 */
      if (ctx.inLink || ctx.inHeading || !ctx.inParagraph) continue;

      const textNode = node as Text;
      const replacements = processTextMatch(textNode, glossaryMap, regex, matchCount);
      if (replacements && replacements.length > 0) {
        children.splice(i, 1, ...replacements);
      }
    } else if ('children' in node) {
      const parent = node as Parent;
      const childCtx: WalkContext = {
        inLink: ctx.inLink || parent.type === 'link',
        inHeading: ctx.inHeading || parent.type === 'heading',
        inParagraph: ctx.inParagraph || PHRASING_CONTAINER_TYPES.has(parent.type),
      };
      walkAndMark(parent.children, childCtx, glossaryMap, regex, matchCount);
    }
  }
}

/**
 * remark-term-link 插件：在构建时将 Markdown 中的术语标记为可交互的 HTML 元素
 *
 * 输入：项目根目录路径（用于定位 metadata/glossary/）
 * 输出：remark 插件函数
 * 流程：
 * 1. 加载术语数据并构建匹配正则
 * 2. 遍历 Markdown AST，在文本节点中匹配术语
 * 3. 将匹配到的术语替换为带 data 属性的 HTML span 元素
 *
 * @param baseDir - 项目根目录路径
 * @returns remark 插件函数
 */
export function remarkTermLink(baseDir: string) {
  const glossaryMap = loadGlossaryData(baseDir);

  /* 无术语数据时返回空操作插件 */
  if (glossaryMap.size === 0) {
    return () => {};
  }

  const regex = buildTermRegex([...glossaryMap.keys()]);

  return (tree: Root) => {
    const matchCount = { value: 0 };
    const ctx: WalkContext = {
      inLink: false,
      inHeading: false,
      inParagraph: false,
    };
    walkAndMark(tree.children, ctx, glossaryMap, regex, matchCount);
  };
}
