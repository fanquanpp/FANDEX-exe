/**
 * CheatSheet 速查表组件（React Island）
 *
 * 功能概述：
 * - 接收 CheatsheetData 数据，按章节 Tabs 切换展示
 * - Fuse.js 模糊搜索：跨章节标题 / 语法 / 描述 / 示例
 * - 代码块简单语法高亮（基于正则，支持字符串 / 注释 / 关键字 / 数字）
 * - 复制语法 / 示例代码到剪贴板
 * - 打印整张速查表（调用浏览器原生 print）
 * - 折叠/展开单个条目（点击条目头部切换）
 * - 基于 shadcn/ui Tabs + Input + Button
 * - Motion：Tab 切换淡入 + 条目 stagger 入场
 *
 * 使用方式（Astro island）：
 *   <CheatSheet client:visible cheatsheet={cheatsheetData} />
 *
 * 数据流：
 * 1. props.cheatsheet 传入结构化速查表数据
 * 2. 用户切换 Tab → 更新 activeSection
 * 3. 用户输入搜索 → Fuse.js 跨所有 sections 过滤 → 显示匹配条目
 * 4. 用户点击条目 → 折叠/展开示例代码
 * 5. 用户点击复制 → navigator.clipboard.writeText
 * 6. 用户点击打印 → window.print()
 */

import Fuse from 'fuse.js';
import { ChevronRight, ClipboardCheck, Code2, Copy, Printer, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import type { CheatsheetData, CheatsheetItem } from '@/types';

/** CheatSheet 组件 Props 类型 */
export interface CheatSheetProps {
  /** 速查表数据 */
  cheatsheet: CheatsheetData;
  /** 默认激活的 section index（默认 0） */
  defaultSectionIndex?: number;
  /** 是否默认展开所有条目（默认 false） */
  defaultExpanded?: boolean;
  /** 额外类名 */
  className?: string;
}

/** 搜索索引项类型（扁平化后的条目） */
interface SearchableItem {
  /** 所属章节标题 */
  sectionTitle: string;
  /** 所属章节 index */
  sectionIndex: number;
  /** 条目在所属章节内的 index */
  itemIndex: number;
  /** 条目数据 */
  item: CheatsheetItem;
}

/** 语法高亮 Token 类型 */
type TokenType = 'plain' | 'comment' | 'string' | 'keyword' | 'number' | 'function';

/** 高亮 Token 内部表示 */
interface HighlightToken {
  type: TokenType;
  value: string;
}

/** JS / TS 通用关键字列表 */
const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'default',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'delete',
  'typeof',
  'instanceof',
  'void',
  'this',
  'super',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'enum',
  'namespace',
  'module',
  'import',
  'export',
  'from',
  'as',
  'async',
  'await',
  'yield',
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  'public',
  'private',
  'protected',
  'readonly',
  'static',
  'abstract',
  'get',
  'set',
  'of',
  'in',
  'is',
  'def',
  'elif',
  'lambda',
  'pass',
  'with',
  'print',
  'range',
  'len',
  'self',
  'None',
  'True',
  'False',
  'and',
  'or',
  'not',
  'int',
  'str',
  'float',
  'bool',
  'list',
  'dict',
  'tuple',
  'set',
]);

/**
 * 简易语法高亮（基于正则）
 *
 * 实现说明：
 * - 按顺序匹配：注释 → 字符串 → 数字 → 标识符（关键字/函数） → 其他
 * - 使用累加扫描避免正则贪婪问题
 * - 输出 token 数组，由渲染层映射为不同颜色的 span
 *
 * @param code - 待高亮的代码
 * @returns token 数组
 */
