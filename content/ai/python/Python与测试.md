---
order: 73
title: Python与测试
module: python
category: Python
difficulty: beginner
description: pytest与测试实践
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与日志
  - python/Python与CLI
  - python/Python与代码质量
  - python/Python与CI-CD
prerequisites:
  - python/语法速查
---

## 什么是测试

测试是验证代码是否按预期工作的过程。你编写测试代码来自动检查你的程序在各种输入下是否产生正确的输出。测试不是可选的——它是专业软件开发的基本实践。

没有测试的代码就像没有安全网的走钢丝。每次修改代码，你都无法确定是否引入了新的错误。有了测试，你可以在修改后立即运行测试套件，几秒钟内就能知道代码是否仍然正确。

## 基础概念

### 单元测试

单元测试是针对代码中最小可测试单元（通常是一个函数或方法）的测试。它验证这个单元在给定输入下是否返回正确结果。单元测试应该快速、独立、可重复。

### 集成测试

集成测试验证多个模块组合在一起时是否正常工作。比如测试数据库操作是否正确，测试 API 端到端是否正常。

### 测试驱动开发（TDD）

TDD 的流程是：先写测试（此时测试会失败，因为功能还没实现），然后写最少的代码让测试通过，最后重构代码。这种"红-绿-重构"的循环能帮助你写出更好的代码。

### pytest

pytest 是 Python 最流行的测试框架。它比标准库的 unittest 更简洁、更强大，支持参数化测试、夹具（fixture）、插件扩展等特性。

## 快速上手

### 安装 pytest

```bash
pip install pytest
```

### 第一个测试

创建文件 `test_calc.py`：

```python
# 被测试的函数
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

# 测试函数（以 test_ 开头）
def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_divide():
    assert divide(6, 3) == 2.0
    assert divide(5, 2) == 2.5

# 测试异常
import pytest

def test_divide_by_zero():
    with pytest.raises(ValueError, match="除数不能为零"):
        divide(1, 0)
```

运行测试：

```bash
# 运行当前目录下所有测试
pytest

# 运行指定文件
pytest test_calc.py

# 显示详细输出
pytest -v

# 显示 print 输出
pytest -s
```

## 详细用法

### pytest 夹具（Fixture）

夹具是测试的前置条件，比如创建测试数据、建立数据库连接等。使用夹具可以避免在每个测试中重复编写准备代码：

```python
import pytest

# 定义夹具
@pytest.fixture
def sample_users():
    """提供测试用的用户数据"""
    return [
        {"id": 1, "name": "张三", "age": 25},
        {"id": 2, "name": "李四", "age": 30},
        {"id": 3, "name": "王五", "age": 20},
    ]

# 在测试中使用夹具（通过参数名自动注入）
def test_user_count(sample_users):
    assert len(sample_users) == 3

def test_user_names(sample_users):
    names = [u["name"] for u in sample_users]
    assert "张三" in names
```

### 夹具的作用域

夹具可以设置不同的作用域，控制创建和销毁的时机：

```python
import pytest

# function：每个测试函数都创建一次（默认）
@pytest.fixture(scope="function")
def fresh_data():
    data = []
    yield data  # yield 之前的代码是前置，之后的代码是清理
    data.clear()  # 测试结束后清理

# class：每个测试类创建一次
@pytest.fixture(scope="class")
def class_data():
    return {"count": 0}

# module：每个模块创建一次
@pytest.fixture(scope="module")
def module_config():
    return {"debug": True}

# session：整个测试会话只创建一次
@pytest.fixture(scope="session")
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()
```

### 参数化测试

用同一套逻辑测试多组输入：

```python
import pytest

def is_palindrome(s):
    """判断是否为回文字符串"""
    s = s.lower().replace(" ", "")
    return s == s[::-1]

# 参数化：每组参数独立运行一次测试
@pytest.mark.parametrize("input_str,expected", [
    ("racecar", True),
    ("hello", False),
    ("A man a plan a canal Panama", True),
    ("", True),
    ("a", True),
])
def test_is_palindrome(input_str, expected):
    assert is_palindrome(input_str) == expected
```

### 测试异常

