/**
 * FANDEX 标签索引构建脚本
 *
 * 功能概述：
 * 扫描 content/ 下所有 .md/.mdx 文件的 frontmatter，
 * 提取所有 tags 字段，生成标签索引文件 metadata/tags/tag-index.json。
 *
 * 索引结构：
 * - version: 索引格式版本号
 * - generatedAt: 生成时间（ISO 8601）
 * - tags: 标签映射对象
 *   - 键为标签原始名称
 *   - 值包含 slug（URL 友好形式）、count（文档数量）、
 *     modules（所属模块列表）、related（共现标签，按频率排序取前5）
 *
 * 数据来源：
 * content/ 目录下所有 .md/.mdx 文件的 frontmatter tags 字段
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录 */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 文档源文件目录 */
const DOCS_DIR = join(__dirname, '..', 'content');
/** 索引输出目录 */
const OUTPUT_DIR = join(__dirname, '..', 'metadata', 'tags');
/** 索引输出文件路径 */
const OUTPUT_FILE = join(OUTPUT_DIR, 'tag-index.json');
/** 索引格式版本号 */
const INDEX_VERSION = '1.0.0';
/** 共现标签最大保留数量 */
const MAX_RELATED_TAGS = 5;

/**
 * 中文标签到英文 slug 的映射表
 * 用于将中文标签转换为 URL 友好的英文等价词
 * 未在映射表中的中文标签将使用 encodeURIComponent 编码后作为 slug
 */
