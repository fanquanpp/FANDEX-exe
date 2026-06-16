---
order: 74
title: Python与配置管理
module: python
category: Python
difficulty: beginner
description: 配置文件与环境变量
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与消息队列
  - python/Python与Docker
  - python/Python与日志
  - python/Python与加密
prerequisites:
  - python/语法速查
---

## 什么是配置管理

配置管理是指如何管理程序运行时需要的各种参数，如数据库连接地址、API 密钥、调试模式开关等。好的配置管理能让同一份代码在不同环境（开发、测试、生产）中运行，而不需要修改代码本身。

最常见的错误做法是把配置硬编码在代码中。一旦数据库地址或密码变了，就得改代码重新部署。正确的做法是把配置与代码分离，通过配置文件、环境变量等方式注入。

## 基础概念

### 配置文件

配置文件是存储配置参数的文件，常见的格式有：

- .env 文件：键值对格式，简单直观，适合存放环境变量
- YAML 文件：支持层级结构，适合复杂配置
- TOML 文件：Python 社区推荐格式，pyproject.toml 就是这个格式
- JSON 文件：通用格式，但不支持注释

### 环境变量

环境变量是操作系统级别的键值对，每个进程都可以读取。在容器化和云原生环境中，环境变量是最常用的配置方式。

### 十二因素应用

十二因素应用（12-Factor App）方法论建议：配置应该存储在环境变量中，而不是代码中。这样可以方便地在不同环境之间切换，而不需要修改代码。

## 快速上手

### 使用环境变量

```python
import os

# 读取环境变量
database_url = os.getenv('DATABASE_URL', 'sqlite:///default.db')
debug_mode = os.getenv('DEBUG', 'false').lower() == 'true'
port = int(os.getenv('PORT', '8000'))

print(f"数据库: {database_url}")
print(f"调试模式: {debug_mode}")
print(f"端口: {port}")
```

设置环境变量后运行：

```bash
# Linux/Mac
export DATABASE_URL=postgresql://localhost/mydb
export DEBUG=true
python app.py

# Windows
set DATABASE_URL=postgresql://localhost/mydb
set DEBUG=true
python app.py
```

### 使用 .env 文件

创建 .env 文件：

```
DATABASE_URL=postgresql://localhost/mydb
DEBUG=true
SECRET_KEY=my-secret-key
PORT=8000
```

安装 python-dotenv：

```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
import os

# 加载 .env 文件中的环境变量
load_dotenv()

# 现在可以通过 os.getenv 读取 .env 中的值
database_url = os.getenv('DATABASE_URL')
debug = os.getenv('DEBUG')
secret_key = os.getenv('SECRET_KEY')
```

## 详细用法

### 使用 Pydantic 管理配置

Pydantic 的 BaseSettings 类可以自动从环境变量读取配置，并进行类型验证：

```bash
pip install pydantic-settings
```

```python
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """应用配置"""
    # 数据库配置
    database_url: str = Field(default='sqlite:///default.db', alias='DATABASE_URL')

    # 应用配置
    debug: bool = Field(default=False, alias='DEBUG')
    secret_key: str = Field(default='change-me-in-production', alias='SECRET_KEY')
    port: int = Field(default=8000, alias='PORT')

    # Redis 配置
    redis_url: str = Field(default='redis://localhost:6379/0', alias='REDIS_URL')

    # 模型配置
    model_config = {
        'env_file': '.env',           # 从 .env 文件读取
        'env_file_encoding': 'utf-8',
        'case_sensitive': False,      # 环境变量不区分大小写
    }

# 创建全局配置实例
settings = Settings()

# 使用配置
print(f"数据库: {settings.database_url}")
print(f"调试模式: {settings.debug}")
print(f"端口: {settings.port}")
```

### 多环境配置

不同环境使用不同的 .env 文件：

```
# .env.dev（开发环境）
DATABASE_URL=sqlite:///dev.db
DEBUG=true

# .env.prod（生产环境）
DATABASE_URL=postgresql://user:pass@db:5432/prod
DEBUG=false
SECRET_KEY=a-real-secret-key
```

```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = 'sqlite:///default.db'
    debug: bool = False
    secret_key: str = 'change-me'

    model_config = {
        'env_file': f'.env.{os.getenv("APP_ENV", "dev")}',
    }

settings = Settings()
```

运行时指定环境：

```bash
# 开发环境
APP_ENV=dev python app.py

# 生产环境
APP_ENV=prod python app.py
```

### 使用 YAML 配置文件

```bash
pip install pyyaml
```

```yaml
# config.yaml
database:
  url: postgresql://localhost/mydb
  pool_size: 10
  echo: false

server:
  host: 0.0.0.0
  port: 8000
  debug: false

redis:
  url: redis://localhost:6379/0

logging:
  level: INFO
  file: app.log
```

