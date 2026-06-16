---
order: 55
title: Goroutine调度
module: go
category: Go
difficulty: advanced
description: GMP调度模型
author: fanquanpp
updated: '2026-06-14'
related:
  - go/goroutine与channel通信原理
  - go/GMP调度模型
  - go/Go与限流
  - go/Go与分布式追踪
prerequisites:
  - go/概述与环境配置
---

## 概述

Goroutine 调度是 Go 运行时的核心机制，决定了成千上万的 goroutine 如何在有限的系统线程上高效运行。Go 使用 GMP 调度模型（Goroutine-Machine-Processor），相比传统的操作系统线程模型，goroutine 的创建和切换开销极小，可以轻松创建百万级并发。

## 基础概念

在开始深入了解之前，需要理解 GMP 模型的几个核心概念：

- **G（Goroutine）**：用户态的轻量级线程，每个 go 语句创建一个 G。初始栈大小仅 2KB（可动态增长），创建和切换成本极低。
- **M（Machine）**：操作系统线程，由操作系统调度。M 负责执行 G 中的代码。M 的数量默认上限为 10000。
- **P（Processor）**：逻辑处理器，是调度的核心。P 持有本地 G 队列，M 必须关联一个 P 才能执行 G。P 的数量默认等于 CPU 核心数。
- **全局队列**：当 P 的本地队列满时，新的 G 会被放入全局队列。空闲的 P 会从全局队列获取 G。
- **Work Stealing**：当某个 P 的本地队列为空时，会从其他 P 的本地队列偷取一半的 G，实现负载均衡。

## 快速上手

理解调度最直观的方式是观察 goroutine 的行为：

```go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func main() {
    // 查看 CPU 核心数（即 P 的数量）
    fmt.Println("CPU 核心数:", runtime.NumCPU())
    // 查看 GOMAXPROCS（P 的数量）
    fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0))

    // 启动多个 goroutine
    for i := 0; i < 10; i++ {
        go func(id int) {
            fmt.Printf("Goroutine %d 运行中\n", id)
        }(i)
    }

    // 查看当前 goroutine 数量
    fmt.Println("Goroutine 数量:", runtime.NumGoroutine())

    time.Sleep(time.Second)
}
```

## 详细用法

### 1. GMP 调度流程

GMP 调度的核心流程如下：

1. 创建 goroutine 时，优先放入当前 P 的本地队列。
2. M 关联 P 后，从 P 的本地队列获取 G 执行。
3. 如果本地队列为空，先从全局队列获取。
4. 如果全局队列也为空，从其他 P 偷取（Work Stealing）。
5. 如果 G 执行了阻塞操作（如系统调用），M 会与 P 解绑，P 关联新的 M 继续运行其他 G。
6. 阻塞的 G 完成后，M 会尝试获取空闲的 P 继续执行，或把 G 放入全局队列。

### 2. 调度时机

以下情况会触发调度：

```go
// 1. goroutine 主动让出 CPU
runtime.Gosched()

// 2. channel 操作阻塞
ch <- value    // 发送阻塞
<-ch           // 接收阻塞

// 3. 系统调用（网络 I/O 使用非阻塞，由 netpoller 处理）
conn.Read(buf) // 文件 I/O 会阻塞 M

// 4. time.Sleep
time.Sleep(time.Second)

// 5. select 操作
select {
case <-ch1:
case <-time.After(time.Second):
}

// 6. sync.Mutex 竞争
mu.Lock() // 如果锁被占用，goroutine 会挂起
```

### 3. GOMAXPROCS

GOMAXPROCS 控制同时执行的 M 的最大数量（即 P 的数量）：

```go
// 设置 P 的数量
runtime.GOMAXPROCS(4)

// 获取当前 P 的数量
n := runtime.GOMAXPROCS(0)

// Go 1.5 之后默认值等于 CPU 核心数
// 之前默认为 1
```

### 4. runtime.Gosched

主动让出 CPU，让其他 goroutine 有机会运行：

```go
func main() {
    go func() {
        for i := 0; i < 5; i++ {
            fmt.Println("goroutine A:", i)
            runtime.Gosched() // 主动让出
        }
    }()

    go func() {
        for i := 0; i < 5; i++ {
            fmt.Println("goroutine B:", i)
            runtime.Gosched()
        }
    }()

    time.Sleep(time.Second)
}
```

