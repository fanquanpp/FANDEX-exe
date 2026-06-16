---
order: 80
title: C++嵌入式开发
module: cpp
category: C++
difficulty: advanced
description: 嵌入式C++开发要点
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++图形编程
  - cpp/C++游戏开发
  - cpp/内存管理
  - cpp/C++与Rust对比
prerequisites:
  - cpp/概述与现代标准
---

## 1. 嵌入式 C++ 限制

```cpp
// 避免异常（增加代码体积）
// -fno-exceptions

// 避免RTTI
// -fno-rtti

// 使用 constexpr 代替运行时计算
constexpr int BUFFER_SIZE = 1024;
alignas(16) uint8_t buffer[BUFFER_SIZE];

// 静态分配
class ObjectPool {
  std::array<Object, MAX_OBJECTS> pool_;
  std::bitset<MAX_OBJECTS> used_;
};
```