```python
import yaml
from pathlib import Path

def load_config(config_path: str = 'config.yaml') -> dict:
    """加载 YAML 配置文件"""
    path = Path(config_path)
    if not path.exists():
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

config = load_config()

# 使用配置
db_url = config.get('database', {}).get('url', 'sqlite:///default.db')
server_port = config.get('server', {}).get('port', 8000)
```

### 使用 TOML 配置文件

```python
import tomllib  # Python 3.11+ 内置
from pathlib import Path

def load_toml_config(path: str = 'config.toml') -> dict:
    """加载 TOML 配置文件"""
    config_path = Path(path)
    if not config_path.exists():
        return {}
    with open(config_path, 'rb') as f:
        return tomllib.load(f)

config = load_toml_config()
```

### 配置优先级

通常的配置优先级从高到低为：

1. 命令行参数
2. 环境变量
3. .env 文件
4. 配置文件（YAML/TOML）
5. 代码中的默认值

```python
import os
import argparse
from dotenv import load_dotenv

load_dotenv()

def get_config():
    """按优先级获取配置"""
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int)
    parser.add_argument('--debug', action='store_true')
    args = parser.parse_args()

    return {
        # 命令行参数 > 环境变量 > 默认值
        'port': args.port or int(os.getenv('PORT', '8000')),
        'debug': args.debug or os.getenv('DEBUG', 'false').lower() == 'true',
        'database_url': os.getenv('DATABASE_URL', 'sqlite:///default.db'),
    }
```

## 常见场景

### FastAPI 项目配置

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = 'sqlite:///default.db'
    secret_key: str = 'change-me'
    debug: bool = False
    redis_url: str = 'redis://localhost:6379/0'

    model_config = {'env_file': '.env'}

@lru_cache()
def get_settings():
    """缓存配置实例，避免重复创建"""
    return Settings()

# 在 FastAPI 中使用依赖注入
from fastapi import Depends

@app.get("/info")
async def info(settings: Settings = Depends(get_settings)):
    return {"debug": settings.debug}
```

### Docker 中的配置

```yaml
# docker-compose.yml
services:
  web:
    build: .
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=false
    env_file:
      - .env.prod # 也可以从文件加载
```

## 注意事项与常见错误

### 不要把 .env 文件提交到 Git

.env 文件中通常包含密码和密钥，绝对不能提交到版本控制。在 .gitignore 中添加：

```
.env
.env.*
```

可以提供一个 .env.example 文件作为模板，只包含变量名不含真实值：

```
# .env.example
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key
DEBUG=false
```

### 环境变量的值都是字符串

os.getenv 返回的值始终是字符串，需要手动转换类型：

```python
# 错误：port 是字符串 "8000"，不是整数
port = os.getenv('PORT')  # "8000"

# 正确：手动转换
port = int(os.getenv('PORT', '8000'))  # 8000

# 布尔值也需要手动处理
debug = os.getenv('DEBUG', 'false').lower() in ('true', '1', 'yes')
```

Pydantic BaseSettings 会自动处理类型转换，这是推荐使用它的原因之一。

### 敏感信息不要记录到日志

配置中可能包含数据库密码、API Key 等敏感信息，不要把它们打印到日志中：

```python
# 错误：会把密码打印到日志
# print(f"配置: {settings.model_dump()}")

# 正确：只打印非敏感信息
print(f"数据库主机: {settings.database_host}")
print(f"调试模式: {settings.debug}")
```

## 进阶用法

### 动态配置（运行时更新）

某些配置可能需要在运行时更新（如功能开关），可以使用 Redis 或数据库存储：

```python
import redis
import json

class DynamicConfig:
    """从 Redis 读取的动态配置"""
    def __init__(self, redis_url='redis://localhost:6379/0'):
        self.client = redis.from_url(redis_url)

    def get(self, key: str, default=None):
        value = self.client.get(f'config:{key}')
        return json.loads(value) if value else default

    def set(self, key: str, value):
        self.client.set(f'config:{key}', json.dumps(value))

# 使用
config = DynamicConfig()
config.set('feature_x_enabled', True)
if config.get('feature_x_enabled', False):
    print("功能 X 已启用")
```

### 配置验证

使用 Pydantic 的验证器确保配置值的合法性：

```python
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    database_url: str
    port: int = 8000
    log_level: str = 'INFO'

    @field_validator('port')
    @classmethod
    def validate_port(cls, v):
        if not (1 <= v <= 65535):
            raise ValueError('端口号必须在 1-65535 之间')
        return v

    @field_validator('log_level')
    @classmethod
    def validate_log_level(cls, v):
        valid_levels = {'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'}
        if v.upper() not in valid_levels:
            raise ValueError(f'日志级别必须是 {valid_levels} 之一')
        return v.upper()

    model_config = {'env_file': '.env'}
```
