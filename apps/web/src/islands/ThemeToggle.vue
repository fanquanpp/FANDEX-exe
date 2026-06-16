<!--
  主题切换组件 (ThemeToggle)
  ========================
  功能概述：
  - 在亮色(light)和暗色(dark)模式之间切换
  - 主题状态持久化到 localStorage（键名: fandex-theme），刷新页面后保持用户选择
  - 首次访问时跟随系统偏好（prefers-color-scheme）
  - 挂载前不渲染按钮，避免 SSR（服务端渲染）与客户端状态不一致导致的水合错误

  数据流：
  - onMounted 时从 localStorage 读取已保存的主题，无保存值时检测系统偏好
  - 切换时同步更新：theme(ref) → document.documentElement data-theme 属性 → localStorage
  - 通过 data-theme 属性驱动全局 CSS 变量切换（在全局样式中定义）

  事件处理：
  - 点击按钮调用 toggle()，切换主题并持久化

  使用场景：
  - 放置在页面顶部导航栏，作为全局主题控制入口
  - 配合 Astro 岛屿架构，仅客户端交互
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * 当前主题状态：'light' 亮色 | 'dark' 暗色
 * 初始值为 'light'，在 onMounted 中根据 localStorage 或系统偏好修正
 */
const theme = ref<'light' | 'dark'>('light');

/**
 * 是否已完成客户端挂载
 * 用于控制按钮的渲染时机：仅在客户端挂载后才渲染
 * 这避免了 SSR 时渲染默认主题、客户端实际主题不同导致的水合不匹配(hydration mismatch)
 */
let mounted = ref(false);

/**
 * 组件挂载后的初始化逻辑
 * 1. 标记已挂载，允许按钮渲染
 * 2. 从 localStorage 读取用户保存的主题偏好
 * 3. 如果没有保存值，则检测系统暗色模式偏好
 * 4. 根据结果设置 theme 值（注意：不在此处设置 data-theme 属性，
 *    因为全局初始化脚本通常在 HTML <head> 中已处理）
 */
onMounted(() => {
  mounted.value = true;
  // 读取用户保存的主题偏好，无保存值时跟随系统
  const saved = localStorage.getItem('fandex-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    theme.value = 'dark';
  } else {
    theme.value = 'light';
  }
});

/**
 * 切换主题并持久化到 localStorage
 * 逻辑：
 *   1. 翻转当前主题（dark → light, light → dark）
 *   2. 设置 <html> 元素的 data-theme 属性，触发全局 CSS 变量切换
 *   3. 将新主题保存到 localStorage，确保刷新后保持
 */
function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('fandex-theme', theme.value);
}
</script>

<template>
  <!-- 仅在客户端挂载后渲染，避免 SSR/CSR 水合不匹配 -->
  <button
    v-if="mounted"
    class="theme-toggle"
    @click="toggle"
    :title="theme === 'dark' ? '亮色模式' : '暗色模式'"
    :aria-label="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
  >
    <!-- 暗色模式下显示太阳图标（提示用户可切换到亮色） -->
    <svg
      v-if="theme === 'dark'"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
    <!-- 亮色模式下显示月亮图标（提示用户可切换到暗色） -->
    <svg
      v-else
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<style scoped>
/* 主题切换按钮：方形图标按钮，居中对齐 */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  cursor: pointer;
}

/* 悬停效果：背景变浅，图标变为主题色 */
.theme-toggle:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}
</style>
