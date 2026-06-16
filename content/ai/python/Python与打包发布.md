---
order: 82
title: Python与打包发布
module: python
category: Python
difficulty: intermediate
description: PyPI与包发布
author: fanquanpp
updated: '2026-06-14'
related:
  - python/正则表达式
  - python/Python与设计模式
  - python/Python与Jupyter
  - python/Python与虚拟环境
prerequisites:
  - python/语法速查
---

## 1. pyproject.toml

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "1.0.0"
dependencies = ["requests>=2.28"]
```

## 2. 发布

```bash
python -m build
twine upload dist/*
```
