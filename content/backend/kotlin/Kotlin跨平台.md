---
order: 108
title: Kotlin跨平台
module: kotlin
category: 'dev-lang'
difficulty: advanced
description: Kotlin跨平台详解：Kotlin/JS与Kotlin/Native。
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/作用域函数区别
  - kotlin/协程异常处理
prerequisites:
  - kotlin/概述与环境配置
---

## 1. Kotlin Multiplatform

```kotlin
// 共享代码
expect fun getPlatformName(): String

// 平台实现
// androidMain
actual fun getPlatformName() = "Android"

// iosMain
actual fun getPlatformName() = "iOS"

// jsMain
actual fun getPlatformName() = "JavaScript"
```

## 2. Kotlin/JS

```kotlin
// 调用 JavaScript API
external fun alert(message: String)

// 使用 DOM
document.getElementById("app")?.innerHTML = "<h1>Hello</h1>"
```

## 3. Kotlin/Native

```kotlin
// 直接编译为原生二进制
// 无需 JVM
// 适用于 iOS、嵌入式、WASM

// 内存管理：自动引用计数（ARC）
```

## 4. 共享模块策略

```
shared/
  commonMain/     # 所有平台共享
  androidMain/    # Android 特定
  iosMain/        # iOS 特定
  jsMain/         # JS 特定
  desktopMain/    # JVM Desktop 特定
```
