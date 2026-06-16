---
order: 82
title: Java与GraalVM
module: java
category: Java
difficulty: advanced
description: GraalVM原生镜像
author: fanquanpp
updated: '2026-06-14'
related:
  - java/方法详解
  - java/Java与虚拟线程
  - java/Java与Kubernetes
  - java/Java记录类
prerequisites:
  - java/概述与开发环境
---

## 概述

GraalVM 是 Oracle 推出的高性能运行时，其核心特性是 Native Image（原生镜像）技术，能将 Java 应用编译为独立的本地可执行文件。编译后的应用启动时间从秒级降至毫秒级，内存占用大幅减少，非常适合云原生和 Serverless 场景。Spring Boot 3.x 已原生支持 GraalVM 编译。

## 基础概念

### GraalVM 核心组件

| 组件         | 说明                                |
| ------------ | ----------------------------------- |
| Graal 编译器 | 替代 HotSpot C2 的新一代 JIT 编译器 |
| Native Image | AOT 编译为本地可执行文件            |
| Truffle 框架 | 支持在 JVM 上运行多种语言           |
| GraalWasm    | 在 JVM 上运行 WebAssembly           |

### Native Image 工作原理

- 构建时进行静态分析，找出所有可达的类和方法
- 将应用代码、依赖库和 JDK 类一起编译为机器码
- 运行时不需要 JVM，直接作为本地进程执行
- 闭世界假设：运行时不能动态加载新类

### 与传统 JVM 的对比

| 特性       | 传统 JVM         | Native Image   |
| ---------- | ---------------- | -------------- |
| 启动时间   | 秒级             | 毫秒级         |
| 内存占用   | 较高（数百MB）   | 较低（数十MB） |
| 峰值吞吐量 | 高（JIT 预热后） | 较低（无 JIT） |
| 动态特性   | 完全支持         | 受限           |
| 构建时间   | 快               | 较慢（几分钟） |

## 快速上手

### 安装 GraalVM

```bash
# 使用 SDKMAN 安装
sdk install java 21.0.3-graal
sdk use java 21.0.3-graal

# 验证安装
java -version
native-image --version

# 安装 Native Image 组件（如果未自带）
gu install native-image
```

### 基本编译

```bash
# 编译 Java 文件
javac HelloWorld.java

# 生成原生镜像
native-image HelloWorld

# 运行（无需 JVM）
./helloworld
# 启动时间通常在 10ms 以内
```

### Spring Boot Native 编译

```bash
# 使用 Maven 编译原生镜像
mvn -Pnative native:compile

# 使用 Gradle 编译原生镜像
gradle nativeCompile

# 直接构建并运行容器
mvn -Pnative spring-boot:build-image
docker run --rm -p 8080:8080 myapp:latest
```

## 详细用法

### 反射配置

```json
// reflect-config.json - 声明需要反射访问的类
[
  {
    "name": "com.example.User",
    "allDeclaredConstructors": true,
    "allPublicMethods": true,
    "allDeclaredFields": true
  },
  {
    "name": "com.example.Order",
    "methods": [
      { "name": "getId", "parameterTypes": [] },
      { "name": "setStatus", "parameterTypes": ["java.lang.String"] }
    ]
  }
]
```

```java
// 使用 @RegisterReflectionForBinding 自动生成反射配置（Spring Boot 3.x）
@Configuration
@RegisterReflectionForBinding({
    User.class,
    Order.class,
    OrderDTO.class
})
public class NativeConfig {
    // Spring Boot 会自动为这些类生成 reflect-config.json
}
```

### 资源配置

```json
// resource-config.json - 声明需要包含的资源文件
{
  "resources": {
    "includes": [
      { "pattern": ".*\\.json$" },
      { "pattern": ".*\\.xml$" },
      { "pattern": "templates/.*" },
      { "pattern": "i18n/.*" }
    ]
  }
}
```

```java
// 使用 @RegisterResource 自动生成资源配置
@Configuration
@RegisterResource({
    @ResourceEntry(patterns = "application.yml"),
    @ResourceEntry(patterns = ".*\\.json$")
})
public class ResourceConfig {}
```

