---
order: 67
title: 'Promise-withResolvers'
module: javascript
category: JavaScript
difficulty: intermediate
description: Promise.withResolvers()详解
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/时间API
  - javascript/迭代器帮助器
  - javascript/Records与Tuples
  - javascript/对象与数组
prerequisites:
  - javascript/语法速查
---

## 1. Promise.withResolvers 概述

`Promise.withResolvers()` 是 ES2024 新增的静态方法，它返回一个包含 `promise`、`resolve`、`reject` 的对象，避免了手动提取 resolve/reject 的样板代码。

## 2. 传统写法 vs 新写法

### 2.1 传统写法

```javascript
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// 使用
resolve('done');
```

### 2.2 新写法

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

resolve('done');
```

## 3. 实际应用

### 3.1 事件包装

```javascript
function waitForEvent(element, eventName) {
  const { promise, resolve } = Promise.withResolvers();
  element.addEventListener(eventName, resolve, { once: true });
  return promise;
}

// 使用
const click = await waitForEvent(button, 'click');
```

### 3.2 流式处理

```javascript
function createReadableStreamFromAsyncIterator(asyncIterator) {
  const { promise, resolve, reject } = Promise.withResolvers();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await asyncIterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
        resolve();
      } catch (err) {
        reject(err);
        throw err;
      }
    },
  });
}
```

### 3.3 超时控制

```javascript
function withTimeout(promise, ms) {
  const { promise: timeoutPromise, resolve } = Promise.withResolvers();
  const timer = setTimeout(() => resolve('timeout'), ms);

  return Promise.race([promise.finally(() => clearTimeout(timer)), timeoutPromise]);
}
```

### 3.4 一次性信号

```javascript
class Signal {
  #promise;
  #resolve;

  constructor() {
    const { promise, resolve } = Promise.withResolvers();
    this.#promise = promise;
    this.#resolve = resolve;
  }

  wait() {
    return this.#promise;
  }
  emit(value) {
    this.#resolve(value);
  }
}

const ready = new Signal();
// 生产者
ready.emit('data');
// 消费者
const data = await ready.wait();
```

## 4. 与传统写法的完整对比

```javascript
// 传统写法的问题
// 1. resolve/reject 在回调外部使用需要提前声明
// 2. 代码不够直观
// 3. TypeScript 类型推断困难

// 新写法的优势
// 1. 声明即解构，一步到位
// 2. resolve/reject 与 promise 同级，逻辑清晰
// 3. TypeScript 类型推断更友好
```
