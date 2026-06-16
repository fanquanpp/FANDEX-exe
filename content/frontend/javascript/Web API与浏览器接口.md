---
order: 120
tags:
  - javascript
  - 'web-api'
difficulty: intermediate
title: 'Web API 与浏览器接口'
module: javascript
category: 'JS Basics'
description: '浏览器Web API详解：Fetch、Storage、IntersectionObserver、Web Workers、Geolocation等常用接口。'
author: fanquanpp
updated: '2026-06-13'
related:
  - javascript/错误边界与全局错误捕获
  - javascript/内存泄漏排查
  - javascript/调试与性能优化
  - javascript/典型项目实战
prerequisites:
  - javascript/语法速查
---

## 1. Fetch API

### 1.1 基本用法

```javascript
// GET请求
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

// POST请求
async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// 完整配置
async function advancedFetch() {
  const response = await fetch('https://api.example.com/data', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
    },
    body: JSON.stringify({ name: 'Alice', age: 25 }),
    mode: 'cors', // 请求模式
    credentials: 'include', // 发送cookie
    cache: 'no-cache', // 缓存策略
    redirect: 'follow', // 重定向处理
    referrerPolicy: 'no-referrer', // 引用策略
    signal: AbortSignal.timeout(5000), // 超时（ES2023）
  });

  // 读取不同类型的响应
  const text = await response.text(); // 文本
  const json = await response.json(); // JSON
  const blob = await response.blob(); // 二进制数据
  const arrayBuffer = await response.arrayBuffer(); // ArrayBuffer
  const formData = await response.formData(); // FormData

  // 读取响应头
  console.log(response.headers.get('Content-Type'));
  console.log(response.status); // 200
  console.log(response.ok); // true
}
```

### 1.2 请求取消与超时

```javascript
// AbortController 取消请求
const controller = new AbortController();
const signal = controller.signal;

fetch('https://api.example.com/slow', { signal })
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => {
    if (err.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 5秒后取消
setTimeout(() => controller.abort(), 5000);

// 用户点击取消按钮
// cancelButton.addEventListener('click', () => controller.abort());

// 封装超时fetch
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}
```

### 1.3 文件上传与下载

```javascript
// 文件上传
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({ name: file.name }));

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData, // 不设置Content-Type，浏览器自动设置multipart/form-data
  });
  return response.json();
}

// 带进度监控的上传（使用XMLHttpRequest）
function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => resolve(JSON.parse(xhr.responseText)));
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

// 文件下载
async function downloadFile(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(downloadUrl);
}
```

## 2. Web Storage

### 2.1 localStorage 与 sessionStorage

```javascript
// localStorage: 持久化存储，同源共享
localStorage.setItem('username', 'Alice');
const username = localStorage.getItem('username'); // "Alice"
localStorage.removeItem('username');
localStorage.clear(); // 清空所有

// sessionStorage: 会话存储，标签页关闭后清除
sessionStorage.setItem('tempData', JSON.stringify({ page: 1 }));
const data = JSON.parse(sessionStorage.getItem('tempData'));

// 封装带过期时间的Storage
const storage = {
  set(key, value, ttl = null) {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const item = JSON.parse(raw);
    if (item.expiry && Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};

// 使用
storage.set('token', 'abc123', 3600000); // 1小时后过期
console.log(storage.get('token')); // "abc123"
```

### 2.2 Storage 事件监听

```javascript
// 监听其他标签页的storage变化
window.addEventListener('storage', (event) => {
  console.log('Key:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
  console.log('URL:', event.url);
  console.log('Storage area:', event.storageArea);
});

// IndexedDB: 大量结构化数据存储
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
```

## 3. IntersectionObserver

### 3.1 懒加载

```javascript
// 图片懒加载
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img); // 加载后停止观察
      }
    });
  },
  {
    rootMargin: '100px', // 提前100px开始加载
    threshold: 0.01,
  }
);

lazyImages.forEach((img) => imageObserver.observe(img));
```

### 3.2 无限滚动

```javascript
// 无限滚动加载
const sentinel = document.getElementById('sentinel'); // 底部哨兵元素

const scrollObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      loadMoreData();
    }
  },
  {
    rootMargin: '200px', // 提前200px触发
  }
);

scrollObserver.observe(sentinel);

let page = 1;
let loading = false;

async function loadMoreData() {
  if (loading) return;
  loading = true;

  const response = await fetch(`/api/items?page=${page}`);
  const data = await response.json();

  if (data.items.length > 0) {
    appendItems(data.items);
    page++;
  } else {
    scrollObserver.disconnect(); // 没有更多数据
  }

  loading = false;
}
```

