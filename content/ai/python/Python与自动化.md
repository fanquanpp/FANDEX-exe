---
order: 70
title: Python与自动化
module: python
category: Python
difficulty: intermediate
description: 脚本自动化与任务调度
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与计算机视觉
  - python/Python与Web爬虫
  - python/函数详解
  - python/Python与测试
prerequisites:
  - python/语法速查
---

## 1. 文件自动化

```python
import shutil
from pathlib import Path

# 批量重命名
for f in Path('photos').glob('*.jpg'):
  new_name = f"IMG_{f.stat().st_mtime_ns}.jpg"
  f.rename(f.parent / new_name)
```

## 2. 定时任务

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(cleanup, 'cron', hour=2)
scheduler.start()
```
