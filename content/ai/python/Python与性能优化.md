---
order: 80
title: Python与性能优化
module: python
category: Python
difficulty: advanced
description: 性能分析与优化技巧
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与WebSocket
  - 'python/Python与CI-CD'
  - python/内置数据结构
  - python/正则表达式
prerequisites:
  - python/语法速查
---

## 1. 性能分析

```python
# cProfile
python -m cProfile -s time my_script.py

# line_profiler
@profile
def slow_function():
  ...

# memory_profiler
@profile
def memory_heavy():
  ...
```

## 2. 优化技巧

- 使用 `__slots__` 减少内存
- 使用生成器代替列表
- 使用 NumPy 向量化
- 使用 Cython 加速
- 使用 `functools.lru_cache`
