---
order: 51
title: Python与虚拟环境
module: python
category: Python
difficulty: beginner
description: venv与包管理
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与Jupyter
  - python/Python与打包发布
  - python/Python与代码质量
  - python/Python与Docker
prerequisites:
  - python/语法速查
---

## 什么是虚拟环境

虚拟环境是 Python 的一个独立运行环境，它有自己的 Python 解释器和第三方库，与系统全局的 Python 环境相互隔离。每个项目可以使用自己的虚拟环境，安装不同版本的库，互不干扰。

如果没有虚拟环境，所有项目共享同一个 Python 环境。当项目 A 需要 Django 4.x 而项目 B 需要 Django 5.x 时，就会产生冲突。虚拟环境解决了这个问题——每个项目在自己的环境中安装所需版本的依赖。

## 基础概念

### 为什么需要虚拟环境

- 隔离依赖：不同项目可以使用不同版本的同一个库
- 避免污染：不会影响系统全局的 Python 环境
- 可复现：通过 requirements.txt 或 pyproject.toml 锁定依赖版本，确保其他开发者或部署环境安装相同的依赖
- 权限安全：不需要管理员权限就能安装第三方库

### 常用工具

- venv：Python 标准库自带，轻量级，适合大多数场景
- virtualenv：第三方工具，功能比 venv 更多，支持 Python 2
- conda：Anaconda 提供的环境管理工具，适合数据科学项目
- uv：新一代 Python 包管理器，速度极快

## 快速上手

### 使用 venv 创建虚拟环境

```bash
# 创建虚拟环境（在项目目录下）
python -m venv .venv

# 激活虚拟环境
# Linux/Mac:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate

# 激活后命令行前面会显示 (.venv)
# 此时 pip install 安装的包都在虚拟环境中
```

### 退出虚拟环境

```bash
# 退出虚拟环境
deactivate
```

### 安装依赖

```bash
# 激活虚拟环境后安装包
pip install requests
pip install fastapi uvicorn

# 查看已安装的包
pip list

# 导出依赖列表
pip freeze > requirements.txt
```

### 从 requirements.txt 安装依赖

```bash
# 在新环境中安装所有依赖
pip install -r requirements.txt
```

## 详细用法

### 指定 Python 版本

```bash
# 使用特定版本的 Python 创建虚拟环境
python3.12 -m venv .venv

# 如果安装了多个 Python 版本
python3.11 -m venv .venv311
python3.12 -m venv .venv312
```

### 使用 uv（推荐）

uv 是一个用 Rust 编写的极速 Python 包管理器，比 pip 快 10-100 倍：

```bash
# 安装 uv
pip install uv

# 创建虚拟环境
uv venv

# 激活虚拟环境（和 venv 一样）
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# 安装包（比 pip 快得多）
uv pip install requests fastapi

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 导出依赖
uv pip freeze > requirements.txt
```

### 使用 pyproject.toml 管理依赖

现代 Python 项目推荐使用 pyproject.toml 来管理依赖：

```toml
# pyproject.toml
[project]
name = "myproject"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn>=0.24.0",
    "sqlalchemy>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.1.0",
    "mypy>=1.0",
]
```

```bash
# 安装项目依赖
pip install -e .

# 安装开发依赖
pip install -e ".[dev]"
```

### 使用 pip-tools 精确锁定依赖

pip-tools 可以生成精确的依赖版本锁定文件：

```bash
pip install pip-tools
```

创建 requirements.in 文件（只写直接依赖）：

```
# requirements.in
fastapi
uvicorn
sqlalchemy
```

编译生成锁定文件：

```bash
# 生成精确版本的 requirements.txt
pip-compile requirements.in

# 生成开发依赖的锁定文件
pip-compile requirements-dev.in
```

生成的 requirements.txt 会包含所有间接依赖和精确版本号。

### 使用 conda

conda 适合需要安装非 Python 依赖（如 C 库、CUDA）的数据科学项目：

```bash
# 创建 conda 环境
conda create -n myproject python=3.12

# 激活环境
conda activate myproject

# 安装包
conda install numpy pandas matplotlib

# 也可以用 pip 安装
pip install requests

# 退出环境
conda deactivate

# 删除环境
conda env remove -n myproject

# 导出环境
conda env export > environment.yml

# 从文件创建环境
conda env create -f environment.yml
```

## 常见场景

### 新项目初始化流程

```bash
# 1. 创建项目目录
mkdir myproject && cd myproject

# 2. 创建虚拟环境
python -m venv .venv

# 3. 激活虚拟环境
source .venv/bin/activate  # Linux/Mac

# 4. 升级 pip
pip install --upgrade pip

# 5. 安装项目依赖
pip install fastapi uvicorn sqlalchemy

# 6. 导出依赖
pip freeze > requirements.txt

# 7. 创建 .gitignore
echo ".venv/" >> .gitignore
```

### 在 VS Code 中使用虚拟环境

VS Code 会自动检测项目中的虚拟环境。你也可以手动选择：

1. 按 Ctrl+Shift+P 打开命令面板
2. 输入 "Python: Select Interpreter"
3. 选择项目中的 .venv 目录下的 Python 解释器

### 在 Docker 中使用虚拟环境

在 Docker 容器中通常不需要虚拟环境，因为容器本身就是隔离的。但如果你需要，也可以使用：

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 注意事项与常见错误

### 不要把 .venv 目录提交到 Git

虚拟环境目录包含二进制文件和大量依赖，不应该提交到版本控制。在 .gitignore 中添加：

```
.venv/
venv/
env/
```

### 激活虚拟环境后再运行 Python

如果忘记激活虚拟环境，直接运行 python 或 pip，会使用系统全局的 Python，安装的包也不会在虚拟环境中。养成习惯：打开终端后先激活虚拟环境。

### requirements.txt 要包含精确版本

使用 pip freeze 导出的 requirements.txt 包含精确版本号（如 fastapi==0.104.1），这样可以确保在不同环境中安装完全相同的依赖。不要手动编写不带版本号的 requirements.txt。

### 虚拟环境中的 Python 版本不可更改

创建虚拟环境后，其中的 Python 版本就固定了。如果需要切换 Python 版本，必须删除旧的虚拟环境并重新创建。

### Windows 上的执行策略

Windows 上激活虚拟环境时可能会遇到执行策略错误。以管理员身份运行 PowerShell 执行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 进阶用法

### 使用 direnv 自动激活虚拟环境

direnv 可以在进入项目目录时自动激活虚拟环境：

```bash
# 安装 direnv
# Mac: brew install direnv
# Linux: apt install direnv

# 在项目目录创建 .envrc
echo "source .venv/bin/activate" > .envrc
direnv allow
```

以后每次进入项目目录，虚拟环境会自动激活。

### 使用 Poetry 管理项目和依赖

Poetry 是一个集项目管理和依赖管理于一体的工具：

```bash
pip install poetry

# 创建新项目
poetry new myproject

# 在现有项目中初始化
poetry init

# 添加依赖
poetry add fastapi uvicorn

# 添加开发依赖
poetry add --group dev pytest ruff

# 安装所有依赖
poetry install

# 运行命令
poetry run python app.py

# 进入虚拟环境 shell
poetry shell
```

### 使用 pyenv 管理多个 Python 版本

pyenv 可以在同一台机器上安装和管理多个 Python 版本：

```bash
# 安装 pyenv
curl https://pyenv.run | bash

# 安装特定版本的 Python
pyenv install 3.12.0

# 设置全局默认版本
pyenv global 3.12.0

# 为某个项目设置特定版本
cd myproject
pyenv local 3.11.0  # 创建 .python-version 文件
```
