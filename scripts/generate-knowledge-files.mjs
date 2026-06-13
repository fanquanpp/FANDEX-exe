import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;

function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== HTML5 ====================
addFile(
  'html5',
  'HTML5',
  50,
  '文档类型声明',
  'DOCTYPE与HTML Living Standard',
  'beginner',
  `## 1. DOCTYPE 声明

### 1.1 什么是 DOCTYPE

DOCTYPE（Document Type Declaration）是 HTML 文档的第一行，用于告知浏览器当前文档使用的 HTML 版本和渲染模式。它不是 HTML 标签，而是一条"处理指令"。

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文档类型声明示例</title>
</head>
<body>
  <p>这是一个 HTML5 文档</p>
</body>
</html>
\`\`\`

### 1.2 DOCTYPE 的历史演变

| 版本 | DOCTYPE 声明 | 说明 |
|------|-------------|------|
| HTML 2.0 | \`<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">\` | 极其简洁 |
| HTML 4.01 Strict | \`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" ...>\` | 包含 DTD 引用 |
| XHTML 1.0 | \`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ...>\` | XML 语法 |
| HTML5 | \`<!DOCTYPE html>\` | 极简声明 |

HTML5 的 DOCTYPE 设计哲学是**向后兼容**与**极简主义**——它不再引用 DTD，因为 HTML5 不再基于 SGML。

### 1.3 标准模式与怪异模式

| 模式 | 触发条件 | 特点 |
|------|---------|------|
| **标准模式** | 存在有效的 DOCTYPE | 按 W3C 标准渲染 |
| **怪异模式** | 缺少 DOCTYPE 或无效 | 模拟旧浏览器行为 |
| **几乎标准模式** | 某些过渡型 DOCTYPE | 除表格单元格高度外按标准渲染 |

**关键差异**：盒模型（怪异模式下 width 包含 padding 和 border）、行内元素尺寸、字体继承、图片间距。

\`\`\`javascript
// 检测当前渲染模式
if (document.compatMode === 'CSS1Compat') {
  console.log('标准模式');
} else {
  console.log('怪异模式');
}
\`\`\`

## 2. HTML Living Standard

### 2.1 从 W3C 到 WHATWG

2019 年，W3C 与 WHATWG 达成协议，HTML 和 DOM 规范由 WHATWG 作为唯一发布者维护。HTML 正式成为"活标准"（Living Standard）。

**核心理念**：持续演进、向后兼容、浏览器驱动、社区参与。

### 2.2 规范结构

| 章节 | 内容 |
|------|------|
| Infrastructure | 术语、编码、解析器 |
| Semantics | 元素语义定义 |
| DOM | 文档对象模型 |
| Communication | Web Sockets、Web Messaging |
| Web Workers | 后台线程 |

### 2.3 新特性演进时间线

| 年份 | 新增特性 |
|------|---------|
| 2020 | \`loading="lazy"\` |
| 2021 | \`<dialog>\` 元素、\`popover\` 属性 |
| 2022 | Container Queries、\`:has()\` 选择器 |
| 2023 | View Transitions API、\`<search>\` 元素 |
| 2024 | CSS Anchor Positioning |
| 2025 | Declarative Shadow DOM |

## 3. DOCTYPE 最佳实践

- 永远在文档首行声明 DOCTYPE
- 推荐大写 \`<!DOCTYPE html>\`
- 使用 W3C Markup Validation Service 验证
`
);

addFile(
  'html5',
  'HTML5',
  51,
  '元数据与字符编码',
  'meta、title、link、UTF-8',
  'beginner',
  `## 1. 元数据概述

元数据（Metadata）是"关于数据的数据"，在 HTML 中通过 \`<head>\` 内的元素描述文档的属性、行为和关系。

\`\`\`html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述">
  <title>页面标题</title>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

### 1.1 元数据分类

| 类别 | 元素 | 作用 |
|------|------|------|
| 字符编码 | \`<meta charset>\` | 声明文档编码 |
| 视口配置 | \`<meta viewport>\` | 移动端适配 |
| SEO 相关 | \`<meta name>\` | 描述、关键词、机器人指令 |
| 社交分享 | \`<meta property>\` | Open Graph、Twitter Card |
| 安全策略 | \`<meta http-equiv>\` | CSP、CORS |
| 资源关系 | \`<link>\` | 样式表、图标、预加载 |

## 2. meta 元素详解

### 2.1 字符编码声明

\`\`\`html
<meta charset="UTF-8">
\`\`\`

**关键规则**：编码声明必须在文档前 1024 字节内；必须在 \`<title>\` 之前声明，防止 XSS 攻击；推荐始终使用 UTF-8。

### 2.2 SEO 元数据

\`\`\`html
<meta name="description" content="深入讲解 HTML5 元数据与字符编码">
<meta name="robots" content="index, follow">
<meta name="author" content="fanquanpp">
\`\`\`

### 2.3 Open Graph 与社交分享

\`\`\`html
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta name="twitter:card" content="summary_large_image">
\`\`\`

### 2.4 安全相关元数据

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
\`\`\`

## 3. UTF-8 字符编码

### 3.1 UTF-8 编码原理

UTF-8 是一种变长编码，使用 1-4 个字节表示 Unicode 码点：

| 码点范围 | 字节数 | 编码格式 |
|---------|--------|---------|
| U+0000 ~ U+007F | 1 | \`0xxxxxxx\` |
| U+0080 ~ U+07FF | 2 | \`110xxxxx 10xxxxxx\` |
| U+0800 ~ U+FFFF | 3 | \`1110xxxx 10xxxxxx 10xxxxxx\` |
| U+10000 ~ U+10FFFF | 4 | \`11110xxx 10xxxxxx 10xxxxxx 10xxxxxx\` |

中文字符"中"（U+4E2D）的 UTF-8 编码：

$$
\\text{UTF-8} = \\text{0xE4 0xB8 0xAD}
$$

### 3.2 编码声明优先级

BOM > HTTP Content-Type 头 > meta charset 声明

## 4. link 元素

\`\`\`html
<link rel="stylesheet" href="styles.css">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="canonical" href="https://example.com/page">
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  52,
  '文本语义',
  'h1-h6、p、strong、em、mark、time、address',
  'beginner',
  `## 1. 标题元素 h1-h6

HTML 提供六级标题，\`<h1>\` 最高，\`<h6>\` 最低，用于构建文档大纲。

**核心规则**：每个页面建议只有一个 \`<h1>\`；不要跳级；标题用于语义结构，不用于控制字号。

\`\`\`html
<h1>网站主标题</h1>
  <h2>章节标题</h2>
    <h3>小节标题</h3>
\`\`\`

## 2. 段落与文本元素

### 2.1 强调元素

| 元素 | 语义 | 默认样式 | 使用场景 |
|------|------|---------|---------|
| \`<em>\` | 语气强调 | 斜体 | 语音阅读时加重 |
| \`<strong>\` | 重要性强调 | 粗体 | 标记重要内容 |
| \`<mark>\` | 相关性标记 | 黄色高亮 | 搜索结果高亮 |
| \`<b>\` | 吸引注意 | 粗体 | 关键词 |
| \`<i>\` | 不同语态 | 斜体 | 术语、外文 |
| \`<small>\` | 附属细则 | 小字 | 免责声明 |

\`\`\`html
<p><em>不要</em>在走廊奔跑</p>
<p><strong>警告：</strong>高压危险</p>
<p>搜索"<mark>HTML5</mark>"的结果</p>
\`\`\`

### 2.2 术语与引用

\`\`\`html
<dfn>HTML</dfn>是超文本标记语言
<abbr title="HyperText Markup Language">HTML</abbr>
<blockquote cite="https://example.com"><p>引用文字</p></blockquote>
H<sub>2</sub>O  E=mc<sup>2</sup>
<code>console.log()</code>
<kbd>Ctrl</kbd> + <kbd>C</kbd>
\`\`\`

## 3. time 元素

\`\`\`html
<time datetime="2026-06-14">2026年6月14日</time>
<time datetime="2026-06-14T10:30:00+08:00">上午10:30</time>
<time datetime="PT2H30M">2小时30分钟</time>
\`\`\`

| 类型 | 格式 | 示例 |
|------|------|------|
| 日期 | YYYY-MM-DD | 2026-06-14 |
| 日期时间 | YYYY-MM-DDTHH:MM:SS | 2026-06-14T10:30:00 |
| 持续时间 | PnYnMnDTnHnMnS | PT2H30M |

## 4. address 元素

\`\`\`html
<address>
  <a href="mailto:contact@example.com">contact@example.com</a><br>
  北京市朝阳区某某路123号
</address>
\`\`\`

**注意**：\`<address>\` 用于联系信息，不是物理地址的通用容器；默认斜体显示。

## 5. 其他语义文本元素

\`\`\`html
<p>价格：<del datetime="2026-01-01">¥99</del> <ins>¥79</ins></p>
<p>用户 <bdi>إبراهيم</bdi> 发表了评论</p>
<p>第一行<br>第二行</p>
<p>超长单词<wbr>可以在<wbr>此处<wbr>断行</p>
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  53,
  '列表',
  'ul、ol、dl',
  'beginner',
  `## 1. 无序列表 ul

\`\`\`html
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>橙子</li>
</ul>
\`\`\`

\`\`\`css
ul { list-style-type: disc; }    /* 实心圆（默认） */
ul { list-style-type: circle; }  /* 空心圆 */
ul { list-style-type: square; }  /* 实心方块 */
ul { list-style-type: none; }    /* 无标记 */
\`\`\`

## 2. 有序列表 ol

\`\`\`html
<ol>
  <li>第一步</li>
  <li>第二步</li>
</ol>

<ol start="5">
  <li>第五项</li>
</ol>

<ol reversed>
  <li>第三项</li>
  <li>第二项</li>
</ol>
\`\`\`

\`\`\`css
ol { list-style-type: decimal; }         /* 1, 2, 3 */
ol { list-style-type: lower-roman; }     /* i, ii, iii */
ol { list-style-type: cjk-ideographic; } /* 一, 二, 三 */
\`\`\`

### CSS 计数器

\`\`\`css
ol.custom { counter-reset: section; list-style: none; }
ol.custom li { counter-increment: section; }
ol.custom li::before { content: "第" counter(section) "章："; font-weight: bold; }
\`\`\`

## 3. 定义列表 dl

\`\`\`html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>
\`\`\`

### 多对多关系

\`\`\`html
<!-- 一个术语多个定义 -->
<dl>
  <dt>Java</dt>
  <dd>一种编程语言</dd>
  <dd>一种咖啡</dd>
</dl>
\`\`\`

## 4. 列表布局技巧

\`\`\`css
ul, ol { list-style: none; margin: 0; padding: 0; }
ul.nav { display: flex; gap: 1rem; }
ul.custom-mark li { position: relative; padding-left: 1.5em; }
ul.custom-mark li::before { content: "✓"; position: absolute; left: 0; color: green; }
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  54,
  '链接与锚点',
  'a标签、target、相对/绝对路径',
  'beginner',
  `## 1. 超链接基础

\`\`\`html
<a href="https://example.com">访问示例网站</a>
<a href="mailto:contact@example.com">发送邮件</a>
<a href="tel:+861012345678">拨打电话</a>
<a href="document.pdf" download>下载文件</a>
\`\`\`

### 1.1 target 属性

| 值 | 行为 |
|----|------|
| \`_self\` | 当前窗口打开（默认） |
| \`_blank\` | 新窗口/标签页打开 |
| \`_parent\` | 父框架中打开 |
| \`_top\` | 顶层窗口中打开 |

\`\`\`html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">外部链接</a>
\`\`\`

> **安全提示**：使用 \`target="_blank"\` 时务必添加 \`rel="noopener noreferrer"\`。

### 1.2 rel 属性

\`\`\`html
<a rel="noopener">无 opener</a>
<a rel="noreferrer">不发送 Referer</a>
<a rel="nofollow">不传递权重</a>
<a rel="ugc">用户生成内容</a>
\`\`\`

## 2. 锚点与页面内导航

\`\`\`html
<h2 id="section1">第一节</h2>
<a href="#section1">跳转到第一节</a>
\`\`\`

\`\`\`css
html { scroll-behavior: smooth; }
[id] { scroll-margin-top: 80px; }
\`\`\`

## 3. 路径系统

\`\`\`html
<!-- 绝对路径 -->
<a href="https://example.com/page.html">完整 URL</a>
<a href="/about/index.html">根目录开始</a>

<!-- 相对路径 -->
<a href="page.html">同目录</a>
<a href="sub/page.html">子目录</a>
<a href="../page.html">父目录</a>
\`\`\`

## 4. 链接可访问性

\`\`\`html
<!-- ✅ 描述性链接文本 -->
<a href="report.pdf">查看2026年度报告</a>

<!-- 跳过导航链接 -->
<a href="#main-content" class="skip-link">跳到主要内容</a>
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  55,
  '图像与响应式图片',
  'img、srcset、sizes、picture元素',
  'intermediate',
  `## 1. img 元素

\`\`\`html
<img src="photo.jpg" alt="描述文字" width="800" height="600">
<img src="photo.jpg" alt="照片" loading="lazy">
\`\`\`

## 2. 响应式图片

### 2.1 srcset 属性

\`\`\`html
<!-- 宽度描述符 -->
<img src="small.jpg"
     srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
     alt="响应式图片">

<!-- 像素密度描述符 -->
<img src="photo.jpg"
     srcset="photo.jpg 1x, photo@2x.jpg 2x"
     alt="高分辨率图片">
\`\`\`

### 2.2 sizes 属性

\`\`\`html
<img src="photo.jpg"
     srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="响应式图片">
\`\`\`

计算过程：$\\text{选择宽度} = \\text{sizes 计算值} \\times \\text{设备像素比}$

### 2.3 picture 元素

\`\`\`html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="照片" width="800" height="600">
</picture>
\`\`\`

## 3. 图片格式选择

| 格式 | 压缩类型 | 透明度 | 压缩率 | 浏览器支持 |
|------|---------|--------|--------|-----------|
| JPEG | 有损 | ❌ | 中等 | 全部 |
| PNG | 无损 | ✅ | 较低 | 全部 |
| WebP | 有损/无损 | ✅ | 高 | 97%+ |
| AVIF | 有损/无损 | ✅ | 最高 | 92%+ |
| SVG | 矢量 | ✅ | — | 全部 |

## 4. 图片性能优化

\`\`\`html
<img src="photo.jpg" alt="照片" width="800" height="600"
     style="width: 100%; height: auto;">
<link rel="preload" as="image" href="hero.webp" type="image/webp">
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  56,
  '音频与视频',
  'audio、video、source、track字幕',
  'intermediate',
  `## 1. audio 元素

\`\`\`html
<audio src="music.mp3" controls></audio>
<audio controls>
  <source src="music.mp3" type="audio/mpeg">
  <source src="music.ogg" type="audio/ogg">
</audio>
\`\`\`

| 属性 | 说明 |
|------|------|
| \`controls\` | 显示播放控件 |
| \`autoplay\` | 自动播放（需配合 muted） |
| \`loop\` | 循环播放 |
| \`muted\` | 静音 |
| \`preload\` | none/metadata/auto |

\`\`\`javascript
const audio = document.querySelector('audio');
audio.play(); audio.pause();
audio.currentTime = 30; audio.volume = 0.5;
\`\`\`

## 2. video 元素

\`\`\`html
<video controls width="640" height="360" poster="cover.jpg" playsinline>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.webm" type="video/webm">
</video>
\`\`\`

\`\`\`javascript
const video = document.querySelector('video');
await video.play();
video.requestFullscreen();
await video.requestPictureInPicture();
\`\`\`

## 3. track 字幕

\`\`\`vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
欢迎观看本教程

00:00:05.000 --> 00:00:08.000
今天我们学习 HTML5 视频
\`\`\`

\`\`\`html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  <track kind="subtitles" src="subs/zh.vtt" srclang="zh" label="中文">
  <track kind="subtitles" src="subs/en.vtt" srclang="en" label="English" default>
</video>
\`\`\`

| kind 值 | 说明 |
|---------|------|
| \`subtitles\` | 字幕（翻译） |
| \`captions\` | 说明文字（听障） |
| \`chapters\` | 章节标题 |

## 4. 自动播放策略

| 条件 | 是否允许自动播放 |
|------|----------------|
| 有声视频 | ❌ |
| 静音视频 | ✅ |
| 用户已交互 | ✅ |
`
);

