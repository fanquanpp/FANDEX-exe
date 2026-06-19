/**
 * FANDEX Service Worker - PWA 全量预缓存版
 *
 * 缓存策略（离线优先）：
 * - install 阶段：预缓存全部静态资源（HTML/CSS/JS/JSON/字体/图片）
 * - HTML 页面：Cache First，后台 SWR 更新
 * - JSON 数据：Cache First，后台 SWR 更新
 * - 含 hash 的资源（CSS/JS/字体）：Cache First（长期缓存）
 * - 图片/其他：Stale While Revalidate
 * - 导航请求：Cache First，回退网络，再回退离线页
 *
 * 更新机制：
 * - 每次构建生成新版本号，触发 SW 更新
 * - 新版 SW 安装后预缓存新资源，skipWaiting 立即激活
 * - 旧缓存在 activate 阶段清除
 */

/** @type {string} 缓存版本号（由 generate-sw-precache.mjs 注入） */
const CACHE_NAME = 'fandex-v6';
/** @type {string} 站点基础路径（由 generate-sw-precache.mjs 注入，支持 GitHub Pages 和离线包） */
const BASE = '/FANDEX/';

/** @type {string[]} 预缓存资源列表（由 generate-sw-precache.mjs 注入） */
const PRECACHE_URLS = [BASE + 'data/glossary-index.json'];

/** @type {Set<string>} 含 hash 的资源扩展名，可长期缓存 */
const HASHED_EXTS = new Set(['.css', '.js', '.woff2', '.woff', '.ttf']);
/** @type {RegExp} 需要后台更新的 JSON 数据文件 */
const JSON_DATA_PATTERN = /\/data\/[^/]+\.json$/;
/** @type {RegExp} HTML 页面模式 */
const HTML_PATTERN = /\/$/;

/**
 * Service Worker 安装事件
 *
 * 预缓存全部静态资源，实现完全离线可用。
 * 预缓存失败时仅记录警告，不阻止安装（部分资源可运行时缓存补充）。
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      /** 分批预缓存，避免单次 addAll 失败导致全部回退 */
      const batchSize = 50;
      for (let i = 0; i < PRECACHE_URLS.length; i += batchSize) {
        const batch = PRECACHE_URLS.slice(i, i + batchSize);
        try {
          await cache.addAll(batch);
        } catch (err) {
          console.warn('[SW] 预缓存批次失败，跳过:', err.message);
        }
      }
      self.skipWaiting();
    })()
  );
});

/**
 * Service Worker 激活事件
 *
 * 清除旧版本缓存，立即接管所有客户端。
 * 通知所有客户端有新版本可用。
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      /** 清除非当前版本的缓存 */
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      self.clients.claim();

      /** 通知客户端 SW 已更新 */
      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({ type: 'SW_UPDATED' });
      }
    })()
  );
});

/**
 * Fetch 事件：根据资源类型选择缓存策略
 *
 * 所有策略均为离线优先，确保无网络时仍可访问。
 *
 * @param {FetchEvent} event
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  /**
   * 路径匹配逻辑：
   * - 绝对路径模式（GitHub Pages）：检查 pathname 是否以 BASE 开头
   * - 相对路径模式（离线包）：同源请求全部处理
   */
  if (BASE.startsWith('/')) {
    if (!url.pathname.startsWith(BASE)) return;
  } else {
    /** 离线包模式，仅处理同源 GET 请求 */
    if (url.origin !== self.location.origin) return;
  }

  const ext = getExt(url.pathname);
  const isHTML = ext === '' || ext === '.html' || url.pathname.endsWith('/');
  const isNavigation = event.request.mode === 'navigate';

  /** 导航请求：Cache First -> 网络 -> 离线页 */
  if (isNavigation) {
    event.respondWith(handleNavigation(event.request));
    return;
  }

  /** HTML 子资源：Cache First + 后台更新 */
  if (isHTML) {
    event.respondWith(cacheFirstWithUpdate(event.request));
    return;
  }

  /** 含 hash 的静态资源：Cache First */
  if (HASHED_EXTS.has(ext)) {
    event.respondWith(cacheFirstLong(event.request));
    return;
  }

  /** JSON 数据：Cache First + 后台更新 */
  if (JSON_DATA_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirstWithUpdate(event.request));
    return;
  }

  /** 图片/其他：Stale While Revalidate */
  event.respondWith(staleWhileRevalidate(event.request));
});

/**
 * 处理导航请求
 *
 * 输入：导航 Request
 * 输出：Response（缓存优先 -> 网络 -> 离线页）
 * 流程：
 * 1. 尝试从缓存匹配（处理尾部斜杠差异）
 * 2. 缓存命中则返回，同时后台更新
 * 3. 缓存未命中则走网络
 * 4. 网络失败则返回离线页
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  /** 尝试匹配缓存（处理 /path 和 /path/index.html 两种形式） */
  let cached = await cache.match(request);
  if (!cached) {
    const url = new URL(request.url);
    cached = await cache.match(url.pathname + 'index.html');
  }

  if (cached) {
    /** 后台更新缓存 */
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    return cached;
  }

  /** 缓存未命中，走网络 */
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /** 网络失败，返回离线页 */
    const offlineUrl = BASE.startsWith('/') ? BASE + 'offline.html' : './offline.html';
    const offlinePage = await cache.match(offlineUrl);
    return offlinePage || new Response('离线模式', { status: 503, statusText: 'Offline' });
  }
}

/**
 * Cache First + 后台更新策略
 *
 * 输入：Request
 * 输出：Response（缓存优先，后台静默更新）
 * 流程：缓存命中返回缓存并后台更新 -> 未命中走网络并缓存
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstWithUpdate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    /** 后台静默更新 */
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('{"error":"offline"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Cache First 策略（长期缓存）
 *
 * 适用于含 hash 的静态资源，文件名变化即视为新资源。
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstLong(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

/**
 * Stale While Revalidate 策略
 *
 * 先返回缓存，后台更新。
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || new Response('Offline', { status: 503, statusText: 'Offline' }));
  return cached || fetchPromise;
}

/**
 * 从路径中提取文件扩展名
 *
 * @param {string} path
 * @returns {string}
 */
function getExt(path) {
  const idx = path.lastIndexOf('.');
  if (idx <= 0) return '';
  const ext = path.substring(idx);
  if (ext.includes('/')) return '';
  return ext;
}