function highlightCode(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1];

    // 1. 单行注释 //...
    if (ch === '/' && next === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 2. 多行注释 /* ... */
    if (ch === '/' && next === '*') {
      let end = code.indexOf('*/', i + 2);
      end = end === -1 ? len : end + 2;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 3. 模板字符串 `...`
    if (ch === '`') {
      let end = i + 1;
      while (end < len && code[end] !== '`') {
        if (code[end] === '\\' && end + 1 < len) end += 2;
        else end++;
      }
      end++;
      tokens.push({ type: 'string', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 4. 单/双引号字符串
    if (ch === '"' || ch === "'") {
      let end = i + 1;
      while (end < len && code[end] !== ch) {
        if (code[end] === '\\' && end + 1 < len) end += 2;
        else end++;
      }
      end++;
      tokens.push({ type: 'string', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 5. 数字
    if (/[0-9]/.test(ch)) {
      let end = i + 1;
      while (end < len && /[0-9._eExXa-fA-F]/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 6. 标识符（关键字 / 函数名 / 普通标识符）
    if (/[a-zA-Z_$]/.test(ch)) {
      let end = i + 1;
      while (end < len && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const word = code.slice(i, end);
      // 检查下一个非空白字符是否为 (，判断是否为函数调用
      let nextNonSpace = end;
      while (nextNonSpace < len && /\s/.test(code[nextNonSpace])) nextNonSpace++;
      const isFunction = code[nextNonSpace] === '(';
      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = end;
      continue;
    }

    // 7. 其他字符（运算符、标点、空白）累积为 plain token
    let end = i + 1;
    while (
      end < len &&
      !/[/"'`a-zA-Z_$0-9]/.test(code[end]) &&
      !(code[end - 1] === '/' && (code[end] === '/' || code[end] === '*'))
    ) {
      end++;
    }
    tokens.push({ type: 'plain', value: code.slice(i, end) });
    i = end;
  }

  return tokens;
}

/** Token 类型对应的 Tailwind 类名 */
const TOKEN_CLASS: Record<TokenType, string> = {
  plain: 'text-foreground',
  comment: 'text-muted-foreground italic',
  string: 'text-emerald-600 dark:text-emerald-400',
  keyword: 'text-purple-600 dark:text-purple-400 font-medium',
  number: 'text-orange-600 dark:text-orange-400',
  function: 'text-blue-600 dark:text-blue-400',
};

/**
 * 渲染高亮代码块（内部组件）
 *
 * @param props.code - 待渲染的代码
 * @param props.ariaLabel - 无障碍标签
 */
function HighlightedCode({ code, ariaLabel }: { code: string; ariaLabel?: string }) {
  const tokens = useMemo(() => highlightCode(code), [code]);
  return (
    <pre
      className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs leading-relaxed"
      aria-description={ariaLabel}
    >
      <code className="font-mono">
        {tokens.map((token, index) => (
          <span key={index} className={TOKEN_CLASS[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

/**
 * CheatSheet 速查表组件
 *
 * @param props.cheatsheet - 速查表数据
 * @param props.defaultSectionIndex - 默认激活的 section index
 * @param props.defaultExpanded - 是否默认展开所有条目
 * @param props.className - 外部类名
 */
export function CheatSheet({
  cheatsheet,
  defaultSectionIndex = 0,
  defaultExpanded = false,
  className,
}: CheatSheetProps) {
  // 当前激活的 section
  const [activeSection, setActiveSection] = useState<string>(String(defaultSectionIndex));
  // 搜索关键词
  const [query, setQuery] = useState('');
  // 防抖后的关键词
  const [debouncedQuery, setDebouncedQuery] = useState('');
  // 展开的条目集合（key: `${sectionIndex}-${itemIndex}`）
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    if (!defaultExpanded) return new Set();
    const set = new Set<string>();
    cheatsheet.sections.forEach((_, sIdx) => {
      _.items.forEach((__, iIdx) => {
        set.add(`${sIdx}-${iIdx}`);
      });
    });
    return set;
  });
  // 复制状态：key → boolean
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // 防抖定时器 ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 扁平化所有条目（用于 Fuse.js 搜索索引） */
  const searchIndex = useMemo<SearchableItem[]>(() => {
    const items: SearchableItem[] = [];
    cheatsheet.sections.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        items.push({
          sectionTitle: section.title,
          sectionIndex: sIdx,
          itemIndex: iIdx,
          item,
        });
      });
    });
    return items;
  }, [cheatsheet]);

  /** Fuse.js 实例 */
  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: 'item.syntax', weight: 0.4 },
          { name: 'item.description', weight: 0.3 },
          { name: 'item.example', weight: 0.2 },
          { name: 'sectionTitle', weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 1,
        includeMatches: true,
      }),
    [searchIndex],
  );

  /** 输入变化处理（防抖 150ms） */
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 150);
  }, []);

  // 卸载时清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /** 搜索结果（按 section 分组） */
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return null;
    const results = fuse.search(debouncedQuery);
    // 按 section 分组
    const grouped = new Map<number, SearchableItem[]>();
    for (const r of results) {
      const arr = grouped.get(r.item.sectionIndex);
      if (arr) arr.push(r.item);
      else grouped.set(r.item.sectionIndex, [r.item]);
    }
    return grouped;
  }, [debouncedQuery, fuse]);

  /** 当前激活 section 的条目（无搜索时） */
  const activeSectionIndex = Number(activeSection);
  const _activeItems: Array<{ sectionIndex: number; itemIndex: number; item: CheatsheetItem }> =
    useMemo(() => {
      const section = cheatsheet.sections[activeSectionIndex];
      if (!section) return [];
      return section.items.map((item, iIdx) => ({
        sectionIndex: activeSectionIndex,
        itemIndex: iIdx,
        item,
      }));
    }, [cheatsheet, activeSectionIndex]);

  /** 切换条目展开状态 */
  const toggleItem = useCallback((key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /** 复制到剪贴板 */
  const handleCopy = useCallback(async (text: string, key: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // 静默失败
    }
  }, []);

  /** 打印 */
  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  /** 清空搜索 */
  const handleClearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  /** 渲染单个条目 */
  const renderItem = (
    sectionIndex: number,
    itemIndex: number,
    item: CheatsheetItem,
    animateIndex: number,
  ) => {
    const key = `${sectionIndex}-${itemIndex}`;
    // 提取 example 为局部常量，使 Biome 能够通过后续守卫识别其非空类型
    const example = item.example;
    const isExpanded = expandedItems.has(key) || !example;
    const hasExample = Boolean(example);
    const copiedSyntax = copiedKey === `${key}-syntax`;
    const copiedExample = copiedKey === `${key}-example`;

    return (
      <motion.li
        key={key}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(animateIndex * 0.03, 0.3), duration: 0.18 }}
        className="rounded-md border bg-card overflow-hidden"
      >
        {/* 条目头部 */}
        <div className="flex items-start gap-2 p-3">
          {/* 展开按钮（仅有示例时显示） */}
          {hasExample && (
            <button
              type="button"
              onClick={() => toggleItem(key)}
              className="mt-0.5 flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label={isExpanded ? '收起示例' : '展开示例'}
              aria-expanded={isExpanded}
            >
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          )}

          {/* 主内容区 */}
          <div className="flex-1 min-w-0">
            {/* 语法行 */}
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs text-foreground break-all">
                {item.syntax}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(item.syntax, `${key}-syntax`)}
                className="h-6 w-6 flex-shrink-0"
                aria-label="复制语法"
              >
                {copiedSyntax ? (
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            {/* 描述 */}
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </div>
        </div>

        {/* 示例代码（可折叠） */}
        {hasExample && example && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden border-t bg-muted/10"
              >
                <div className="p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Code2 className="h-3 w-3" aria-hidden="true" />
                      示例
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(example, `${key}-example`)}
                      className="h-6 w-6"
                      aria-label="复制示例代码"
                    >
                      {copiedExample ? (
                        <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <HighlightedCode code={example} ariaLabel="示例代码" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.li>
    );
  };

  return (
    <div className={cn('cheat-sheet space-y-3', className)}>
      {/* 顶部工具栏：标题 + 搜索 + 打印 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{cheatsheet.title}</h2>
          <p className="text-xs text-muted-foreground">
            共 {cheatsheet.sections.length} 章 ·{' '}
            {cheatsheet.sections.reduce((sum, s) => sum + s.items.length, 0)} 条
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="搜索语法或描述..."
              className="h-8 pl-8 pr-7 text-xs"
              aria-label="搜索速查表"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7"
                aria-label="清空搜索"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {/* 打印按钮 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1 px-2.5 text-xs"
            aria-label="打印速查表"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">打印</span>
          </Button>
        </div>
      </div>

      {/* 搜索结果 / 正常 Tabs 视图 */}
      {searchResults ? (
        // 搜索结果视图（跨所有 sections）
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            找到{' '}
            <span className="font-medium text-foreground">
              {Array.from(searchResults.values()).reduce((s, arr) => s + arr.length, 0)}
            </span>{' '}
            条匹配 “<span className="text-foreground">{debouncedQuery}</span>” 的结果
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={debouncedQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {Array.from(searchResults.entries()).map(([sectionIndex, items]) => {
                const section = cheatsheet.sections[sectionIndex];
                if (!section) return null;
                return (
                  <div key={`search-${sectionIndex}`}>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {section.title}
                      <span className="ml-2 text-xs font-normal">({items.length} 条)</span>
                    </h3>
                    <ul className="space-y-2">
                      {items.map((entry, idx) =>
                        renderItem(sectionIndex, entry.itemIndex, entry.item, idx),
                      )}
                    </ul>
                  </div>
                );
              })}
              {searchResults.size === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/40 mb-3" aria-hidden="true" />
                  <p className="text-sm font-medium">未找到匹配的条目</p>
                  <p className="mt-1 text-xs text-muted-foreground">尝试使用更通用的关键词</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        // 正常 Tabs 视图
        <Tabs value={activeSection} onValueChange={setActiveSection} className="gap-3">
          {/* 章节 Tabs（横向滚动以适应小屏） */}
          <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/40 p-1">
            {cheatsheet.sections.map((section, index) => (
              <TabsTrigger key={index} value={String(index)} className="text-xs">
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 各章节内容 */}
          {cheatsheet.sections.map((section, sectionIndex) => (
            <TabsContent key={sectionIndex} value={String(sectionIndex)} className="mt-0">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2"
                >
                  {section.items.map((item, itemIndex) =>
                    renderItem(sectionIndex, itemIndex, item, itemIndex),
                  )}
                </motion.ul>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default CheatSheet;