addFile(
  'html5',
  'HTML5',
  57,
  'SVG',
  '基本形状、viewBox、路径、文本、滤镜',
  'intermediate',
  `## 1. SVG 基础

\`\`\`html
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="blue" />
</svg>
\`\`\`

## 2. viewBox 详解

\`viewBox="min-x min-y width height"\` 定义 SVG 的内部坐标系统：

\`\`\`html
<svg width="400" height="300" viewBox="0 0 200 150">
  <rect x="0" y="0" width="100" height="75" fill="blue" />
</svg>
\`\`\`

| preserveAspectRatio 值 | 说明 |
|----------------------|------|
| \`xMidYMid meet\` | 居中，完整显示（默认） |
| \`xMidYMid slice\` | 居中，裁剪填充 |
| \`none\` | 不保持比例 |

## 3. 基本形状

\`\`\`html
<svg width="400" height="300">
  <rect x="10" y="10" width="100" height="60" rx="10" fill="blue" />
  <circle cx="200" cy="80" r="50" fill="red" />
  <ellipse cx="320" cy="80" rx="60" ry="30" fill="green" />
  <line x1="10" y1="150" x2="390" y2="150" stroke="black" />
  <polyline points="10,180 50,160 90,200" fill="none" stroke="purple" />
  <polygon points="200,180 240,220 160,220" fill="orange" />
</svg>
\`\`\`

## 4. 路径 path

| 命令 | 说明 | 示例 |
|------|------|------|
| \`M\` | 移动到 | \`M 10 10\` |
| \`L\` | 直线到 | \`L 100 100\` |
| \`C\` | 三次贝塞尔 | \`C 20,20 40,20 50,10\` |
| \`Q\` | 二次贝塞尔 | \`Q 50,0 100,50\` |
| \`A\` | 弧线 | \`A 25,25 0 0,1 50,25\` |
| \`Z\` | 闭合路径 | \`Z\` |

> 小写字母为相对坐标，大写字母为绝对坐标。

## 5. 文本

\`\`\`html
<svg>
  <text x="20" y="50" font-size="24" fill="black">Hello SVG</text>
  <defs><path id="curve" d="M 50 150 Q 200 50, 350 150" /></defs>
  <text font-size="20"><textPath href="#curve">沿曲线排列的文字</textPath></text>
</svg>
\`\`\`

## 6. 滤镜与渐变

\`\`\`html
<svg>
  <defs>
    <filter id="blur"><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="shadow"><feDropShadow dx="4" dy="4" stdDeviation="3" /></filter>
    <linearGradient id="lg" x1="0%" x2="100%">
      <stop offset="0%" stop-color="red" />
      <stop offset="100%" stop-color="blue" />
    </linearGradient>
  </defs>
  <rect x="50" y="50" width="100" height="80" fill="url(#lg)" filter="url(#shadow)" />
</svg>
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  58,
  '嵌入式内容',
  'iframe、embed、object',
  'intermediate',
  `## 1. iframe 元素

\`\`\`html
<iframe src="https://example.com" width="800" height="600" title="嵌入页面"></iframe>
\`\`\`

### 1.1 sandbox 安全沙箱

\`\`\`html
<iframe src="untrusted.html" sandbox></iframe>
<iframe src="widget.html" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
\`\`\`

| sandbox 值 | 允许的功能 |
|------------|-----------|
| （空） | 禁止所有 |
| \`allow-scripts\` | 执行脚本 |
| \`allow-same-origin\` | 同源请求 |
| \`allow-forms\` | 提交表单 |

> **安全警告**：同时使用 \`allow-scripts\` 和 \`allow-same-origin\` 可能导致沙箱被绕过。

### 1.2 iframe 通信

\`\`\`javascript
// 父页面 → iframe
iframe.contentWindow.postMessage({ type: 'DATA' }, 'https://example.com');

// 接收消息
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://example.com') return;
  console.log(event.data);
});
\`\`\`

### 1.3 srcdoc 内联内容

\`\`\`html
<iframe srcdoc="<h1>内联内容</h1>" sandbox="allow-scripts"></iframe>
\`\`\`

## 2. embed 与 object

\`\`\`html
<embed src="document.pdf" type="application/pdf" width="800" height="600">

<object data="document.pdf" type="application/pdf" width="800" height="600">
  <p>您的浏览器不支持 PDF 预览</p>
</object>
\`\`\`

**embed vs object**：\`embed\` 自闭合无回退内容，\`object\` 可包含回退内容。

## 3. 安全最佳实践

\`\`\`html
<iframe src="https://trusted-site.com/widget"
  sandbox="allow-scripts allow-forms"
  allow="geolocation"
  referrerpolicy="no-referrer"
  loading="lazy" title="第三方小组件">
</iframe>
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  59,
  'progress与meter',
  'progress与meter',
  'beginner',
  `## 1. progress 元素

\`\`\`html
<progress>加载中...</progress>
<progress value="70" max="100">70%</progress>
\`\`\`

| 属性 | 说明 | 默认值 |
|------|------|--------|
| \`value\` | 当前值 | 0 |
| \`max\` | 最大值 | 1 |

\`\`\`javascript
const progress = document.querySelector('progress');
progress.value = 0.5;
console.log(progress.position); // 0.5
\`\`\`

### 自定义样式

\`\`\`css
progress::-webkit-progress-bar { background: #e0e0e0; border-radius: 10px; }
progress::-webkit-progress-value { background: #4caf50; border-radius: 10px; }
progress::-moz-progress-bar { background: #4caf50; }
\`\`\`

## 2. meter 元素

\`\`\`html
<meter value="0.7" min="0" max="1">70%</meter>
<meter value="85" min="0" max="100" low="60" high="90" optimum="80">85分</meter>
\`\`\`

| 属性 | 说明 | 默认值 |
|------|------|--------|
| \`value\` | 当前值（必需） | 0 |
| \`min\` | 最小值 | 0 |
| \`max\` | 最大值 | 1 |
| \`low\` | 低值区间边界 | min |
| \`high\` | 高值区间边界 | max |
| \`optimum\` | 最优值 | — |

### 区间划分

\`\`\`
min          low          high          max
 |-----------|------------|-------------|
   低值区间     中值区间       高值区间
\`\`\`

颜色规则基于 optimum 所在区间：optimum 所在区间为绿色，远离为黄色/红色。

\`\`\`css
meter::-webkit-meter-optimum-value { background: #4caf50; }
meter::-webkit-meter-suboptimum-value { background: #ff9800; }
meter::-webkit-meter-even-less-good-value { background: #f44336; }
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  60,
  '拖拽API',
  'drag/drop',
  'intermediate',
  `## 1. 拖拽 API 概述

HTML5 原生拖拽 API 允许用户通过拖拽操作在页面内或页面间移动元素和数据。

### 1.1 事件

| 事件 | 触发时机 | 用途 |
|------|---------|------|
| \`dragstart\` | 开始拖拽 | 设置拖拽数据 |
| \`drag\` | 拖拽过程中持续触发 | 更新状态 |
| \`dragend\` | 拖拽结束 | 清理状态 |
| \`dragenter\` | 拖拽进入目标 | 高亮放置区域 |
| \`dragover\` | 拖拽在目标上方 | **必须 preventDefault** |
| \`dragleave\` | 拖拽离开目标 | 取消高亮 |
| \`drop\` | 在目标上释放 | 处理放置逻辑 |

## 2. 基本实现

\`\`\`html
<div id="draggable" draggable="true">拖拽我</div>
<div id="dropzone">放置区域</div>
\`\`\`

\`\`\`javascript
const draggable = document.getElementById('draggable');
const dropzone = document.getElementById('dropzone');

draggable.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault(); // 必须！否则无法触发 drop
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  dropzone.appendChild(document.getElementById(id));
});
\`\`\`

## 3. DataTransfer 对象

\`\`\`javascript
e.dataTransfer.setData('text/plain', '文本数据');
e.dataTransfer.setData('application/json', JSON.stringify({ id: 1 }));
e.dataTransfer.effectAllowed = 'move';
e.dataTransfer.dropEffect = 'copy';

// 自定义拖拽图像
const img = new Image();
img.src = 'drag-icon.png';
e.dataTransfer.setDragImage(img, 0, 0);
\`\`\`

## 4. 文件拖拽

\`\`\`javascript
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  for (const file of files) {
    console.log(\`文件名: \${file.name}, 大小: \${file.size} bytes\`);
  }
});
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  61,
  '地理位置定位',
  'Geolocation',
  'intermediate',
  `## 1. Geolocation API

\`\`\`javascript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('纬度:', position.coords.latitude);
      console.log('经度:', position.coords.longitude);
      console.log('精度:', position.coords.accuracy);
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED: console.error('用户拒绝'); break;
        case error.POSITION_UNAVAILABLE: console.error('位置不可用'); break;
        case error.TIMEOUT: console.error('请求超时'); break;
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}
\`\`\`

### watchPosition

\`\`\`javascript
const watchId = navigator.geolocation.watchPosition(
  (pos) => console.log(\`位置: \${pos.coords.latitude}, \${pos.coords.longitude}\`),
  (err) => console.error(err),
  { enableHighAccuracy: true }
);
navigator.geolocation.clearWatch(watchId);
\`\`\`

## 2. Haversine 距离计算

$$
d = 2r \\cdot \\arcsin\\left(\\sqrt{\\sin^2\\left(\\frac{\\varphi_2 - \\varphi_1}{2}\\right) + \\cos(\\varphi_1) \\cos(\\varphi_2) \\sin^2\\left(\\frac{\\lambda_2 - \\lambda_1}{2}\\right)}\\right)
$$

\`\`\`javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
\`\`\`

## 3. 地理围栏

\`\`\`javascript
class Geofence {
  constructor(centerLat, centerLng, radiusMeters) {
    this.center = { lat: centerLat, lng: centerLng };
    this.radius = radiusMeters;
  }
  contains(lat, lng) {
    return haversineDistance(this.center.lat, this.center.lng, lat, lng) * 1000 <= this.radius;
  }
}
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  62,
  'Web-Workers',
  'Web Workers',
  'advanced',
  `## 1. Web Workers 概述

Web Workers 允许在后台线程中运行 JavaScript，避免 CPU 密集型任务阻塞主线程。

| 特性 | 主线程 | Worker 线程 |
|------|--------|------------|
| DOM 访问 | ✅ | ❌ |
| 网络请求 | ✅ | ✅ |
| IndexedDB | ✅ | ✅ |
| localStorage | ✅ | ❌ |

## 2. Dedicated Worker

**主线程**：

\`\`\`javascript
const worker = new Worker('worker.js');
worker.postMessage({ type: 'CALCULATE', data: [1, 2, 3, 4, 5] });
worker.onmessage = (e) => console.log('Worker 返回:', e.data);
worker.onerror = (e) => console.error('Worker 错误:', e.message);
worker.terminate();
\`\`\`

**Worker 线程（worker.js）**：

\`\`\`javascript
self.onmessage = (e) => {
  const { type, data } = e.data;
  if (type === 'CALCULATE') {
    const result = data.reduce((sum, n) => sum + n * n, 0);
    self.postMessage({ type: 'RESULT', data: result });
  }
};
\`\`\`

### 内联 Worker

\`\`\`javascript
const code = \`self.onmessage = (e) => { self.postMessage(e.data.reduce((s, n) => s + n * n, 0)); };\`;
const blob = new Blob([code], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
\`\`\`

### Transferable Objects

\`\`\`javascript
const buffer = new ArrayBuffer(1024 * 1024);
worker.postMessage({ buffer }, [buffer]); // 零拷贝传输
\`\`\`

## 3. Shared Worker

\`\`\`javascript
const worker = new SharedWorker('shared-worker.js');
worker.port.start();
worker.port.postMessage('Hello');
worker.port.onmessage = (e) => console.log('收到:', e.data);
\`\`\`

## 4. Worker 池

\`\`\`javascript
class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency) {
    this.workers = Array.from({ length: poolSize }, () => new Worker(workerScript));
  }
  execute(data) {
    return new Promise((resolve) => {
      const worker = this.workers.pop();
      worker.onmessage = (e) => { resolve(e.data); this.workers.push(worker); };
      worker.postMessage(data);
    });
  }
  terminate() { this.workers.forEach(w => w.terminate()); }
}
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  63,
  'Service-Worker与PWA',
  'Service Worker与PWA',
  'advanced',
  `## 1. Service Worker 概述

Service Worker 是浏览器后台独立于网页运行的脚本，充当网络代理，支持离线缓存、推送通知和后台同步。

**生命周期**：Installing → Installed(Waiting) → Activating → Activated → Redundant

\`\`\`javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((reg) => console.log('注册成功'))
    .catch((err) => console.error('注册失败:', err));
}
\`\`\`

## 2. 生命周期事件

\`\`\`javascript
const CACHE_NAME = 'app-v1';
const CACHE_URLS = ['/', '/index.html', '/styles.css', '/app.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});
\`\`\`

## 3. 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **Cache First** | 优先缓存 | 静态资源 |
| **Network First** | 优先网络 | API 请求 |
| **Stale While Revalidate** | 缓存即时响应，后台更新 | 非关键 API |

\`\`\`javascript
// Cache First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
\`\`\`

## 4. PWA 基础

\`\`\`json
{
  "name": "我的应用",
  "short_name": "我的App",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1976d2",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" }
  ]
}
\`\`\`

## 5. 推送通知与后台同步

\`\`\`javascript
// 推送通知
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: '新消息' };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') event.waitUntil(syncData());
});
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  64,
  'History-API',
  'History API（pushState、replaceState）',
  'intermediate',
  `## 1. History API 概述

History API 允许 JavaScript 操作浏览器的历史记录栈，实现无刷新页面导航。

| 属性 | 说明 |
|------|------|
| \`length\` | 历史记录栈中的条目数 |
| \`scrollRestoration\` | 滚动恢复策略（auto/manual） |
| \`state\` | 当前历史条目的状态对象 |

## 2. 导航方法

\`\`\`javascript
history.back();     // 后退
history.forward();  // 前进
history.go(-2);     // 后退2步
\`\`\`

### pushState 与 replaceState

\`\`\`javascript
// 添加新历史条目
history.pushState({ page: 'about' }, '', '/about');

// 修改当前历史条目
history.replaceState({ page: 'home' }, '', '/home');
\`\`\`

> **注意**：\`pushState\` 和 \`replaceState\` 不会触发 \`popstate\` 事件。

## 3. popstate 事件

\`\`\`javascript
window.addEventListener('popstate', (event) => {
  if (event.state) renderPage(event.state.page);
});
\`\`\`

## 4. SPA 路由实现

\`\`\`javascript
class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('popstate', () => this.resolve());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.origin === location.origin) {
        e.preventDefault();
        this.navigate(link.pathname);
      }
    });
  }
  addRoute(path, handler) { this.routes[path] = handler; return this; }
  navigate(path, state = {}) { history.pushState(state, '', path); this.resolve(); }
  resolve() { (this.routes[location.pathname] || this.routes['*'])?.(history.state); }
}
\`\`\`

## 5. 注意事项

- URL 必须同源
- 状态对象有大小限制（约 640KB）
- SPA 需服务端配置所有路由返回 index.html
`
);

