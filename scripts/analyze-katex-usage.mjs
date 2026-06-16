/**
 * KaTeX 字体使用分析脚本
 *
 * 功能概述：
 * 扫描构建产物中所有 HTML 文件，提取 KaTeX 渲染元素使用的字体类名，
 * 分析 Unicode 范围，输出字体子集化所需的分析报告。
 *
 * 输入：构建产物目录路径（默认 apps/web/dist/）
 * 输出：控制台分析报告 + JSON 格式详细报告
 *
 * 流程：
 * 1. 递归扫描 dist/ 目录下所有 .html 文件
 * 2. 解析 HTML，查找 class 包含 "katex" 的元素
 * 3. 提取所有 KaTeX 字体相关类名（如 mathit、mathbf、mathbb 等）
 * 4. 映射类名到 KaTeX 字体族
 * 5. 统计使用频率，输出分析报告
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

/** 项目根目录 */
const PROJECT_ROOT = resolve(import.meta.dirname, '..');
/** 默认构建产物目录 */
const DEFAULT_DIST_DIR = resolve(PROJECT_ROOT, 'apps/web/dist');
/** 分析报告输出路径 */
const REPORT_OUTPUT = resolve(PROJECT_ROOT, 'scripts/katex-usage-report.json');

/**
 * KaTeX 字体类名到字体族的映射关系
 * 键：KaTeX HTML 输出中的 CSS 类名
 * 值：对应的 KaTeX 字体族名称
 */
const KATEX_CLASS_TO_FONT = {
  /* 主字体族：常规数学文本 */
  mathit: 'KaTeX_Main',
  mathrm: 'KaTeX_Main',
  mathbf: 'KaTeX_Main',
  mainrm: 'KaTeX_Main',
  textrm: 'KaTeX_Main',
  textbf: 'KaTeX_Main',
  textit: 'KaTeX_Main',

  /* 数学斜体字体族 */
  mathnormal: 'KaTeX_Math',
  boldsymbol: 'KaTeX_Math',

  /* AMS 字体族：黑板粗体等特殊符号 */
  mathbb: 'KaTeX_AMS',
  amsrm: 'KaTeX_AMS',
  textbb: 'KaTeX_AMS',

  /* 花体字体族 */
  mathcal: 'KaTeX_Caligraphic',

  /* 哥特体字体族 */
  mathfrak: 'KaTeX_Fraktur',
  textfrak: 'KaTeX_Fraktur',
  mathboldfrak: 'KaTeX_Fraktur',
  textboldfrak: 'KaTeX_Fraktur',

  /* 打字机字体族 */
  mathtt: 'KaTeX_Typewriter',
  texttt: 'KaTeX_Typewriter',

  /* 手写体字体族 */
  mathscr: 'KaTeX_Script',
  textscr: 'KaTeX_Script',

  /* 无衬线字体族 */
  mathsf: 'KaTeX_SansSerif',
  textsf: 'KaTeX_SansSerif',
  mathboldsf: 'KaTeX_SansSerif',
  textboldsf: 'KaTeX_SansSerif',
  mathitsf: 'KaTeX_SansSerif',
  mathsfit: 'KaTeX_SansSerif',
  textitsf: 'KaTeX_SansSerif',

  /* 尺寸字体族：大括号、大运算符等 */
  'delimsizing-size1': 'KaTeX_Size1',
  'delimsizing-size2': 'KaTeX_Size2',
  'delimsizing-size3': 'KaTeX_Size3',
  'delimsizing-size4': 'KaTeX_Size4',
  'small-op': 'KaTeX_Size1',
  'large-op': 'KaTeX_Size2',
};

/**
 * 递归获取目录下所有 HTML 文件
 * @param {string} dir - 目标目录路径
 * @returns {string[]} HTML 文件绝对路径数组
 */
