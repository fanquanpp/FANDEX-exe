/**
 * 术语提示运行时交互模块
 *
 * 功能概述：
 * 为构建时已标记的术语节点（.term-tip[data-term]）绑定交互事件。
 * 构建时由 remark-term-link 插件在 HTML 中嵌入术语标记，
 * 运行时仅需绑定 hover/click 事件，无需扫描 DOM 或加载术语数据。
 *
 * 交互模式：
 * - 桌面端：mouseenter 动态创建并定位 popup，mouseleave 隐藏
 * - 移动端：click 显示 modal 弹窗
 * - 键盘：Enter/Space 触发对应交互
 *
 * 数据来源：
 * 术语信息从 .term-tip 元素的 data 属性读取（data-term, data-module, data-def, data-slug）
 */

/** 移动端断点（与 CSS 媒体查询保持一致） */
const MOBILE_BREAKPOINT = 768;

/** 当前活跃的 popup 元素（桌面端复用，避免重复创建） */
let activePopup: HTMLElement | null = null;

/** 当前关联的 term-tip 元素 */
let activeTip: HTMLElement | null = null;

/**
 * 判断当前是否为移动端视口
 *
 * 输入：无
 * 输出：是否为移动端
 */
function isMobile(): boolean {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * 关闭术语详情弹窗（移动端）
 *
 * 输入：无
 * 输出：无
 * 流程：移除弹窗 DOM 元素，恢复页面滚动
 */
function closeTermModal(): void {
  const existing = document.querySelector('.term-modal');
  if (existing) {
    existing.remove();
    document.body.style.overflow = '';
  }
}

/**
 * 显示术语详情弹窗（移动端）
 *
 * 输入：术语名、定义、模块 ID、slug
 * 输出：无
 * 流程：创建全屏遮罩 + 弹窗内容，绑定关闭事件
 *
 * @param term - 术语名称
 * @param def - 术语定义
 * @param module - 术语所属模块 ID
 * @param slug - 术语页面 slug
 */
function showTermModal(
  term: string,
  def: string,
  module: string,
  slug: string
): void {
  closeTermModal();

  const baseUrl = import.meta.env.BASE_URL;

  const modal = document.createElement('div');
  modal.className = 'term-modal';

  const overlay = document.createElement('div');
  overlay.className = 'term-modal-overlay';

  const content = document.createElement('div');
  content.className = 'term-modal-content';

  const header = document.createElement('div');
  header.className = 'term-modal-header';

  const h3 = document.createElement('h3');
  h3.className = 'term-modal-title';
  h3.textContent = term;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'term-modal-close';
  closeBtn.setAttribute('aria-label', '关闭');
  closeBtn.textContent = '\u2715';

  header.appendChild(h3);
  header.appendChild(closeBtn);

  const defDiv = document.createElement('div');
  defDiv.className = 'term-modal-def';
  defDiv.textContent = def;

  const link = document.createElement('a');
  link.className = 'term-modal-link';
  link.href = `${baseUrl}${slug}/`;
  link.textContent = '查看详情 \u2192';

  content.appendChild(header);
  content.appendChild(defDiv);
  content.appendChild(link);
  modal.appendChild(overlay);
  modal.appendChild(content);
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  closeBtn.addEventListener('click', closeTermModal);
  overlay.addEventListener('click', (e: Event) => {
    if (e.target === overlay) closeTermModal();
  });

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTermModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * 隐藏当前活跃的桌面端 popup
 *
 * 输入：无
 * 输出：无
 * 流程：移除 popup DOM 元素，清理引用
 */
function hidePopup(): void {
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
  activeTip = null;
}

/**
 * 为术语节点创建并显示桌面端 popup
 *
 * 输入：术语节点元素
 * 输出：无
 * 流程：
 * 1. 读取 data 属性获取术语信息
 * 2. 创建 popup DOM 元素
 * 3. 定位到术语文本下方
 * 4. 绑定 mouseleave 事件
 *
 * @param tip - 术语节点元素（.term-tip）
 */
function showPopup(tip: HTMLElement): void {
  /* 若 popup 已显示且关联同一术语节点，不重复创建 */
  if (activeTip === tip) return;

  /* 隐藏之前的 popup */
  hidePopup();

  const term = tip.dataset.term ?? '';
  const def = tip.dataset.def ?? '';
  const slug = tip.dataset.slug ?? '';
  const baseUrl = import.meta.env.BASE_URL;

  const popup = document.createElement('span');
  popup.className = 'term-popup';

  const defSpan = document.createElement('span');
  defSpan.className = 'term-popup-def';
  defSpan.textContent = def;
  popup.appendChild(defSpan);

  const link = document.createElement('a');
  link.className = 'term-popup-link';
  link.href = `${baseUrl}${slug}/`;
  link.textContent = '查看详情';
  popup.appendChild(link);

  tip.appendChild(popup);
  activePopup = popup;
  activeTip = tip;

  /* 定位 popup */
  const abbr = tip.querySelector<HTMLElement>('.term-abbr');
  if (abbr) {
    const rect = abbr.getBoundingClientRect();
    const popupWidth = Math.min(320, window.innerWidth - 16);
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + popupWidth > window.innerWidth - 8) {
      left = window.innerWidth - popupWidth - 8;
    }
    if (left < 8) left = 8;
    if (top + 200 > window.innerHeight) {
      top = rect.top - 6;
      popup.style.transform = 'translateY(-100%)';
    } else {
      popup.style.transform = '';
    }
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.maxWidth = popupWidth + 'px';
  }

  /* 鼠标离开术语节点或 popup 时隐藏 */
  const hideHandler = (e: MouseEvent) => {
    /* 检查鼠标是否移入 popup 自身（popup 是 tip 的子元素） */
    const related = e.relatedTarget as HTMLElement | null;
    if (related && (related === popup || popup.contains(related))) return;
    if (related && (related === tip || tip.contains(related))) return;
    hidePopup();
    tip.removeEventListener('mouseleave', hideHandler);
    popup.removeEventListener('mouseleave', hideHandler);
  };
  tip.addEventListener('mouseleave', hideHandler);
  popup.addEventListener('mouseleave', hideHandler);
}

/**
 * 初始化术语提示交互
 *
 * 输入：无
 * 输出：无
 * 流程：
 * 1. 查找所有 .term-tip[data-term] 元素（构建时已标记）
 * 2. 根据设备类型绑定 hover 或 click 事件
 * 3. 桌面端：mouseenter 显示 popup
 * 4. 移动端：click 显示 modal
 * 5. 键盘：Enter/Space 触发对应交互
 */
export function initTermTooltip(): void {
  const tips = document.querySelectorAll<HTMLElement>('.term-tip[data-term]');
  if (tips.length === 0) return;

  const mobile = isMobile();

  tips.forEach((tip) => {
    if (mobile) {
      /* 移动端：点击显示 modal */
      tip.style.cursor = 'pointer';
      tip.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        showTermModal(
          tip.dataset.term ?? '',
          tip.dataset.def ?? '',
          tip.dataset.module ?? '',
          tip.dataset.slug ?? ''
        );
      });
    } else {
      /* 桌面端：悬停显示 popup */
      tip.addEventListener('mouseenter', () => {
        showPopup(tip);
      });
    }

    /* 键盘交互：Enter/Space 触发 */
    tip.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isMobile()) {
          showTermModal(
            tip.dataset.term ?? '',
            tip.dataset.def ?? '',
            tip.dataset.module ?? '',
            tip.dataset.slug ?? ''
          );
        } else {
          showPopup(tip);
          /* 键盘触发时短暂显示 popup 后自动隐藏 */
          if (activePopup) {
            activePopup.style.visibility = 'visible';
            activePopup.style.opacity = '1';
            setTimeout(() => {
              if (activePopup) {
                activePopup.style.visibility = '';
                activePopup.style.opacity = '';
              }
            }, 3000);
          }
        }
      }
    });
  });
}
