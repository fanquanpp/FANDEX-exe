---
order: 80
title: Go与时间
module: go
category: Go
difficulty: beginner
description: time包详解
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与HTTP客户端
  - go/Go与信号处理
  - go/Go与正则表达式
  - go/Go与JSON
prerequisites:
  - go/概述与环境配置
---

## 概述

时间是程序中最常用的概念之一。无论是记录日志时间戳、设置超时、定时任务还是计算耗时，都需要使用时间相关的功能。Go 标准库的 `time` 包提供了完整的时间操作功能，包括获取当前时间、格式化、解析、定时器和计时器等。

## 基础概念

在开始编码之前，需要理解时间操作的几个核心概念：

- **Time 类型**：Go 中表示时间的核心类型，包含日期和时间信息。
- **Duration**：表示时间间隔，如 5 秒、100 毫秒。底层是 int64，单位为纳秒。
- **Location**：时区信息。Go 默认使用 UTC，可以通过 `LoadLocation` 加载其他时区。
- **Monotonic Clock**：单调时钟，不受系统时间调整影响，适合测量时间间隔。
- **格式化字符串**：Go 使用参考时间 `2006-01-02 15:04:05` 来定义格式，而非 YYYY-MM-DD。

## 快速上手

最常用的时间操作：

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 获取当前时间
    now := time.Now()
    fmt.Println("当前时间:", now)

    // 格式化时间
    fmt.Println("格式化:", now.Format("2006-01-02 15:04:05"))

    // 解析时间字符串
    t, _ := time.Parse("2006-01-02", "2026-06-14")
    fmt.Println("解析结果:", t)

    // 计算耗时
    start := time.Now()
    doWork()
    elapsed := time.Since(start)
    fmt.Println("耗时:", elapsed)
}
```

## 详细用法

### 1. 创建时间

```go
// 当前时间
now := time.Now()

// 指定日期和时间
date := time.Date(2026, 6, 14, 10, 30, 0, 0, time.Local)

// 从 Unix 时间戳创建
t1 := time.Unix(1718352000, 0)    // 秒
t2 := time.UnixMilli(1718352000000) // 毫秒
t3 := time.UnixMicro(1718352000000000) // 微秒
```

### 2. 时间格式化

Go 使用独特的参考时间格式 `2006-01-02 15:04:05 MST`：

```go
now := time.Now()

// 常用格式
now.Format("2006-01-02")           // 2026-06-14
now.Format("15:04:05")             // 10:30:00
now.Format("2006-01-02 15:04:05")  // 2026-06-14 10:30:00
now.Format("2006/01/02 15:04")     // 2026/06/14 10:30
now.Format(time.RFC3339)           // 2026-06-14T10:30:00+08:00
now.Format(time.RFC1123)           // Sat, 14 Jun 2026 10:30:00 CST

// 记忆方法：2006（年）01（月）02（日）15（时）04（分）05（秒）
// 对应：    1      2      3      4      5      6
```

### 3. 时间解析

```go
// 解析时间字符串（默认 UTC 时区）
t1, err := time.Parse("2006-01-02 15:04:05", "2026-06-14 10:30:00")

// 解析时指定时区
t2, err := time.ParseInLocation("2006-01-02 15:04:05", "2026-06-14 10:30:00", time.Local)

// 解析 RFC3339 格式
t3, err := time.Parse(time.RFC3339, "2026-06-14T10:30:00+08:00")

// 解析失败时 err 不为 nil
if err != nil {
    fmt.Println("时间格式不正确:", err)
}
```

### 4. 时间运算

```go
now := time.Now()

// 加减时间
tomorrow := now.Add(24 * time.Hour)
yesterday := now.Add(-24 * time.Hour)

// 加减日期（更精确，处理月末等边界情况）
inAMonth := now.AddDate(0, 1, 0)  // 加1个月
lastYear := now.AddDate(-1, 0, 0) // 减1年

// 计算时间差
diff := tomorrow.Sub(now) // 24h0m0s

// 判断时间先后
now.Before(tomorrow)  // true
now.After(yesterday)  // true
now.Equal(now)        // true
```

### 5. Duration 操作

```go
// 创建 Duration
d1 := 5 * time.Second
d2 := 100 * time.Millisecond
d3 := time.Duration(10) * time.Minute

// Duration 运算
total := d1 + d2 // 5.1秒

// 转换为各种单位
fmt.Println(d1.Seconds())       // 5
fmt.Println(d1.Milliseconds())  // 5000
fmt.Println(d1.Microseconds())  // 5000000
fmt.Println(d1.Nanoseconds())   // 5000000000
fmt.Println(d1.String())        // "5s"

// 四舍五入
d := 1*time.Hour + 30*time.Minute
d.Round(time.Hour)      // 2h（四舍五入到最近的小时）
d.Truncate(time.Hour)   // 1h（向下截断）
```

### 6. 定时器（Timer）

```go
// 创建一次性定时器
timer := time.NewTimer(5 * time.Second)
<-timer.C // 阻塞等待定时器触发
fmt.Println("5秒到了")

