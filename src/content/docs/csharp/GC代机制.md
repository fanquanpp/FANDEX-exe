---
order: 107
title: 'GC代机制'
module: 'csharp'
category: 'dev-lang'
difficulty: 'advanced'
description: '.NET GC代机制详解：Generation 0/1/2。'
author: 'fanquanpp'
updated: 2026-06-14
---

## 1. 三代模型

| 代    | 说明                 | 大小 | GC 频率      |
| ----- | -------------------- | ---- | ------------ |
| Gen 0 | 短寿命对象           | 小   | 最频繁       |
| Gen 1 | 短寿命与长寿命的缓冲 | 中   | 较少         |
| Gen 2 | 长寿命对象           | 大   | 最少         |
| LOH   | 大对象（≥85KB）      | 大   | Gen 2 回收时 |

## 2. 提升规则

- 新对象分配在 Gen 0
- Gen 0 GC 后存活的对象提升到 Gen 1
- Gen 1 GC 后存活的对象提升到 Gen 2
- Gen 2 GC 后仍存活的对象留在 Gen 2

## 3. GC 模式

```csharp
// 工作站模式（默认）
// 服务器模式
<ServerGarbageCollection>true</ServerGarbageCollection>
```

## 4. 手动触发

```csharp
GC.Collect();         // 全代回收
GC.Collect(0);        // 仅 Gen 0
GC.Collect(2, GCCollectionMode.Forced, blocking: true);
```

> 通常不需要手动触发 GC。