function getHtmlFiles(dir) {
  const results = [];
  if (!existsSync(dir)) {
    console.error(`[错误] 目录不存在: ${dir}`);
    return results;
  }

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getHtmlFiles(fullPath));
    } else if (entry.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 从 HTML 内容中提取所有 KaTeX 相关的 CSS 类名
 * @param {string} html - HTML 文件内容
 * @returns {Set<string>} 去重后的 KaTeX CSS 类名集合
 */
function extractKatexClasses(html) {
  const katexClasses = new Set();

  /* KaTeX 字体相关类名列表（与 KATEX_CLASS_TO_FONT 映射表的键一致） */
  const fontClassNames = Object.keys(KATEX_CLASS_TO_FONT);

  /* 直接搜索所有 class 属性值，匹配 KaTeX 字体类名 */
  const classRegex = /class="([^"]+)"/g;
  let match;

  while ((match = classRegex.exec(html)) !== null) {
    const classValue = match[1];
    const classes = classValue.split(/\s+/);
    for (const cls of classes) {
      if (fontClassNames.includes(cls)) {
        katexClasses.add(cls);
      }
    }
  }

  return katexClasses;
}

/**
 * 将提取的类名映射到 KaTeX 字体族
 * @param {Set<string>} classes - CSS 类名集合
 * @returns {Map<string, number>} 字体族到使用次数的映射
 */
function mapClassesToFonts(classes) {
  const fontUsage = new Map();

  for (const cls of classes) {
    const font = KATEX_CLASS_TO_FONT[cls];
    if (font) {
      fontUsage.set(font, (fontUsage.get(font) || 0) + 1);
    }
  }

  return fontUsage;
}

/**
 * 扫描内容源文件，提取数学公式中的 LaTeX 命令
 * @param {string} contentDir - 内容目录路径
 * @returns {Map<string, number>} LaTeX 命令到使用次数的映射
 */
function analyzeLatexCommands(contentDir) {
  const commandUsage = new Map();

  if (!existsSync(contentDir)) {
    return commandUsage;
  }

  const mdFiles = getMdFiles(contentDir);

  for (const filePath of mdFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      /* 匹配行内公式 $...$ 和块级公式 $$...$$ */
      const mathRegex = /\$\$([\s\S]*?)\$\$|\$([^\$]+)\$/g;
      let match;

      while ((match = mathRegex.exec(content)) !== null) {
        const formula = match[1] || match[2] || '';
        /* 提取 LaTeX 命令（以 \ 开头的标识符） */
        const cmdRegex = /\\([a-zA-Z]+)/g;
        let cmdMatch;

        while ((cmdMatch = cmdRegex.exec(formula)) !== null) {
          const cmd = cmdMatch[1];
          commandUsage.set(cmd, (commandUsage.get(cmd) || 0) + 1);
        }
      }
    } catch {
      /* 忽略读取失败的文件 */
    }
  }

  return commandUsage;
}

/**
 * 递归获取目录下所有 Markdown 文件
 * @param {string} dir - 目标目录路径
 * @returns {string[]} Markdown 文件绝对路径数组
 */
function getMdFiles(dir) {
  const results = [];
  if (!existsSync(dir)) {
    return results;
  }

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getMdFiles(fullPath));
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 生成分析报告并输出
 * @param {string} distDir - 构建产物目录
 * @param {string} contentDir - 内容源文件目录
 */
