/**
 * 阅读模式状态管理
 *
 * 管理三种阅读模式的切换和状态持久化：
 * - standard: 标准模式（默认），完整功能
 * - focus: 专注模式，隐藏干扰元素
 * - study: 学习模式，高亮学习辅助信息
 *
 * 状态存储在 localStorage 中，跨页面保持。
 * 模式切换通过 CSS 类驱动显隐，不直接操作 DOM 元素。
 */

/** 阅读模式类型定义 */
type ReadingMode = 'standard' | 'focus' | 'study';

/** localStorage 存储键名 */
const STORAGE_KEY = 'fandex-reading-mode';

/** 自定义事件名称，用于通知其他组件模式变更 */
const MODE_CHANGE_EVENT = 'fandex-reading-mode-change';

/**
 * 获取当前阅读模式
 *
 * 从 localStorage 读取持久化的模式值，若存储不可用或值非法则返回默认值 'standard'。
 *
 * @returns 当前阅读模式，默认为 'standard'
 */
export function getReadingMode(): ReadingMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'focus' || stored === 'study') return stored;
  } catch {
    /* localStorage 不可用时使用默认值 */
  }
  return 'standard';
}

/**
 * 设置阅读模式
 *
 * 将模式值持久化到 localStorage，同时在 document.documentElement 上设置
 * data-reading-mode 属性和对应的 CSS 类名，以驱动 CSS 显隐控制。
 * 模式变更后派发自定义事件通知其他组件。
 *
 * @param mode - 目标阅读模式
 */
export function setReadingMode(mode: ReadingMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* 忽略存储失败 */
  }
  document.documentElement.setAttribute('data-reading-mode', mode);
  applyModeStyles(mode);
  document.dispatchEvent(new CustomEvent(MODE_CHANGE_EVENT, { detail: { mode } }));
}

/**
 * 应用模式样式
 *
 * 在根元素上切换 CSS 类名（mode-standard / mode-focus / mode-study），
 * 由 CSS 规则控制各元素的显隐和高亮。
 *
 * @param mode - 目标阅读模式
 */
function applyModeStyles(mode: ReadingMode): void {
  const root = document.documentElement;
  root.classList.remove('mode-standard', 'mode-focus', 'mode-study');
  root.classList.add(`mode-${mode}`);
}

/**
 * 初始化阅读模式
 *
 * 在页面加载时调用，从 localStorage 恢复上次的阅读模式，
 * 并将对应的 CSS 类和 data 属性应用到根元素。
 */
export function initReadingMode(): void {
  const mode = getReadingMode();
  document.documentElement.setAttribute('data-reading-mode', mode);
  applyModeStyles(mode);
}

/**
 * 切换专注模式
 *
 * 当前为专注模式则切回标准模式，否则切换到专注模式。
 */
export function toggleFocusMode(): void {
  const current = getReadingMode();
  setReadingMode(current === 'focus' ? 'standard' : 'focus');
}

/**
 * 切换学习模式
 *
 * 当前为学习模式则切回标准模式，否则切换到学习模式。
 */
export function toggleStudyMode(): void {
  const current = getReadingMode();
  setReadingMode(current === 'study' ? 'standard' : 'study');
}

/**
 * 退出当前非标准模式，回到标准模式
 *
 * 用于 Esc 键退出等场景。
 */
export function exitToStandardMode(): void {
  const current = getReadingMode();
  if (current !== 'standard') {
    setReadingMode('standard');
  }
}

/**
 * 监听阅读模式变更事件
 *
 * 注册回调函数，在模式变更时触发。返回一个取消监听的函数。
 *
 * @param callback - 模式变更回调，接收新模式作为参数
 * @returns 取消监听的函数
 */
export function onReadingModeChange(callback: (mode: ReadingMode) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ mode: ReadingMode }>;
    callback(customEvent.detail.mode);
  };
  document.addEventListener(MODE_CHANGE_EVENT, handler);
  return () => document.removeEventListener(MODE_CHANGE_EVENT, handler);
}