addFile(
  'html5',
  'HTML5',
  65,
  'WebSocket',
  'WebSocket',
  'intermediate',
  `## 1. WebSocket 概述

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 请求-响应 | 全双工 |
| 连接 | 短连接 | 持久连接 |
| 服务器推送 | ❌ | ✅ |

## 2. WebSocket API

\`\`\`javascript
const ws = new WebSocket('wss://example.com/chat');

ws.onopen = () => { console.log('连接已建立'); ws.send('Hello!'); };
ws.onmessage = (e) => { console.log('收到消息:', e.data); };
ws.onclose = (e) => { console.log('连接关闭:', e.code); };
ws.onerror = () => { console.error('WebSocket 错误'); };
\`\`\`

### 连接状态

| readyState | 常量 | 说明 |
|-----------|------|------|
| 0 | CONNECTING | 正在连接 |
| 1 | OPEN | 连接已建立 |
| 2 | CLOSING | 正在关闭 |
| 3 | CLOSED | 已关闭 |

### 发送与关闭

\`\`\`javascript
ws.send('文本消息');
ws.send(JSON.stringify({ type: 'chat', content: '你好' }));
ws.send(new ArrayBuffer(4));
ws.close(1000, '正常关闭');
\`\`\`

## 3. 断线重连

\`\`\`javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.retries = 0;
    this.options = { reconnectInterval: 1000, ...options };
    this.connect();
  }
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = (e) => { this.retries = 0; this.onopen?.(e); };
    this.ws.onmessage = (e) => this.onmessage?.(e);
    this.ws.onclose = (e) => {
      this.onclose?.(e);
      const delay = Math.min(this.options.reconnectInterval * Math.pow(1.5, this.retries), 30000);
      this.retries++;
      setTimeout(() => this.connect(), delay);
    };
  }
  send(data) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data); }
  close() { this.retries = Infinity; this.ws?.close(); }
}
\`\`\`

## 4. 心跳机制

\`\`\`javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  66,
  'WebRTC',
  'WebRTC（getUserMedia）',
  'advanced',
  `## 1. WebRTC 概述

| 组件 | 说明 |
|------|------|
| **getUserMedia** | 获取本地媒体流 |
| **RTCPeerConnection** | 建立点对点连接 |
| **RTCDataChannel** | 传输任意数据 |

## 2. getUserMedia

\`\`\`javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
const video = document.querySelector('#localVideo');
video.srcObject = stream;
await video.play();
\`\`\`

### 约束条件

\`\`\`javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
  audio: { echoCancellation: true, noiseSuppression: true }
});
\`\`\`

### 屏幕共享

\`\`\`javascript
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
\`\`\`

## 3. RTCPeerConnection

\`\`\`javascript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// 添加本地流
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(t => pc.addTrack(t, stream));

// 接收远端流
pc.ontrack = (e) => { document.getElementById('remote').srcObject = e.streams[0]; };

// ICE 候选
pc.onicecandidate = (e) => { if (e.candidate) sendSignal({ candidate: e.candidate }); };

// 交换 SDP
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
\`\`\`

## 4. RTCDataChannel

\`\`\`javascript
const channel = pc.createDataChannel('chat', { ordered: true });
channel.onopen = () => channel.send('Hello!');
channel.onmessage = (e) => console.log('收到:', e.data);
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  67,
  '微数据与JSON-LD',
  'Microdata与JSON-LD',
  'intermediate',
  `## 1. 结构化数据概述

| 格式 | 嵌入方式 | 优点 | 缺点 |
|------|---------|------|------|
| **Microdata** | HTML 属性 | 与内容一体 | HTML 冗余 |
| **JSON-LD** | \`<script>\` 标签 | 独立于内容，Google 推荐 | 需额外维护 |

## 2. Microdata

\`\`\`html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">张三</span>
  <span itemprop="jobTitle">软件工程师</span>
</div>
\`\`\`

| 属性 | 说明 |
|------|------|
| \`itemscope\` | 声明一个项目 |
| \`itemtype\` | 项目类型（Schema.org URL） |
| \`itemprop\` | 项目属性 |

## 3. JSON-LD

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "深入理解 HTML5",
  "author": { "@type": "Person", "name": "张三" },
  "datePublished": "2026-06-14"
}
</script>
\`\`\`

### 常用类型

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "无线蓝牙耳机",
  "offers": { "@type": "Offer", "price": "299.00", "priceCurrency": "CNY" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5" }
}
\`\`\`

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "什么是 HTML5？", "acceptedAnswer": { "@type": "Answer", "text": "HTML5 是超文本标记语言的最新标准..." } }
  ]
}
\`\`\`

## 4. 验证与测试

- [Google 富摘要测试](https://search.google.com/test/rich-results)
- [Schema.org 验证器](https://validator.schema.org/)
`
);

