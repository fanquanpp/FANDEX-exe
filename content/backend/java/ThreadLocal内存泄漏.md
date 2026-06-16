---
order: 103
title: ThreadLocal内存泄漏
module: java
category: 'dev-lang'
difficulty: advanced
description: 'Java ThreadLocal内存泄漏原因与解决方案。'
author: fanquanpp
updated: '2026-06-14'
related:
  - java/并发编程详解
  - java/CompletableFuture异步编排
  - java/反射与动态代理
  - java/注解处理器
prerequisites:
  - java/概述与开发环境
---

## 1. 泄漏原因

ThreadLocal 存储在 Thread 的 ThreadLocalMap 中，key 是弱引用，value 是强引用：

```
Thread → ThreadLocalMap → Entry[WeakRef<ThreadLocal>, value]
                              ↑ 弱引用           ↑ 强引用
```

当 ThreadLocal 对象被回收后，key 变为 null，但 value 仍被强引用，无法回收。

## 2. 解决方案

```java
ThreadLocal<Connection> tl = new ThreadLocal<>();

try {
    tl.set(connection);
    // 使用 tl.get()
} finally {
    tl.remove();  // 必须手动清理！
}
```

## 3. 线程池中的风险

```java
ExecutorService pool = Executors.newFixedThreadPool(10);

// 线程被复用，ThreadLocal 值不会自动清理
pool.submit(() -> {
    tl.set(data);
    // 忘记 remove → 下一个任务可能读到脏数据
});
```

## 4. 最佳实践

- 使用后必须 `remove()`
- 声明为 `private static final`
- 使用 try-finally 确保清理
