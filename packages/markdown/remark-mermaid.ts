/**
 * remark-mermaid 插件
 *
 * 功能概述：
 * 在构建时将 Markdown 中的 Mermaid 代码块预渲染为 SVG，
 * 支持亮色/暗色双主题切换，消除客户端 Mermaid JS 依赖。
 * 预渲染后首屏不再需要加载约 200KB+ 的 Mermaid 运行时。
 *
 * 渲染流程：
 * 1. 遍历 Markdown AST，收集所有 language-mermaid 代码块
 * 2. 使用 mermaid Node.js API + svgdom 环境渲染 SVG
 * 3. 为每个代码块生成亮色（default）和暗色（dark）两套 SVG
 * 4. 将代码块替换为包含双主题 SVG 的 HTML 节点
 * 5. 渲染失败时保留原始代码文本作为回退展示
 *
 * 双 DOM 环境方案（参考 isomorphic-mermaid）：
 * - jsdom：为 DOMPurify 提供完整的 DOM API（TreeWalker 等）
 * - svgdom：为 Mermaid 渲染提供 SVG API（getBBox、getBoundingClientRect 等）
 * - DOMPurify 使用 jsdom 的 window 初始化，然后将 sanitize 方法
 *   复制到全局 DOMPurify 对象上，使 Mermaid 的 ESM 导入可以调用
 *
 * 主题切换机制：
 * - 亮色 SVG 添加 data-theme="light" 属性
 * - 暗色 SVG 添加 data-theme="dark" 属性
 * - 通过 CSS display 属性根据页面主题切换显示
 *
 * 注意：使用 createRequire 加载 mermaid、jsdom、svgdom，
 * 绕过 Vite SSR Module Runner（构建时可能已关闭导致动态 import 失败）
 */

import { createRequire } from 'node:module';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Code, Html, Parent } from 'mdast';

/** 使用 Node.js 原生 require 加载模块，绕过 Vite SSR Module Runner */
const nodeRequire = createRequire(import.meta.url);

/** 全局渲染计数器，确保 Mermaid 图表 SVG ID 全局唯一 */
let globalCounter = 0;

/** 标记 CSSStyleSheet polyfill 是否已安装 */
let polyfillInstalled = false;

/**
 * CSSStyleSheet 最小化 polyfill
 *
 * Mermaid v11 使用 CSSStyleSheet API（new CSSStyleSheet()、insertRule、cssRules、replaceSync），
 * 但 jsdom/svgdom 不支持该 API。此 polyfill 提供最小化实现，使 Mermaid 可以在 Node.js 环境中渲染。
 *
 * 实现说明：
 * - CSSRule 模拟：每条规则存储为包含 cssText 属性的对象
 * - insertRule(rule, index)：将规则插入到指定位置
 * - cssRules：返回规则列表（支持 .length 和 [i] 访问）
 * - replaceSync(cssText)：批量替换所有规则（按闭合大括号拆分）
 */
class CSSRulePolyfill {
  /** 规则文本 */
  cssText: string;

  constructor(cssText: string) {
    this.cssText = cssText;
  }
}

class CSSStyleSheetPolyfill {
  /** 规则列表 */
  cssRules: CSSRulePolyfill[];

  constructor() {
    this.cssRules = [];
  }

  /**
   * 插入 CSS 规则
   *
   * @param rule - CSS 规则文本
   * @param index - 插入位置
   * @returns 插入位置的索引
   */
  insertRule(rule: string, index: number): number {
    const normalizedIndex = Math.min(index, this.cssRules.length);
    this.cssRules.splice(normalizedIndex, 0, new CSSRulePolyfill(rule));
    return normalizedIndex;
  }

  /**
   * 批量替换 CSS 规则
   *
   * 将 CSS 文本按规则拆分并替换现有规则列表。
   * 简化实现：按闭合大括号拆分，过滤空行。
   *
   * @param cssText - 完整 CSS 文本
   */
  replaceSync(cssText: string): void {
    const rules = cssText
      .split('}')
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
      .map((r) => r + '}');
    this.cssRules = rules.map((r) => new CSSRulePolyfill(r));
  }
}

/**
 * 安装 CSSStyleSheet 全局 polyfill
 *
 * 在全局注入 CSSStyleSheet 构造函数，使 Mermaid v11 可以在 Node.js 环境中渲染。
 * 仅在 CSSStyleSheet 未定义时安装，避免覆盖浏览器环境。
 * 使用标记变量避免重复安装。
 */
function installCSSStyleSheetPolyfill(): void {
  if (polyfillInstalled) return;
  if (typeof globalThis.CSSStyleSheet === 'undefined') {
    (globalThis as Record<string, unknown>).CSSStyleSheet = CSSStyleSheetPolyfill;
  }
  polyfillInstalled = true;
}

