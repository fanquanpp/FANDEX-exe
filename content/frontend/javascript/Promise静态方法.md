---
order: 103
title: Promise静态方法
module: javascript
category: 'dev-lang'
difficulty: intermediate
description: Promise静态方法详解：allSettled、any、withResolvers及传统方法对比。
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/原型链继承与class本质
  - javascript/事件循环详解
  - javascript/异步并发控制
  - javascript/ES6+新特性
prerequisites:
  - javascript/语法速查
---

## 1. Promise.all — 全部成功

### 1.1 基本用法

```javascript
const [users, posts, comments] = await Promise.all([fetchUsers(), fetchPosts(), fetchComments()]);
```

- 所有 Promise 成功 → 返回结果数组
- 任一 Promise 失败 → 立即拒绝，返回第一个错误

### 1.2 错误处理

```javascript
try {
  const results = await Promise.all([
    fetch('/api/a'),
    fetch('/api/b'), // 如果这个失败
    fetch('/api/c'),
  ]);
} catch (error) {
  // 只能捕获第一个失败，其他请求的结果丢失
  console.error(error);
}
```

## 2. Promise.allSettled — 全部完成

### 2.1 基本用法

```javascript
const results = await Promise.allSettled([
  fetch('/api/a'),
  fetch('/api/b'), // 即使失败
  fetch('/api/c'),
]);

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('成功:', result.value);
  } else {
    console.log('失败:', result.reason);
  }
});
```

### 2.2 结果格式

```javascript
// 成功
{ status: 'fulfilled', value: any }

// 失败
{ status: 'rejected', reason: any }
```

### 2.3 实用工具函数

```javascript
// 分离成功和失败
function partitionResults(results) {
  const fulfilled = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const rejected = results.filter((r) => r.status === 'rejected').map((r) => r.reason);
  return { fulfilled, rejected };
}

// 批量操作，收集所有结果
async function batchDelete(ids) {
  const results = await Promise.allSettled(
    ids.map((id) => fetch(`/api/items/${id}`, { method: 'DELETE' }))
  );
  const { fulfilled, rejected } = partitionResults(results);
  console.log(`成功: ${fulfilled.length}, 失败: ${rejected.length}`);
  return { fulfilled, rejected };
}
```

## 3. Promise.any — 任一成功

### 3.1 基本用法

```javascript
// 多源竞速，取最快成功的
const fastest = await Promise.any([
  fetchFromCDN1('/api/data'),
  fetchFromCDN2('/api/data'),
  fetchFromCDN3('/api/data'),
]);
```

- 任一 Promise 成功 → 立即返回该结果
- 所有 Promise 失败 → 抛出 `AggregateError`

### 3.2 AggregateError

```javascript
try {
  const result = await Promise.any([
    Promise.reject(new Error('CDN1 failed')),
    Promise.reject(new Error('CDN2 failed')),
    Promise.reject(new Error('CDN3 failed')),
  ]);
} catch (aggregateError) {
  console.log(aggregateError instanceof AggregateError); // true
  console.log(aggregateError.errors); // [Error, Error, Error]
  aggregateError.errors.forEach((err) => console.error(err.message));
}
```

### 3.3 与 Promise.race 的区别

| 方法           | 成功条件   | 失败条件                 |
| -------------- | ---------- | ------------------------ |
| `Promise.race` | 第一个完成 | 第一个完成（可能是拒绝） |
| `Promise.any`  | 第一个成功 | 全部失败                 |

```javascript
// race: 第一个拒绝就拒绝
const r1 = await Promise.race([
  Promise.reject(new Error('fast fail')),
  new Promise((resolve) => setTimeout(() => resolve('slow success'), 100)),
]);
// 抛出 Error: fast fail

// any: 忽略拒绝，等第一个成功
const r2 = await Promise.any([
  Promise.reject(new Error('fast fail')),
  new Promise((resolve) => setTimeout(() => resolve('slow success'), 100)),
]);
// 'slow success'
```

## 4. Promise.withResolvers

### 4.1 传统模式的问题

```javascript
// 传统方式：resolve/reject 需要在 Promise 回调内定义
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// 使用
resolve('done');
```

### 4.2 withResolvers 用法

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

// resolve 和 reject 可以在 Promise 外部使用
setTimeout(() => resolve('done'), 1000);
const result = await promise; // 'done'
```

### 4.3 实际应用场景

**缓存 Promise**：

```javascript
function createCachedFetcher() {
  const cache = new Map();

  return function fetchWithCache(url) {
    if (cache.has(url)) {
      return cache.get(url).promise;
    }

    const { promise, resolve, reject } = Promise.withResolvers();
    cache.set(url, { promise });

    fetch(url)
      .then((res) => res.json())
      .then(resolve)
      .catch(reject);

    return promise;
  };
}
```

**事件转 Promise**：

```javascript
function waitForEvent(emitter, eventName) {
  const { promise, resolve } = Promise.withResolvers();

  emitter.once(eventName, resolve);
  // 也可添加超时
  setTimeout(() => resolve(null), 5000);

  return promise;
}

// 使用
const data = await waitForEvent(socket, 'message');
```

**可取消的异步操作**：

```javascript
function createCancellableTask(asyncFn) {
  const { promise, resolve, reject } = Promise.withResolvers();
  let cancelled = false;

  asyncFn()
    .then((result) => {
      if (!cancelled) resolve(result);
    })
    .catch((error) => {
      if (!cancelled) reject(error);
    });

  return {
    promise,
    cancel() {
      cancelled = true;
      reject(new Error('Task cancelled'));
    },
  };
}
```

## 5. 方法对比总结

| 方法                    | 成功条件   | 失败条件               | 返回值                       |
| ----------------------- | ---------- | ---------------------- | ---------------------------- |
| `Promise.all`           | 全部成功   | 任一失败               | 结果数组                     |
| `Promise.allSettled`    | 永远成功   | 不会失败               | 状态对象数组                 |
| `Promise.race`          | 第一个完成 | 第一个完成（可能拒绝） | 第一个结果                   |
| `Promise.any`           | 第一个成功 | 全部失败               | 第一个成功值                 |
| `Promise.withResolvers` | 手动控制   | 手动控制               | { promise, resolve, reject } |

## 6. 组合使用

### 6.1 带超时的请求

```javascript
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
  ]);
}
```

### 6.2 批量重试

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```
