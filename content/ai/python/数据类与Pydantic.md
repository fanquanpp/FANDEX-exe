---
order: 57
title: 数据类与Pydantic
module: python
category: Python
difficulty: intermediate
description: dataclass与Pydantic模型
author: fanquanpp
updated: '2026-06-14'
related:
  - python/协程与asyncio
  - python/多进程与多线程
  - python/Python与FastAPI
  - python/Python与Django
prerequisites:
  - python/语法速查
---

## 1. dataclass

```python
from dataclasses import dataclass, field

@dataclass
class User:
  name: str
  age: int
  tags: list[str] = field(default_factory=list)
```

## 2. Pydantic

```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
  name: str
  email: EmailStr
  age: int = Field(ge=0, le=150)

user = UserCreate(name="Alice", email="a@b.com", age=25)
user.model_dump_json()
```
