---
order: 101
title: Flow冷流与SharedFlow和StateFlow
module: kotlin
category: 'dev-lang'
difficulty: advanced
description: 'Kotlin Flow冷流与SharedFlow和StateFlow详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与安全
  - kotlin/协程调度器与上下文
  - kotlin/Channel与BroadcastChannel
  - kotlin/密封类与密封接口
prerequisites:
  - kotlin/概述与环境配置
---

## 1. Flow（冷流）

```kotlin
val numbers = flow {
    for (i in 1..5) {
        emit(i)
        delay(100)
    }
}

// 每个收集者独立执行
numbers.collect { println(it) }  // 1,2,3,4,5
numbers.collect { println(it) }  // 1,2,3,4,5（重新执行）
```

## 2. SharedFlow（热流）

```kotlin
val sharedFlow = MutableSharedFlow<String>()

// 发射
sharedFlow.emit("event")

// 多个收集者共享
sharedFlow.collect { println("A: $it") }
sharedFlow.collect { println("B: $it") }
```

配置：

```kotlin
MutableSharedFlow<String>(
    replay = 0,        // 新订阅者重放数量
    extraBufferCapacity = 64,
    onBufferOverflow = BufferOverflow.SUSPEND
)
```

## 3. StateFlow

```kotlin
val state = MutableStateFlow(0)  // 必须有初始值

state.value = 1  // 更新值
state.collect { println(it) }  // 总是能获取最新值
```

## 4. 对比

| 特性     | Flow     | SharedFlow  | StateFlow            |
| -------- | -------- | ----------- | -------------------- |
| 冷/热    | 冷       | 热          | 热                   |
| 多收集者 | 各自执行 | 共享        | 共享                 |
| 初始值   | 无       | 无          | 必须                 |
| 值缓存   | 无       | replay 配置 | 最新值               |
| 去重     | 无       | 无          | 自动（值相同不发射） |
