---
order: 82
title: C++代码规范
module: cpp
category: C++
difficulty: beginner
description: C++编码规范与最佳实践
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/内存管理
  - cpp/C++与Rust对比
  - cpp/C++与WebAssembly
  - cpp/C++反射与元编程
prerequisites:
  - cpp/概述与现代标准
---

## 1. 命名规范

| 类型     | 风格       | 示例                |
| -------- | ---------- | ------------------- |
| 类名     | PascalCase | `MyClass`           |
| 函数     | snake_case | `process_data`      |
| 变量     | snake_case | `item_count`        |
| 常量     | UPPER_CASE | `MAX_SIZE`          |
| 模板参数 | PascalCase | `typename Iterator` |

## 2. 现代C++最佳实践

- 使用 `auto` 推断类型
- 优先 `{}` 初始化
- 使用 `nullptr` 代替 `NULL`
- 使用 `enum class`
- 使用 `constexpr`
- 优先 `std::array` 代替 C 数组
- 使用 RAII 管理资源
