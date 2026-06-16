---
order: 85
title: Python与代码质量
module: python
category: Python
difficulty: beginner
description: Ruff、Black与代码规范
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与Jupyter
  - python/Python与虚拟环境
  - python/并发编程
  - python/Python与数据库迁移
prerequisites:
  - python/语法速查
---

## 1. 工具链

```bash
# Ruff — linter + formatter
ruff check .
ruff format .

# mypy — 类型检查
mypy --strict .

# pre-commit
pre-commit run --all-files
```

## 2. pyproject.toml 配置

```toml
[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "UP"]

[tool.mypy]
strict = true
```