addFile(
  'html5',
  'HTML5',
  68,
  '自定义数据属性',
  'data-*',
  'beginner',
  `## 1. data-* 属性概述

\`\`\`html
<div id="user" data-user-id="123" data-role="admin" data-login-count="42">用户信息</div>
\`\`\`

**命名规则**：以 \`data-\` 开头，后续只能包含小写字母、数字和连字符。

## 2. JavaScript 访问

### dataset 属性

\`\`\`javascript
const el = document.getElementById('user');
el.dataset.userId;     // "123"（连字符转驼峰）
el.dataset.role;       // "admin"
el.dataset.active = 'true';  // 设置
delete el.dataset.role;       // 删除
\`\`\`

### getAttribute / setAttribute

\`\`\`javascript
el.getAttribute('data-user-id'); // "123"
el.setAttribute('data-user-id', '456');
\`\`\`

## 3. CSS 访问

\`\`\`css
[data-role="admin"] { background: gold; }
[data-featured] { border: 2px solid blue; }
.tooltip::after { content: attr(data-tooltip); }
\`\`\`

## 4. 实际应用

\`\`\`html
<ul id="user-list">
  <li data-user-id="1" data-name="张三">张三</li>
</ul>
\`\`\`

\`\`\`javascript
document.getElementById('user-list').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) console.log(\`用户: \${li.dataset.name} (ID: \${li.dataset.userId})\`);
});
\`\`\`

## 5. 注意事项

- data-* 值始终是字符串，需手动类型转换
- 不建议存储大量数据，大数据用 WeakMap
- 避免用 \`innerHTML\` 输出 data-* 值（XSS 风险）
`
);

addFile(
  'html5',
  'HTML5',
  69,
  '跨文档通信',
  'postMessage',
  'intermediate',
  `## 1. postMessage 概述

\`window.postMessage\` 是一种安全的跨源通信机制，允许不同窗口/iframe 之间传递数据。

## 2. 基本用法

\`\`\`javascript
// 发送
iframe.contentWindow.postMessage({ type: 'GREETING' }, 'https://example.com');
window.parent.postMessage({ type: 'RESULT' }, '*');

// 接收
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://example.com') return;
  console.log('来源:', event.origin);
  console.log('数据:', event.data);
});
\`\`\`

### MessageEvent 属性

| 属性 | 说明 |
|------|------|
| \`data\` | 传递的数据 |
| \`origin\` | 发送方的源 |
| \`source\` | 发送方的 window 引用 |

## 3. 安全实践

\`\`\`javascript
window.addEventListener('message', (event) => {
  // ✅ 验证来源
  if (event.origin !== 'https://trusted-domain.com') return;
  // ✅ 验证数据格式
  if (typeof event.data !== 'object' || !event.data.type) return;
  handleMessage(event.data);
});
\`\`\`

**始终指定 targetOrigin**：

\`\`\`javascript
// ✅ 指定确切的目标源
iframe.contentWindow.postMessage(data, 'https://specific-domain.com');
// ❌ 使用通配符（不安全）
iframe.contentWindow.postMessage(data, '*');
\`\`\`

## 4. Channel Messaging API

\`\`\`javascript
const channel = new MessageChannel();
channel.port1.onmessage = (e) => console.log('收到:', e.data);
iframe.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channel.port2]);
\`\`\`
`
);

addFile(
  'html5',
  'HTML5',
  70,
  '视口配置与移动优先',
  'viewport、移动优先设计',
  'beginner',
  `## 1. 视口概念

| 视口类型 | 说明 |
|---------|------|
| **布局视口** | 浏览器用于计算 CSS 布局的视口 |
| **视觉视口** | 用户实际看到的区域 |
| **理想视口** | 设备屏幕的理想尺寸 |

\`\`\`javascript
console.log(document.documentElement.clientWidth);  // 布局视口
console.log(window.visualViewport.width);            // 视觉视口
\`\`\`

## 2. viewport meta 标签

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`

| 属性 | 值 | 说明 |
|------|---|------|
| \`width\` | device-width | 布局视口宽度 |
| \`initial-scale\` | 1.0 | 初始缩放比例 |
| \`maximum-scale\` | 1.0-10.0 | 最大缩放比例 |
| \`user-scalable\` | yes/no | 是否允许用户缩放 |
| \`viewport-fit\` | auto/contain/cover | 适配刘海屏 |

> **可访问性警告**：禁止用户缩放会影响视力不佳的用户，WCAG 要求支持 200% 缩放。

## 3. 设备像素比

$$
\\text{DPR} = \\frac{\\text{物理像素}}{\\text{CSS 像素}}
$$

\`\`\`javascript
console.log(window.devicePixelRatio); // 1, 2, 3 等
\`\`\`

## 4. 移动优先设计

\`\`\`css
/* 移动优先：基础样式 */
.container { padding: 1rem; display: flex; flex-direction: column; }

/* 平板 */
@media (min-width: 768px) { .container { padding: 2rem; flex-direction: row; } }

/* 桌面 */
@media (min-width: 1024px) { .container { max-width: 1200px; margin: 0 auto; } }
\`\`\`

## 5. 安全区域适配

\`\`\`css
.header { padding-top: env(safe-area-inset-top); }
.footer { padding-bottom: env(safe-area-inset-bottom); }
\`\`\`

## 6. 响应式断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| xs | < 576px | 手机 |
| sm | ≥ 576px | 大手机 |
| md | ≥ 768px | 平板 |
| lg | ≥ 992px | 小桌面 |
| xl | ≥ 1200px | 桌面 |
`
);

