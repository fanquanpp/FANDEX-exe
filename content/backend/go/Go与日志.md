---
order: 76
title: Go与日志
module: go
category: Go
difficulty: beginner
description: slog与结构化日志
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与依赖注入
  - go/Go与配置管理
  - go/Go与模板
  - go/Go与加密
prerequisites:
  - go/概述与环境配置
---

## 概述

日志是程序运行时输出的记录信息，用于调试问题、监控运行状态和审计操作。Go 1.21 引入了 `log/slog` 包，提供了结构化日志功能，支持键值对形式的日志输出，方便日志系统检索和分析。相比传统的格式化日志，结构化日志更适合现代微服务和云原生环境。

## 基础概念

在开始编码之前，需要理解日志的几个核心概念：

- **日志级别**：表示日志的重要程度，从低到高有 DEBUG、INFO、WARN、ERROR 四个级别。生产环境通常设置为 INFO 或 WARN。
- **结构化日志**：每条日志由一组键值对组成，而非自由文本。例如 `level=INFO msg="请求处理" method=GET path=/users duration=10ms`。
- **Handler**：slog 中的日志处理器，决定日志的输出格式和目标。内置有 TextHandler（键值对文本）和 JSONHandler（JSON 格式）。
- **Logger**：日志记录器，提供 Info、Error 等方法写入日志。可以绑定默认属性，避免重复传入。

## 快速上手

最简单的日志输出：

```go
package main

import "log/slog"

func main() {
    // 使用默认 Logger 输出日志
    slog.Info("服务器启动", "port", 8080, "mode", "debug")
    slog.Warn("内存使用率高", "usage", "85%")
    slog.Error("数据库连接失败", "error", "timeout", "retry", 3)
    slog.Debug("调试信息", "detail", "仅开发环境可见")

    // 输出示例（TextHandler 格式）：
    // time=2026-06-14T10:30:00.000Z level=INFO msg=服务器启动 port=8080 mode=debug
}
```

## 详细用法

### 1. 四个日志级别

```go
// DEBUG：调试信息，仅开发环境使用
slog.Debug("查询参数", "sql", querySQL, "args", args)

// INFO：正常运行信息
slog.Info("请求处理完成", "method", "GET", "path", "/users", "duration", elapsed)

// WARN：警告信息，不影响运行但需要关注
slog.Warn("缓存未命中", "key", cacheKey, "fallback", "数据库查询")

// ERROR：错误信息，需要立即处理
slog.Error("支付失败", "order_id", orderID, "error", err)
```

### 2. 创建自定义 Logger

默认 Logger 使用 TextHandler 输出到标准错误。可以自定义格式和输出目标：

```go
import (
    "log/slog"
    "os"
)

// 创建 JSON 格式的 Logger（推荐生产环境使用）
jsonHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo, // 最低日志级别
})
logger := slog.New(jsonHandler)

// 设置为全局默认 Logger
slog.SetDefault(logger)

// 现在所有 slog 调用都使用 JSON 格式
slog.Info("请求处理", "method", "GET")
// 输出：{"time":"2026-06-14T10:30:00Z","level":"INFO","msg":"请求处理","method":"GET"}
```

### 3. 带默认属性的 Logger

为 Logger 绑定默认属性，后续所有日志自动携带：

```go
// 创建带默认属性的 Logger
requestLogger := slog.With(
    "request_id", "abc-123",
    "user_id", "456",
    "ip", "192.168.1.1",
)

// 所有日志自动携带 request_id、user_id、ip
requestLogger.Info("查询用户", "action", "get_user")
requestLogger.Warn("权限不足", "resource", "/admin")
```

### 4. 使用 slog.Attr 类型安全属性

直接传键值对时类型不安全，可以使用 `slog.Attr`：

```go
slog.Info("订单创建",
    slog.String("order_id", "ORD-001"),
    slog.Int("items", 3),
    slog.Float64("total", 299.9),
    slog.Bool("paid", true),
    slog.Duration("processing_time", 150*time.Millisecond),
    slog.Time("created_at", time.Now()),
)
```

### 5. 日志组（Group）

将相关属性分组：

```go
slog.Info("请求信息",
    slog.Group("request",
        slog.String("method", "POST"),
        slog.String("path", "/orders"),
        slog.Int("status", 201),
    ),
    slog.Group("response",
        slog.Int("size", 1024),
        slog.Duration("duration", 50*time.Millisecond),
    ),
)
// JSON 输出中 request 和 response 会是嵌套对象
```

### 6. 动态属性计算

仅在日志级别满足时才计算属性值：

```go
// 使用 LogAttrs 避免在低级别时计算属性
slog.LogAttrs(context.Background(), slog.LevelDebug,
    "调试信息",
    slog.String("big_data", expensiveOperation()), // 仅在 DEBUG 级别时调用
)
```

