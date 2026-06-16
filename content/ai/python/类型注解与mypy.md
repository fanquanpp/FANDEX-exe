---
order: 110
title: 类型注解与mypy
module: python
category: 'dev-lang'
difficulty: advanced
description: Python类型注解与mypy详解：typing模块、泛型、Protocol。
author: fanquanpp
updated: '2026-06-14'
related:
  - python/数据类与字段默认值
  - python/装饰器进阶
  - python/描述符
  - python/打包与发布
prerequisites:
  - python/语法速查
---

## 概述

Python 3.5 引入了类型注解（Type Hints），允许开发者为函数参数和返回值添加类型信息。类型注解不影响运行时行为，但可以被 mypy 等静态类型检查器用来在编译前发现类型错误。随着 Python 类型系统的不断完善，类型注解已成为大型项目提升代码质量和可维护性的重要工具。

## 基础概念

### 基本类型注解

```python
# 函数参数和返回值注解
def greet(name: str) -> str:
    return f"Hello, {name}"

# 变量注解
age: int = 30
name: str = "Alice"
scores: list[float] = [95.5, 88.0, 92.3]
```

### 常用类型

```python
from typing import Optional, Union, List, Dict, Tuple, Set

# 基本容器类型
names: list[str] = ["Alice", "Bob"]
mapping: dict[str, int] = {"age": 30}
coords: tuple[float, float] = (39.9, 116.4)
unique: set[int] = {1, 2, 3}

# 可选类型（Python 3.10+ 推荐 X | None）
def find_user(user_id: int) -> str | None:
    if user_id > 0:
        return "Alice"
    return None

# 联合类型（Python 3.10+ 推荐 X | Y）
def process(value: int | str) -> str:
    return str(value)
```

## 快速上手

### 安装与使用 mypy

```bash
# 安装
pip install mypy

# 检查单个文件
mypy main.py

# 检查整个项目
mypy src/

# 严格模式
mypy --strict src/

# 忽略特定错误
mypy --disable-error-code=import-untyped src/
```

### mypy 配置

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
ignore_missing_imports = true

# 针对特定模块的配置
[[tool.mypy.overrides]]
module = "third_party_lib.*"
ignore_errors = true
```

## 详细用法

### typing 模块常用类型

```python
from typing import (
    Optional, Union, List, Dict, Tuple,
    Callable, Iterable, Iterator, Generator,
    Protocol, TypeVar, Generic, Any,
    TypeAlias, Final, Literal,
)

# Callable：可调用对象
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# Iterable 和 Iterator
def process_items(items: Iterable[str]) -> list[str]:
    return [item.upper() for item in items]

# Generator
def counter(n: int) -> Generator[int, None, None]:
    for i in range(n):
        yield i

# TypeAlias：类型别名
Coordinate: TypeAlias = tuple[float, float]

# Final：不可变常量
MAX_SIZE: Final[int] = 100

# Literal：字面量类型
def set_mode(mode: Literal["read", "write", "append"]) -> None:
    pass
```

### 泛型

```python
from typing import TypeVar, Generic

T = TypeVar('T')

# 泛型函数
def first(items: list[T]) -> T | None:
    return items[0] if items else None

# 泛型类
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def is_empty(self) -> bool:
        return len(self._items) == 0

# 使用
stack: Stack[int] = Stack()
stack.push(1)
value: int = stack.pop()
```

### 有界泛型

```python
from typing import TypeVar

# 限制 T 必须是 Number 的子类
T = TypeVar('T', bound='Number')

class Number:
    def __add__(self, other: 'Number') -> 'Number':
        raise NotImplementedError

def add(a: T, b: T) -> T:
    return a + b
```

### Protocol 结构化子类型

```python
from typing import Protocol

class Drawable(Protocol):
    """定义协议：只要有 draw 方法就满足"""
    def draw(self) -> None: ...

class Renderable(Protocol):
    """可渲染协议"""
    def render(self, surface: str) -> str: ...

class Circle:
    def draw(self) -> None:
        print("绘制圆形")

    def render(self, surface: str) -> str:
        return f"在 {surface} 上渲染圆形"

# Circle 自动满足 Drawable 和 Renderable 协议
def render_all(items: list[Drawable]) -> None:
    for item in items:
        item.draw()

render_all([Circle()])  # 类型检查通过
```

### 类型守卫

```python
from typing import TypeGuard

