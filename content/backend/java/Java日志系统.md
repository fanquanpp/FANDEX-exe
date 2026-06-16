---
order: 68
title: Java日志系统
module: java
category: Java
difficulty: intermediate
description: SLF4J、Logback与日志框架
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java函数式编程
  - java/Java网络编程
  - java/Java单元测试
  - java/Java构建工具
prerequisites:
  - java/概述与开发环境
---

## 概述

日志是 Java 应用开发中不可或缺的组成部分，用于记录运行状态、排查问题和监控系统健康度。Java 日志生态以 SLF4J 为日志门面、Logback 为日志实现最为常见。本文介绍日志框架的配置、使用和最佳实践。

## 基础概念

### 日志框架体系

| 框架    | 定位     | 说明                       |
| ------- | -------- | -------------------------- |
| SLF4J   | 日志门面 | 统一日志 API，不涉及实现   |
| Logback | 日志实现 | SLF4J 的原生实现，性能优秀 |
| Log4j 2 | 日志实现 | Apache 出品，异步性能极佳  |
| JUL     | 日志实现 | JDK 内置，功能有限         |

### 日志级别

从低到高依次为：TRACE < DEBUG < INFO < WARN < ERROR。设置某个级别后，只输出该级别及更高级别的日志。

## 快速上手

### 基本使用

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// 获取 Logger 实例（推荐使用类名作为标识）
private static final Logger logger = LoggerFactory.getLogger(MyClass.class);

// 使用占位符，避免不必要的字符串拼接
logger.info("用户 {} 登录成功，IP: {}", userId, clientIp);
logger.debug("查询参数: {}", params);
logger.warn("缓存未命中，key: {}", key);
logger.error("处理订单失败，订单号: {}", orderId, exception);

// 不要这样写（性能差）
logger.debug("结果: " + result);  // 即使 DEBUG 级别关闭也会拼接字符串
```

### Logback 基础配置

```xml
<!-- logback.xml 基础配置 -->
<configuration>
    <!-- 控制台输出 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 根日志级别 -->
    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>

    <!-- 按包设置不同级别 -->
    <logger name="com.example" level="DEBUG" />
    <logger name="org.springframework" level="WARN" />
</configuration>
```

## 详细用法

### 文件滚动输出

```xml
<!-- 按日期和大小滚动的文件输出 -->
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/application.log</file>
    <!-- 滚动策略 -->
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
        <maxFileSize>100MB</maxFileSize>   <!-- 单个文件最大 100MB -->
        <maxHistory>30</maxHistory>         <!-- 保留 30 天 -->
        <totalSizeCap>5GB</totalSizeCap>    <!-- 总大小上限 5GB -->
    </rollingPolicy>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        <charset>UTF-8</charset>
    </encoder>
</appender>
```

### 异步日志

```xml
<!-- 异步 Appender，避免日志 I/O 阻塞业务线程 -->
<appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 队列容量，默认 256 -->
    <queueSize>1024</queueSize>
    <!-- 队列满时不丢弃 WARN 以上级别的日志 -->
    <discardingThreshold>0</discardingThreshold>
    <!-- 队列满时是否阻塞（false=丢弃日志，true=阻塞等待） -->
    <neverBlock>true</neverBlock>
    <appender-ref ref="FILE" />
</appender>
```

### 按业务分离日志

```xml
<!-- 将不同业务的日志输出到不同文件 -->
<appender name="ORDER_LOG" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/order.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>logs/order.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
        <maxFileSize>200MB</maxFileSize>
        <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %msg%n</pattern>
    </encoder>
</appender>

<!-- 业务 Logger -->
<logger name="ORDER_LOGGER" level="INFO" additivity="false">
    <appender-ref ref="ORDER_LOG" />
</logger>
```

```java
// 在代码中使用独立的 Logger
private static final Logger orderLogger = LoggerFactory.getLogger("ORDER_LOGGER");
orderLogger.info("订单创建: orderId={}, amount={}", orderId, amount);
```

## 常见场景

### Spring Boot 日志配置

```yaml
# application.yml 日志配置
logging:
  level:
    root: INFO
    com.example: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE # 显示 SQL 参数
  file:
    name: logs/application.log
  logback:
    rollingpolicy:
      max-file-size: 100MB
      max-history: 30
      total-size-cap: 5GB
```

### 结构化日志（JSON 格式）

```xml
<!-- 输出 JSON 格式日志，便于 ELK 采集 -->
<appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/application.json</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.json.gz</fileNamePattern>
        <maxFileSize>100MB</maxFileSize>
        <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeContext>true</includeContext>
        <includeMdc>true</includeMdc>
    </encoder>
</appender>
```

### MDC 追踪日志

```java
// 使用 MDC 在日志中添加追踪信息
import org.slf4j.MDC;

// 在请求入口设置追踪 ID
public class TraceFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        String traceId = UUID.randomUUID().toString().replace("-", "");
        MDC.put("traceId", traceId);
        MDC.put("userId", getCurrentUserId());
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear(); // 请求结束后清理
        }
    }
}
```

```xml
<!-- 在日志格式中引用 MDC 变量 -->
<pattern>%d{HH:mm:ss.SSS} [trace:%X{traceId}] [user:%X{userId}] %-5level %logger - %msg%n</pattern>
```

## 注意事项

- 使用 SLF4J 占位符而非字符串拼接，避免日志级别关闭时的性能浪费
- 异步日志的队列容量需要根据日志量合理设置，过小会丢失日志
- 不要在循环中打印 DEBUG 日志，即使使用占位符也有方法调用开销
- ERROR 级别日志应包含异常对象，便于定位问题
- 生产环境不要使用 DEBUG/TRACE 级别，日志量过大会影响性能
- 日志文件应配置滚动策略，避免磁盘写满

## 进阶用法

### Log4j 2 异步日志

```xml
<!-- Log4j 2 的全异步模式，性能比 Logback 异步更高 -->
<!-- pom.xml 添加依赖 -->
<!-- disruptor 依赖用于全异步 -->
<!-- 启动参数: -Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector -->

<!-- log4j2.xml -->
<Configuration>
    <Appenders>
        <RollingFile name="File" fileName="logs/app.log"
            filePattern="logs/app-%d{yyyy-MM-dd}-%i.log.gz">
            <PatternLayout pattern="%d %p %c{1.} [%t] %m%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="100MB"/>
            </Policies>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="File"/>
        </Root>
    </Loggers>
</Configuration>
```

### 自定义日志脱敏

```java
// 日志脱敏：防止敏感信息写入日志
public class SensitiveDataConverter extends MessageConverter {
    // 手机号脱敏: 13812345678 -> 138****5678
    private static final Pattern PHONE_PATTERN =
        Pattern.compile("(\\d{3})\\d{4}(\\d{4})");

    @Override
    public String convert(ILoggingEvent event) {
        String message = super.convert(event);
        return PHONE_PATTERN.matcher(message).replaceAll("$1****$2");
    }
}
```
