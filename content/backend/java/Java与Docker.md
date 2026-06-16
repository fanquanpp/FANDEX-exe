---
order: 74
title: Java与Docker
module: java
category: Java
difficulty: intermediate
description: Java容器化部署
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与消息队列
  - java/Java与Redis
  - java/Java与GraphQL
  - java/Java性能调优
prerequisites:
  - java/概述与开发环境
---

## 概述

Docker 是 Java 应用容器化部署的核心工具。将 Java 应用打包为 Docker 镜像后，可以实现环境一致性、快速部署和弹性伸缩。本文介绍 Java 应用的 Docker 化最佳实践，包括镜像构建、多阶段构建、JVM 容器感知配置以及 Docker Compose 编排。

## 基础概念

### 容器化核心术语

| 术语       | 说明                                      |
| ---------- | ----------------------------------------- |
| Dockerfile | 镜像构建脚本，定义每一步操作              |
| 镜像       | 只读模板，包含运行应用所需的一切          |
| 容器       | 镜像的运行实例                            |
| 多阶段构建 | 在一个 Dockerfile 中使用多个 FROM 指令    |
| 层缓存     | Docker 镜像的每一层可被缓存，加速后续构建 |

### Java 容器化的注意事项

- JVM 从 Java 10 起支持容器感知，能正确识别容器的 CPU 和内存限制
- 选择合适的基础镜像（Alpine vs Debian）影响镜像大小和兼容性
- 容器中运行 JVM 需要合理配置堆内存，避免 OOM

## 快速上手

### 基础 Dockerfile

```dockerfile
# 使用轻量级 JRE 镜像
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/app.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 构建与运行

```bash
# 构建 Docker 镜像
docker build -t myapp:1.0 .

# 运行容器，限制内存为 512MB
docker run -d -p 8080:8080 -m 512m myapp:1.0

# 查看运行中的容器
docker ps

# 查看容器日志
docker logs <container_id>
```

## 详细用法

### 多阶段构建

```dockerfile
# 第一阶段：构建
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
# 先复制 pom.xml，利用层缓存加速依赖下载
COPY pom.xml .
RUN mvn dependency:go-offline
# 再复制源码并构建
COPY src ./src
RUN mvn package -DskipTests

# 第二阶段：运行
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 从构建阶段复制 jar 文件
COPY --from=build /build/target/app.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### JVM 容器参数配置

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/app.jar .

# 设置 JVM 参数，适配容器环境
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Docker Compose 编排

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '8080:8080'
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mydb
    depends_on:
      - db
      - redis
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '1.0'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/actuator/health']
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

## 常见场景

### Spring Boot 分层 JAR

```dockerfile
# 利用 Spring Boot 分层 JAR 优化构建缓存
FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /app
COPY target/app.jar .
# 解压分层 JAR
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 按层复制，依赖层变化最少，缓存命中率最高
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./
EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

### 开发环境热重载

```yaml
# 开发环境使用 Docker Compose 挂载源码
version: '3.8'
services:
  app:
    build: .
    volumes:
      - ./src:/app/src # 挂载源码目录
      - ./pom.xml:/app/pom.xml
    environment:
      - SPRING_DEVTOOLS_RESTART_ENABLED=true
    command: mvn spring-boot:run
```

## 注意事项

- 使用 MaxRAMPercentage 代替 Xmx 硬编码值，让 JVM 根据容器内存自动调整
- Alpine 镜像使用 musl libc，部分 JNI 库可能不兼容，遇到问题可切换到 Debian 基础镜像
- 容器时区默认为 UTC，需要通过 TZ 环境变量设置为中国时区：`TZ=Asia/Shanghai`
- 不要在镜像中硬编码密码，使用环境变量或 Docker Secrets 传递敏感信息
- 生产环境建议使用非 root 用户运行应用，在 Dockerfile 中添加 `USER` 指令

## 进阶用法

### GraalVM 原生镜像构建

```dockerfile
# 使用 GraalVM 构建原生镜像，启动时间毫秒级
FROM ghcr.io/graalvm/native-image-community:21 AS build
WORKDIR /build
COPY . .
RUN ./mvnw -Pnative package -DskipTests

FROM gcr.io/distroless/static-debian11
COPY --from=build /build/target/myapp /app
EXPOSE 8080
ENTRYPOINT ["/app"]
```

### Jib 无 Dockerfile 构建

```xml
<!-- 使用 Jib 插件，无需编写 Dockerfile -->
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>3.4.0</version>
    <configuration>
        <from>
            <image>eclipse-temurin:21-jre-alpine</image>
        </from>
        <to>
            <image>registry.example.com/myapp:${project.version}</image>
        </to>
        <container>
            <ports><port>8080</port></ports>
            <jvmFlags>
                <jvmFlag>-XX:MaxRAMPercentage=75.0</jvmFlag>
            </jvmFlags>
        </container>
    </configuration>
</plugin>
```

```bash
# 直接构建并推送到镜像仓库
mvn compile jib:build
```