def is_string_list(value: list[object]) -> TypeGuard[list[str]]:
    """类型守卫：检查列表是否全为字符串"""
    return all(isinstance(v, str) for v in value)

def process(items: list[object]) -> None:
    if is_string_list(items):
        # 在这个分支中，items 的类型被收窄为 list[str]
        print(items[0].upper())
```

### 重载

```python
from typing import overload

@overload
def process(value: int) -> str: ...
@overload
def process(value: str) -> int: ...
def process(value: int | str) -> str | int:
    """根据输入类型返回不同类型"""
    if isinstance(value, int):
        return str(value)
    return len(value)

# mypy 知道 process(42) 返回 str，process("hi") 返回 int
x: str = process(42)     # OK
y: int = process("hello")  # OK
```

## 常见场景

### 场景一：API 响应类型

```python
from typing import TypedDict

class UserResponse(TypedDict):
    """API 响应的类型定义"""
    id: int
    name: str
    email: str
    is_active: bool

def parse_response(data: dict[str, object]) -> UserResponse:
    return {
        "id": data["id"],
        "name": data["name"],
        "email": data["email"],
        "is_active": data.get("is_active", True),
    }
```

### 场景二：回调类型

```python
from typing import Callable

# 定义回调类型
EventHandler = Callable[[str, dict[str, object]], None]

class EventEmitter:
    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = {}

    def on(self, event: str, handler: EventHandler) -> None:
        if event not in self._handlers:
            self._handlers[event] = []
        self._handlers[event].append(handler)

    def emit(self, event: str, data: dict[str, object]) -> None:
        for handler in self._handlers.get(event, []):
            handler(event, data)
```

### 场景三：泛型容器

```python
from typing import TypeVar, Generic, Iterator

K = TypeVar('K')
V = TypeVar('V')

class Cache(Generic[K, V]):
    """带过期时间的泛型缓存"""
    def __init__(self) -> None:
        self._data: dict[K, tuple[V, float]] = {}

    def set(self, key: K, value: V, ttl: float = 60.0) -> None:
        import time
        self._data[key] = (value, time.time() + ttl)

    def get(self, key: K) -> V | None:
        import time
        entry = self._data.get(key)
        if entry is None:
            return None
        value, expires = entry
        if time.time() > expires:
            del self._data[key]
            return None
        return value

# 使用
cache: Cache[str, int] = Cache()
cache.set("count", 42)
value = cache.get("count")  # int | None
```

## 注意事项

- 类型注解不影响运行时性能，Python 仍然是动态类型语言
- mypy 的类型推断有限，复杂场景需要显式注解
- `Any` 类型会绕过类型检查，应尽量避免使用
- 第三方库可能没有类型存根，使用 `ignore_missing_imports` 或安装 `types-*` 包
- 类型注解应保持简洁，过度复杂的类型会降低可读性
- 使用 `from __future__ import annotations` 延迟注解求值，避免前向引用问题

## 进阶用法

### ParamSpec 和 Concatenate

```python
from typing import ParamSpec, Callable, TypeVar

P = ParamSpec('P')
R = TypeVar('R')

def retry(max_attempts: int = 3):
    """保留被装饰函数的类型签名"""
    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            for _ in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    continue
            raise RuntimeError("重试次数耗尽")
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch(url: str) -> dict:
    # mypy 知道 fetch 返回 dict
    return {}
```

### TypeVarTuple

```python
from typing import TypeVarTuple, Unpack

Ts = TypeVarTuple('Ts')

def zip_exact(*iterables: tuple[*Ts]) -> list[tuple[*Ts]]:
    """类型安全的 zip"""
    return list(zip(*iterables))

# 使用
result = zip_exact((1, 2), ("a", "b"))
# result 的类型是 list[tuple[int, str]]
```

### dataclass_transform

```python
from typing import dataclass_transform

@dataclass_transform()
def define(cls):
    """自定义 dataclass 装饰器，mypy 会识别字段类型"""
    return cls

@define
class User:
    name: str
    age: int = 0

# mypy 知道 User 有 name: str 和 age: int
u = User(name="Alice")
```

### runtime_checkable

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Closeable(Protocol):
    """运行时可检查的协议"""
    def close(self) -> None: ...

# 可以在运行时使用 isinstance 检查
class Resource:
    def close(self) -> None:
        pass

print(isinstance(Resource(), Closeable))  # True
```