// ==================== CSS ====================
addFile(
  'css',
  'CSS',
  50,
  '伪类与伪元素',
  ':nth-child、:not、:is、::before、::after',
  'intermediate',
  `## 1. 伪类概述

伪类用于匹配元素的特定状态。

| 类别 | 示例 | 说明 |
|------|------|------|
| 交互状态 | \`:hover\`, \`:focus\`, \`:active\` | 用户交互 |
| 位置 | \`:first-child\`, \`:nth-child()\` | DOM 位置 |
| 输入状态 | \`:checked\`, \`:disabled\` | 表单状态 |
| 否定 | \`:not()\` | 排除匹配 |
| 匹配 | \`:is()\`, \`:where()\`, \`:has()\` | 复杂匹配 |

## 2. :nth-child()

\`\`\`css
li:nth-child(3) { color: red; }         /* 第 3 个 */
tr:nth-child(odd) { background: #f0f0f0; } /* 奇数 */
li:nth-child(3n+1) { color: blue; }     /* 每 3 个选第 1 个 */
li:nth-child(-n+3) { font-weight: bold; } /* 前 3 个 */
\`\`\`

**An+B 语法**：\`2n+1\` = odd，\`2n\` = even，\`-n+3\` = 前3个

### nth-child vs nth-of-type

\`\`\`html
<div>
  <h1>标题</h1>     <!-- h1:first-of-type -->
  <p>段落1</p>      <!-- p:nth-of-type(1) -->
  <p>段落2</p>      <!-- p:nth-of-type(2) -->
</div>
\`\`\`

## 3. 否定与匹配伪类

\`\`\`css
li:not(:last-child) { border-bottom: 1px solid #ccc; }
:is(h1, h2, h3):hover { color: blue; }
:where(h1, h2, h3) { margin: 0; }  /* 优先级为 0 */
a:has(> img) { border: none; }
\`\`\`

## 4. 交互伪类

\`\`\`css
a:hover { color: blue; }
input:focus-visible { box-shadow: 0 0 0 3px rgba(0,0,255,0.3); }
input:focus-within { border-color: blue; }
button:active { transform: scale(0.98); }
\`\`\`

## 5. 伪元素

\`\`\`css
.quote::before { content: "\\201C"; font-size: 2em; }
.clearfix::after { content: ""; display: table; clear: both; }
p::first-line { font-weight: bold; }
p::first-letter { font-size: 3em; float: left; }
::selection { background: #ff6b6b; color: white; }
input::placeholder { color: #999; }
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  51,
  '优先级计算',
  '权重规则',
  'intermediate',
  `## 1. 优先级层级

| 优先级 | 选择器类型 | 示例 | 权重 |
|--------|-----------|------|------|
| A | 内联样式 | \`style="..."\` | (1,0,0,0) |
| B | ID 选择器 | \`#header\` | (0,1,0,0) |
| C | 类/属性/伪类 | \`.nav\`, \`:hover\` | (0,0,1,0) |
| D | 元素/伪元素 | \`div\`, \`::before\` | (0,0,0,1) |

比较规则：A > B > C > D，逐位比较。

\`\`\`
#nav .list li:hover → (0, 1, 2, 1)
.nav li             → (0, 0, 1, 1)
li                  → (0, 0, 0, 1)
\`\`\`

## 2. 特殊情况

### !important

\`\`\`css
.text { color: red !important; }  /* 优先级最高 */
\`\`\`

优先级：内联 !important > 普通 !important > 内联 > 普通

### :where() 和 :is()

\`\`\`css
:is(#id, .class) p { }    /* 取最高：(0,1,0,1) */
:where(#id, .class) p { } /* 始终为 0：(0,0,0,1) */
\`\`\`

### 不影响优先级

通配符 \`*\`、组合符 \`>\` \`+\` \`~\`、\`:not()\` 本身不计（参数计）

## 3. 层叠规则

优先级相同时：来源 > 层叠层 > 顺序

## 4. 最佳实践

- 避免使用 \`!important\`
- 避免使用 ID 选择器
- 使用 BEM 命名控制优先级
- 利用 \`@layer\` 管理优先级
`
);

addFile(
  'css',
  'CSS',
  52,
  '样式表引入方式',
  '内联、嵌入、外部、导入',
  'beginner',
  `## 1. 四种引入方式

### 内联样式
\`\`\`html
<p style="color: red;">内联样式</p>
\`\`\`
优先级最高、无法复用、不推荐。

### 嵌入样式
\`\`\`html
<style>p { color: blue; }</style>
\`\`\`
仅当前页面有效、无法缓存。

### 外部样式表
\`\`\`html
<link rel="stylesheet" href="styles.css">
\`\`\`
可复用、可缓存、**推荐方式**。

### @import 导入
\`\`\`css
@import url('reset.css');
\`\`\`
串行加载（性能差）、避免在顶层使用。

## 2. 对比

| 方式 | 复用性 | 缓存 | 性能 | 推荐度 |
|------|--------|------|------|--------|
| 内联 | ❌ | ❌ | 差 | ⭐ |
| 嵌入 | ❌ | ❌ | 中 | ⭐⭐ |
| 外部 | ✅ | ✅ | 好 | ⭐⭐⭐⭐⭐ |
| @import | ✅ | ✅ | 差 | ⭐⭐ |

## 3. 关键 CSS 内联

\`\`\`html
<head>
  <style>.hero { height: 100vh; }</style>
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  53,
  'margin合并与塌陷',
  'margin合并与塌陷',
  'intermediate',
  `## 1. margin 合并

当两个垂直外边距相遇时，合并为一个，取较大值。

\`\`\`css
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 30px; }
/* 实际间距：30px（取较大值），而非 50px */
\`\`\`

### 合并场景

| 场景 | 示例 |
|------|------|
| 相邻兄弟 | 两个 \`<p>\` 之间 |
| 父元素与首个子元素 | 父 margin-top 与子 margin-top |
| 父元素与末尾子元素 | 父 margin-bottom 与子 margin-bottom |
| 空块元素 | 自身的 margin-top 与 margin-bottom |

### 合并规则

$$
\\text{合并后 margin} = \\max(margin_1, margin_2)
$$

## 2. margin 塌陷

子元素的 margin-top 传递给父元素。

### 解决方案

| 方案 | CSS | 说明 |
|------|-----|------|
| 父元素加 border | \`border-top: 1px solid transparent\` | 触发 BFC |
| 父元素加 padding | \`padding-top: 1px\` | 触发 BFC |
| 父元素 overflow | \`overflow: hidden\` | 触发 BFC |
| 父元素 display | \`display: flow-root\` | **推荐** |

## 3. BFC（块格式化上下文）

触发条件：\`display: flow-root\`、\`overflow: hidden\`、\`float\`、\`position: absolute/fixed\`、\`display: inline-block/flex/grid\`

BFC 作用：阻止 margin 塌陷、包含浮动元素、阻止被浮动元素覆盖。
`
);

addFile(
  'css',
  'CSS',
  54,
  '定位详解',
  'static、relative、absolute、fixed、sticky',
  'intermediate',
  `## 1. position 属性

| 值 | 定位类型 | 脱离文档流 | 参照物 |
|----|---------|-----------|--------|
| \`static\` | 默认 | ❌ | — |
| \`relative\` | 相对定位 | ❌ | 自身原位置 |
| \`absolute\` | 绝对定位 | ✅ | 最近定位祖先 |
| \`fixed\` | 固定定位 | ✅ | 视口 |
| \`sticky\` | 粘性定位 | ❌→✅ | 滚动容器 |

## 2. relative

\`\`\`css
.element { position: relative; top: 10px; left: 20px; }
\`\`\`
不脱离文档流，原位置保留。常作 absolute 的参照容器。

## 3. absolute

\`\`\`css
.parent { position: relative; }
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
\`\`\`
脱离文档流，参照最近定位祖先。

## 4. fixed

\`\`\`css
.header { position: fixed; top: 0; width: 100%; z-index: 100; }
\`\`\`
参照视口，滚动时固定。注意 transform 会改变包含块。

## 5. sticky

\`\`\`css
.sidebar { position: sticky; top: 20px; }
th { position: sticky; top: 0; background: white; z-index: 1; }
\`\`\`
阈值前 relative，达到后 fixed。必须指定 top/bottom。

## 6. z-index

\`\`\`css
:root { --z-dropdown: 100; --z-modal: 300; --z-toast: 400; }
\`\`\`
z-index 仅对定位元素生效；同一层叠上下文内比较；子元素无法超越父上下文。
`
);

addFile(
  'css',
  'CSS',
  55,
  '浮动与清除',
  'float、clear',
  'beginner',
  `## 1. float 属性

\`\`\`css
img { float: left; margin-right: 1rem; }
\`\`\`

| 值 | 说明 |
|----|------|
| \`left\` | 左浮动 |
| \`right\` | 右浮动 |
| \`none\` | 不浮动（默认） |

浮动特性：脱离文档流但不脱离文本流；尽量靠左/右排列。

## 2. 清除浮动

### 父元素高度塌陷问题

\`\`\`css
/* 方式1：clearfix */
.clearfix::after { content: ""; display: block; clear: both; }

/* 方式2：BFC */
.container { overflow: hidden; }

/* 方式3：flow-root（推荐） */
.container { display: flow-root; }
\`\`\`

## 3. 现代替代方案

\`\`\`css
/* ❌ 旧方式 */
.sidebar { float: left; width: 25%; }

/* ✅ 新方式 */
.layout { display: flex; }
.sidebar { width: 25%; }
\`\`\`

浮动仍适用于：文字环绕图片。
`
);

