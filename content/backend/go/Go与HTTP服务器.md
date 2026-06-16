---
order: 85
title: Go与HTTP服务器
module: go
category: Go
difficulty: intermediate
description: net/http与路由
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与JSON
  - go/Go与HTTP客户端
  - go/Go与中间件
  - go/Go与OAuth2
prerequisites:
  - go/概述与环境配置
---

## 概述

HTTP 服务器是 Web 应用的基础。Go 标准库的 `net/http` 包提供了开箱即用的 HTTP 服务器实现，无需第三方框架即可构建高性能的 Web 服务。Go 1.22 更是增强了路由功能，支持方法匹配和路径参数，进一步减少了对外部框架的依赖。

## 基础概念

在开始编码之前，需要理解 HTTP 服务器的几个核心概念：

- **Handler**：处理 HTTP 请求的接口，核心方法是 `ServeHTTP(ResponseWriter, *Request)`。
- **ServeMux**：HTTP 请求多路复用器（路由器），将 URL 路径映射到对应的 Handler。
- **中间件**：包装 Handler 的函数，可以在请求处理前后执行通用逻辑（如日志、认证）。
- **路径参数**：Go 1.22+ 支持，从 URL 路径中提取动态参数，如 `/users/{id}`。

## 快速上手

最简单的 HTTP 服务器：

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    // 注册路由和处理函数
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "欢迎访问！")
    })

    http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "你好，世界！")
    })

    // 启动服务器
    fmt.Println("服务器启动在 :8080")
    http.ListenAndServe(":8080", nil)
}
```

## 详细用法

### 1. Go 1.22+ 增强路由

Go 1.22 引入了方法匹配和路径参数：

```go
mux := http.NewServeMux()

// 方法匹配：仅匹配 GET 请求
mux.HandleFunc("GET /users", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "用户列表")
})

// 路径参数：提取 URL 中的动态部分
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // 获取路径参数
    fmt.Fprintf(w, "用户ID: %s", id)
})

// 方法匹配：POST 请求
mux.HandleFunc("POST /users", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "创建用户")
})

http.ListenAndServe(":8080", mux)
```

### 2. 处理请求和响应

```go
func handleUser(w http.ResponseWriter, r *http.Request) {
    // 读取请求信息
    method := r.Method          // 请求方法
    path := r.URL.Path          // 请求路径
    query := r.URL.Query()      // 查询参数
    name := query.Get("name")   // 获取单个查询参数
    header := r.Header.Get("Content-Type") // 请求头

    // 读取请求体
    body, err := io.ReadAll(r.Body)
    defer r.Body.Close()

    // 解析 JSON 请求体
    var user User
    json.NewDecoder(r.Body).Decode(&user)

    // 设置响应头
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK) // 设置状态码

    // 写入 JSON 响应
    json.NewEncoder(w).Encode(map[string]string{
        "message": "成功",
        "name":    name,
    })
}
```

### 3. 自定义 Handler

实现 `http.Handler` 接口创建可复用的 Handler：

```go
type UserHandler struct {
    userService *UserService
}

// 实现 ServeHTTP 方法
func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        h.handleGet(w, r)
    case http.MethodPost:
        h.handlePost(w, r)
    default:
        http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
    }
}

func (h *UserHandler) handleGet(w http.ResponseWriter, r *http.Request) {
    users := h.userService.GetAll()
    json.NewEncoder(w).Encode(users)
}

// 注册
mux.Handle("/users", &UserHandler{userService: svc})
```

### 4. 提供静态文件

```go
// 提供当前目录下的静态文件
fs := http.FileServer(http.Dir("./static"))
mux.Handle("/static/", http.StripPrefix("/static/", fs))
```

### 5. 优雅关闭

确保服务器在关闭前处理完正在进行的请求：

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", handleRequest)

    server := &http.Server{
        Addr:    ":8080",
        Handler: mux,
    }

    // 在单独的 goroutine 中启动服务器
    go server.ListenAndServe()

    // 等待中断信号
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    // 优雅关闭，给 10 秒时间处理剩余请求
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    server.Shutdown(ctx)
    fmt.Println("服务器已关闭")
}
```

