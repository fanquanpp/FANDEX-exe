---
order: 107
title: GC代机制
module: csharp
category: 'dev-lang'
difficulty: advanced
description: '.NET GC代机制详解：Generation 0/1/2。'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/ASP-NET-Core中间件管道'
  - csharp/依赖注入生命周期
  - csharp/值类型与引用类型
  - csharp/记录类型与不可变性
prerequisites:
  - csharp/概述与环境配置
---

## 概述

.NET 的垃圾回收器采用分代回收策略，将堆内存分为三代（Generation 0/1/2）和大对象堆（LOH）。分代回收基于"弱分代假说"：新对象通常很快变为垃圾，老对象则倾向于继续存活。理解 GC 代机制有助于编写高性能的 .NET 应用。

## 基础概念

### 三代模型

| 代    | 说明                 | 大小 | GC 频率      |
| ----- | -------------------- | ---- | ------------ |
| Gen 0 | 短寿命对象           | 小   | 最频繁       |
| Gen 1 | 短寿命与长寿命的缓冲 | 中   | 较少         |
| Gen 2 | 长寿命对象           | 大   | 最少         |
| LOH   | 大对象（>=85KB）     | 大   | Gen 2 回收时 |

### 提升规则

- 新对象分配在 Gen 0
- Gen 0 GC 后存活的对象提升到 Gen 1
- Gen 1 GC 后存活的对象提升到 Gen 2
- Gen 2 GC 后仍存活的对象留在 Gen 2
- 大对象（>=85KB）直接分配在 LOH，LOH 在 Gen 2 回收时一并回收

## 快速上手

### 查看 GC 信息

```csharp
// 查看对象的代
var obj = new object();
Console.WriteLine(GC.GetGeneration(obj)); // 0

// 查看 GC 计数
Console.WriteLine($"Gen 0 GC 次数: {GC.CollectionCount(0)}");
Console.WriteLine($"Gen 1 GC 次数: {GC.CollectionCount(1)}");
Console.WriteLine($"Gen 2 GC 次数: {GC.CollectionCount(2)}");

// 查看内存使用
Console.WriteLine($"堆内存: {GC.GetTotalMemory(false) / 1024 / 1024} MB");
```

### 手动触发 GC

```csharp
// 全代回收（通常不需要手动触发）
GC.Collect();

// 仅回收 Gen 0
GC.Collect(0);

// 强制回收 Gen 2，阻塞模式
GC.Collect(2, GCCollectionMode.Forced, blocking: true);

// 等待挂起的终结器执行完毕
GC.WaitForPendingFinalizers();
```

## 详细用法

### GC 模式配置

```csharp
// 工作站模式（默认，单核优化）
// 适合桌面应用

// 服务器模式（多核优化）
// 在 csproj 中配置
// <ServerGarbageCollection>true</ServerGarbageCollection>

// 适合服务端应用，每个核心一个堆，并行回收

// 查看当前 GC 模式
Console.WriteLine(GCSettings.IsServerGC ? "服务器模式" : "工作站模式");

// 区域化 GC（.NET 8+）
// <GarbageCollectionAdaptationMode>1</GarbageCollectionAdaptationMode>
// 根据内存压力动态调整堆大小
```

### 内存分配优化

```csharp
// 减少分配：使用 Span<T> 和 stackalloc
Span<int> buffer = stackalloc int[100]; // 在栈上分配，无 GC 压力

// 使用对象池减少分配
var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(1024);
try {
    Process(buffer);
}
finally {
    pool.Return(buffer);
}

// 使用 ValueTask 替代 Task（同步路径无分配）
async ValueTask<int> GetValueAsync() {
    if (cache.TryGetValue(key, out var value))
        return value; // 同步返回，零分配
    return await FetchFromDbAsync();
}

// 使用 string.Create 减少字符串分配
string result = string.Create(10, state, (span, s) => {
    // 直接在目标缓冲区写入
    for (int i = 0; i < span.Length; i++)
        span[i] = (char)('0' + s.Data[i]);
});
```

### LOH 碎片处理

```csharp
// 大对象堆容易产生碎片
// .NET 8+ 默认在 Gen 2 GC 时压缩 LOH

// 手动压缩 LOH（.NET 6+）
GC.Collect(2, GCCollectionMode.Aggressive, blocking: true, compacting: true);

// 使用 ArrayPool 替代频繁分配大数组
var pool = ArrayPool<byte>.Shared;
byte[] largeBuffer = pool.Rent(100_000); // 从池中租用
try {
    ProcessLargeData(largeBuffer);
}
finally {
    pool.Return(largeBuffer);
}
```

## 常见场景

### 监控 GC 性能

```csharp
// 使用 EventSource 监控 GC 事件
using var listener = new GcEventListener();

class GcEventListener : EventListener {
    protected override void OnEventSourceCreated(EventSource eventSource) {
        if (eventSource.Name == "Microsoft-DotNETCore-SampleProfiler")
            EnableEvents(eventSource, EventLevel.Verbose);
    }

    protected override void OnEventWritten(EventWrittenEventArgs eventData) {
        // 处理 GC 事件
        if (eventData.EventName?.StartsWith("GC") == true) {
            Console.WriteLine($"GC 事件: {eventData.EventName}");
        }
    }
}

// 使用 dotnet-counters 工具
// dotnet-counters monitor -p <pid> --counters System.Runtime
```

### 避免 GC 压力的模式

```csharp
// 模式一：复用对象
class ObjectPool<T> where T : new() {
    private readonly ConcurrentBag<T> items = new();

    public T Get() => items.TryTake(out var item) ? item : new T();
    public void Return(T item) => items.Add(item);
}

// 模式二：结构体替代类
public readonly struct Point { // 值类型，在栈上分配
    public double X { get; }
    public double Y { get; }
}

// 模式三：预分配集合大小
var list = new List<int>(1000); // 预分配容量，避免扩容
var dict = new Dictionary<string, int>(500);
```

## 注意事项

- 通常不需要手动调用 GC.Collect()，让 GC 自行管理效率更高
- Gen 2 GC（Full GC）停顿时间最长，应尽量避免频繁触发
- 大对象（>=85KB）直接进入 LOH，LOH 碎片化是常见性能问题
- 服务器模式下每个核心有独立的堆，总内存占用更大但吞吐量更高
- 终结器（Finalizer）会增加 GC 开销，对象需要两次 GC 才能回收
- 使用 IDisposable 和 using 语句替代终结器，及时释放非托管资源

## 进阶用法

### 固定对象（Pinning）

```csharp
// 固定对象阻止 GC 移动它，可能导致堆碎片化
// 使用 fixed 语句固定对象
byte[] data = new byte[100];
fixed (byte* ptr = data) {
    // ptr 指向的数据不会被 GC 移动
    NativeMethod(ptr, data.Length);
}

// 使用 GCHandle 固定
var handle = GCHandle.Alloc(data, GCHandleType.Pinned);
try {
    IntPtr ptr = handle.AddrOfPinnedObject();
    NativeMethod(ptr, data.Length);
}
finally {
    handle.Free(); // 必须释放
}
```

### GC.TryStartNoGCRegion

```csharp
// 在关键路径上禁用 GC（.NET 9+）
if (GC.TryStartNoGCRegion(10_000_000)) { // 预留 10MB
    try {
        // 执行关键路径代码，不会触发 GC
        ProcessCriticalPath();
    }
    finally {
        GC.EndNoGCRegion(); // 退出无 GC 区域
    }
}
```
