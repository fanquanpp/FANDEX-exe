/**
 * DOMPurify 全局类型声明
 *
 * 声明通过 CDN 引入的 DOMPurify 库的全局类型，
 * 用于 tags/index.astro 中安全地净化动态生成的 HTML，防止 XSS 注入。
 * DOMPurify 通过 <script> 标签从 CDN 加载后挂载到 window 对象上。
 */
declare global {
  interface Window {
    DOMPurify?: {
      sanitize: (html: string) => string;
    };
  }
}

export {};