const CHINESE_SLUG_MAP = {
  '文档理解': 'document-understanding',
  '图像分类': 'image-classification',
  '图像检索': 'image-retrieval',
  '图像生成': 'image-generation',
  '图像分割': 'image-segmentation',
  '目标检测': 'object-detection',
  '关键点检测': 'keypoint-detection',
  '深度估计': 'depth-estimation',
  '姿态估计': 'pose-estimation',
  '视频生成': 'video-generation',
  '音频生成': 'audio-generation',
  '文本生成': 'text-generation',
  '情感分析': 'sentiment-analysis',
  '命名实体识别': 'ner',
  '机器翻译': 'machine-translation',
  '文本摘要': 'text-summarization',
  '问答系统': 'qa-system',
  '对话系统': 'dialogue-system',
  '信息检索': 'information-retrieval',
  '关系抽取': 'relation-extraction',
  '知识图谱': 'knowledge-graph',
  '词性标注': 'pos-tagging',
  '句法解析': 'syntactic-parsing',
  '共指消解': 'coreference-resolution',
  '主题建模': 'topic-modeling',
  '子词分词': 'subword-tokenization',
  '实体链接': 'entity-linking',
  '对话状态跟踪': 'dialogue-state-tracking',
  '自然语言推理': 'nli',
  '词嵌入': 'word-embedding',
  '序列模型': 'sequence-model',
  '缓存': 'cache',
  '消息队列': 'message-queue',
  '流处理': 'stream-processing',
  '数据仓库': 'data-warehouse',
  '数据湖': 'data-lake',
  '资源管理': 'resource-management',
  '微服务': 'microservices',
  '容器': 'container',
  '服务网格': 'service-mesh',
  '监控': 'monitoring',
  '日志': 'logging',
  '配置管理': 'config-management',
  '持续集成': 'ci',
  '持续部署': 'cd',
  '基础设施即代码': 'iac',
  '性能调优': 'performance-tuning',
  '故障排查': 'troubleshooting',
  '安全': 'security',
  '网络': 'networking',
  '测试': 'testing',
  '自动化': 'automation',
  '高可用': 'high-availability',
  '并发': 'concurrency',
  '协程': 'coroutine',
  '泛型': 'generics',
  '反射': 'reflection',
  '异常处理': 'error-handling',
  '面向对象': 'oop',
  '函数式编程': 'functional-programming',
  '设计模式': 'design-patterns',
  '依赖注入': 'dependency-injection',
  '内存管理': 'memory-management',
  '垃圾回收': 'garbage-collection',
  '类型系统': 'type-system',
  '异步编程': 'async-programming',
  '正则表达式': 'regex',
  '数据库': 'database',
  '分布式': 'distributed',
  '负载均衡': 'load-balancing',
  '特征工程': 'feature-engineering',
  '模型评估': 'model-evaluation',
  '回归分析': 'regression-analysis',
  '商业智能': 'business-intelligence',
  '强化学习': 'reinforcement-learning',
  '监督学习': 'supervised-learning',
  '无监督学习': 'unsupervised-learning',
  '集成学习': 'ensemble-learning',
  '降维': 'dimensionality-reduction',
  '聚类': 'clustering',
  '优化器': 'optimizer',
  '注意力机制': 'attention',
  '反向传播': 'backpropagation',
  '正则化': 'regularization',
  '激活函数': 'activation-function',
  '损失函数': 'loss-function',
  '权重初始化': 'weight-initialization',
  '学习率': 'learning-rate',
  '预训练': 'pretraining',
  '微调': 'fine-tuning',
  '量化': 'quantization',
  '推理优化': 'inference-optimization',
  '提示工程': 'prompt-engineering',
  '检索增强': 'rag',
  '人类反馈强化学习': 'rlhf',
  '偏好优化': 'preference-optimization',
  '上下文工程': 'context-engineering',
  '分词': 'tokenization',
  '嵌入': 'embedding',
  '结构化输出': 'structured-output',
  '函数调用': 'function-calling',
  '安全护栏': 'safety-guardrails',
  '差分隐私': 'differential-privacy',
  '偏见': 'bias',
  '对齐': 'alignment',
  '提示注入': 'prompt-injection',
  '智能体': 'agent',
  '多智能体': 'multi-agent',
  '工具调用': 'tool-calling',
  '记忆': 'memory',
  '规划': 'planning',
  '通信协议': 'communication-protocol',
  '评估': 'evaluation',
  '生产': 'production',
  '物联网': 'iot',
  '嵌入式': 'embedded',
  '边缘计算': 'edge-computing',
  '数字孪生': 'digital-twin',
  '传感器': 'sensor',
  '协议': 'protocol',
  '隐私': 'privacy',
  '3D生成': '3d-generation',
  '多模态': 'multimodal',
  '视觉语言': 'vision-language',
  '跨模态': 'cross-modal',
  '扩散模型': 'diffusion',
  '生成对抗': 'gan',
  '变分自编码器': 'vae',
  '计算机视觉': 'computer-vision',
  '自然语言处理': 'nlp',
  '语音识别': 'speech-recognition',
  '语音合成': 'tts',
  '音乐生成': 'music-generation',
  '音频分类': 'audio-classification',
  '线性回归': 'linear-regression',
  '逻辑回归': 'logistic-regression',
  '决策树': 'decision-tree',
  '随机森林': 'random-forest',
  '支持向量机': 'svm',
  '朴素贝叶斯': 'naive-bayes',
  'K近邻': 'knn',
  '主成分分析': 'pca',
  '异常检测': 'anomaly-detection',
  '时间序列': 'time-series',
  '采样方法': 'sampling-methods',
  '矩阵变换': 'matrix-transform',
  '线性系统': 'linear-system',
  '凸优化': 'convex-optimization',
  '随机过程': 'stochastic-process',
  '信息论': 'information-theory',
  '图论': 'graph-theory',
  '复数': 'complex-numbers',
  '张量运算': 'tensor-operations',
  '概率论': 'probability',
  '统计学': 'statistics',
  '微积分': 'calculus',
  '线性代数': 'linear-algebra',
  '离散数学': 'discrete-math',
  '算法': 'algorithm',
  '数据结构': 'data-structure',
  '排序': 'sorting',
  '搜索': 'searching',
  '动态规划': 'dynamic-programming',
  '贪心': 'greedy',
  '分治': 'divide-conquer',
  '回溯': 'backtracking',
  '图算法': 'graph-algorithm',
  '字符串算法': 'string-algorithm',
  '网络流': 'network-flow',
  '哈希': 'hash',
  '树': 'tree',
  '堆': 'heap',
  '栈': 'stack',
  '队列': 'queue',
  '链表': 'linked-list',
  '并查集': 'union-find',
  '线段树': 'segment-tree',
  '树状数组': 'fenwick-tree',
  '布隆过滤器': 'bloom-filter',
  '跳跃表': 'skip-list',
  '拓扑排序': 'topological-sort',
  '环境搭建': 'environment-setup',
  '学习路线': 'learning-path',
  '开发工具': 'dev-tools',
  '包管理': 'package-management',
  '版本控制': 'version-control',
  '代码审查': 'code-review',
  '持续交付': 'continuous-delivery',
  '模板语法': 'template-syntax',
  '组件系统': 'component-system',
  '组合式API': 'composition-api',
  '响应式': 'reactivity',
  '路由': 'routing',
  '状态管理': 'state-management',
  '生命周期': 'lifecycle',
  '指令': 'directive',
  '插件': 'plugin',
  '性能优化': 'performance',
  '类型声明': 'type-declaration',
  '模块解析': 'module-resolution',
  '装饰器': 'decorator',
  'DOM操作': 'dom-manipulation',
  '事件处理': 'event-handling',
  '模块化': 'modularity',
  'ES6': 'es6',
  '调试': 'debugging',
  'CSS变量': 'css-variables',
  '响应式设计': 'responsive-design',
  'SSH': 'ssh',
  'HTTPS': 'https',
  'PullRequest': 'pull-request',
  'Actions': 'actions',
  '环境变量': 'env-variables',
  '编译原理': 'compiler',
  '操作系统': 'operating-system',
  '体系结构': 'architecture',
  'JVM': 'jvm',
  '内存模型': 'memory-model',
  '类加载': 'class-loading',
  'IO流': 'io-stream',
  '集合框架': 'collections',
  '并发编程': 'concurrent-programming',
  '序列化': 'serialization',
  '网络编程': 'network-programming',
  'Spring': 'spring',
  'ZGC': 'zgc',
  '虚拟线程': 'virtual-threads',
  'MCP': 'mcp',
  'A2A': 'a2a',
  'RAG': 'rag',
  'LoRA': 'lora',
  'SFT': 'sft',
  'KV缓存': 'kv-cache',
  'Flash注意力': 'flash-attention',
  '推测解码': 'speculative-decoding',
  '分布式训练': 'distributed-training',
  '梯度检查点': 'gradient-checkpointing',
  '流水线并行': 'pipeline-parallelism',
  '数据流水线': 'data-pipeline',
  '成本治理': 'cost-governance',
  '提示缓存': 'prompt-cache',
  '上下文窗口': 'context-window',
  '长上下文': 'long-context',
  '代码生成': 'code-generation',
  '代码搜索': 'code-search',
  '内容搜索': 'content-search',
  '二分查找': 'binary-search',
  '交互式rebase': 'interactive-rebase',
  '对象模型': 'object-model',
  '子模块': 'submodule',
  '工作树': 'worktree',
  '引用日志': 'reflog',
  '暂存区': 'staging-area',
  '合并冲突': 'merge-conflict',
  '变基': 'rebase',
  '摘取': 'cherry-pick',
  '标签管理': 'tag-management',
  '稀疏检出': 'sparse-checkout',
  '垃圾回收Git': 'git-gc',
  '钩子': 'hooks',
  'LFS': 'lfs',
  '三棵树': 'three-trees',
  'HEAD指针': 'head-pointer',
  'SHA-1': 'sha1',
  'Git-Flow': 'git-flow',
  'GitHub-Flow': 'github-flow',
  'diff': 'diff',
  'Code-Review': 'code-review-flow',
  '分布式版本控制': 'distributed-vcs',
  '补丁': 'patch',
  '重置': 'reset',
  '撤销': 'revert',
  '远程跟踪': 'remote-tracking',
  'Markdown': 'markdown',
  'LaTeX': 'latex',
  'Mermaid': 'mermaid',
  'Emoji': 'emoji',
  'CommonMark': 'commonmark',
  'GitHub风格': 'github-flavored',
  '锚点': 'anchor',
  '脚注': 'footnote',
  '速查': 'cheatsheet',
  '编程范式': 'programming-paradigm',
  '函数与模块化': 'functions-modularity',
  'IDE': 'ide',
  '调试思想': 'debugging-mindset',
  '计算机体系': 'computer-architecture',
  '数的表示': 'number-representation',
  '构建工具': 'build-tools',
  '插件生态': 'plugin-ecosystem',
  '英语语法': 'english-grammar',
  '技术翻译': 'technical-translation',
  '学术写作': 'academic-writing',
  '专业英语': 'professional-english',
  '概率': 'probability-statistics',
  '随机变量': 'random-variable',
  '期望': 'expectation',
  '方差': 'variance',
  '协方差': 'covariance',
  '假设检验': 'hypothesis-testing',
  '区间估计': 'interval-estimation',
  '点估计': 'point-estimation',
  '抽样分布': 'sampling-distribution',
  '大数定律': 'law-of-large-numbers',
  '中心极限定理': 'central-limit-theorem',
  '贝叶斯': 'bayesian',
  '条件概率': 'conditional-probability',
  '联合分布': 'joint-distribution',
  '边缘分布': 'marginal-distribution',
  '条件分布': 'conditional-distribution',
  '独立性': 'independence',
  '正态分布': 'normal-distribution',
  '样本空间': 'sample-space',
  '矩': 'moments',
  '相关系数': 'correlation',
  '统计量': 'statistic',
  'ArkTS': 'arkts',
  'ArkUI': 'arkui',
  'HarmonyOS': 'harmonyos',
  '元服务': 'atomic-service',
  'Stage模型': 'stage-model',
  'FA模型': 'fa-model',
  'DevEco': 'deveco',
  '声明式UI': 'declarative-ui',
  'TypeScript差异': 'typescript-differences',
  '自定义组件': 'custom-component',
  '状态管理Harmony': 'harmony-state',
  '路由跳转': 'route-navigation',
  '列表网格': 'list-grid',
  '动画系统Harmony': 'harmony-animation',
  '手势交互': 'gesture-interaction',
  '数据持久化': 'data-persistence',
  '网络请求': 'network-request',
  '多媒体能力': 'multimedia',
  '传感器位置': 'sensor-location',
  '通知权限': 'notification-permission',
  '应用签名': 'app-signing',
  '国际化': 'i18n',
  '无障碍': 'accessibility',
  '卡片开发': 'widget-development',
  '分布式能力Harmony': 'harmony-distributed',
  '跨设备调用': 'cross-device',
  '组件生命周期': 'component-lifecycle',
  '权限申请': 'permission-request',
  '分布式数据': 'distributed-data',
  '性能优化Harmony': 'harmony-performance',
  '测试调试': 'test-debug',
};