### 3.3 动画触发

```javascript
// 滚动时触发动画
const animatedElements = document.querySelectorAll('.animate-on-scroll');

const animationObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible'); // 滚出视口时移除
      }
    });
  },
  {
    threshold: 0.2, // 20%可见时触发
  }
);

animatedElements.forEach((el) => animationObserver.observe(el));
```

## 4. Web Workers

### 4.1 创建 Worker

```javascript
// 主线程
const worker = new Worker('worker.js');

worker.postMessage({ type: 'compute', data: [1, 2, 3, 4, 5] });

worker.onmessage = (event) => {
  console.log('Worker result:', event.data);
};

worker.onerror = (error) => {
  console.error('Worker error:', error.message);
};

// 终止Worker
// worker.terminate();

// worker.js
self.onmessage = function (event) {
  const { type, data } = event.data;

  if (type === 'compute') {
    // 耗时计算
    const result = data.reduce((sum, n) => sum + n * n, 0);
    self.postMessage({ type: 'result', data: result });
  }
};
```

### 4.2 内联 Worker

```javascript
// 使用Blob创建内联Worker
const workerCode = `
    self.onmessage = function(event) {
        const result = heavyComputation(event.data);
        self.postMessage(result);
    };

    function heavyComputation(n) {
        let result = 0;
        for (let i = 0; i < n; i++) {
            result += Math.sqrt(i);
        }
        return result;
    }
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const worker = new Worker(workerUrl);

worker.postMessage(1000000);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
  URL.revokeObjectURL(workerUrl); // 清理
};
```

## 5. 其他常用 Web API

### 5.1 Geolocation

```javascript
// 获取地理位置
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('纬度:', position.coords.latitude);
      console.log('经度:', position.coords.longitude);
      console.log('精度:', position.coords.accuracy);
    },
    (error) => {
      console.error('定位失败:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 缓存5分钟
    }
  );

  // 持续监听位置变化
  const watchId = navigator.geolocation.watchPosition(
    (position) => console.log(position),
    (error) => console.error(error)
  );

  // 停止监听
  // navigator.geolocation.clearWatch(watchId);
}
```

### 5.2 Clipboard API

```javascript
// 复制文本
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('已复制到剪贴板');
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// 读取剪贴板
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('剪贴板内容:', text);
  } catch (err) {
    console.error('读取剪贴板失败:', err);
  }
}
```

### 5.3 Notification API

```javascript
// 请求通知权限
async function requestNotificationPermission() {
  if (!('Notification' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification('消息标题', {
      body: '这是通知内容',
      icon: '/icon.png',
      badge: '/badge.png',
      tag: 'unique-tag', // 相同tag替换旧通知
      data: { url: '/detail' },
    });
  }
}

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  clients.openWindow(url);
});
```

### 5.4 ResizeObserver

```javascript
// 监听元素尺寸变化
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`元素尺寸: ${width}x${height}`);
  }
});

resizeObserver.observe(document.querySelector('.container'));
```

## 6. 常见问题与解决方案

### 6.1 Fetch 不支持进度

```javascript
// 使用ReadableStream读取响应进度
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  const contentLength = response.headers.get('Content-Length');
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }

  const blob = new Blob(chunks);
  return blob;
}
```

### 6.2 Storage 容量限制

```javascript
// 检测Storage可用空间
async function estimateStorage() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    console.log(`已用: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`可用: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);
  }
}

// 安全写入Storage
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('存储空间已满');
      // 清理策略：移除最旧的数据
    }
  }
}
```

## 7. 总结与最佳实践

### 7.1 API 选择指南

| 需求     | 推荐API              | 替代方案                 |
| :------- | :------------------- | :----------------------- |
| HTTP请求 | Fetch API            | XMLHttpRequest（需进度） |
| 本地存储 | localStorage         | IndexedDB（大量数据）    |
| 懒加载   | IntersectionObserver | scroll事件（性能差）     |
| 后台计算 | Web Worker           | 主线程（阻塞UI）         |
| 定位     | Geolocation API      | IP定位（精度低）         |
| 复制粘贴 | Clipboard API        | execCommand（已废弃）    |

### 7.2 最佳实践

1. **Fetch始终处理错误**：检查 `response.ok` 和网络异常
2. **使用AbortController**：取消不需要的请求
3. **Storage加密敏感数据**：不要明文存储密码
4. **Observer用完disconnect**：避免内存泄漏
5. **Web Worker处理CPU密集任务**：不阻塞主线程
6. **API兼容性检测**：使用 `'api' in window` 检查
