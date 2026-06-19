<script setup lang="ts">
/**
 * PWA 安装提示组件
 *
 * 功能概述：
 * 监听浏览器的 beforeinstallprompt 事件，显示安装按钮。
 * 用户点击后触发安装流程，安装完成后隐藏按钮。
 * 同时监听 appinstalled 事件，记录安装状态。
 *
 * 水合策略：client:load（需尽早监听 beforeinstallprompt 事件）
 */

import { ref, onMounted, onUnmounted } from 'vue';

/** beforeinstallprompt 事件类型（非标准 API，内联类型定义） */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/** 是否已安装（standalone 模式或已触发 appinstalled 事件） */
const isInstalled = ref(false);
/** 是否可安装（已捕获 beforeinstallprompt 事件） */
const canInstall = ref(false);
/** 安装提示事件引用 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
/** 是否显示安装横幅 */
const showBanner = ref(false);

/**
 * 检查是否已以 standalone 模式运行（已安装）
 *
 * 输入：无
 * 输出：boolean
 * 流程：检查 display-mode 或 navigator.standalone
 */
function checkStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * 处理 beforeinstallprompt 事件
 *
 * 阻止默认行为，保存事件引用，显示安装按钮。
 */
function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  canInstall.value = true;

  /** 延迟显示横幅，避免打断用户首次浏览 */
  setTimeout(() => {
    if (!isInstalled.value && canInstall.value) {
      showBanner.value = true;
    }
  }, 3000);
}

/**
 * 处理 appinstalled 事件
 *
 * 安装完成后隐藏横幅，清理事件引用。
 */
function handleAppInstalled() {
  isInstalled.value = true;
  canInstall.value = false;
  showBanner.value = false;
  deferredPrompt = null;
}

/**
 * 触发安装流程
 *
 * 用户点击安装按钮后调用 deferredPrompt.prompt()。
 * 根据用户选择结果更新状态。
 */
async function install() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    isInstalled.value = true;
  }
  canInstall.value = false;
  showBanner.value = false;
  deferredPrompt = null;
}

/** 关闭安装横幅（用户拒绝安装） */
function dismiss() {
  showBanner.value = false;
  /** 记录拒绝状态，本次会话不再提示 */
  try {
    sessionStorage.setItem('fandex-install-dismissed', '1');
  } catch {
    // sessionStorage 不可用时静默失败
  }
}

onMounted(() => {
  if (checkStandalone()) {
    isInstalled.value = true;
    return;
  }

  /** 检查用户是否已拒绝安装 */
  try {
    if (sessionStorage.getItem('fandex-install-dismissed') === '1') {
      return;
    }
  } catch {
    // sessionStorage 不可用时忽略
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<template>
  <!-- 安装横幅：仅在可安装且未拒绝时显示 -->
  <Transition name="install-slide">
    <div v-if="showBanner && canInstall && !isInstalled" class="install-banner">
      <div class="install-content">
        <div class="install-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div class="install-text">
          <span class="install-title">安装 FANDEX 到桌面</span>
          <span class="install-desc">离线可用，秒开体验</span>
        </div>
      </div>
      <div class="install-actions">
        <button class="btn-dismiss" @click="dismiss">稍后</button>
        <button class="btn-install" @click="install">安装</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 320px;
  max-width: calc(100vw - 2rem);
  padding: 0.75rem 1rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

:global([data-theme='dark']) .install-banner {
  background: #1a1a1a;
  border-color: #333;
}

.install-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.install-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #3366cc;
  color: #ffffff;
  border-radius: 10px;
  flex-shrink: 0;
}

.install-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.install-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #0d0d0d);
}

.install-desc {
  font-size: 0.75rem;
  color: var(--text-secondary, #4d4d4d);
}

.install-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-dismiss {
  padding: 0.4rem 0.8rem;
  border: none;
  background: transparent;
  color: var(--text-secondary, #4d4d4d);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-dismiss:hover {
  background: rgba(0, 0, 0, 0.06);
}

.btn-install {
  padding: 0.4rem 1rem;
  border: none;
  background: #3366cc;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-install:hover {
  background: #264da8;
}

/* 过渡动画 */
.install-slide-enter-active,
.install-slide-leave-active {
  transition: all 0.3s ease;
}

.install-slide-enter-from,
.install-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .install-banner {
    left: 0.5rem;
    right: 0.5rem;
    transform: none;
    max-width: none;
  }

  .install-slide-enter-from,
  .install-slide-leave-to {
    transform: translateY(100%);
  }
}
</style>