/**
 * 递归遍历目录，对匹配扩展名的文件执行回调
 *
 * @param {string} dir - 要遍历的目录路径
 * @param {string[]} exts - 文件扩展名数组（如 ['.md', '.mdx']）
 * @param {Function} fn - 对每个匹配文件执行的异步回调
 */
async function walkDir(dir, exts, fn) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(full, exts, fn); // 递归子目录
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      await fn(full);
    }
  }
}

/**
 * 解析 Markdown/MDX 文件的 frontmatter
 * 简易 YAML 解析器，支持键值对和数组格式
 *
 * @param {string} content - 文件完整内容
 * @returns {Object} 解析后的 frontmatter 键值对对象
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const raw = match[1];
  const data = {};
  let key = null; // 当前正在解析的键名
  let inArray = false; // 是否正在解析数组
  let arrayVals = []; // 数组值收集器

  for (const line of raw.split('\n')) {
    if (inArray) {
      // 尝试匹配数组项 "  - value"
      const itemMatch = line.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/);
      if (itemMatch) {
        arrayVals.push(itemMatch[1]);
        continue;
      }
      // 数组结束，保存收集到的值
      data[key] = arrayVals;
      inArray = false;
      key = null;
      arrayVals = [];
    }
    // 匹配键值对
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const k = kvMatch[1];
      const v = kvMatch[2].trim();
      if (v === '') {
        // 空值表示数组开始
        key = k;
        inArray = true;
        arrayVals = [];
      } else {
        // 有值则直接存储，去除引号
        data[k] = v.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  // 处理文件末尾仍在解析的数组
  if (inArray && key) data[key] = arrayVals;
  return data;
}

/**
 * 将标签名转换为 URL 友好的 slug
 * 英文标签直接小写化，中文标签优先查映射表，未命中则使用 encodeURIComponent
 *
 * @param {string} tagName - 标签原始名称
 * @returns {string} URL 友好的 slug
 */
