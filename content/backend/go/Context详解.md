---
order: 54
title: Context详解
module: go
category: Go
difficulty: intermediate
description: context.Context与取消传播
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Channel原理
  - go/Goroutine调度
  - go/接口与类型断言
  - go/错误处理进阶
prerequisites:
  - go/概述与环境配置
---

## 1. 基本用法

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := fetchWithTimeout(ctx, url)
```

## 2. 传播取消

```go
func handler(ctx context.Context) {
  go func() {
    select {
    case <-ctx.Done():
      log.Println("Cancelled:", ctx.Err())
    case <-time.After(10 * time.Second):
      log.Println("Done")
    }
  }()
}
```
