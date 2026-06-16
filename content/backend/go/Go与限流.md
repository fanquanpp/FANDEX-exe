---
order: 89
title: Go与限流
module: go
category: Go
difficulty: intermediate
description: 限流与熔断
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与OAuth2
  - go/Go与分布式追踪
  - go/goroutine与channel通信原理
  - go/GMP调度模型
prerequisites:
  - go/概述与环境配置
---

## 概述

限流是控制单位时间内请求数量的技术，防止系统因过载而崩溃。当流量超过系统处理能力时，限流会拒绝多余的请求，保护后端服务。熔断则是在检测到服务异常时主动断开调用，避免故障扩散。Go 标准库和社区提供了多种限流和熔断工具。

## 基础概念

在开始编码之前，需要理解限流的几个核心概念：

- **限流（Rate Limiting）**：限制单位时间内的请求数量，超出限制的请求被拒绝或排队。
- **熔断（Circuit Breaking）**：当下游服务异常率超过阈值时，自动断开调用，直接返回错误，避免浪费资源等待超时。
- **令牌桶（Token Bucket）**：限流算法之一，以固定速率向桶中放入令牌，请求需要消耗令牌，桶满时多余令牌丢弃。
- **漏桶（Leaky Bucket）**：限流算法之一，请求进入桶中排队，以固定速率处理。
- **滑动窗口**：限流算法之一，统计最近一个时间窗口内的请求数量。

## 快速上手

使用 Go 扩展库的令牌桶限流器：

```bash
go get golang.org/x/time/rate
```

```go
package main

import (
    "fmt"
    "golang.org/x/time/rate"
)

func main() {
    // 创建限流器：每秒产生 100 个令牌，桶容量 10
    limiter := rate.NewLimiter(100, 10)

    // 尝试获取令牌
    if limiter.Allow() {
        fmt.Println("请求通过")
    } else {
        fmt.Println("请求被限流")
    }
}
```

## 详细用法

### 1. 令牌桶限流（rate.Limiter）

```go
import "golang.org/x/time/rate"

// 创建限流器
// 参数1：每秒产生的令牌数（rate）
// 参数2：桶容量（burst），允许瞬间通过的最多请求数
limiter := rate.NewLimiter(100, 10)

// 方式1：Allow - 立即返回是否允许
if limiter.Allow() {
    // 处理请求
} else {
    // 返回 429 Too Many Requests
}

// 方式2：Wait - 阻塞等待直到获取令牌
err := limiter.Wait(context.Background())
if err != nil {
    // Context 被取消
}
// 处理请求

// 方式3：Reserve - 预留令牌，返回需要等待的时间
reservation := limiter.Reserve()
if !reservation.OK() {
    // 令牌数超过桶容量，无法满足
    return
}
time.Sleep(reservation.Delay()) // 等待预留的延迟时间
// 处理请求

// 动态调整速率
limiter.SetRate(200)    // 调整为每秒 200 个
limiter.SetBurst(20)    // 调整桶容量为 20
```

### 2. HTTP 中间件限流

将限流器集成到 HTTP 服务中：

```go
func RateLimitMiddleware(limiter *rate.Limiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if !limiter.Allow() {
                http.Error(w, "请求过于频繁，请稍后再试", http.StatusTooManyRequests)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

// 使用
limiter := rate.NewLimiter(100, 10)
handler := RateLimitMiddleware(limiter)(mux)
http.ListenAndServe(":8080", handler)
```

### 3. 按客户端限流

为每个客户端（IP 或用户 ID）维护独立的限流器：

```go
type IPRateLimiter struct {
    limiters sync.Map
    rate     rate.Limit
    burst    int
}

func NewIPRateLimiter(r rate.Limit, burst int) *IPRateLimiter {
    return &IPRateLimiter{rate: r, burst: burst}
}

func (l *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
    if limiter, ok := l.limiters.Load(ip); ok {
        return limiter.(*rate.Limiter)
    }
    limiter := rate.NewLimiter(l.rate, l.burst)
    l.limiters.Store(ip, limiter)
    return limiter
}

// 中间件
func (l *IPRateLimiter) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        if !l.GetLimiter(ip).Allow() {
            http.Error(w, "请求过于频繁", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

### 4. 滑动窗口限流

使用 Redis 实现分布式滑动窗口限流：

```go
func SlidingWindowLimit(rdb *redis.Client, key string, limit int, window time.Duration) (bool, error) {
    ctx := context.Background()
    now := time.Now().UnixNano()
    windowStart := now - window.Nanoseconds()

    pipe := rdb.Pipeline()
    // 移除窗口外的记录
    pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))
    // 添加当前请求
    pipe.ZAdd(ctx, key, redis.Z{Score: float64(now), Member: now})
    // 统计窗口内请求数
    countCmd := pipe.ZCard(ctx, key)
    // 设置过期时间
    pipe.Expire(ctx, key, window)

    _, err := pipe.Exec(ctx)
    if err != nil {
        return false, err
    }

    return countCmd.Val() <= int64(limit), nil
}
```

### 5. 熔断器

使用 `github.com/sony/gobreaker` 实现熔断：

```bash
go get github.com/sony/gobreaker
```

```go
import "github.com/sony/gobreaker"

