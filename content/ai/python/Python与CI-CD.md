---
order: 79
title: 'Python与CI-CD'
module: python
category: Python
difficulty: intermediate
description: Python项目CI/CD
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与gRPC
  - python/Python与WebSocket
  - python/Python与性能优化
  - python/内置数据结构
prerequisites:
  - python/语法速查
---

## 什么是 CI/CD

CI/CD 是持续集成（Continuous Integration）和持续部署（Continuous Deployment）的缩写。持续集成是指开发者频繁地将代码合并到主分支，每次合并都自动运行测试，确保代码不会破坏现有功能。持续部署是指代码通过测试后自动部署到生产环境，不需要人工操作。

CI/CD 的目标是尽早发现问题、减少手动操作、让发布变得可靠和频繁。对于 Python 项目来说，CI/CD 通常包括：运行测试、检查代码风格、构建 Docker 镜像、部署到服务器等步骤。

## 基础概念

### 持续集成（CI）

每次代码提交或合并请求时，自动执行以下操作：

- 安装依赖
- 运行单元测试和集成测试
- 检查代码风格（lint）
- 检查类型（type check）

如果任何一步失败，合并请求就不能合并，防止有问题的代码进入主分支。

### 持续部署（CD）

代码通过 CI 检查后，自动执行部署操作：

- 构建 Docker 镜像
- 推送镜像到镜像仓库
- 部署到测试环境或生产环境

### GitHub Actions

GitHub Actions 是 GitHub 内置的 CI/CD 服务，使用 YAML 文件定义工作流。它是 Python 项目最常用的 CI/CD 工具之一，免费额度对开源项目足够使用。

### 工作流、Job 与 Step

- 工作流（Workflow）：一个完整的 CI/CD 流程，定义在 YAML 文件中
- Job：工作流中的一个独立任务，可以并行或串行执行
- Step：Job 中的一个步骤，按顺序执行

## 快速上手

### 创建第一个 GitHub Actions 工作流

在项目根目录创建文件 `.github/workflows/test.yml`：

```yaml
# 工作流名称
name: Test

# 触发条件：推送到 main 分支或创建 PR 时触发
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 定义任务
jobs:
  test:
    # 运行环境
    runs-on: ubuntu-latest

    # 执行步骤
    steps:
      # 第一步：检出代码
      - uses: actions/checkout@v4

      # 第二步：安装 Python
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      # 第三步：安装依赖
      - run: pip install -r requirements.txt

      # 第四步：运行测试
      - run: pytest

      # 第五步：检查代码风格
      - run: ruff check .
```

提交这个文件后，每次推送到 main 分支或创建 PR，GitHub 就会自动运行测试和代码检查。

## 详细用法

### 多 Python 版本测试

确保你的代码在多个 Python 版本下都能正常工作：

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    # 定义策略矩阵：测试多个 Python 版本
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: 安装依赖
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: 运行测试
        run: pytest --cov=src tests/

      - name: 代码风格检查
        run: ruff check .

      - name: 类型检查
        run: mypy src/
```

### 缓存依赖加速构建

每次 CI 运行都重新安装依赖很慢，可以使用缓存加速：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      # 缓存 pip 依赖
      - name: 缓存 pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - run: pip install -r requirements.txt
      - run: pytest
```

### 构建 Docker 镜像并推送

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 登录 Docker Hub
      - name: 登录 Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # 构建并推送镜像
      - name: 构建并推送
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            myuser/myapp:latest
            myuser/myapp:${{ github.sha }}
```

### 部署到服务器

通过 SSH 将代码部署到远程服务器：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    # 只有测试通过后才部署
    needs: test
    steps:
      - name: 部署到服务器
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/myproject
            git pull origin main
            pip install -r requirements.txt
            python manage.py migrate
            sudo systemctl restart myapp
```

### 使用环境变量和密钥

在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中添加密钥，然后在工作流中引用：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 使用密钥
      - name: 运行测试
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SECRET_KEY: ${{ secrets.SECRET_KEY }}
        run: pytest
```

### 发布 Python 包到 PyPI

```yaml
name: Publish

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: 安装构建工具
        run: pip install build

      - name: 构建包
        run: python -m build

      - name: 发布到 PyPI
        uses: pypa/gh-action-pypi-publish@release/v1
        with:
          password: ${{ secrets.PYPI_API_TOKEN }}
```

## 常见场景

### 完整的 Python 项目 CI/CD 流水线

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 任务一：代码质量检查
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install ruff mypy
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/

  # 任务二：运行测试
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -r requirements-dev.txt
      - run: pytest --cov --cov-report=xml
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # 任务三：构建和部署（只在 main 分支且测试通过后执行）
  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: 构建并推送 Docker 镜像
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: myuser/myapp:latest
```

## 注意事项与常见错误

### 不要把密钥写在 YAML 文件中

密码、API Key 等敏感信息必须使用 GitHub Secrets 存储，绝对不能直接写在 YAML 文件中。YAML 文件是明文存储在仓库中的，任何人都能看到。

### CI 失败时不要跳过测试

当 CI 测试失败时，正确的做法是修复代码，而不是跳过或放宽测试。跳过测试会让 CI 失去意义。

### 注意依赖版本锁定

使用 requirements.txt 锁定依赖版本，避免因为依赖更新导致 CI 突然失败。可以使用 pip freeze > requirements.txt 或 pip-compile 生成锁定文件。

### CI 环境与本地环境的差异

CI 环境通常是 Linux，如果你在 Windows 或 Mac 上开发，可能会遇到路径分隔符、换行符等问题。建议在 CI 中也运行与生产环境一致的检查。

## 进阶用法

### 使用矩阵策略并行测试

```yaml
strategy:
  matrix:
    python-version: ['3.10', '3.11', '3.12']
    os: [ubuntu-latest, macos-latest, windows-latest]
    exclude:
      - python-version: '3.10'
        os: windows-latest
```

### 定时运行 CI

```yaml
on:
  # 每天凌晨 2 点运行
  schedule:
    - cron: '0 2 * * *'
  push:
    branches: [main]
```

### 使用 Artifact 保存构建产物

```yaml
steps:
  - run: python -m build

  - name: 上传构建产物
    uses: actions/upload-artifact@v4
    with:
      name: dist
      path: dist/
```

### 其他 CI/CD 平台

除了 GitHub Actions，还有其他常用的 CI/CD 平台：

- GitLab CI：GitLab 内置的 CI/CD，配置文件为 .gitlab-ci.yml
- Jenkins：老牌 CI/CD 工具，功能强大但配置复杂
- CircleCI：云端 CI/CD 服务，配置文件为 .circleci/config.yml
