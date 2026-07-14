import { reactive } from 'vue';
import { getAllProgress, setProgress, type ProgressMap, type DocStatus } from './progress';

export const globalState = reactive({
  progress: {} as ProgressMap,
  activeModule: '',
  searchQuery: '',
  isMobile: false,
  initialized: false,
});

let channel: BroadcastChannel | null = null;

if (typeof BroadcastChannel !== 'undefined') {
  channel = new BroadcastChannel('fandex-sync');
  channel.onmessage = (e: MessageEvent) => {
    if (e.data?.type === 'progress-update') {
      const { slug, status } = e.data;
      if (slug && status) {
        globalState.progress[slug] = { status, lastRead: Date.now(), scrollPos: 0 };
      }
      window.dispatchEvent(new CustomEvent('progress-sync'));
    }
  };
}

/** 更新进度并广播变更（仅发送变更的 slug，而非全量 progress） */
export function updateProgress(slug: string, status: DocStatus, scrollPos = 0) {
  setProgress(slug, status, scrollPos);
  globalState.progress[slug] = { status, lastRead: Date.now(), scrollPos };
  channel?.postMessage({ type: 'progress-update', slug, status });
}

export async function initGlobalState() {
  // 读取学习进度，异常时回退为空进度对象，避免阻断全局状态初始化
  try {
    globalState.progress = getAllProgress();
  } catch (e) {
    console.error('[FANDEX] 进度加载失败，回退为空进度对象', e);
    globalState.progress = {};
  }

  const checkMobile = () => {
    globalState.isMobile = window.innerWidth <= 768;
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);

  globalState.initialized = true;
}