// 创建熔断器
cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "order-service",
    MaxRequests: 5,                    // 半开状态下允许的测试请求数
    Interval:    60 * time.Second,     // 统计窗口
    Timeout:     30 * time.Second,     // 熔断后等待多久尝试恢复
    ReadyToTrip: func(counts gobreaker.Counts) bool {
        // 连续 5 次失败则熔断
        return counts.ConsecutiveFailures > 5
    },
})

// 使用熔断器包装调用
result, err := cb.Execute(func() (interface{}, error) {
    resp, err := http.Get("http://order-service/api/orders")
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    if resp.StatusCode >= 500 {
        return nil, fmt.Errorf("服务端错误: %d", resp.StatusCode)
    }
    return io.ReadAll(resp.Body), nil
})

if err != nil {
    // 熔断器打开时，err 为 gobreaker.ErrOpenCircuit
    if err == gobreaker.ErrOpenCircuit {
        fmt.Println("熔断器已打开，快速失败")
    }
}
```

### 6. 并发限流

使用信号量限制并发数：

```bash
go get golang.org/x/sync/semaphore
```

```go
import "golang.org/x/sync/semaphore"

// 最多 10 个并发
sem := semaphore.NewWeighted(10)

func handler(w http.ResponseWriter, r *http.Request) {
    // 获取信号量
    if err := sem.Acquire(r.Context(), 1); err != nil {
        http.Error(w, "服务器繁忙", http.StatusServiceUnavailable)
        return
    }
    defer sem.Release(1)

    // 处理请求
    processRequest(w, r)
}
```

## 常见场景

### 场景一：API 网关限流

```go
// 全局限流 + 按用户限流
globalLimiter := rate.NewLimiter(1000, 50)   // 全局每秒 1000
userLimiters := NewIPRateLimiter(10, 5)       // 每用户每秒 10

func GatewayMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 全局限流
        if !globalLimiter.Allow() {
            http.Error(w, "系统繁忙", http.StatusTooManyRequests)
            return
        }
        // 用户限流
        if !userLimiters.GetLimiter(r.RemoteAddr).Allow() {
            http.Error(w, "请求过于频繁", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

### 场景二：下游服务熔断保护

```go
var userCB *gobreaker.CircuitBreaker

func init() {
    userCB = gobreaker.NewCircuitBreaker(gobreaker.Settings{
        Name:    "user-service",
        Timeout: 30 * time.Second,
        ReadyToTrip: func(c gobreaker.Counts) bool {
            return c.ConsecutiveFailures > 3
        },
    })
}

func GetUser(ctx context.Context, id string) (*User, error) {
    result, err := userCB.Execute(func() (interface{}, error) {
        return userClient.Get(ctx, id)
    })
    if err != nil {
        return nil, err // 熔断时快速失败
    }
    return result.(*User), nil
}
```

## 注意事项与常见错误

1. **限流粒度选择**：全局限流保护系统，用户级限流防止单个用户滥用。两者通常组合使用。

2. **429 响应要包含重试信息**：返回 `Retry-After` 头，告诉客户端多久后可以重试：

```go
w.Header().Set("Retry-After", "1")
http.Error(w, "请求过于频繁", http.StatusTooManyRequests)
```

3. **限流器内存泄漏**：按客户端限流时，如果客户端数量无限增长，sync.Map 会持续膨胀。需要定期清理不活跃的限流器。

4. **分布式限流**：单机限流在多实例部署时无法全局生效。需要使用 Redis 等共享存储实现分布式限流。

5. **熔断器不是万能的**：熔断器适合保护下游服务调用，不适合保护内部逻辑。

6. **令牌桶 vs 漏桶**：令牌桶允许突发流量（burst），漏桶强制匀速。大多数场景用令牌桶更合适。

## 进阶用法

### 自适应限流

根据系统负载动态调整限流阈值：

```go
type AdaptiveLimiter struct {
    limiter *rate.Limiter
    mu      sync.Mutex
}

func (l *AdaptiveLimiter) Adjust(cpuUsage float64) {
    l.mu.Lock()
    defer l.mu.Unlock()

    // CPU 使用率低时提高限流阈值
    if cpuUsage < 0.5 {
        l.limiter.SetRate(l.limiter.Limit() * 1.1)
    }
    // CPU 使用率高时降低限流阈值
    if cpuUsage > 0.8 {
        l.limiter.SetRate(l.limiter.Limit() * 0.9)
    }
}
```

### 限流响应格式

返回标准的限流响应：

```go
func RateLimitResponse(w http.ResponseWriter, retryAfter int) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Retry-After", fmt.Sprintf("%d", retryAfter))
    w.WriteHeader(http.StatusTooManyRequests)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "error":       "too_many_requests",
        "message":     "请求过于频繁，请稍后再试",
        "retry_after": retryAfter,
    })
}
```