addFile(
  'css',
  'CSS',
  56,
  '层叠上下文',
  'z-index',
  'intermediate',
  `## 1. 层叠上下文概述

层叠上下文决定元素在 Z 轴上的显示顺序。

### 层叠顺序（从底到顶）

1. 层叠上下文的背景和边框
2. 负 z-index 子元素
3. 常规流块级盒子
4. 浮动盒子
5. 常规流行内盒子
6. z-index: 0 的定位元素
7. 正 z-index 的定位元素

## 2. 创建层叠上下文

| 条件 | 示例 |
|------|------|
| position + z-index | \`position: relative; z-index: 1\` |
| opacity < 1 | \`opacity: 0.9\` |
| transform | \`transform: translateZ(0)\` |
| filter | \`filter: blur(5px)\` |
| will-change | \`will-change: transform\` |
| isolation | \`isolation: isolate\` |

**推荐创建方式**：\`isolation: isolate\`（无副作用）

## 3. z-index 规则

同一层叠上下文内比较 z-index；嵌套层叠上下文中，子元素无法超越父上下文。

## 4. 最佳实践

\`\`\`css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  57,
  '渐变',
  'linear-gradient、radial-gradient、conic-gradient',
  'intermediate',
  `## 1. 线性渐变

\`\`\`css
background: linear-gradient(to right, red, blue);
background: linear-gradient(135deg, #667eea, #764ba2);
background: linear-gradient(red 0%, yellow 50%, blue 100%);
background: linear-gradient(red 50%, blue 50%); /* 硬边界 */
\`\`\`

重复线性渐变：

\`\`\`css
background: repeating-linear-gradient(45deg, #fff 0px, #fff 10px, #000 10px, #000 20px);
\`\`\`

## 2. 径向渐变

\`\`\`css
background: radial-gradient(circle, red, blue);
background: radial-gradient(circle 100px at center, red, blue);
background: radial-gradient(circle closest-side at 50% 50%, red, blue);
\`\`\`

| 大小关键字 | 说明 |
|-----------|------|
| \`closest-side\` | 到最近边 |
| \`farthest-corner\` | 到最远角（默认） |

## 3. 锥形渐变

\`\`\`css
background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
background: conic-gradient(red 0% 30%, blue 30% 70%, green 70% 100%);
background: conic-gradient(from 45deg at 50% 50%, red, blue);
\`\`\`

## 4. 实战效果

\`\`\`css
/* 渐变文字 */
.gradient-text {
  background: linear-gradient(to right, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 渐变边框 */
.gradient-border {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(to right, #667eea, #764ba2) border-box;
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  58,
  '阴影',
  'box-shadow、text-shadow',
  'beginner',
  `## 1. box-shadow

\`\`\`css
box-shadow: offset-x offset-y blur-radius spread-radius color inset;
\`\`\`

\`\`\`css
.box { box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); }
.box { box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); }
.box {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.07),
    0 2px 4px rgba(0, 0, 0, 0.07),
    0 4px 8px rgba(0, 0, 0, 0.07);
}
\`\`\`

## 2. text-shadow

\`\`\`css
.text { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); }
.neon { text-shadow: 0 0 7px #fff, 0 0 42px #0fa, 0 0 82px #0fa; }
\`\`\`

## 3. 实战效果

\`\`\`css
.card { box-shadow: 0 1px 3px rgba(0,0,0,.12); transition: box-shadow 0.3s; }
.card:hover { box-shadow: 0 10px 40px rgba(0,0,0,.15); }

.elevation-1 { box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24); }
.elevation-2 { box-shadow: 0 3px 6px rgba(0,0,0,.16), 0 3px 6px rgba(0,0,0,.23); }
\`\`\`

## 4. drop-shadow 滤镜

\`\`\`css
.icon { filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3)); }
\`\`\`

box-shadow 沿盒子形状，drop-shadow 沿元素实际轮廓（适合 PNG 图标）。
`
);

addFile(
  'css',
  'CSS',
  59,
  '背景增强',
  '多背景、background-size、background-clip、background-origin',
  'intermediate',
  `## 1. 多背景

\`\`\`css
.element {
  background:
    url('overlay.png') no-repeat center,
    linear-gradient(to right, #667eea, #764ba2);
}
\`\`\`

第一个声明在最上层，最后一个在最底层。

## 2. background-size

\`\`\`css
background-size: cover;     /* 等比缩放覆盖容器 */
background-size: contain;   /* 等比缩放完整显示 */
background-size: 100px 200px;
background-size: 50% 100%;
\`\`\`

## 3. background-clip

\`\`\`css
background-clip: border-box;  /* 默认 */
background-clip: padding-box;
background-clip: content-box;
background-clip: text;        /* 仅文字区域 */
\`\`\`

渐变文字效果：

\`\`\`css
.gradient-text {
  background: linear-gradient(to right, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
\`\`\`

## 4. background-origin

\`\`\`css
background-origin: padding-box;  /* 默认 */
background-origin: border-box;
background-origin: content-box;
\`\`\`

origin 是背景图片定位的起始点，clip 是背景绘制的裁剪区域。

## 5. background-attachment

\`\`\`css
background-attachment: scroll;  /* 默认，随页面滚动 */
background-attachment: fixed;   /* 固定不动 */
background-attachment: local;   /* 随元素内容滚动 */
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  60,
  '边框圆角',
  'border-radius',
  'beginner',
  `## 1. border-radius 语法

\`\`\`css
.box { border-radius: 10px; }
.box { border-radius: 10px 20px 30px 40px; } /* 左上 右上 右下 左下 */
.box { border-radius: 50px / 20px; } /* 水平/垂直半径 */
\`\`\`

## 2. 常见形状

\`\`\`css
.circle { border-radius: 50%; }
.pill { border-radius: 9999px; }
.leaf { border-radius: 0 100% 0 100%; }
.diagonal { border-radius: 50% 0 50% 0; }
.blob { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
\`\`\`

## 3. 实战效果

\`\`\`css
.bubble { border-radius: 12px; border-bottom-left-radius: 2px; }
.card { border-radius: 8px; overflow: hidden; }
.button { border-radius: 6px; transition: border-radius 0.3s; }
.button:hover { border-radius: 12px; }
\`\`\`

## 4. 注意事项

- 百分比参照元素尺寸
- 圆角不会裁剪溢出内容（需配合 \`overflow: hidden\`）
- 表格 \`border-collapse: collapse\` 时圆角无效
`
);

addFile(
  'css',
  'CSS',
  61,
  '媒体查询',
  '@media',
  'intermediate',
  `## 1. @media 语法

\`\`\`css
@media screen and (min-width: 768px) { /* 样式 */ }
\`\`\`

### 媒体类型：\`all\`（默认）、\`screen\`、\`print\`、\`speech\`

### 逻辑操作符：\`and\`、逗号（or）、\`not\`、\`only\`

## 2. 常用媒体特性

\`\`\`css
@media (min-width: 768px) { }              /* 视口宽度 */
@media (orientation: portrait) { }          /* 竖屏 */
@media (prefers-color-scheme: dark) { }     /* 深色模式 */
@media (prefers-reduced-motion: reduce) { } /* 减少动画 */
@media (hover: hover) { }                  /* 支持悬停 */
@media (pointer: fine) { }                 /* 精确指针 */
\`\`\`

## 3. 响应式断点

\`\`\`css
.container { padding: 1rem; }
@media (min-width: 576px) { .container { padding: 1.5rem; } }
@media (min-width: 768px) { .container { padding: 2rem; } }
@media (min-width: 992px) { .container { max-width: 960px; margin: 0 auto; } }
\`\`\`

## 4. 深色模式

\`\`\`css
:root { --bg: #fff; --text: #333; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #1a1a1a; --text: #e0e0e0; }
}
\`\`\`

## 5. JavaScript 检测

\`\`\`javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  console.log('深色模式:', e.matches);
});
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  62,
  '容器查询',
  '@container',
  'advanced',
  `## 1. 容器查询概述

容器查询允许根据父容器的尺寸而非视口尺寸应用样式。

| 特性 | 媒体查询 | 容器查询 |
|------|---------|---------|
| 参照物 | 视口 | 父容器 |
| 组件独立性 | ❌ | ✅ |

## 2. 基本用法

\`\`\`css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { display: flex; gap: 1rem; }
}

@container card (min-width: 200px) and (max-width: 399px) {
  .card { display: block; }
}
\`\`\`

## 3. container-type

| 值 | 说明 |
|----|------|
| \`inline-size\` | 按行内尺寸查询（最常用） |
| \`size\` | 按宽高查询 |
| \`normal\` | 默认，不作为查询容器 |

## 4. 样式查询

\`\`\`css
.card-container { --theme: dark; }
@container style(--theme: dark) {
  .card { background: #1a1a1a; color: white; }
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  63,
  '移动端适配',
  'rem、vw、vh、clamp',
  'intermediate',
  `## 1. 适配单位

| 单位 | 参照物 | 特点 |
|------|--------|------|
| \`rem\` | 根元素字体大小 | 全局缩放 |
| \`em\` | 父元素字体大小 | 局部缩放 |
| \`vw\` | 视口宽度 1% | 响应视口 |
| \`vh\` | 视口高度 1% | 响应视口 |
| \`vmin\` | 视口较小边 1% | 适配短边 |

## 2. rem 适配

\`\`\`css
html { font-size: 62.5%; } /* 1rem = 10px */
body { font-size: 1.6rem; } /* 16px */
\`\`\`

## 3. vw 适配

\`\`\`css
/* 设计稿 375px，元素 100px → 100/375*100 = 26.67vw */
.element { width: 26.67vw; }
\`\`\`

## 4. clamp() 函数

\`\`\`css
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
.container { width: clamp(300px, 80vw, 1200px); }
\`\`\`

$$
\\text{font-size} = \\text{clamp}(\\text{min}, \\text{preferred}, \\text{max})
$$

## 5. 安全区域与1px边框

\`\`\`css
.header { padding-top: env(safe-area-inset-top); }
.border-1px::after {
  content: ""; position: absolute; bottom: 0; width: 100%; height: 1px;
  background: #ccc; transform: scaleY(0.5);
}
\`\`\`

## 6. dvh 单位

\`\`\`css
.full-screen { height: 100dvh; } /* 动态视口高度，解决移动端 vh 问题 */
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  64,
  '函数',
  'calc、min、max、clamp',
  'intermediate',
  `## 1. calc() 函数

\`\`\`css
.element { width: calc(100% - 60px); }
.element { height: calc(50vh - 2rem); }
.element { font-size: calc(16px + 0.5vw); }
\`\`\`

规则：可以混合不同单位；运算符前后必须有空格；可以嵌套。

## 2. min() 函数

\`\`\`css
.element { width: min(50vw, 400px); } /* 取较小值 */
\`\`\`

## 3. max() 函数

\`\`\`css
.element { width: max(50vw, 300px); } /* 取较大值 */
\`\`\`

## 4. clamp() 函数

\`\`\`css
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
\`\`\`

等价于：

\`\`\`css
h1 {
  font-size: 1.5rem;
  font-size: max(1.5rem, min(5vw, 3rem));
}
\`\`\`

## 5. 其他 CSS 函数

\`\`\`css
.element { 
  width: var(--width, 100%);           /* 自定义属性 */
  transform: translateX(50px);          /* 变换 */
  filter: blur(5px);                    /* 滤镜 */
  color: color-mix(in srgb, red 50%, blue); /* 颜色混合 */
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  65,
  '特性查询',
  '@supports',
  'intermediate',
  `## 1. @supports 语法

\`\`\`css
@supports (display: grid) {
  .container { display: grid; }
}

@supports not (display: grid) {
  .container { display: flex; }
}
\`\`\`

### 逻辑操作符

\`\`\`css
@supports (display: grid) and (gap: 1rem) { }
@supports (display: flex) or (display: grid) { }
@supports not (display: grid) { }
\`\`\`

## 2. 常用检测

\`\`\`css
@supports (backdrop-filter: blur(10px)) { .glass { backdrop-filter: blur(10px); } }
@supports (aspect-ratio: 1/1) { .square { aspect-ratio: 1/1; } }
@supports (selector(:has(*))) { .card:has(.badge) { border-color: gold; } }
\`\`\`

## 3. JavaScript 检测

\`\`\`javascript
if (CSS.supports('display', 'grid')) { /* 使用 Grid */ }
if (CSS.supports('(display: grid) and (gap: 1rem)')) { /* 使用 Grid + gap */ }
\`\`\`

## 4. 渐进增强策略

\`\`\`css
/* 基础样式 */
.container { display: flex; flex-wrap: wrap; }
.item { width: 50%; }

/* 增强样式 */
@supports (display: grid) {
  .container { display: grid; grid-template-columns: 1fr 1fr; }
  .item { width: auto; }
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  66,
  '层叠层',
  '@layer',
  'advanced',
  `## 1. @layer 概述

CSS 层叠层（Cascade Layers）允许开发者将 CSS 规则分组到不同的层中，控制层叠优先级。

\`\`\`css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: sans-serif; line-height: 1.6; }
}

@layer components {
  .card { border-radius: 8px; padding: 1rem; }
}

@layer utilities {
  .hidden { display: none; }
}
\`\`\`

## 2. 层优先级

**后声明的层优先级更高**：reset < base < components < utilities

**未分层的规则优先级最高**（高于所有层）。

## 3. 嵌套层

\`\`\`css
@layer framework {
  @layer base { .btn { padding: 8px; } }
  @layer theme { .btn { color: blue; } }
}

/* 引用嵌套层 */
@layer framework.theme {
  .btn { color: red; }
}
\`\`\`

## 4. @import 与 @layer

\`\`\`css
@import url('reset.css') layer(reset);
@import url('base.css') layer(base);
\`\`\`

## 5. 最佳实践

- 使用 \`@layer\` 声明层顺序
- 第三方样式放在低优先级层
- 自定义样式放在高优先级层
- 工具类放在最高优先级层
`
);

