---
order: 62
title: 'Fetch-API'
module: javascript
category: JavaScript
difficulty: intermediate
description: 现代网络请求API详解
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/自定义Error
  - javascript/浏览器对象模型
  - javascript/Web存储API
  - javascript/索引数据库
prerequisites:
  - javascript/语法速查
---

## 1. Fetch API 基础

```javascript
// GET
const response = await fetch('/api/users');
const data = await response.json();

// POST
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});

// Fetch 不会对 HTTP 错误状态码抛出异常！
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

## 2. Response 对象

```javascript
response.status; // 200
response.ok; // true
response.headers.get('Content-Type');

// 解析响应体（只能读取一次）
await response.json();
await response.text();
await response.blob();
await response.arrayBuffer();

// 克隆
const cloned = response.clone();
```

## 3. 请求取消

```javascript
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal }).catch((err) => {
  if (err.name === 'AbortError') console.log('请求被取消');
});
controller.abort();

// 超时取消
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal });
}
```

## 4. 流式处理

```javascript
// 下载进度
async function downloadWithProgress(url, onProgress) {
  const response = await fetch(url);
  const total = parseInt(response.headers.get('Content-Length'), 10);
  const reader = response.body.getReader();
  let received = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  return new Blob(chunks);
}
```

## 5. 封装 HTTP 客户端

```javascript
class HttpClient {
  constructor(baseURL, defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
  }

  async request(url, options = {}) {
    const response = await fetch(this.baseURL + url, {
      ...this.defaultOptions,
      ...options,
      headers: { ...this.defaultOptions.headers, ...options.headers },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  get(url, opts) {
    return this.request(url, { ...opts, method: 'GET' });
  }
  post(url, body, opts) {
    return this.request(url, {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}
```
