---
order: 87
title: Go与中间件
module: go
category: Go
difficulty: intermediate
description: HTTP中间件模式
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与HTTP服务器
  - go/Go与OAuth2
  - go/Go与限流
  - go/Go与日志
prerequisites:
  - go/概述与环境配置
---

## 概述

中间件是一种包装模式，在请求处理前后插入通用逻辑，如日志记录、认证、限流等。中间件将横切关注点与业务逻辑分离，使代码更清晰、更易维护。Go 的 `net/http` 原生支持中间件模式，不需要框架即可实现。

## 基础概念

在开始编码之前，需要理解中间件的几个核心概念：

- **Handler**：处理 HTTP 请求的函数或对象，签名为 `func(w http.ResponseWriter, r *http.Request)`。
- **中间件函数**：接收一个 Handler，返回一个新的 Handler，在原 Handler 前后添加逻辑。
- **中间件链**：多个中间件按顺序组合，请求依次经过每个中间件，响应反向返回。
- **洋葱模型**：请求从外层中间件进入，到达核心 Handler 后，响应从内层向外层返回。

## 快速上手

最简单的中间件 -- 日志记录：

```go
package main

import (
    "log"
    "net/http"
    "time"
)

// 日志中间件
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        log.Printf("请求开始: %s %s", r.Method, r.URL.Path)

        next.ServeHTTP(w, r) // 调用下一个 Handler

        log.Printf("请求完成: %s %s 耗时: %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("你好！"))
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", helloHandler)

    // 用中间件包装路由
    handler := loggingMiddleware(mux)
    http.ListenAndServe(":8080", handler)
}
```

## 详细用法

### 1. 中间件的基本模式

```go
// 标准中间件签名
func Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 前置逻辑：在 next.ServeHTTP 之前执行
        fmt.Println("请求前")

        next.ServeHTTP(w, r) // 调用下一个 Handler

        // 后置逻辑：在 next.ServeHTTP 之后执行
        fmt.Println("请求后")
    })
}
```

### 2. 认证中间件

```go
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "未认证", http.StatusUnauthorized)
            return // 不调用 next，请求被拦截
        }

        // 验证 token
        claims, err := validateToken(token)
        if err != nil {
            http.Error(w, "令牌无效", http.StatusUnauthorized)
            return
        }

        // 将用户信息存入 Context
        ctx := context.WithValue(r.Context(), "userID", claims.UserID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 3. CORS 中间件

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // 处理预检请求
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}
```

### 4. 请求 ID 中间件

```go
func requestIDMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        requestID := r.Header.Get("X-Request-ID")
        if requestID == "" {
            requestID = generateUUID()
        }

        ctx := context.WithValue(r.Context(), "requestID", requestID)
        w.Header().Set("X-Request-ID", requestID)

        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 5. 恢复中间件（防崩溃）

```go
func recoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("panic 已恢复: %v\n%s", err, debug.Stack())
                http.Error(w, "服务器内部错误", http.StatusInternalServerError)
            }
        }()

        next.ServeHTTP(w, r)
    })
}
```

### 6. 组合多个中间件

```go
// 链式组合中间件
func Chain(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        handler = middlewares[i](handler)
    }
    return handler
}

// 使用
handler := Chain(mux,
    recoveryMiddleware,  // 最外层：恢复 panic
    loggingMiddleware,   // 日志
    corsMiddleware,      // CORS
    authMiddleware,      // 认证（最内层）
)
```

### 7. 响应包装器

如果中间件需要读取响应状态码，需要包装 ResponseWriter：

```go
type responseRecorder struct {
    http.ResponseWriter
    statusCode int
}

func (r *responseRecorder) WriteHeader(code int) {
    r.statusCode = code
    r.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        recorder := &responseRecorder{ResponseWriter: w, statusCode: 200}

        next.ServeHTTP(recorder, r)

        log.Printf("%s %s %d %v", r.Method, r.URL.Path, recorder.statusCode, time.Since(start))
    })
}
```

## 常见场景

### 场景一：API 网关中间件栈

```go
handler := Chain(mux,
    recoveryMiddleware,
    requestIDMiddleware,
    loggingMiddleware,
    corsMiddleware,
    rateLimitMiddleware(limiter),
    authMiddleware,
)
```

### 场景二：路由级中间件

某些路由需要认证，某些不需要：

```go
mux := http.NewServeMux()

// 公开路由
mux.HandleFunc("GET /api/public", publicHandler)

// 受保护路由
protectedMux := http.NewServeMux()
protectedMux.HandleFunc("GET /api/users", listUsers)
protectedMux.HandleFunc("POST /api/users", createUser)

// 只对受保护路由应用认证中间件
mux.Handle("/api/users/", authMiddleware(protectedMux))
```

### 场景三：超时中间件

```go
func timeoutMiddleware(duration time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ctx, cancel := context.WithTimeout(r.Context(), duration)
            defer cancel()

            done := make(chan struct{})
            go func() {
                next.ServeHTTP(w, r.WithContext(ctx))
                close(done)
            }()

            select {
            case <-done:
                return
            case <-ctx.Done():
                http.Error(w, "请求超时", http.StatusGatewayTimeout)
            }
        })
    }
}
```

## 注意事项与常见错误

1. **中间件顺序很重要**：最外层的中间件最先执行前置逻辑，最后执行后置逻辑。恢复中间件应该放在最外层。

2. **不要忘记调用 next**：如果中间件不调用 `next.ServeHTTP`，请求链会中断，后续的 Handler 不会执行。

3. **Context 值的类型安全**：使用自定义类型作为 Context 的键，避免冲突：

```go
type contextKey string
const userIDKey contextKey = "userID"
ctx := context.WithValue(r.Context(), userIDKey, "123")
```

4. **goroutine 泄漏**：在中间件中启动 goroutine 时，确保它能正确退出，特别是当请求被取消时。

5. **ResponseWriter 只能写入一次**：如果中间件已经写入了响应，后续的 Handler 不应该再写入。

6. **中间件应该是无状态的**：中间件不应该存储请求相关的状态。每个请求的数据应该通过 Context 传递。

## 进阶用法

### 使用 chi 路由器的中间件

chi 提供了更优雅的中间件管理：

```go
import "github.com/go-chi/chi/v5"
import "github.com/go-chi/chi/v5/middleware"

r := chi.NewRouter()

// 全局中间件
r.Use(middleware.RequestID)
r.Use(middleware.RealIP)
r.Use(middleware.Logger)
r.Use(middleware.Recoverer)

// 路由组中间件
r.Route("/admin", func(r chi.Router) {
    r.Use(authMiddleware) // 仅 admin 路由需要认证
    r.Get("/dashboard", adminDashboard)
})
```

### 条件中间件

```go
func conditionalMiddleware(condition func(r *http.Request) bool, mw func(http.Handler) http.Handler) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if condition(r) {
                mw(next).ServeHTTP(w, r)
            } else {
                next.ServeHTTP(w, r)
            }
        })
    }
}

// 仅对 API 路径应用认证
conditionalMiddleware(func(r *http.Request) bool {
    return strings.HasPrefix(r.URL.Path, "/api/")
}, authMiddleware)
```