### 动态代理配置

```json
// proxy-config.json - 声明需要动态代理的接口
[
  ["com.example.UserService", "org.springframework.aop.SpringProxy"],
  ["com.example.OrderRepository"]
]
```

### 序列化配置

```json
// serialization-config.json - 声明需要序列化的类
{
  "types": [{ "name": "com.example.User" }, { "name": "com.example.Order" }],
  "lambdaCapturingTypes": [{ "name": "com.example.Application" }]
}
```

## 常见场景

### Spring Boot 3.x 原生镜像

```xml
<!-- pom.xml 添加 native profile -->
<profiles>
    <profile>
        <id>native</id>
        <build>
            <plugins>
                <plugin>
                    <groupId>org.graalvm.buildtools</groupId>
                    <artifactId>native-maven-plugin</artifactId>
                    <configuration>
                        <imageName>myapp</imageName>
                        <mainClass>com.example.Application</mainClass>
                        <buildArgs>
                            <buildArg>--initialize-at-build-time=org.slf4j</buildArg>
                            <buildArg>-H:+ReportExceptionStackTraces</buildArg>
                        </buildArgs>
                    </configuration>
                </plugin>
            </plugins>
        </build>
    </profile>
</profiles>
```

### 使用追踪代理自动生成配置

```bash
# 在 JVM 模式下运行应用，自动收集反射、代理等配置
java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image \
  -jar target/myapp.jar

# 运行所有测试场景，确保配置完整
# 追踪代理会在运行过程中记录所有动态特性使用情况
```

### 构建优化

```bash
# 使用 PGO（Profile-Guided Optimization）提升运行时性能
# 第一步：构建带 PGO 采样的原生镜像
native-image --pgo-instrument -jar myapp.jar myapp-pgo

# 第二步：运行应用并收集性能数据
./myapp-pgo [运行典型业务场景]

# 第三步：使用采集到的数据重新编译
native-image --pgo=default.iprof -jar myapp.jar myapp-optimized
```

## 注意事项

- 反射、动态代理、JNI 等动态特性需要显式配置，否则运行时会报错
- Native Image 不支持运行时动态加载类（Class.forName 可能失败）
- 序列化相关的类需要在配置中声明
- 构建过程需要大量内存（建议至少 8GB）
- 编译时间较长（通常 2-5 分钟），不适合开发阶段使用
- 部分第三方库可能不兼容 Native Image，需要检查兼容性列表

## 进阶用法

### 自定义 Feature 扩展

```java
// 实现 Feature 接口，在构建过程中执行自定义逻辑
public class MyFeature implements Feature {
    @Override
    public void beforeAnalysis(BeforeAnalysisAccess access) {
        // 在分析阶段前注册额外的类
        RuntimeReflection.register(User.class);
        RuntimeReflection.register(User.class.getDeclaredConstructor());
        RuntimeReflection.register(User.class.getDeclaredMethods());
    }

    @Override
    public void duringSetup(DuringSetupAccess access) {
        // 构建阶段的初始化逻辑
    }
}
```

```json
// 在 native-image.properties 中注册 Feature
Args = --features=com.example.MyFeature
```

### 条件初始化

```bash
# 控制类的初始化时机
# 构建时初始化（提升启动速度）
native-image --initialize-at-build-time=org.slf4j,com.example.constant \
  -jar myapp.jar

# 运行时初始化（避免初始化顺序问题）
native-image --initialize-at-run-time=com.example.database \
  -jar myapp.jar
```

### Native Image 与 Docker 多阶段构建

```dockerfile
# 第一阶段：使用 GraalVM 构建原生镜像
FROM ghcr.io/graalvm/native-image-community:21 AS builder
WORKDIR /build
COPY . .
RUN ./mvnw -Pnative -DskipTests package

# 第二阶段：使用最小化基础镜像
FROM gcr.io/distroless/static-debian11
COPY --from=builder /build/target/myapp /app
EXPOSE 8080
ENTRYPOINT ["/app"]
```
