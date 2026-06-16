---
order: 73
title: Python与加密
module: python
category: Python
difficulty: intermediate
description: cryptography与安全编程
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与测试
  - python/Python与日志
  - python/Python与CLI
  - python/Python与配置管理
prerequisites:
  - python/语法速查
---

## 1. 加密

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)
encrypted = cipher.encrypt(b"secret message")
decrypted = cipher.decrypt(encrypted)
```

## 2. 哈希

```python
import hashlib
hash = hashlib.sha256(data.encode()).hexdigest()

import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
bcrypt.checkpw(input.encode(), hashed)
```
