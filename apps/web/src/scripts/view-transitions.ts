/**
 * View Transitions 增强脚本（Phase 10）
 *
 * 功能概述：
 * - 主题切换动画：使用 document.startViewTransition() 包裹 class 切换
 * - 页面过渡回调：astro:before-swap 事件中保留主题 class
 * - 过渡类型扩展：为不同导航类型添加 transition-name
 * - 降级处理：不支持 View Transitions API 的浏览器直接切换
 *
 * 设计要点：
 * - 与 theme-store 协作：监听 store 变化触发动画
 * - 与 Astro ClientRouter 协作：astro:before-swap / astro:after-swap 钩子
 * - 模块级单例订阅，避免重复绑定
 * - 兼容 Tauri 环境：不依赖 window.location.origin
 * - 所有 DOM 操作显式类型断言，符合 TS strict 模式
 *
 * 使用方式：
 *   import '@/scripts/view-transitions'; // 自动初始化
 *   或 import { initViewTransitions } from '@/scripts/view-transitions';
 */

import { logger } from '@/lib/logger';
import { resolveTheme, useThemeStore } from '@/lib/store/theme-store';

/** 主题 class（documentElement 上的暗色标记） */
const DARK_CLASS = 'dark';

/** transition-name 标记：返回导航 */
const TRANSITION_BACK = 'vt-back';

/** transition-name 标记：前进导航 */
const TRANSITION_FORWARD = 'vt-forward';

/** navigation 类型记录（用于判定前进 / 后退） */
interface NavigationRecord {
  url: string;
  timestamp: number;
}

/** 导航历史栈（最多保留 20 条，用于判定前进 / 后退） */
const navigationStack: NavigationRecord[] = [];

/** 导航栈最大长度 */
const NAV_STACK_MAX = 20;

/** store 订阅取消函数（模块级单例） */
let themeStoreUnsubscribe: (() => void) | null = null;

/** 是否已初始化（避免重复绑定） */
let viewTransitionsInitialized = false;

/**
 * 检测浏览器是否支持 View Transitions API
 *
 * @returns 是否支持
 */
