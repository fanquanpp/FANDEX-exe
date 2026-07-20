/**
 * 主题状态管理 Store（Zustand v5）
 *
 * 功能概述：
 * - 使用 Zustand v5 `create` + `persist` 中间件管理全局主题状态
 * - 主题模式：'light' | 'dark' | 'system'（system 跟随系统偏好）
 * - 持久化到 localStorage（key: 'fandex-theme'）
 * - applyTheme 副作用：操作 document.documentElement.classList 的 'dark' class
 * - 集成 View Transitions API（如浏览器支持）实现平滑主题切换
 * - 监听系统主题变化（matchMedia change），仅 'system' 模式自动响应
 *
 * 与 Phase 3 use-theme.ts 的协作关系：
 * - use-theme.ts 通过 useSyncExternalStore 监听 DOM class 变化，是 UI 层接口
 * - 本 store 是底层状态管理，提供 setTheme/toggleTheme/applyTheme 方法
 * - 两者共享同一份 localStorage key 'fandex-theme'，保持数据一致
 * - use-theme.ts 可作为 React 组件消费层；theme-store 可作为非组件层入口
 *
 * 使用示例：
 *   import { useThemeStore } from '@/lib/store/theme-store';
 *   const { theme, setTheme, toggleTheme } = useThemeStore();
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 主题模式类型 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 主题持久化键名 */
export const THEME_STORAGE_KEY = 'fandex-theme';

/**
 * 判断系统当前是否为暗色主题
 *
 * 实现说明：
 * - 通过 window.matchMedia('(prefers-color-scheme: dark)') 检测
 * - SSR 或不支持 matchMedia 时返回 false
 *
 * @returns 系统是否偏好暗色主题
 */
function getSystemTheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 解析当前生效主题（将 'system' 解析为 'light' 或 'dark'）
 *
 * @param mode - 主题模式
 * @returns 实际生效主题（'light' 或 'dark'）
 */
export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemTheme() ? 'dark' : 'light';
  }
  return mode;
}

/** 主题 Store 状态接口 */
export interface ThemeStoreState {
  /** 当前主题模式 */
  theme: ThemeMode;
  /** 设置主题模式（同步持久化 + 应用到 DOM） */
  setTheme: (theme: ThemeMode) => void;
  /** 在 light/dark 之间切换（system 视为当前生效主题的相反值） */
  toggleTheme: () => void;
  /** 应用主题到 DOM（操作 document.documentElement.classList） */
  applyTheme: () => void;
  /** 初始化系统主题监听（仅 system 模式生效，需在客户端调用） */
  initSystemListener: () => () => void;
}

/** 系统主题变化监听器（模块级单例，避免重复绑定） */
let systemThemeCleanup: (() => void) | null = null;

/**
 * 主题 Store 实现
 *
 * 设计要点：
 * 1. persist 中间件持久化 theme 字段到 localStorage
 * 2. setTheme 同时调用 applyTheme 确保状态与 DOM 同步
 * 3. applyTheme 支持 View Transitions API 平滑切换
 * 4. initSystemListener 监听 prefers-color-scheme 变化（仅 system 模式触发）
 */
export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      /**
       * 设置主题模式
       *
       * @param next - 目标主题模式
       */
      setTheme: (next) => {
        set({ theme: next });
        // 副作用：应用到 DOM
        get().applyTheme();
      },

      /**
       * 切换主题：light ↔ dark
       * system 模式视为当前生效主题，切换到其相反值
       */
      toggleTheme: () => {
        const current = resolveTheme(get().theme);
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        get().applyTheme();
      },

      /**
       * 应用当前主题到 DOM
       *
       * 实现细节：
       * - 解析 theme 为实际生效值（'light' 或 'dark'）
       * - 操作 document.documentElement.classList 的 'dark' class
       * - 设置 colorScheme 属性以同步原生控件主题
       * - 通过 View Transitions API 实现平滑过渡（如可用）
       */
      applyTheme: () => {
        if (typeof document === 'undefined') return;

        const resolved = resolveTheme(get().theme);
        const root = document.documentElement;
        const isDark = resolved === 'dark';

        /** 实际 DOM 操作函数 */
        const applyChanges = () => {
          if (isDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
          } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
          }
        };

        // 检查 View Transitions API 支持
        if ('startViewTransition' in document) {
          try {
            // 调用 View Transitions API 实现平滑切换
            // 使用类型断言避免因 lib.dom 版本差异导致的类型问题
            (
              document as Document & {
                startViewTransition: (callback: () => void) => void;
              }
            ).startViewTransition(applyChanges);
          } catch {
            // View Transitions API 异常时降级为直接应用
            applyChanges();
          }
        } else {
          applyChanges();
        }
      },

      /**
       * 初始化系统主题监听
       *
       * 实现说明：
       * - 仅在 theme === 'system' 时触发重新应用
       * - 模块级单例，避免多次绑定
       * - 返回 cleanup 函数用于解绑
       *
       * @returns 取消监听函数
       */
      initSystemListener: () => {
        // 已存在监听则先清理
        if (systemThemeCleanup) {
          systemThemeCleanup();
          systemThemeCleanup = null;
        }

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
          return () => {};
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        /** 系统主题变化处理函数 */
        const handleChange = () => {
          // 仅 system 模式响应系统变化
          if (get().theme === 'system') {
            get().applyTheme();
          }
        };

        mediaQuery.addEventListener('change', handleChange);
        const cleanup = () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
        systemThemeCleanup = cleanup;
        return cleanup;
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // 仅持久化 theme 字段，方法不持久化
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export default useThemeStore;