/** Mermaid 双主题渲染结果 */
interface MermaidDualThemeResult {
  /** 亮色主题 SVG 字符串 */
  lightSvg: string;
  /** 暗色主题 SVG 字符串 */
  darkSvg: string;
}

/** 全局对象扩展类型（用于访问注入的 DOM 环境） */
type GlobalWithOptionalDom = typeof globalThis & {
  document?: Document;
  window?: Window & typeof globalThis;
};

/** mermaid 模块类型（仅声明需要的接口） */
interface MermaidApi {
  initialize(config: MermaidConfig): void;
  render(id: string, code: string): Promise<{ svg: string }>;
}

/** mermaid 初始化配置 */
interface MermaidConfig {
  startOnLoad: boolean;
  securityLevel: 'strict' | 'loose';
  theme: 'default' | 'dark' | 'forest' | 'neutral';
  htmlLabels?: boolean;
  flowchart?: { htmlLabels?: boolean };
}

/** mermaid 模块缓存（延迟加载，避免无 mermaid 代码块时的不必要开销） */
let cachedMermaid: MermaidApi | null = null;

/** 标记 Mermaid 环境是否已初始化 */
let environmentInitialized = false;

/**
 * 初始化 Mermaid 渲染所需的 Node.js 环境
 *
 * Mermaid v11 的 ESM 依赖链需要两类浏览器环境 API：
 * - DOMPurify：需要完整的 DOM API（TreeWalker 等），jsdom 提供
 * - SVG 渲染：需要 SVG API（getBBox、getBoundingClientRect 等），svgdom 提供
 *
 * 因此采用双 DOM 环境方案（参考 isomorphic-mermaid）：
 * 1. 使用 jsdom 创建 window 传给 DOMPurify 初始化
 * 2. 将 DOMPurify 实例的 sanitize 方法复制到全局 DOMPurify 对象
 * 3. 使用 svgdom 创建全局 window/document（Mermaid 渲染使用）
 * 4. 安装 CSSStyleSheet polyfill
 * 5. 加载 Mermaid（此时 DOMPurify 和 SVG 环境均可用）
 *
 * @returns Mermaid API 实例，加载失败返回 null
 */
function initializeMermaidEnvironment(): MermaidApi | null {
  if (cachedMermaid) {
    return cachedMermaid;
  }

  if (!environmentInitialized) {
    try {
      /* 步骤 1：使用 jsdom 初始化 DOMPurify */
      const jsdomMod = nodeRequire('jsdom');
      const JSDOM = jsdomMod.JSDOM;
      const jsdomWindow = new JSDOM('').window;

      const dompurifyMod = nodeRequire('dompurify');
      const createDOMPurify = dompurifyMod.default || dompurifyMod;
      const DOMPurifyInstance = createDOMPurify(jsdomWindow);

      /*
       * 步骤 2：将 DOMPurify 实例的方法复制到工厂函数上
       * Mermaid 的 ESM 导入 `import DOMPurify from "dompurify"` 得到的是工厂函数，
       * 它在 Node.js 中不支持 sanitize。通过 Object.assign 将实例方法复制过去，
       * 使 Mermaid 调用 DOMPurify.sanitize() 时实际调用 jsdom 初始化的实例方法。
       */
      Object.assign(createDOMPurify, DOMPurifyInstance);

      /* 步骤 3：使用 svgdom 创建全局 SVG 兼容 DOM 环境 */
      const svgdomMod = nodeRequire('svgdom');
      const { createHTMLWindow } = svgdomMod;
      const svgWindow = createHTMLWindow();

      Object.assign(globalThis, {
        window: svgWindow,
        document: svgWindow.document,
      });

      /* 步骤 4：安装 CSSStyleSheet polyfill */
      installCSSStyleSheetPolyfill();

      environmentInitialized = true;
    } catch (error) {
      console.warn('[remark-mermaid] 环境初始化失败:', error);
      return null;
    }
  }

  /* 步骤 5：加载 Mermaid（此时全局环境已就绪） */
  try {
    const mod = nodeRequire('mermaid');
    cachedMermaid = mod.default || mod;
    return cachedMermaid;
  } catch (error) {
    console.warn('[remark-mermaid] 无法加载 mermaid 依赖:', error);
    return null;
  }
}