addFile(
  'css',
  'CSS',
  67,
  '逻辑属性',
  'margin-inline、margin-block',
  'intermediate',
  `## 1. 逻辑属性概述

逻辑属性根据书写模式（writing mode）自动适配方向，替代物理方向属性。

### 物理属性 vs 逻辑属性

| 物理属性 | 逻辑属性 | 说明 |
|---------|---------|------|
| \`margin-top\` | \`margin-block-start\` | 块轴起始 |
| \`margin-bottom\` | \`margin-block-end\` | 块轴结束 |
| \`margin-left\` | \`margin-inline-start\` | 行内轴起始 |
| \`margin-right\` | \`margin-inline-end\` | 行内轴结束 |
| \`width\` | \`inline-size\` | 行内尺寸 |
| \`height\` | \`block-size\` | 块尺寸 |
| \`top\` | \`inset-block-start\` | 块轴偏移 |
| \`left\` | \`inset-inline-start\` | 行内轴偏移 |

## 2. 简写属性

\`\`\`css
/* margin */
margin-block: 10px 20px;        /* block-start block-end */
margin-inline: 15px;            /* inline-start = inline-end */
margin: 10px 15px;              /* block inline */

/* padding */
padding-block: 1rem;
padding-inline: 2rem;

/* inset */
inset-block-start: 0;
inset-inline-start: 0;
inset: 0;                       /* 四个方向 */

/* size */
inline-size: 100%;
block-size: auto;
\`\`\`

## 3. 边框与圆角

\`\`\`css
border-block-start: 1px solid #ccc;
border-inline-end: 2px dashed #999;
border-start-start-radius: 8px;  /* 行内起始 + 块起始 */
border-end-end-radius: 8px;      /* 行内结束 + 块结束 */
\`\`\`

## 4. 书写模式适配

\`\`\`css
/* 水平书写模式（默认） */
.element { writing-mode: horizontal-tb; }
/* margin-block-start = margin-top */

/* 垂直书写模式 */
.element { writing-mode: vertical-rl; }
/* margin-block-start = margin-right */
\`\`\`

## 5. 国际化支持

\`\`\`css
/* 自动适配 RTL 语言 */
[dir="rtl"] .element { /* 无需额外样式 */ }

/* 使用逻辑属性后，RTL 自动适配 */
.element {
  margin-inline-start: 1rem;  /* LTR: left, RTL: right */
  padding-inline-end: 2rem;
}
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  68,
  '滚动捕捉',
  'scroll-snap',
  'intermediate',
  `## 1. scroll-snap 概述

CSS 滚动捕捉允许创建类似轮播图的滚动效果，滚动停止时自动对齐到指定位置。

## 2. 容器属性

\`\`\`css
.scroll-container {
  scroll-snap-type: x mandatory;  /* 方向 + 严格度 */
  overflow-x: auto;
}
\`\`\`

### scroll-snap-type

| 方向 | 说明 |
|------|------|
| \`x\` | 水平捕捉 |
| \`y\` | 垂直捕捉 |
| \`both\` | 双向捕捉 |

| 严格度 | 说明 |
|--------|------|
| \`mandatory\` | 必须捕捉（强对齐） |
| \`proximity\` | 接近时捕捉（默认） |

## 3. 子元素属性

\`\`\`css
.scroll-item {
  scroll-snap-align: start;    /* 对齐方式 */
  scroll-snap-stop: always;    /* 停止行为 */
}
\`\`\`

### scroll-snap-align

| 值 | 说明 |
|----|------|
| \`start\` | 对齐容器起始 |
| \`center\` | 对齐容器中心 |
| \`end\` | 对齐容器结束 |

### scroll-snap-stop

| 值 | 说明 |
|----|------|
| \`normal\` | 可以跳过（默认） |
| \`always\` | 必须停止 |

## 4. 实战：轮播图

\`\`\`css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 20px;
}

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
}
\`\`\`

## 5. 实战：全屏滚动

\`\`\`css
.fullpage {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.fullpage-section {
  height: 100vh;
  scroll-snap-align: start;
}
\`\`\`

## 6. scroll-margin 和 scroll-padding

\`\`\`css
/* 捕捉偏移 */
.snap-item { scroll-margin: 80px; }        /* 元素偏移 */
.container { scroll-padding: 80px; }        /* 容器偏移 */
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  69,
  'Sass',
  'Sass（变量、嵌套、混合、继承、运算、模块化）',
  'intermediate',
  `## 1. Sass 概述

Sass 是最流行的 CSS 预处理器，提供变量、嵌套、混合、继承等特性。

### 语法：SCSS（大括号）vs Sass（缩进）

\`\`\`scss
// SCSS 语法（推荐）
$primary: #3498db;

.btn {
  background: $primary;
  &:hover { opacity: 0.8; }
}
\`\`\`

## 2. 变量

\`\`\`scss
$font-stack: 'Helvetica Neue', sans-serif;
$primary: #3498db;
$spacing: 1rem;

body { font-family: $font-stack; color: $primary; }
\`\`\`

## 3. 嵌套

\`\`\`scss
.nav {
  ul { list-style: none; }
  li { display: inline-block; }
  a {
    text-decoration: none;
    &:hover { color: blue; }  /* & 引用父选择器 */
  }
}
\`\`\`

## 4. 混合（Mixin）

\`\`\`scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin respond-to($breakpoint) {
  @if $breakpoint == md { @media (min-width: 768px) { @content; } }
  @if $breakpoint == lg { @media (min-width: 1024px) { @content; } }
}

.container { @include flex-center; }
.sidebar { @include respond-to(md) { width: 25%; } }
\`\`\`

## 5. 继承（Extend）

\`\`\`scss
%button-base {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary { @extend %button-base; background: blue; }
.btn-secondary { @extend %button-base; background: gray; }
\`\`\`

## 6. 运算与函数

\`\`\`scss
$base: 16px;
h1 { font-size: $base * 2; }
h2 { font-size: $base * 1.5; }

@function rem($px) {
  @return ($px / 16) * 1rem;
}
h1 { font-size: rem(32); }
\`\`\`

## 7. 模块化

\`\`\`scss
// _variables.scss
$primary: #3498db;

// _mixins.scss
@mixin flex-center { display: flex; justify-content: center; align-items: center; }

// main.scss
@use 'variables' as *;
@use 'mixins' as *;
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  70,
  'Less与Stylus',
  'Less与Stylus',
  'intermediate',
  `## 1. Less

Less 是一种 CSS 预处理器，语法接近 CSS，学习成本低。

### 1.1 变量

\`\`\`less
@primary: #3498db;
@spacing: 1rem;

body { color: @primary; padding: @spacing; }
\`\`\`

### 1.2 混合

\`\`\`less
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container { .flex-center(); }
\`\`\`

### 1.3 嵌套与运算

\`\`\`less
.nav {
  a { color: @primary; &:hover { opacity: 0.8; } }
}

@base: 16px;
h1 { font-size: @base * 2; }
\`\`\`

## 2. Stylus

Stylus 提供更灵活的语法，大括号和分号均可省略。

### 2.1 变量

\`\`\`stylus
primary = #3498db
spacing = 1rem

body
  color primary
  padding spacing
\`\`\`

### 2.2 混合

\`\`\`stylus
flex-center()
  display flex
  justify-content center
  align-items center

.container
  flex-center()
\`\`\`

### 2.3 函数

\`\`\`stylus
rem(px)
  (px / 16) * 1rem

h1
  font-size rem(32)
\`\`\`

## 3. 对比

| 特性 | Sass | Less | Stylus |
|------|------|------|--------|
| 语法 | SCSS/Sass | 类 CSS | 灵活 |
| 变量 | \`$\` | \`@\` | 自定义 |
| 混合 | @mixin/@include | .class() | function() |
| 继承 | @extend | :extend() | @extend |
| 条件 | @if/@else | when guards | if/else |
| 循环 | @for/@each | 循环需递归 | for/in |
| 社区 | 最大 | 较大 | 较小 |
`
);