```python
import pytest

def withdraw(balance, amount):
    """取款函数"""
    if amount <= 0:
        raise ValueError("取款金额必须大于零")
    if amount > balance:
        raise ValueError("余额不足")
    return balance - amount

def test_withdraw_success():
    assert withdraw(100, 30) == 70

def test_withdraw_invalid_amount():
    with pytest.raises(ValueError, match="取款金额必须大于零"):
        withdraw(100, -10)

def test_withdraw_insufficient_balance():
    with pytest.raises(ValueError, match="余额不足"):
        withdraw(100, 200)
```

### 测试类

将相关的测试组织在一个类中：

```python
class TestUserManager:
    """用户管理器的测试类"""

    @pytest.fixture
    def manager(self):
        """每个测试方法都会创建一个新的 Manager 实例"""
        return UserManager()

    def test_create_user(self, manager):
        user = manager.create("张三", "zhangsan@example.com")
        assert user.name == "张三"
        assert user.email == "zhangsan@example.com"

    def test_get_user(self, manager):
        manager.create("张三", "zhangsan@example.com")
        user = manager.get("张三")
        assert user is not None

    def test_delete_user(self, manager):
        manager.create("张三", "zhangsan@example.com")
        manager.delete("张三")
        assert manager.get("张三") is None
```

### 使用 mock 替换外部依赖

在测试中，你不希望真的调用外部 API 或连接真实数据库。mock 可以替换这些依赖：

```python
from unittest.mock import patch, MagicMock
import pytest

def get_weather(city):
    """获取天气信息（调用外部 API）"""
    import requests
    response = requests.get(f"https://api.weather.com/{city}")
    return response.json()["temperature"]

# 使用 mock 替换 requests.get
@patch("requests.get")
def test_get_weather(mock_get):
    # 配置 mock 的返回值
    mock_response = MagicMock()
    mock_response.json.return_value = {"temperature": 25}
    mock_get.return_value = mock_response

    # 调用被测试的函数
    temp = get_weather("北京")

    # 验证结果
    assert temp == 25
    # 验证 mock 被正确调用
    mock_get.assert_called_once_with("https://api.weather.com/北京")
```

### 测试 FastAPI 应用

```python
from fastapi.testclient import TestClient
from myapp.main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/users", json={
        "name": "张三",
        "email": "zhangsan@example.com"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "张三"

def test_get_user():
    # 先创建
    client.post("/users", json={"name": "张三", "email": "z@example.com"})
    # 再查询
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["name"] == "张三"

def test_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
```

## 常见场景

### 测试数据库操作

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# 使用内存数据库进行测试
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine)
    yield session
    session.close()

def test_create_user(db_session):
    user = User(name="张三", email="z@example.com")
    db_session.add(user)
    db_session.commit()

    result = db_session.query(User).filter_by(name="张三").first()
    assert result is not None
    assert result.email == "z@example.com"
```

### 测试覆盖率

```bash
# 安装覆盖率工具
pip install pytest-cov

# 运行测试并生成覆盖率报告
pytest --cov=myapp tests/

# 生成详细的覆盖率报告
pytest --cov=myapp --cov-report=html tests/
```

## 注意事项与常见错误

### 测试要独立

每个测试应该独立运行，不依赖其他测试的执行顺序。不要在一个测试中创建数据，然后在另一个测试中使用。

### 测试要快速

单元测试应该在毫秒级别完成。如果测试很慢（如需要网络请求），应该使用 mock 替换外部依赖。

### 不要测试实现细节

测试应该验证行为（输入什么、输出什么），而不是实现（内部怎么做的）。这样重构代码时测试不会频繁失败。

### 测试文件命名

pytest 默认查找以 test\_ 开头的文件和函数。确保你的测试文件命名为 test_xxx.py，测试函数命名为 test_xxx。

## 进阶用法

### pytest 配置文件

创建 `pytest.ini` 或 `pyproject.toml` 中的 pytest 配置：

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### 使用 conftest.py 共享夹具

conftest.py 中的夹具对所有测试文件可见，不需要显式导入：

```python
# tests/conftest.py
import pytest

@pytest.fixture
def app_client():
    from fastapi.testclient import TestClient
    from myapp.main import app
    return TestClient(app)
```

### 标记测试

```python
import pytest

@pytest.mark.slow
def test_large_dataset():
    """慢速测试"""
    pass

@pytest.mark.skip(reason="等待修复 bug #123")
def test_broken_feature():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="不支持 Windows")
def test_unix_only():
    pass
```

运行时过滤：

```bash
# 只运行非慢速测试
pytest -m "not slow"

# 只运行特定标记的测试
pytest -m slow
```