### 6. 服务器配置

```go
server := &http.Server{
    Addr:         ":8080",
    Handler:      mux,
    ReadTimeout:  5 * time.Second,  // 读取请求超时
    WriteTimeout: 10 * time.Second, // 写入响应超时
    IdleTimeout:  120 * time.Second, // 空闲连接超时
    MaxHeaderBytes: 1 << 20,        // 最大请求头大小（1MB）
}
```

## 常见场景

### 场景一：RESTful API

```go
mux := http.NewServeMux()

mux.HandleFunc("GET /api/users", listUsers)
mux.HandleFunc("GET /api/users/{id}", getUser)
mux.HandleFunc("POST /api/users", createUser)
mux.HandleFunc("PUT /api/users/{id}", updateUser)
mux.HandleFunc("DELETE /api/users/{id}", deleteUser)

func getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    user, err := userService.GetByID(id)
    if err != nil {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}
```

### 场景二：文件上传

```go
mux.HandleFunc("POST /upload", func(w http.ResponseWriter, r *http.Request) {
    // 限制上传大小（10MB）
    r.ParseMultipartForm(10 << 20)

    file, header, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "获取文件失败", http.StatusBadRequest)
        return
    }
    defer file.Close()

    // 保存文件
    dst, _ := os.Create("./uploads/" + header.Filename)
    defer dst.Close()
    io.Copy(dst, file)

    fmt.Fprintf(w, "上传成功: %s", header.Filename)
})
```

### 场景三：Server-Sent Events

```go
mux.HandleFunc("GET /events", func(w http.ResponseWriter, r *http.Request) {
    // 设置 SSE 必需的响应头
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")

    flusher, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "不支持流式响应", http.StatusInternalServerError)
        return
    }

    for {
        select {
        case <-r.Context().Done():
            return
        case event := <-eventChan:
            fmt.Fprintf(w, "data: %s\n\n", event)
            flusher.Flush()
        }
    }
})
```

## 注意事项与常见错误

1. **默认 ServeMux 的安全风险**：`http.HandleFunc` 使用全局默认的 ServeMux，任何第三方库都能注册路由。建议始终使用 `http.NewServeMux()` 创建自己的路由器。

2. **必须读取并关闭请求体**：如果不读取请求体就返回，连接可能无法复用。至少要 `io.Copy(io.Discard, r.Body)` 然后 `r.Body.Close()`。

3. **响应写入后不能再修改 Header**：调用 `w.Write()` 后再调用 `w.Header().Set()` 不会生效。先设置 Header，再写入响应。

4. **超时设置**：生产环境必须设置 ReadTimeout 和 WriteTimeout，否则慢客户端可能导致连接泄漏。

5. **路径末尾斜杠**：Go 1.22 之前，`/foo/` 和 `/foo` 是不同的路由。Go 1.22+ 使用方法匹配语法后更清晰。

6. **Context 取消**：请求的 Context 会在客户端断开连接时自动取消。长时间操作应检查 `r.Context().Done()`。

## 进阶用法

### HTTP/2 支持

Go 的 `net/http` 自动支持 HTTP/2（包括 h2c）：

```go
// 启用 HTTP/2（HTTPS 自动启用）
server := &http.Server{Addr: ":443"}
http2.ConfigureServer(server, nil)
server.ListenAndServeTLS("cert.pem", "key.pem")
```

### 自定义 ServerMux 匹配

如果需要更复杂的路由匹配，可以使用第三方路由库：

- **chi**：轻量级路由库，兼容 net/http
- **gorilla/mux**：功能丰富的路由库（已归档）
- **gin**：高性能 Web 框架

```go
import "github.com/go-chi/chi/v5"

r := chi.NewRouter()
r.Use(loggingMiddleware) // 中间件
r.Get("/users", listUsers)
r.Get("/users/{id}", getUser)
r.Post("/users", createUser)
r.Route("/admin", func(r chi.Router) {
    r.Use(authMiddleware) // 子路由中间件
    r.Get("/dashboard", adminDashboard)
})
```