addFile(
  'css',
  'CSS',
  71,
  'PostCSS',
  'PostCSS（autoprefixer、cssnano）',
  'intermediate',
  `## 1. PostCSS 概述

PostCSS 是一个用 JavaScript 插件转换 CSS 的工具，本身不提供任何功能，通过插件实现。

\`\`\`javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' })
  ]
};
\`\`\`

## 2. 常用插件

### 2.1 autoprefixer

自动添加浏览器前缀：

\`\`\`css
/* 输入 */
.container { display: flex; }

/* 输出 */
.container { display: -webkit-box; display: -ms-flexbox; display: flex; }
\`\`\`

\`\`\`json
// package.json → browserslist
"browserslist": ["last 2 versions", "> 1%", "not dead"]
\`\`\`

### 2.2 cssnano

CSS 压缩优化：

\`\`\`css
/* 输入 */
.container { margin: 0px; color: #ff0000; }

/* 输出 */
.container{margin:0;color:red}
\`\`\`

### 2.3 postcss-preset-env

使用未来 CSS 特性：

\`\`\`css
/* 输入 */
@custom-media --md (min-width: 768px);
@media (--md) { .container { width: 750px; } }

/* 输出 */
@media (min-width: 768px) { .container { width: 750px; } }
\`\`\`

### 2.4 postcss-nesting

CSS 原生嵌套：

\`\`\`css
.card {
  padding: 1rem;
  & .title { font-size: 1.5rem; }
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
}
\`\`\`

## 3. 与构建工具集成

\`\`\`bash
# Vite
npm install -D postcss autoprefixer

# Webpack
npm install -D postcss-loader autoprefixer
\`\`\`

## 4. 自定义插件

\`\`\`javascript
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-my-plugin',
    Declaration(decl) {
      if (decl.prop === 'color' && decl.value === 'primary') {
        decl.value = opts.primary || '#3498db';
      }
    }
  };
};
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  72,
  'BEM命名方法论',
  'BEM命名方法论',
  'intermediate',
  `## 1. BEM 概述

BEM（Block Element Modifier）是一种 CSS 命名方法论，提高样式可维护性。

\`\`\`
.block__element--modifier
\`\`\`

- **Block**：独立的页面组件（如 \`.card\`）
- **Element**：Block 的组成部分（如 \`.card__title\`）
- **Modifier**：Block 或 Element 的变体（如 \`.card--featured\`）

## 2. 命名规范

\`\`\`css
/* Block */
.card { }

/* Element */
.card__title { }
.card__body { }
.card__footer { }

/* Block Modifier */
.card--featured { }
.card--dark { }

/* Element Modifier */
.card__title--large { }
.card__button--primary { }
\`\`\`

## 3. 实战示例

\`\`\`html
<div class="card card--featured">
  <div class="card__header">
    <h2 class="card__title card__title--large">标题</h2>
  </div>
  <div class="card__body">
    <p class="card__text">内容</p>
  </div>
  <div class="card__footer">
    <button class="card__button card__button--primary">操作</button>
  </div>
</div>
\`\`\`

\`\`\`css
.card { border-radius: 8px; padding: 1rem; background: white; }
.card--featured { border: 2px solid gold; }
.card__title { font-size: 1.2rem; }
.card__title--large { font-size: 1.5rem; }
.card__button { padding: 8px 16px; border: none; }
.card__button--primary { background: blue; color: white; }
\`\`\`

## 4. 替代方案

| 方法论 | 命名风格 | 特点 |
|--------|---------|------|
| BEM | \`.block__element--modifier\` | 语义清晰 |
| SMACSS | 分类命名 | 按功能分层 |
| OOCSS | 结构与皮肤分离 | 复用性高 |
| ITCSS | 倒三角分层 | 优先级管理 |
`
);

addFile(
  'css',
  'CSS',
  73,
  'CSS原子化',
  'Tailwind CSS、UnoCSS',
  'intermediate',
  `## 1. CSS 原子化概述

原子化 CSS（Atomic CSS）将每个样式属性拆分为独立的工具类，按需组合。

## 2. Tailwind CSS

### 2.1 基本用法

\`\`\`html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 class="text-xl font-bold text-gray-900">标题</h1>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    操作
  </button>
</div>
\`\`\`

### 2.2 响应式前缀

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3">
  响应式宽度
</div>
\`\`\`

### 2.3 状态变体

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 active:bg-blue-700">
  按钮
</button>
\`\`\`

### 2.4 自定义配置

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#3498db' },
      spacing: { 18: '4.5rem' }
    }
  },
  plugins: []
};
\`\`\`

### 2.5 @apply 指令

\`\`\`css
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
\`\`\`

## 3. UnoCSS

### 3.1 特点

- 更快的编译速度
- 高度可定制的预设系统
- 按需生成，零冗余

\`\`\`javascript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  rules: [
    ['text-primary', { color: '#3498db' }]
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded cursor-pointer',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600'
  }
});
\`\`\`

## 4. 对比

| 特性 | Tailwind CSS | UnoCSS |
|------|-------------|--------|
| 性能 | 快 | 更快 |
| 定制性 | 高 | 更高 |
| 生态 | 最大 | 增长中 |
| 学习曲线 | 中等 | 中等 |
`
);

addFile(
  'css',
  'CSS',
  74,
  'CSS-Modules',
  'CSS Modules',
  'intermediate',
  `## 1. CSS Modules 概述

CSS Modules 自动为每个类名生成唯一哈希，实现样式隔离，避免命名冲突。

\`\`\`css
/* Button.module.css */
.btn { padding: 8px 16px; border-radius: 4px; }
.primary { background: blue; color: white; }
\`\`\`

\`\`\`javascript
import styles from './Button.module.css';

function Button() {
  return <button className={\`\${styles.btn} \${styles.primary}\`}>Click</button>;
}
// 渲染为：<button class="Button_btn_x9y8z Button_primary_a1b2c">Click</button>
\`\`\`

## 2. 命名约定

\`\`\`css
/* 推荐：camelCase */
.primaryButton { }

/* 也可以：kebab-case */
.primary-button { }
\`\`\`

\`\`\`javascript
// camelCase 引用
styles.primaryButton

// kebab-case 引用
styles['primary-button']
\`\`\`

## 3. 组合（composes）

\`\`\`css
.base {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.primary {
  composes: base;
  background: blue;
  color: white;
}
\`\`\`

## 4. 与框架集成

### React

\`\`\`javascript
import styles from './Component.module.css';
<div className={styles.container}></div>
\`\`\`

### Vue

\`\`\`html
<style module>
.container { padding: 1rem; }
</style>

<template>
  <div :class="$style.container"></div>
</template>
\`\`\`

## 5. TypeScript 支持

\`\`\`typescript
// declare module '*.module.css' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }
\`\`\`

## 6. 对比其他方案

| 方案 | 隔离方式 | 运行时 | 优点 |
|------|---------|--------|------|
| CSS Modules | 哈希类名 | ❌ | 零运行时 |
| CSS-in-JS | 运行时生成 | ✅ | 动态样式 |
| Shadow DOM | DOM 隔离 | ✅ | 完全隔离 |
| BEM | 命名约定 | ❌ | 简单 |
`
);

addFile(
  'css',
  'CSS',
  75,
  '关键渲染路径优化',
  '关键CSS内联、异步加载',
  'advanced',
  `## 1. 关键渲染路径

浏览器渲染流程：DOM → CSSOM → Render Tree → Layout → Paint → Composite

CSS 是渲染阻塞资源，必须优化加载策略。

## 2. 关键 CSS 内联

将首屏关键 CSS 内联到 \`<head>\` 中，消除渲染阻塞：

\`\`\`html
<head>
  <style>
    /* 首屏关键 CSS */
    .hero { height: 100vh; background: #333; color: white; }
    .nav { position: fixed; top: 0; width: 100%; }
  </style>
</head>
\`\`\`

## 3. 非关键 CSS 异步加载

\`\`\`html
<!-- 方式1：preload + onload -->
<link rel="preload" href="styles.css" as="style"
      onload="this.rel='stylesheet'">

<!-- 方式2：media 切换 -->
<link rel="stylesheet" href="styles.css"
      media="print" onload="this.media='all'">

<!-- 方式3：noscript 回退 -->
<noscript><link rel="stylesheet" href="styles.css"></noscript>
\`\`\`

## 4. CSS 性能优化清单

| 优化项 | 说明 |
|--------|------|
| 关键 CSS 内联 | 首屏 CSS 内联到 \`<head>\` |
| 非关键 CSS 异步 | 延迟加载非首屏样式 |
| 压缩 CSS | 移除空格、注释、冗余 |
| 减少选择器复杂度 | 避免深层嵌套 |
| 避免使用 @import | 串行加载影响性能 |
| 使用 contain | 限制渲染范围 |
| 使用 will-change | 提示浏览器优化 |
| 减少重排重绘 | 批量 DOM 操作 |

## 5. CSS contain 属性

\`\`\`css
.widget {
  contain: layout style paint;
  /* 或简写 */
  contain: strict;  /* size layout style paint */
  contain: content; /* layout style paint */
}
\`\`\`

## 6. 性能测量

\`\`\`bash
# Lighthouse
npx lighthouse https://example.com --view

# Chrome DevTools
# Performance → 录制 → 分析渲染时间
# Coverage → 查看 CSS 使用率
\`\`\`
`
);

addFile(
  'css',
  'CSS',
  76,
  'CSS原生嵌套',
  'CSS原生嵌套',
  'intermediate',
  `## 1. CSS 原生嵌套概述

CSS 原生嵌套（CSS Nesting）允许在选择器内部嵌套子选择器，无需预处理器。

\`\`\`css
.card {
  padding: 1rem;
  background: white;

  & .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
  }

  @media (min-width: 768px) {
    padding: 2rem;
  }
}
\`\`\`

## 2. 嵌套规则

### 2.1 & 符号

\`&\` 代表父选择器：

\`\`\`css
.btn {
  background: blue;

  &:hover { background: darkblue; }
  &:active { transform: scale(0.98); }
  &--primary { background: green; }
  &__icon { margin-right: 8px; }
}
\`\`\`

### 2.2 隐式嵌套

不带 \`&\` 的嵌套会自动在前面添加父选择器：

\`\`\`css
.card {
  .title { font-size: 1.5rem; }
  /* 等价于 .card .title */
}
\`\`\`

### 2.3 嵌套 @规则

\`\`\`css
.container {
  width: 100%;

  @media (min-width: 768px) { width: 750px; }
  @media (min-width: 1024px) { width: 960px; }
  @supports (backdrop-filter: blur(10px)) { backdrop-filter: blur(10px); }
}
\`\`\`

## 3. 与预处理器嵌套的区别

| 特性 | CSS 原生嵌套 | Sass/Less |
|------|------------|-----------|
| 运行时 | 浏览器原生 | 需编译 |
| & 用法 | 必须（隐式时自动添加） | 可选 |
| 嵌套深度 | 无限制 | 无限制 |
| @规则嵌套 | ✅ | ✅ |
| 浏览器支持 | 2023+ | 全部（编译后） |

## 4. 最佳实践

- 嵌套深度不超过 3 层
- 优先使用 \`&\` 显式引用
- 善用 @规则嵌套简化媒体查询
`
);

console.log(`\nDone! Total files created: ${total}`);