function tagToSlug(tagName) {
  // 查找中文映射表
  if (CHINESE_SLUG_MAP[tagName]) {
    return CHINESE_SLUG_MAP[tagName];
  }

  // 纯英文/数字标签：小写化并替换空格为连字符
  if (/^[a-zA-Z0-9\s\-_.]+$/.test(tagName)) {
    return tagName.toLowerCase().replace(/\s+/g, '-');
  }

  // 包含中文且未在映射表中：使用 encodeURIComponent 编码
  return encodeURIComponent(tagName);
}

/**
 * 主函数：构建标签索引
 *
 * 流程：
 * 1. 扫描 content/ 下所有 .md/.mdx 文件
 * 2. 提取每个文件的 tags 和 module 字段
 * 3. 统计每个标签的文档数量和所属模块
 * 4. 计算标签共现关系（related 字段）
 * 5. 生成 tag-index.json 并写入 metadata/tags/
 */
async function main() {
  /** @type {Map<string, { count: number, modules: Set<string>, coOccurrence: Map<string, number> }>} */
  const tagData = new Map();

  // 第一遍扫描：收集标签基础数据和共现关系
  await walkDir(DOCS_DIR, ['.md', '.mdx'], async (filePath) => {
    const content = await readFile(filePath, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title) return; // 跳过无标题的文件

    const tags = Array.isArray(fm.tags) ? fm.tags : [];
    const module = fm.module || '';
    if (tags.length === 0) return; // 跳过无标签的文件

    // 更新每个标签的计数和模块归属
    for (const tag of tags) {
      if (!tagData.has(tag)) {
        tagData.set(tag, {
          count: 0,
          modules: new Set(),
          coOccurrence: new Map(),
        });
      }
      const data = tagData.get(tag);
      data.count += 1;
      if (module) data.modules.add(module);
    }

    // 计算共现关系：同一文档中的标签两两配对
    for (let i = 0; i < tags.length; i++) {
      for (let j = 0; j < tags.length; j++) {
        if (i === j) continue;
        const data = tagData.get(tags[i]);
        const current = data.coOccurrence.get(tags[j]) || 0;
        data.coOccurrence.set(tags[j], current + 1);
      }
    }
  });

  // 第二遍：构建输出结构
  const tagsOutput = {};
  for (const [tagName, data] of tagData) {
    // 按共现频率降序排序，取前 MAX_RELATED_TAGS 个
    const related = Array.from(data.coOccurrence.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_RELATED_TAGS)
      .map(([name]) => name);

    tagsOutput[tagName] = {
      slug: tagToSlug(tagName),
      count: data.count,
      modules: Array.from(data.modules).sort(),
      related,
    };
  }

  // 组装最终输出
  const output = {
    version: INDEX_VERSION,
    generatedAt: new Date().toISOString(),
    tags: tagsOutput,
  };

  // 确保输出目录存在并写入索引文件
  await mkdir(OUTPUT_DIR, { recursive: true });
  const json = JSON.stringify(output, null, 2);
  await writeFile(OUTPUT_FILE, json, 'utf-8');

  const tagCount = Object.keys(tagsOutput).length;
  console.log(`Tag index: ${tagCount} tags written to ${OUTPUT_FILE}`);
}

main().catch(console.error);
