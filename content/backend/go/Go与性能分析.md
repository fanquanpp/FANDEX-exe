---
order: 83
title: Go与性能分析
module: go
category: Go
difficulty: advanced
description: pprof与性能调优
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与CGO
  - go/Go与Fuzzing
  - go/Go与代码生成
  - go/Go与信号处理
prerequisites:
  - go/概述与环境配置
---

## 概述

性能分析是找出程序性能瓶颈的过程。Go 标准库内置了 pprof 工具，可以分析 CPU 使用、内存分配、Goroutine 阻塞等情况。通过 pprof，开发者可以精确定位哪些函数消耗了最多的 CPU 时间，哪些代码分配了最多的内存，从而有针对性地优化。

## 基础概念

在开始编码之前，需要理解性能分析的几个核心概念：

- **pprof**：Go 内置的性能分析工具，采集和展示性能数据。
- **Profile**：性能分析数据文件，记录了程序运行时的采样信息。
- **CPU Profile**：CPU 使用分析，记录哪些函数占用了最多的 CPU 时间。
- **Memory Profile**：内存分配分析，记录哪些代码分配了最多的内存。
- **Goroutine Profile**：Goroutine 分析，记录所有 Goroutine 的调用栈。
- **火焰图（Flame Graph）**：一种可视化性能数据的图表，直观展示函数调用关系和耗时占比。

## 快速上手

最简单的 CPU 性能分析：

```go
package main

import (
    "os"
    "runtime/pprof"
)

func main() {
    // 创建 CPU Profile 文件
    f, err := os.Create("cpu.prof")
    if err != nil {
        panic(err)
    }
    defer f.Close()

    // 开始 CPU 采样
    pprof.StartCPUProfile(f)
    defer pprof.StopCPUProfile()

    // 运行需要分析的代码
    heavyWork()
}

func heavyWork() {
    // 模拟耗时计算
    for i := 0; i < 1000000; i++ {
        _ = i * i
    }
}
```

分析 Profile 文件：

```bash
# 使用 go tool pprof 分析
go tool pprof cpu.prof

# 常用命令（在 pprof 交互界面中）
# top10    - 查看 CPU 占用最高的 10 个函数
# list 函数名 - 查看函数的逐行分析
# web      - 生成调用图（需要安装 graphviz）
```

## 详细用法

### 1. CPU 性能分析

```go
import "runtime/pprof"

// 方式1：写入文件
f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
// ... 运行代码
pprof.StopCPUProfile()
f.Close()

// 方式2：写入任意 io.Writer
var buf bytes.Buffer
pprof.StartCPUProfile(&buf)
// ... 运行代码
pprof.StopCPUProfile()
```

### 2. 内存性能分析

```go
import "runtime/pprof"

// 运行需要分析的代码
heavyMemoryWork()

// 写入内存 Profile
f, _ := os.Create("mem.prof")
defer f.Close()

// runtime.GC() // 可选：先触发 GC，只记录存活对象
pprof.WriteHeapProfile(f)
```

### 3. Goroutine 分析

```go
// 获取当前所有 Goroutine 的调用栈
f, _ := os.Create("goroutine.prof")
defer f.Close()
pprof.Lookup("goroutine").WriteTo(f, 0)
```

### 4. HTTP 服务集成

在线上服务中通过 HTTP 端点暴露 pprof 数据：

```go
import _ "net/http/pprof"

func main() {
    // pprof 自动注册到默认 ServeMux
    // 访问 http://localhost:8080/debug/pprof/ 查看
    go http.ListenAndServe(":8080", nil)

    // 你的服务逻辑
    startServer()
}
```

可用的 pprof 端点：

- `/debug/pprof/` - 概览页面
- `/debug/pprof/profile?seconds=30` - CPU Profile（采样 30 秒）
- `/debug/pprof/heap` - 内存 Profile
- `/debug/pprof/goroutine` - Goroutine Profile
- `/debug/pprof/block` - 阻塞分析
- `/debug/pprof/mutex` - 锁竞争分析

远程分析：

```bash
# 直接分析远程服务的 CPU
go tool pprof http://localhost:8080/debug/pprof/profile?seconds=30

# 分析远程服务的内存
go tool pprof http://localhost:8080/debug/pprof/heap
```

### 5. 阻塞分析

分析 Goroutine 阻塞在哪些操作上：

```go
// 需要先启用阻塞分析
runtime.SetBlockProfileRate(1) // 记录所有阻塞事件

// 访问 /debug/pprof/block 获取数据
// 或手动写入
f, _ := os.Create("block.prof")
pprof.Lookup("block").WriteTo(f, 0)
```