/**
 * HTML 特殊字符转义
 *
 * @param str - 原始字符串
 * @returns 转义后的安全字符串，防止 XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 渲染 Mermaid 代码为双主题 SVG
 *
 * 输入：Mermaid 代码字符串和基础 ID
 * 输出：包含亮色和暗色两套 SVG 的渲染结果，失败返回 null
 * 流程：
 * 1. 初始化 Mermaid 渲染环境（双 DOM 环境方案）
 * 2. 分别以 default 和 dark 主题渲染 SVG
 * 3. 清理渲染产生的 DOM 残留元素
 *
 * 注意：
 * - htmlLabels 必须设为 false，因为 svgdom 不支持 HTML foreignObject 的 getBoundingClientRect
 * - 全局环境由 initializeMermaidEnvironment 在首次调用时注入
 *
 * @param code - Mermaid 图表代码
 * @param baseId - 基础 ID（用于生成唯一 SVG 元素 ID）
 * @returns 双主题渲染结果，失败时返回 null
 */
export async function renderMermaidDualTheme(
  code: string,
  baseId: string
): Promise<MermaidDualThemeResult | null> {
  const mermaidApi = initializeMermaidEnvironment();
  if (!mermaidApi) {
    return null;
  }

  try {
    /* 渲染亮色主题 SVG */
    mermaidApi.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default',
      htmlLabels: false,
      flowchart: { htmlLabels: false },
    });
    const { svg: lightSvg } = await mermaidApi.render(`${baseId}-light`, code);

    /* 清理 DOM 中上一次渲染的残留元素 */
    const document = (globalThis as GlobalWithOptionalDom).document;
    if (document) {
      const container = document.getElementById('d' + baseId + '-light');
      if (container) container.remove();
    }

    /* 渲染暗色主题 SVG */
    mermaidApi.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'dark',
      htmlLabels: false,
      flowchart: { htmlLabels: false },
    });
    const { svg: darkSvg } = await mermaidApi.render(`${baseId}-dark`, code);

    /* 清理暗色渲染残留 */
    if (document) {
      const container = document.getElementById('d' + baseId + '-dark');
      if (container) container.remove();
    }

    return { lightSvg, darkSvg };
  } catch (renderError) {
    console.warn(`[remark-mermaid] 渲染失败 (${baseId}):`, renderError);
    return null;
  }
}

/**
 * remark-mermaid 插件
 *
 * 在构建时将 Mermaid 代码块预渲染为 SVG，支持亮色/暗色双主题切换。
 * 消除客户端 Mermaid JS 依赖，减少首屏加载体积约 200KB+。
 *
 * 输入：Markdown AST（包含 language-mermaid 代码块）
 * 输出：Markdown AST（代码块被替换为包含内联 SVG 的 HTML 节点）
 * 流程：
 * 1. 遍历 AST 收集所有 mermaid 代码块
 * 2. 逐个渲染为双主题 SVG（顺序执行，避免并发 DOM 环境冲突）
 * 3. 替换代码块为 HTML 节点
 * 4. 渲染失败时保留原始代码文本作为回退
 */
export function remarkMermaid(): Plugin<[], Root> {
  return async (tree: Root) => {
    /** 收集的 mermaid 代码块信息 */
    const mermaidBlocks: Array<{
      node: Code;
      index: number;
      parent: Parent;
    }> = [];

    /* 遍历 AST 收集所有 mermaid 代码块 */
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (node.lang !== 'mermaid') return;
        if (index === undefined || parent === undefined) return;
        mermaidBlocks.push({ node, index, parent });
      }
    );

    /* 没有 mermaid 代码块则跳过 */
    if (mermaidBlocks.length === 0) return;

    /* 逐个渲染 mermaid 代码块（顺序执行，避免并发 DOM 环境冲突） */
    for (const block of mermaidBlocks) {
      const { node, index, parent } = block;
      const code = node.value;
      const baseId = `mermaid-svg-${globalCounter++}`;

      const result = await renderMermaidDualTheme(code, baseId);

      let htmlNode: Html;
      if (result) {
        /* 渲染成功：生成包含双主题 SVG 的 HTML 节点 */
        htmlNode = {
          type: 'html',
          value: [
            '<div class="mermaid-output">',
            `<div class="mermaid-svg" data-theme="light">${result.lightSvg}</div>`,
            `<div class="mermaid-svg" data-theme="dark">${result.darkSvg}</div>`,
            '</div>',
          ].join(''),
        };
      } else {
        /* 渲染失败：保留原始代码文本作为回退 */
        htmlNode = {
          type: 'html',
          value: [
            '<div class="mermaid-error">',
            'Mermaid 渲染失败，原始代码如下：',
            `<pre><code>${escapeHtml(code)}</code></pre>`,
            '</div>',
          ].join(''),
        };
      }

      parent.children.splice(index, 1, htmlNode);
    }
  };
}
