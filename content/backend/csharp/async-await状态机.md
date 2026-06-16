---
order: 101
title: 'async-await状态机'
module: csharp
category: 'dev-lang'
difficulty: advanced
description: 'C# async/await状态机生成原理详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与反射'
  - csharp/LINQ延迟与立即执行
  - csharp/委托与事件底层原理
  - csharp/反射与特性应用
prerequisites:
  - csharp/概述与环境配置
---

## 1. 编译器转换

```csharp
async Task<int> GetDataAsync() {
    var a = await Step1Async();
    var b = await Step2Async(a);
    return a + b;
}
```

编译器生成状态机：

```csharp
struct StateMachine : IAsyncStateMachine {
    int state;
    TaskAwaiter<int> awaiter;

    void MoveNext() {
        try {
            if (state == 0) {
                awaiter = Step1Async().GetAwaiter();
                if (!awaiter.IsCompleted) {
                    state = 1;
                    AwaitUnsafeOnCompleted(ref awaiter, ref this);
                    return;
                }
                goto step1_done;
            }
            if (state == 1) {
                step1_done:
                a = awaiter.GetResult();
                awaiter = Step2Async(a).GetAwaiter();
                // ...
            }
        } catch (Exception ex) {
            taskCompletionSource.SetException(ex);
        }
    }
}
```

## 2. 开销

- 状态机结构体分配
- Task 对象分配（ValueTask 可优化）
- 上下文捕获和恢复

## 3. 优化建议

- 使用 `ValueTask` 替代 `Task`（同步完成时无分配）
- 使用 `ConfigureAwait(false)` 避免上下文捕获
- 避免在热路径中使用 async/await