### 7. 自定义 Handler

实现 `slog.Handler` 接口自定义日志处理：

```go
type FilterHandler struct {
    handler slog.Handler
    ignoreKeys map[string]bool
}

func (h *FilterHandler) Enabled(ctx context.Context, level slog.Level) bool {
    return h.handler.Enabled(ctx, level)
}

func (h *FilterHandler) Handle(ctx context.Context, r slog.Record) error {
    // 过滤敏感字段
    return h.handler.Handle(ctx, r)
}

func (h *FilterHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
    return &FilterHandler{handler: h.handler.WithAttrs(attrs), ignoreKeys: h.ignoreKeys}
}

func (h *FilterHandler) WithGroup(name string) slog.Handler {
    return &FilterHandler{handler: h.handler.WithGroup(name), ignoreKeys: h.ignoreKeys}
}
```

## 常见场景

### 场景一：HTTP 请求日志中间件

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // 使用请求信息创建 Logger
        logger := slog.With(
            "method", r.Method,
            "path", r.URL.Path,
            "remote_addr", r.RemoteAddr,
        )

        // 将 Logger 存入 Context
        ctx := context.WithValue(r.Context(), "logger", logger)
        next.ServeHTTP(w, r.WithContext(ctx))

        duration := time.Since(start)
        logger.Info("请求完成", "duration", duration)
    })
}
```

### 场景二：多环境日志配置

```go
func SetupLogger(env string) {
    var handler slog.Handler

    switch env {
    case "production":
        // 生产环境：JSON 格式，INFO 级别
        handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
            Level: slog.LevelInfo,
        })
    case "development":
        // 开发环境：文本格式，DEBUG 级别
        handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
            Level: slog.LevelDebug,
        })
    default:
        handler = slog.NewTextHandler(os.Stdout, nil)
    }

    // 添加全局默认属性
    handler = handler.WithAttrs([]slog.Attr{
        slog.String("service", "my-app"),
        slog.String("version", "1.0.0"),
    })

    slog.SetDefault(slog.New(handler))
}
```

### 场景三：错误日志与上下文

```go
func ProcessOrder(ctx context.Context, orderID string) error {
    logger := slog.With("order_id", orderID)

    if err := validateOrder(orderID); err != nil {
        logger.Error("订单验证失败",
            "error", err,
            "step", "validate",
        )
        return err
    }

    if err := chargePayment(orderID); err != nil {
        logger.Error("支付扣款失败",
            "error", err,
            "step", "payment",
        )
        return err
    }

    logger.Info("订单处理成功")
    return nil
}
```

## 注意事项与常见错误

1. **日志级别设置**：默认级别是 INFO，Debug 日志不会输出。需要显式设置 `HandlerOptions{Level: slog.LevelDebug}`。

2. **不要在热路径记录 Debug 日志**：即使 Debug 日志不输出，字符串拼接等操作仍会执行。使用 `LogAttrs` 延迟计算。

3. **结构化日志不要拼接字符串**：错误做法 `slog.Info("用户 " + name + " 登录")`，正确做法 `slog.Info("用户登录", "name", name)`。

4. **敏感信息不要记录**：密码、令牌、身份证号等敏感信息不应出现在日志中。

5. **Error 日志要包含错误原因**：`slog.Error("操作失败")` 不如 `slog.Error("操作失败", "error", err)` 有用。

6. **日志输出目标**：生产环境通常输出到标准输出（stdout），由容器/系统收集，而非写入文件。

## 进阶用法

### 日志级别自定义

```go
// 自定义日志级别（比 INFO 高，比 WARN 低）
var LevelTrace = slog.Level(-8)

slog.LogAttrs(ctx, LevelTrace, "追踪信息", slog.String("detail", "..."))
```

### Context 集成

从 Context 中提取请求级别的 Logger：

```go
type contextKey string
const loggerKey contextKey = "logger"

func WithLogger(ctx context.Context, logger *slog.Logger) context.Context {
    return context.WithValue(ctx, loggerKey, logger)
}

func FromContext(ctx context.Context) *slog.Logger {
    if logger, ok := ctx.Value(loggerKey).(*slog.Logger); ok {
        return logger
    }
    return slog.Default()
}
```

### 第三方日志库

如果需要更丰富的功能，可以考虑：

- **zerolog**：高性能零分配 JSON 日志库
- **zap**：Uber 开源的高性能结构化日志库
- **logrus**：社区广泛使用的结构化日志库（已进入维护模式）

```go
// zerolog 示例
import "github.com/rs/zerolog/log"

log.Info().Str("method", "GET").Int("status", 200).Msg("请求完成")
```
