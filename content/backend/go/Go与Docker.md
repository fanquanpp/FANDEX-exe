---
order: 65
title: Go与Docker
module: go
category: Go
difficulty: intermediate
description: 容器化部署
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与Kubernetes
  - go/Go与配置管理
  - go/Go与信号处理
  - go/Go与日志
prerequisites:
  - go/概述与环境配置
---

## 概述

Docker 是最流行的容器化平台，将应用及其依赖打包成一个可移植的容器镜像。Go 程序编译后是单一二进制文件，非常适合容器化部署。Go 的静态编译特性使得 Docker 镜像可以非常小，甚至不需要基础操作系统。

## 基础概念

在开始编码之前，需要理解 Docker 的几个核心概念：

- **Dockerfile**：定义镜像构建步骤的文本文件，类似构建脚本。
- **镜像（Image）**：只读的模板，包含运行应用所需的一切。
- **容器（Container）**：镜像的运行实例，有独立的文件系统和网络。
- **多阶段构建**：在一个 Dockerfile 中使用多个构建阶段，最终镜像只包含运行时必需的文件。
- **scratch 镜像**：空的基础镜像，适合 Go 静态编译的二进制文件。

## 快速上手

最简单的 Go Docker 镜像：

```dockerfile
# Dockerfile
FROM golang:1.24-alpine AS builder

WORKDIR /app

# 先复制依赖文件，利用缓存
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码并编译
COPY . .
RUN CGO_ENABLED=0 go build -o myapp .

# 使用更小的基础镜像
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/myapp /myapp

EXPOSE 8080

ENTRYPOINT ["/myapp"]
```

构建和运行：

```bash
# 构建镜像
docker build -t myapp:1.0 .

# 运行容器
docker run -p 8080:8080 myapp:1.0

# 后台运行
docker run -d -p 8080:8080 --name myapp myapp:1.0
```

## 详细用法

### 1. 多阶段构建

多阶段构建是 Go 容器化的最佳实践，最终镜像只包含编译后的二进制文件：

```dockerfile
# 阶段1：编译
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# 静态编译，不依赖 glibc
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# 阶段2：运行
FROM scratch

# 从 builder 阶段复制二进制文件
COPY --from=builder /app/server /server

# 复制 CA 证书（HTTPS 请求需要）
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080
ENTRYPOINT ["/server"]
```

`-ldflags="-s -w"` 的含义：

- `-s`：去除符号表
- `-w`：去除调试信息
- 可以减小二进制文件约 30% 的大小

### 2. scratch 镜像

scratch 是空镜像，适合纯静态编译的 Go 程序：

```dockerfile
FROM scratch
COPY --from=builder /app/myapp /myapp
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/myapp"]
```

scratch 镜像的大小等于二进制文件本身，通常只有 10-20MB。但 scratch 没有 shell，无法进入容器调试。

### 3. Alpine 镜像

如果需要 shell 或其他工具，使用 Alpine：

```dockerfile
FROM alpine:3.19

# 安装常用工具
RUN apk add --no-cache ca-certificates tzdata curl

COPY --from=builder /app/myapp /myapp

EXPOSE 8080
ENTRYPOINT ["/myapp"]
```

Alpine 镜像约 5MB，比 scratch 大但功能更完整。

### 4. .dockerignore

减少构建上下文大小，加速构建：

```text
# .dockerignore
bin/
*.exe
*.test
.git/
.github/
docs/
*.md
.env
.env.*
```

### 5. 环境变量和配置

```dockerfile
# 设置默认环境变量
ENV APP_PORT=8080
ENV APP_MODE=production

# 可以在运行时覆盖
# docker run -e APP_PORT=3000 -e APP_MODE=debug myapp
```

### 6. 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
```

### 7. 非 root 用户运行

```dockerfile
FROM alpine:3.19

# 创建非 root 用户
RUN adduser -D -g '' appuser

COPY --from=builder /app/myapp /myapp

# 切换到非 root 用户
USER appuser

EXPOSE 8080
ENTRYPOINT ["/myapp"]
```

### 8. Docker Compose

多服务编排：

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '8080:8080'
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f app

# 停止所有服务
docker compose down
```

## 常见场景

### 场景一：开发环境 Docker Compose

```yaml
services:
  app:
    build:
      context: .
      target: builder # 使用 builder 阶段
    volumes:
      - .:/app # 挂载源代码
    command: go run . # 热重载
    ports:
      - '8080:8080'
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_PASSWORD: dev
    ports:
      - '5432:5432'
```

### 场景二：生产环境优化

```dockerfile
# 生产级 Dockerfile
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# 编译优化
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w -X main.version=${VERSION}" \
    -trimpath \
    -o /app/server .

FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /app/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]
```

### 场景三：多架构构建

```bash
# 构建 ARM64 和 AMD64 镜像
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:1.0 .
```

## 注意事项与常见错误

1. **CGO_ENABLED=0**：如果 Go 程序使用了 CGO，在 scratch/alpine 镜像中可能无法运行。设置 `CGO_ENABLED=0` 禁用 CGO。

2. **alpine 的 musl libc**：Alpine 使用 musl 而非 glibc。某些依赖 glibc 特性的程序可能不兼容。

3. **不要在镜像中存储秘密**：密码、API Key 等不应硬编码在 Dockerfile 中。使用环境变量或密钥管理服务。

4. **构建缓存优化**：先复制 go.mod/go.sum 并下载依赖，再复制源代码。这样源代码变更不会导致依赖重新下载。

5. **时区设置**：scratch 镜像没有时区数据。需要从 builder 阶段复制 zoneinfo，或设置 `TZ=UTC`。

6. **信号处理**：Docker 使用 SIGTERM 停止容器。Go 程序必须正确处理 SIGTERM 实现优雅关闭。

7. **日志输出**：容器中的程序应将日志输出到 stdout/stderr，由 Docker 收集，而非写入文件。

## 进阶用法

### 构建参数

```dockerfile
ARG VERSION=dev
ARG GO_VERSION=1.24

FROM golang:${GO_VERSION}-alpine AS builder
RUN go build -ldflags="-X main.version=${VERSION}" -o /app/server .
```

```bash
docker build --build-arg VERSION=1.0.0 -t myapp:1.0.0 .
```

### 镜像瘦身技巧

```dockerfile
# 使用 upx 压缩二进制文件
FROM golang:1.24-alpine AS builder
RUN apk add --no-cache upx
RUN go build -o /app/server . && upx --best /app/server
```

### 容器内调试

如果使用 scratch 镜像无法调试，可以使用 distroless 的 debug 镜像：

```dockerfile
FROM gcr.io/distroless/static-debian12:debug
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]
```