### 6. 锁竞争分析

分析哪些锁导致了最多的竞争：

```go
// 启用互斥锁分析
runtime.SetMutexProfileFraction(1)

// 访问 /debug/pprof/mutex 获取数据
f, _ := os.Create("mutex.prof")
pprof.Lookup("mutex").WriteTo(f, 0)
```

### 7. 使用 go test 进行基准测试

```go
// 编写基准测试
func BenchmarkProcess(b *testing.B) {
    for i := 0; i < b.N; i++ {
        process()
    }
}
```

```bash
# 运行基准测试并生成 CPU Profile
go test -bench=. -cpuprofile=cpu.prof

# 运行基准测试并生成内存 Profile
go test -bench=. -memprofile=mem.prof

# 分析结果
go tool pprof cpu.prof
```

### 8. 火焰图

使用 go tool pprof 的 Web 界面查看火焰图：

```bash
# 启动 Web 界面（Go 1.24+ 内置火焰图）
go tool pprof -http=:8080 cpu.prof

# 在浏览器中打开 http://localhost:8080/ui/flamegraph
```

## 常见场景

### 场景一：CPU 热点分析

```bash
# 1. 采集 CPU Profile
go tool pprof http://localhost:8080/debug/pprof/profile?seconds=30

# 2. 在交互界面中
(pprof) top10        # 查看 CPU 占用最高的函数
(pprof) list funcName # 查看函数的逐行耗时
(pprof) web          # 生成调用图

# 3. 找到热点后优化代码
```

### 场景二：内存泄漏排查

```bash
# 1. 采集内存 Profile
go tool pprof http://localhost:8080/debug/pprof/heap

# 2. 查看内存分配最多的位置
(pprof) top
(pprof) list funcName

# 3. 对比两次采样的差异
go tool pprof -base heap1.prof heap2.prof
```

### 场景三：Goroutine 泄漏

```bash
# 查看 Goroutine 数量
curl http://localhost:8080/debug/pprof/goroutine?debug=1

# 分析 Goroutine 调用栈
go tool pprof http://localhost:8080/debug/pprof/goroutine
(pprof) top
(pprof) traces  # 查看调用栈
```

## 注意事项与常见错误

1. **采样有开销**：CPU Profile 采样有约 1-5% 的性能开销。内存 Profile 在写入时有短暂暂停。生产环境可以短时间开启。

2. **采样时间要足够长**：CPU Profile 至少采样 30 秒，否则数据不够准确。

3. **内存 Profile 不等于内存泄漏**：内存 Profile 显示的是当前存活对象的分配位置，不一定是泄漏。需要对比多次采样。

4. **pprof 端点安全**：生产环境的 `/debug/pprof/` 端点不应该对外暴露。使用中间件限制访问：

```go
// 只允许内网访问 pprof
mux.HandleFunc("/debug/", func(w http.ResponseWriter, r *http.Request) {
    if !isInternalIP(r.RemoteAddr) {
        http.Error(w, "禁止访问", http.StatusForbidden)
        return
    }
    // 转发给 pprof handler
})
```

5. **block 和 mutex 默认不开启**：`SetBlockProfileRate` 和 `SetMutexProfileFraction` 默认为 0，需要手动设置。

6. **benchmark 的 b.N**：`b.N` 由测试框架自动调整，不要手动修改。框架会运行足够多次以获得稳定结果。

## 进阶用法

### trace 工具

Go 的 trace 工具可以分析程序的时间线，包括 Goroutine 调度、GC、网络等事件：

```go
import "runtime/trace"

f, _ := os.Create("trace.out")
trace.Start(f)
// ... 运行代码
trace.Stop()
f.Close()
```

```bash
# 分析 trace
go tool trace trace.out
```

### 自定义 Profile

```go
// 创建自定义 Profile
var myProfile = pprof.NewProfile("myapp.custom")

// 记录自定义事件
func trackOperation() {
    myProfile.Add("operation", 1)
    defer myProfile.Remove("operation")

    // 执行操作
}

// 写入自定义 Profile
myProfile.WriteTo(os.Stdout, 1)
```

### 使用 benchmark 比较性能

```bash
# 保存基准结果
go test -bench=. -benchmem > old.txt

# 优化代码后再次测试
go test -bench=. -benchmem > new.txt

# 比较差异
go install golang.org/x/perf/cmd/benchstat@latest
benchstat old.txt new.txt
```