function isViewTransitionsSupported(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * 应用主题到 DOM（无动画版）
 *
 * 实现说明：
 * - 解析当前 theme 模式为实际生效值
 * - 操作 documentElement.classList 的 dark class
 * - 设置 colorScheme 属性同步原生控件主题
 *
 * @param isDark - 是否为暗色主题
 */
function applyThemeToDOM(isDark: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (isDark) {
    root.classList.add(DARK_CLASS);
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove(DARK_CLASS);
    root.style.colorScheme = 'light';
  }
}

/**
 * 使用 View Transitions API 应用主题切换
 *
 * 实现说明：
 * - 检测 startViewTransition 支持
 * - 不支持时降级为直接 applyThemeToDOM
 * - 支持时调用 startViewTransition 包裹 DOM 操作
 * - 异常时降级为直接应用
 *
 * @param isDark - 目标主题是否为暗色
 */
function applyThemeWithTransition(isDark: boolean): void {
  if (!isViewTransitionsSupported()) {
    applyThemeToDOM(isDark);
    return;
  }

  try {
    const doc = document as Document & {
      startViewTransition: (callback: () => void) => { finished: Promise<void> };
    };

    const transition = doc.startViewTransition(() => {
      applyThemeToDOM(isDark);
    });

    // 等待过渡完成（用于调试与日志）
    transition.finished
      .then(() => {
        logger.debug('[view-transitions] theme transition completed');
      })
      .catch(() => {
        // 过渡被中断时静默降级
      });
  } catch {
    // startViewTransition 异常时降级
    applyThemeToDOM(isDark);
  }
}

/**
 * 初始化主题切换动画
 *
 * 实现说明：
 * - 订阅 useThemeStore 的 theme 变化
 * - 变化时调用 applyThemeWithTransition 触发动画
 * - 模块级单例订阅，避免重复绑定
 */
function initThemeTransition(): void {
  // 取消上一次订阅（避免 SPA 导航后重复订阅）
  if (themeStoreUnsubscribe) {
    themeStoreUnsubscribe();
    themeStoreUnsubscribe = null;
  }

  let prevTheme = useThemeStore.getState().theme;
  themeStoreUnsubscribe = useThemeStore.subscribe((state) => {
    if (state.theme === prevTheme) return;
    prevTheme = state.theme;

    // 解析为实际生效主题，触发动画
    const resolved = resolveTheme(state.theme);
    applyThemeWithTransition(resolved === 'dark');
  });

  // 首次应用主题（不带动画，避免首屏闪烁）
  const initialResolved = resolveTheme(useThemeStore.getState().theme);
  applyThemeToDOM(initialResolved === 'dark');
}

/**
 * 初始化 Astro 页面过渡回调
 *
 * 实现说明：
 * - astro:before-swap：保留 <html> 上的 dark class 与 colorScheme
 * - astro:after-swap：重新初始化主题监听（订阅新 document 上的事件）
 * - astro:before-preparation：根据导航类型设置 transition-name
 *
 * 兼容 Astro ClientRouter（Astro 7 替代旧版 ViewTransitions）
 */
function initAstroTransitionHooks(): void {
  if (viewTransitionsInitialized) return;
  viewTransitionsInitialized = true;

  /**
   * astro:before-swap：DOM 替换前保留主题 class
   *
   * 实现说明：
   * - 读取 swap 前的 documentElement class
   * - 在 swap 后将 dark class 应用到新 document
   * - 同时保留 colorScheme 内联样式
   */
  document.addEventListener('astro:before-swap', (event) => {
    const beforeSwapTheme = document.documentElement.classList.contains(DARK_CLASS);
    const beforeSwapColorScheme = document.documentElement.style.colorScheme;

    // 在 swap 完成后应用主题到新 document
    (
      event as Event & {
        swap: () => void;
        newDocument: Document;
      }
    ).swap = (() => {
      const originalSwap = (event as Event & { swap: () => void }).swap;
      return function swapped(this: unknown): void {
        originalSwap?.call(this);
        const newDoc = (event as Event & { newDocument: Document }).newDocument;
        if (beforeSwapTheme) {
          newDoc.documentElement.classList.add(DARK_CLASS);
        } else {
          newDoc.documentElement.classList.remove(DARK_CLASS);
        }
        newDoc.documentElement.style.colorScheme = beforeSwapColorScheme;
      };
    })();
  });

  /**
   * astro:after-swap：DOM 替换后重新初始化主题监听
   *
   * 实现说明：
   * - 重新订阅 store（旧 document 的订阅已失效）
   * - 重新应用主题到新 DOM
   */
  document.addEventListener('astro:after-swap', () => {
    initThemeTransition();
    logger.debug('[view-transitions] astro:after-swap re-initialized theme');
  });

  /**
   * astro:before-preparation：根据导航类型设置 transition-name
   *
   * 实现说明：
   * - 比较当前 URL 与历史栈，判定前进 / 后退
   * - 为 <main> 元素临时添加 transition-name
   * - astro:after-swap 后清除
   */
  document.addEventListener('astro:before-preparation', (event) => {
    const navEvent = event as Event & {
      to: URL;
      from: URL;
      navigationType: NavigationType | 'push' | 'replace' | 'traverse';
    };

    const toUrl = navEvent.to?.pathname ?? '';
    const _fromUrl = navEvent.from?.pathname ?? '';

    // 判定前进 / 后退
    const isBack = isBackwardNavigation(toUrl);

    // 记录到导航栈
    pushNavigationStack(toUrl);

    // 为 <main> 元素临时添加 transition-name
    const main = document.getElementById('app-main');
    if (main) {
      main.style.viewTransitionName = isBack ? TRANSITION_BACK : TRANSITION_FORWARD;
    }
  });

  /**
   * astro:after-swap：清除临时 transition-name
   */
  document.addEventListener('astro:page-load', () => {
    const main = document.getElementById('app-main');
    if (main) {
      main.style.viewTransitionName = '';
    }
  });
}

/**
 * 判定是否为后退导航
 *
 * 实现说明：
 * - 检查目标 URL 是否在导航栈中（且是当前 URL 的前一个）
 * - 若是则判定为后退
 *
 * @param targetUrl - 目标 URL
 * @returns 是否为后退导航
 */
function isBackwardNavigation(targetUrl: string): boolean {
  if (navigationStack.length < 2) return false;
  const currentIdx = navigationStack.length - 1;
  const prevRecord = navigationStack[currentIdx - 1];
  if (!prevRecord) return false;
  return prevRecord.url === targetUrl;
}

/**
 * 推入导航栈
 *
 * 实现说明：
 * - 限制栈最大长度，超出则丢弃最旧记录
 * - 记录 URL 与时间戳
 *
 * @param url - 导航目标 URL
 */
function pushNavigationStack(url: string): void {
  navigationStack.push({ url, timestamp: Date.now() });
  if (navigationStack.length > NAV_STACK_MAX) {
    navigationStack.shift();
  }
}

/**
 * 初始化系统主题监听
 *
 * 实现说明：
 * - 调用 theme-store 的 initSystemListener
 * - 监听 prefers-color-scheme 变化
 * - 仅在 theme === 'system' 时响应
 */
function initSystemThemeListener(): void {
  useThemeStore.getState().initSystemListener();
}

/**
 * 执行 View Transitions 初始化
 *
 * 实现说明：
 * - 初始化主题切换动画（订阅 store）
 * - 注册 Astro 页面过渡回调
 * - 初始化系统主题监听
 */
export function initViewTransitions(): void {
  if (typeof document === 'undefined') return;

  initThemeTransition();
  initAstroTransitionHooks();
  initSystemThemeListener();

  logger.debug('[view-transitions] view transitions initialized');
}

// 自动执行：脚本被 import 时立即初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewTransitions, { once: true });
  } else {
    initViewTransitions();
  }

  // Astro ClientRouter SPA 导航后重新初始化主题订阅
  document.addEventListener('astro:page-load', () => {
    initThemeTransition();
  });
}

export default { initViewTransitions };
