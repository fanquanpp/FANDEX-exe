---
order: 100
title: goroutine与channel通信原理
module: go
category: 'dev-lang'
difficulty: advanced
description: 'Go goroutine与channel通信原理详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与分布式追踪
  - go/Go与限流
  - go/GMP调度模型
  - go/并发模式
prerequisites:
  - go/概述与环境配置
---

## 1. goroutine 原理

goroutine 是用户态线程，初始栈仅 2KB，可动态增长：

```go
go func() {
    fmt.Println("Hello from goroutine")
}()
```

### 1.1 与线程对比

| 特性     | goroutine | OS 线程 |
| -------- | --------- | ------- |
| 初始栈   | 2KB       | 1-8MB   |
| 创建成本 | ~0.3μs    | ~10μs   |
| 切换成本 | ~0.2μs    | ~1-2μs  |
| 数量上限 | 百万级    | 千级    |

## 2. channel 通信

```go
// 无缓冲 channel：同步
ch := make(chan int)

// 有缓冲 channel：异步
ch := make(chan int, 100)

// 发送
ch <- 42

// 接收
value := <-ch

// 关闭
close(ch)

// 遍历
for v := range ch {
    fmt.Println(v)
}
```

## 3. 通信原理

### 3.1 无缓冲 channel

发送方阻塞直到接收方就绪，反之亦然。实现同步语义。

### 3.2 有缓冲 channel

缓冲区满时发送方阻塞，缓冲区空时接收方阻塞。

### 3.3 底层数据结构

```go
type hchan struct {
    qcount   uint           // 缓冲区元素数
    dataqsiz uint           // 缓冲区大小
    buf      unsafe.Pointer // 环形缓冲区
    elemtype *_type         // 元素类型
    sendx    uint           // 发送索引
    recvx    uint           // 接收索引
    recvq    waitq          // 等待接收的 goroutine 队列
    sendq    waitq          // 等待发送的 goroutine 队列
    lock     mutex          // 互斥锁
}
```

## 4. select 多路复用

```go
select {
case v := <-ch1:
    fmt.Println("ch1:", v)
case v := <-ch2:
    fmt.Println("ch2:", v)
case <-time.After(5 * time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no data")
}
```