### 5. runtime.LockOSThread

将 goroutine 绑定到当前操作系统线程，不参与调度：

```go
// 某些场景必须锁定 OS 线程
// 如 GUI 操作（GTK、OpenGL）、CGO 调用等
runtime.LockOSThread()
defer runtime.UnlockOSThread()

// 这个 goroutine 会独占一个 M
// 直到调用 UnlockOSThread
```

### 6. 监控 goroutine 泄漏

```go
func monitorGoroutines() {
    ticker := time.NewTicker(5 * time.Second)
    for range ticker.C {
        count := runtime.NumGoroutine()
        fmt.Printf("当前 goroutine 数量: %d\n", count)
        if count > 1000 {
            fmt.Println("警告：goroutine 数量异常")
        }
    }
}
```

### 7. 协作式调度

Go 1.14 之前使用协作式调度，goroutine 需要主动让出。1.14 引入基于信号的异步抢占，解决了密集循环导致调度延迟的问题：

```go
// Go 1.14 之前，这样的循环可能导致其他 goroutine 饿死
for {
    // 没有函数调用，不会触发调度
}

// Go 1.14+，运行时会发送信号强制抢占
```

## 常见场景

### 场景一：控制并发数

```go
// 使用带缓冲的 channel 控制并发
sem := make(chan struct{}, runtime.NumCPU()*2)

for _, task := range tasks {
    sem <- struct{}{} // 获取信号量
    go func(t Task) {
        defer func() { <-sem }() // 释放信号量
        process(t)
    }(task)
}
```

### 场景二：避免 goroutine 泄漏

```go
// 错误：goroutine 永远不会退出
func leak() {
    ch := make(chan int)
    go func() {
        val := <-ch // 如果没人发送，永远阻塞
        fmt.Println(val)
    }()
}

// 正确：使用 context 控制生命周期
func noLeak(ctx context.Context) {
    ch := make(chan int)
    go func() {
        select {
        case val := <-ch:
            fmt.Println(val)
        case <-ctx.Done():
            return // 超时或取消时退出
        }
    }()
}
```

### 场景三：CPU 密集型任务

```go
// CPU 密集型任务应限制并发数
func parallelProcess(items []Item) {
    numWorkers := runtime.GOMAXPROCS(0) // 等于 CPU 核心数
    sem := make(chan struct{}, numWorkers)
    var wg sync.WaitGroup

    for _, item := range items {
        wg.Add(1)
        sem <- struct{}{}
        go func(i Item) {
            defer wg.Done()
            defer func() { <-sem }()
            cpuIntensiveWork(i)
        }(item)
    }
    wg.Wait()
}
```

## 注意事项与常见错误

1. **goroutine 不是免费的**：虽然创建成本很低，但百万级 goroutine 仍会消耗大量内存（每个至少 2KB 栈）。

2. **避免无限制创建 goroutine**：在循环中启动 goroutine 时，必须控制并发数。

3. **goroutine 泄漏**：goroutine 阻塞在 channel 或锁上且永远无法解除，会导致内存泄漏。使用 context 或超时机制。

4. **不要依赖调度顺序**：goroutine 的执行顺序不确定，不要假设先启动的先执行。

5. **GOMAXPROCS 的设置**：大多数情况不需要修改默认值。在容器中运行时，可能需要根据 cgroup 限制调整。

6. **runtime.Gosched 很少使用**：在正常代码中几乎不需要手动调用。让运行时自动调度。

## 进阶用法

### 调度追踪

使用 trace 工具观察调度行为：

```go
import "runtime/trace"

f, _ := os.Create("trace.out")
trace.Start(f)
// ... 运行代码
trace.Stop()
f.Close()
```

```bash
go tool trace trace.out
# 可以查看 Goroutine 调度时间线、P 的利用率等
```

### 网络轮询器（Netpoller）

Go 的网络 I/O 使用非阻塞模式，由 netpoller 管理，不会阻塞 M：

```go
// 网络操作不会阻塞 M
conn, _ := net.Dial("tcp", "example.com:80")
conn.Read(buf) // 内部使用 epoll/kqueue，goroutine 挂起但不阻塞 M
```

### 系统线程限制

```go
// 设置最大系统线程数
runtime.Debug.SetMaxThreads(1000)

// 查看当前线程数
// 通过 /proc/PID/status 或 runtime.Stack 分析
```
