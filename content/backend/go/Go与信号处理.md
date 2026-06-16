---
order: 82
title: Go与信号处理
module: go
category: Go
difficulty: intermediate
description: os/signal与优雅关闭
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与正则表达式
  - go/Go与文件监控
  - go/Go与日志
  - go/Go与加密
prerequisites:
  - go/概述与环境配置
---

## 概述

信号是操作系统向进程发送的异步通知，用于告知进程发生了某个事件。例如用户按 Ctrl+C 会发送 SIGINT 信号，系统关闭时会发送 SIGTERM 信号。Go 的 `os/signal` 包可以让程序捕获和处理这些信号，实现优雅关闭、配置重载等功能。

## 基础概念

在开始编码之前，需要理解信号处理的几个核心概念：

- **SIGINT**：中断信号，通常由 Ctrl+C 触发，信号编号 2。
- **SIGTERM**：终止信号，kill 命令默认发送此信号，信号编号 15。
- **SIGHUP**：挂断信号，常用于通知进程重新加载配置，信号编号 1。
- **SIGKILL**：强制终止信号，无法被捕获或忽略，信号编号 9。
- **优雅关闭**：收到终止信号后，先完成正在处理的请求，再退出程序。

## 快速上手

最简单的信号捕获示例：

```go
package main

import (
    "fmt"
    "os"
    "os/signal"
    "syscall"
)

func main() {
    // 创建信号通道
    sigChan := make(chan os.Signal, 1)

    // 注册要捕获的信号
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

    // 阻塞等待信号
    sig := <-sigChan
    fmt.Printf("\n收到信号: %v，正在退出...\n", sig)
}
```

## 详细用法

### 1. 捕获多个信号

```go
sigChan := make(chan os.Signal, 1)

// 可以同时监听多个信号
signal.Notify(sigChan,
    syscall.SIGHUP,  // 配置重载
    syscall.SIGINT,  // Ctrl+C
    syscall.SIGTERM, // kill 命令
    syscall.SIGUSR1, // 用户自定义信号1
    syscall.SIGUSR2, // 用户自定义信号2
)

for {
    sig := <-sigChan
    switch sig {
    case syscall.SIGHUP:
        fmt.Println("收到 SIGHUP，重新加载配置")
        reloadConfig()
    case syscall.SIGINT, syscall.SIGTERM:
        fmt.Println("收到终止信号，优雅关闭")
        gracefulShutdown()
        return
    case syscall.SIGUSR1:
        fmt.Println("收到 SIGUSR1，切换日志级别")
        toggleLogLevel()
    }
}
```

### 2. 优雅关闭 HTTP 服务器

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", handler)

    server := &http.Server{Addr: ":8080", Handler: mux}

    // 启动服务器
    go func() {
        if err := server.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    // 等待信号
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    // 优雅关闭
    log.Println("正在关闭服务器...")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Printf("关闭错误: %v\n", err)
    }
    log.Println("服务器已关闭")
}
```

### 3. 优雅关闭 Worker 池

```go
func main() {
    ctx, cancel := context.WithCancel(context.Background())
    var wg sync.WaitGroup

    // 启动多个 worker
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            worker(ctx, id)
        }(i)
    }

    // 等待信号
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    // 通知所有 worker 停止
    fmt.Println("通知 worker 停止...")
    cancel()

    // 等待所有 worker 完成
    wg.Wait()
    fmt.Println("所有 worker 已停止")
}

func worker(ctx context.Context, id int) {
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("Worker %d 停止\n", id)
            return
        default:
            // 处理任务
            processTask(id)
        }
    }
}
```

### 4. 忽略信号

```go
// 忽略 SIGHUP（防止终端关闭时进程退出）
signal.Ignore(syscall.SIGHUP)
```

### 5. 取消信号监听

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGINT)

// ... 某些条件下不再需要监听
signal.Stop(sigChan) // 停止向该通道发送信号
```

### 6. 超时关闭

如果优雅关闭超时，强制退出：

```go
done := make(chan struct{})
go func() {
    wg.Wait() // 等待所有任务完成
    close(done)
}()

select {
case <-done:
    fmt.Println("优雅关闭完成")
case <-time.After(30 * time.Second):
    fmt.Println("关闭超时，强制退出")
    os.Exit(1)
}
```

## 常见场景

### 场景一：配置热重载

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGHUP)

for range sigChan {
    log.Println("收到 SIGHUP，重新加载配置")
    newConfig, err := loadConfig()
    if err != nil {
        log.Printf("加载配置失败: %v\n", err)
        continue
    }
    applyConfig(newConfig)
    log.Println("配置已更新")
}
```

### 场景二：清理资源

```go
func main() {
    // 初始化资源
    db := connectDB()
    defer db.Close()

    cache := connectRedis()
    defer cache.Close()

    // ... 启动服务

    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    // 按顺序清理资源
    log.Println("关闭数据库连接...")
    db.Close()
    log.Println("关闭缓存连接...")
    cache.Close()
}
```

### 场景三：Docker 容器中的信号处理

Docker 停止容器时会发送 SIGTERM，等待一段时间后发送 SIGKILL。Go 程序需要正确处理 SIGTERM：

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGTERM)
<-sigChan
// 在 Docker 的 --stop-timeout 内完成清理
cleanup()
```

## 注意事项与常见错误

1. **SIGKILL 和 SIGSTOP 无法捕获**：这两个信号无法被程序捕获、阻塞或忽略。当收到 SIGKILL 时，进程会立即终止。

2. **信号通道要有缓冲**：`make(chan os.Signal, 1)` 使用缓冲通道，避免信号发送时阻塞。

3. **Windows 信号限制**：Windows 只支持 SIGINT（Ctrl+C）。SIGTERM 等信号在 Windows 上不可用。

4. **不要在信号处理中做耗时操作**：信号处理应该尽量简单，设置标志位或发送通知，让主循环处理具体逻辑。

5. **signal.Reset**：可以恢复信号的默认行为：

```go
signal.Reset(syscall.SIGINT) // 恢复 Ctrl+C 的默认行为（终止程序）
```

6. **多个 Notify 调用**：对同一个信号多次调用 `signal.Notify` 不会覆盖，每个通道都会收到信号。

## 进阶用法

### 信号处理框架

将信号处理封装为可复用的组件：

```go
type ShutdownManager struct {
    handlers []func()
    timeout  time.Duration
}

func NewShutdownManager(timeout time.Duration) *ShutdownManager {
    return &ShutdownManager{timeout: timeout}
}

func (m *ShutdownManager) Register(handler func()) {
    m.handlers = append(m.handlers, handler)
}

func (m *ShutdownManager) Wait() {
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    <-sigChan

    done := make(chan struct{})
    go func() {
        for _, h := range m.handlers {
            h()
        }
        close(done)
    }()

    select {
    case <-done:
        log.Println("关闭完成")
    case <-time.After(m.timeout):
        log.Println("关闭超时，强制退出")
        os.Exit(1)
    }
}
```