function generateReport(distDir, contentDir) {
  console.log('='.repeat(60));
  console.log('KaTeX 字体使用分析报告');
  console.log('='.repeat(60));
  console.log();

  /* ===== 阶段一：分析构建产物 ===== */
  console.log('[阶段一] 扫描构建产物中的 KaTeX 使用情况');
  console.log(`扫描目录: ${distDir}`);
  console.log();

  const htmlFiles = getHtmlFiles(distDir);
  console.log(`发现 HTML 文件: ${htmlFiles.length} 个`);

  const allClasses = new Set();
  let katexElementCount = 0;

  for (const filePath of htmlFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      /* 统计 KaTeX 渲染元素数量 */
      const katexMatches = content.match(/class="katex[^"]*"/g);
      if (katexMatches) {
        katexElementCount += katexMatches.length;
      }
      const classes = extractKatexClasses(content);
      for (const cls of classes) {
        allClasses.add(cls);
      }
    } catch {
      /* 忽略读取失败的文件 */
    }
  }

  console.log(`KaTeX 渲染元素总数: ${katexElementCount}`);
  console.log(`发现 KaTeX 相关类名: ${allClasses.size} 个`);
  console.log();

  const fontUsage = mapClassesToFonts(allClasses);

  console.log('[字体使用统计] (按使用频率降序)');
  console.log('-'.repeat(40));

  const sortedFonts = [...fontUsage.entries()].sort((a, b) => b[1] - a[1]);
  const usedFontFamilies = new Set();

  for (const [font, count] of sortedFonts) {
    console.log(`  ${font}: ${count} 次`);
    usedFontFamilies.add(font);
  }
  console.log();

  /* ===== 阶段二：分析内容源文件 ===== */
  console.log('[阶段二] 分析内容源文件中的 LaTeX 命令');
  console.log(`扫描目录: ${contentDir}`);
  console.log();

  const commandUsage = analyzeLatexCommands(contentDir);
  const sortedCommands = [...commandUsage.entries()].sort((a, b) => b[1] - a[1]);

  console.log(`发现 LaTeX 命令: ${commandUsage.size} 种`);
  console.log('[高频 LaTeX 命令] (前 30 个)');
  console.log('-'.repeat(40));

  for (let i = 0; i < Math.min(30, sortedCommands.length); i++) {
    const [cmd, count] = sortedCommands[i];
    console.log(`  \\${cmd}: ${count} 次`);
  }
  console.log();

  /* ===== 阶段三：字体子集化建议 ===== */
  const ALL_KATEX_FONTS = [
    'KaTeX_Main',
    'KaTeX_Math',
    'KaTeX_AMS',
    'KaTeX_Caligraphic',
    'KaTeX_Fraktur',
    'KaTeX_Typewriter',
    'KaTeX_Script',
    'KaTeX_SansSerif',
    'KaTeX_Size1',
    'KaTeX_Size2',
    'KaTeX_Size3',
    'KaTeX_Size4',
  ];

  const unusedFonts = ALL_KATEX_FONTS.filter((f) => !usedFontFamilies.has(f));

  console.log('[阶段三] 字体子集化建议');
  console.log('-'.repeat(40));
  console.log(`已使用的字体族: ${usedFontFamilies.size} / ${ALL_KATEX_FONTS.length}`);

  if (unusedFonts.length > 0) {
    console.log(`可能未使用的字体族 (${unusedFonts.length} 个):`);
    for (const font of unusedFonts) {
      console.log(`  - ${font}`);
    }
  } else {
    console.log('所有字体族均有使用记录');
  }
  console.log();

  /* 注意：即使某些字体族在构建产物中未出现，也可能被 KaTeX 的默认样式引用 */
  console.log('[注意] 以下字体始终建议保留:');
  console.log('  - KaTeX_Main: 基础数学文本字体（必需）');
  console.log('  - KaTeX_Math: 数学斜体字体（必需）');
  console.log('  - KaTeX_Size1~Size4: 括号和运算符缩放字体（必需）');
  console.log();

  /* ===== 生成 JSON 报告 ===== */
  const report = {
    timestamp: new Date().toISOString(),
    distDir: distDir,
    htmlFileCount: htmlFiles.length,
    katexElementCount,
    usedFontFamilies: [...usedFontFamilies].sort(),
    unusedFontFamilies: unusedFonts.sort(),
    fontUsage: Object.fromEntries(sortedFonts),
    latexCommands: Object.fromEntries(sortedCommands),
    allKatexClasses: [...allClasses].sort(),
  };

  writeFileSync(REPORT_OUTPUT, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[报告已保存] ${REPORT_OUTPUT}`);
  console.log('='.repeat(60));
}

/* ===== 主入口 ===== */
const distDir = process.argv[2] || DEFAULT_DIST_DIR;
const contentDir = resolve(PROJECT_ROOT, 'content');

generateReport(distDir, contentDir);
