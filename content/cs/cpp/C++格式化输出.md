---
order: 88
title: C++格式化输出
module: cpp
category: C++
difficulty: intermediate
description: 'std::format与格式化'
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++正则表达式
  - cpp/C++日期时间
  - cpp/C++26与最新标准
  - cpp/STL容器与迭代器
prerequisites:
  - cpp/概述与现代标准
---

## 1. std::format（C++20）

```cpp
#include <format>

std::string s = std::format("Hello, {}!", "World");
std::string s2 = std::format("{0} + {1} = {2}", 1, 2, 3);
std::string s3 = std::format("{:.2f}", 3.14159); // "3.14"
std::string s4 = std::format("{:10d}", 42);      // "        42"
```

## 2. std::print（C++23）

```cpp
#include <print>

std::print("Hello, {}!\n", "World");
std::println("Value: {}", 42);
```