// 可取消的定时器
timer = time.NewTimer(10 * time.Second)
go func() {
    <-timer.C
    fmt.Println("10秒到了")
}()
timer.Stop() // 取消定时器

// time.After：简化版定时器
select {
case <-time.After(5 * time.Second):
    fmt.Println("超时")
case result := <-ch:
    fmt.Println("收到结果:", result)
}
```

### 7. 定时执行（Ticker）

```go
// 创建定时器，每秒触发一次
ticker := time.NewTicker(1 * time.Second)
defer ticker.Stop()

// 方式1：循环接收
for t := range ticker.C {
    fmt.Println("定时触发:", t.Format("15:04:05"))
}

// 方式2：在 select 中使用
for {
    select {
    case t := <-ticker.C:
        fmt.Println("定时触发:", t.Format("15:04:05"))
    case <-done:
        return
    }
}
```

### 8. 时区处理

```go
// 获取时区
localZone := time.Local           // 本地时区
utcZone := time.UTC               // UTC 时区

// 加载指定时区
shanghai, _ := time.LoadLocation("Asia/Shanghai")
newYork, _ := time.LoadLocation("America/New_York")

// 在指定时区创建时间
t := time.Date(2026, 6, 14, 10, 0, 0, 0, shanghai)

// 转换时区
tInNY := t.In(newYork) // 转换为纽约时间
fmt.Println("上海:", t.Format("15:04"))
fmt.Println("纽约:", tInNY.Format("15:04"))
```

### 9. 提取时间字段

```go
now := time.Now()
now.Year()        // 2026
now.Month()       // June
now.Day()         // 14
now.Hour()        // 10
now.Minute()      // 30
now.Second()      // 0
now.Weekday()     // Saturday
now.YearDay()     // 一年中的第几天
now.Unix()        // Unix 时间戳（秒）
now.UnixMilli()   // Unix 时间戳（毫秒）
now.Nanosecond()  // 纳秒部分
```

## 常见场景

### 场景一：超时控制

```go
// 使用 Context 超时
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := doSomething(ctx)

// 使用 select + time.After
select {
case result := <-ch:
    process(result)
case <-time.After(3 * time.Second):
    fmt.Println("操作超时")
}
```

### 场景二：定时任务

```go
func ScheduleTask(interval time.Duration, task func()) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for range ticker.C {
        task()
    }
}

// 每5分钟执行一次
ScheduleTask(5*time.Minute, func() {
    cleanupExpiredSessions()
})
```

### 场景三：性能计时

```go
func MeasureTime(name string, fn func()) {
    start := time.Now()
    fn()
    elapsed := time.Since(start)
    fmt.Printf("%s 耗时: %v\n", name, elapsed)
}

// 使用
MeasureTime("数据库查询", func() {
    db.Query("SELECT ...")
})
```

### 场景四：时间范围判断

```go
func IsWorkTime(t time.Time) bool {
    hour := t.Hour()
    weekday := t.Weekday()
    // 工作日 9:00-18:00
    return weekday >= time.Monday && weekday <= time.Friday && hour >= 9 && hour < 18
}
```

## 注意事项与常见错误

1. **格式化字符串不是 YYYY-MM-DD**：Go 使用 `2006-01-02 15:04:05` 作为格式参考。写成 `YYYY-MM-DD` 会得到错误结果。

2. **time.Parse 默认 UTC**：`time.Parse` 解析的时间默认是 UTC 时区。如果需要本地时区，使用 `time.ParseInLocation`。

3. **不要用整数比较时间**：比较时间应该用 `Before`、`After`、`Equal` 方法，不要转换为 Unix 时间戳比较。

4. **Duration 乘法注意类型**：`5 * time.Second` 可以，但 `n * time.Second`（n 是变量）不行。应该写 `time.Duration(n) * time.Second`。

5. **time.Sleep 不受 Context 控制**：`time.Sleep` 无法被取消。需要可取消的等待应使用 `select` + `time.After`。

6. **Timer 和 Ticker 必须 Stop**：不再使用时调用 `timer.Stop()` 和 `ticker.Stop()`，否则会泄漏。

7. **Sub 和 Add 的方向**：`t1.Sub(t2)` 得到 `t1 - t2`。`t.Add(d)` 得到 `t + d`。注意方向。

## 进阶用法

### 自定义定时调度

实现 cron 风格的定时任务：

```go
func ScheduleNext(hour, minute int) time.Duration {
    now := time.Now()
    next := time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())
    if next.Before(now) {
        next = next.Add(24 * time.Hour)
    }
    return next.Sub(now)
}

// 每天凌晨2点执行
duration := ScheduleNext(2, 0)
time.AfterFunc(duration, func() {
    runDailyTask()
    // 重新调度
    duration = ScheduleNext(2, 0)
})
```

### 单调时钟

Go 的 `time.Now()` 同时包含墙上时钟和单调时钟。`Sub` 操作使用单调时钟，不受系统时间调整影响：

```go
start := time.Now()
// 即使此时系统时间被修改，Since 的结果仍然正确
elapsed := time.Since(start)
```
