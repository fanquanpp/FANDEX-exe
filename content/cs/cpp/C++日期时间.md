---
order: 87
title: C++日期时间
module: cpp
category: C++
difficulty: intermediate
description: chrono与日期时间处理
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/智能指针
  - cpp/C++正则表达式
  - cpp/C++格式化输出
  - cpp/C++26与最新标准
prerequisites:
  - cpp/概述与现代标准
---

## 概述

C++ 的日期时间处理由 `<chrono>` 库承担，从 C++11 引入基础的时间点和时长，到 C++20 大幅扩展了日历和时区支持。chrono 库的设计目标是类型安全和编译期检查：不同单位的时间量是不同的类型，混淆秒和毫秒会在编译期报错而非运行时出错。

C++20 的日历扩展使得日期计算变得直观，不再需要手动处理闰年、月份天数等细节。时区支持则让跨地域的时间处理有了标准方案。

## 基础概念

### 时钟类型

| 时钟                    | 说明                                 | 适用场景         |
| ----------------------- | ------------------------------------ | ---------------- |
| `system_clock`          | 系统墙钟时间，可被调整               | 获取当前日期时间 |
| `steady_clock`          | 单调递增时钟，不会被调整             | 测量时间间隔     |
| `high_resolution_clock` | 最高精度时钟（可能是上述两者的别名） | 精确计时         |

### 时间点与时长

- **时长（Duration）**：表示时间间隔，如 3 秒、100 毫秒
- **时间点（Time Point）**：表示某个时刻，如 2026 年 6 月 14 日 10:30:00

## 快速上手

### 计时测量

```cpp
#include <chrono>
#include <iostream>

int main() {
    using namespace std::chrono;

    // 使用 steady_clock 测量代码执行时间
    auto start = steady_clock::now();

    // 模拟耗时操作
    for (volatile int i = 0; i < 1000000; ++i) {}

    auto end = steady_clock::now();

    // 转换为毫秒
    auto duration_ms = duration_cast<milliseconds>(end - start);
    std::cout << "耗时: " << duration_ms.count() << "ms" << std::endl;

    // 转换为微秒
    auto duration_us = duration_cast<microseconds>(end - start);
    std::cout << "耗时: " << duration_us.count() << "us" << std::endl;
    return 0;
}
```

### 时长运算

```cpp
#include <chrono>

using namespace std::chrono;

// 创建不同单位的时长
auto sec = 5s;           // 5 秒
auto ms = 500ms;         // 500 毫秒
auto us = 1000us;        // 1000 微秒
auto min = 3min;         // 3 分钟
auto hr = 2h;            // 2 小时

// 时长运算
auto total = 1h + 30min;  // 1 小时 30 分
auto diff = 5s - 500ms;   // 4.5 秒

// 时长比较
if (1s > 500ms) {
    std::cout << "1秒大于500毫秒" << std::endl;
}

// 获取数值
int count = sec.count();  // 5
```

## 详细用法

### C++20 日历类型

```cpp
#include <chrono>
#include <iostream>

using namespace std::chrono;

int main() {
    // 创建日期
    auto today = year_month_day{2026y, June, 14d};
    auto birthday = 2000y / January / 15;

    // 获取日期的各个部分
    auto y = today.year();     // 2026
    auto m = today.month();    // June
    auto d = today.day();      // 14

    // 日期运算
    auto tomorrow = today + days{1};
    auto next_week = today + weeks{1};
    auto next_month = today + months{1};
    auto next_year = today + years{1};

    // 日期比较
    if (today > birthday) {
        std::cout << "今天在生日之后" << std::endl;
    }
    return 0;
}
```

### 获取当前时间

```cpp
#include <chrono>
#include <iostream>

using namespace std::chrono;

int main() {
    // 获取当前系统时间
    auto now = system_clock::now();

    // 转换为 time_t 进行格式化
    auto time_t_now = system_clock::to_time_t(now);
    std::cout << "当前时间: " << std::ctime(&time_t_now);

    // C++20: 转换为日历日期
    auto today = floor<days>(now);
    year_month_day ymd{today};
    std::cout << "日期: " << int(ymd.year()) << "-"
              << unsigned(ymd.month()) << "-"
              << unsigned(ymd.day()) << std::endl;

    // 获取当天的时间部分
    hh_mm_ss time_of_day{now - today};
    std::cout << "时间: " << time_of_day.hours().count() << ":"
              << time_of_day.minutes().count() << ":"
              << time_of_day.seconds().count() << std::endl;
    return 0;
}
```

### 自定义时长类型

```cpp
#include <chrono>
#include <iostream>

// 定义帧率相关的时长类型
using frames = std::chrono::duration<double, std::ratio<1, 60>>;  // 60 FPS

int main() {
    // 1 秒等于 60 帧
    frames f = std::chrono::seconds{1};
    std::cout << "1秒 = " << f.count() << "帧" << std::endl;  // 60

    // 帧转秒
    auto sec = std::chrono::duration_cast<std::chrono::milliseconds>(frames{16});
    std::cout << "16帧 = " << sec.count() << "ms" << std::endl;  // 约 266ms
    return 0;
}
```

## 常见场景

### 超时控制

```cpp
#include <chrono>
#include <thread>
#include <future>
#include <iostream>

template<typename F>
auto withTimeout(F&& func, std::chrono::milliseconds timeout)
    -> std::optional<std::invoke_result_t<F>>
{
    auto future = std::async(std::launch::async, std::forward<F>(func));
    if (future.wait_for(timeout) == std::future_status::ready) {
        return future.get();
    }
    return std::nullopt;  // 超时
}

// 使用
auto result = withTimeout([]() {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 42;
}, std::chrono::seconds(1));

if (result) {
    std::cout << "结果: " << *result << std::endl;
} else {
    std::cout << "操作超时" << std::endl;
}
```

### 定时任务

```cpp
#include <chrono>
#include <thread>
#include <functional>

class Timer {
    std::atomic<bool> running_{false};
public:
    void setInterval(std::chrono::milliseconds interval,
                     std::function<void()> callback) {
        running_ = true;
        std::thread([this, interval, callback]() {
            while (running_) {
                auto next = std::chrono::steady_clock::now() + interval;
                callback();
                std::this_thread::sleep_until(next);
            }
        }).detach();
    }

    void stop() { running_ = false; }
};
```

## 注意事项

- 测量时间间隔应使用 `steady_clock` 而非 `system_clock`，因为 `system_clock` 可能被系统时间调整影响
- `duration_cast` 会截断而非四舍五入，如 `duration_cast<seconds>(1500ms)` 结果为 1 秒而非 2 秒
- C++20 日历功能需要编译器支持，GCC 12+ 和 MSVC 19.29+ 提供了较好的支持
- `system_clock::now()` 返回的是 UTC 时间，本地时间转换需要 C++20 的时区支持或使用 C 函数
- 避免在紧凑循环中频繁调用 `system_clock::now()`，某些系统调用开销较大
- 使用字面量后缀（`s`、`ms`、`h`、`min`）时需要 `using namespace std::chrono`

## 进阶用法

### C++20 时区支持

```cpp
#include <chrono>
#include <iostream>

using namespace std::chrono;

int main() {
    // 获取当前时间并转换时区
    auto now = system_clock::now();

    // 转换为上海时间
    auto shanghai = zoned_time{"Asia/Shanghai", now};
    std::cout << "上海时间: " << shanghai << std::endl;

    // 转换为纽约时间
    auto new_york = zoned_time{"America/New_York", now};
    std::cout << "纽约时间: " << new_york << std::endl;

    // 获取时区信息
    auto tz = locate_zone("Asia/Shanghai");
    auto info = tz->get_info(now);
    std::cout << "UTC偏移: " << info.offset.count() << "秒" << std::endl;
    return 0;
}
```

### 日期范围与迭代

```cpp
#include <chrono>
#include <iostream>

using namespace std::chrono;

// 遍历两个日期之间的所有天
void printDateRange(year_month_day start, year_month_day end) {
    for (auto day = sys_days{start}; day <= sys_days{end}; day += days{1}) {
        year_month_day ymd{day};
        std::cout << int(ymd.year()) << "-"
                  << unsigned(ymd.month()) << "-"
                  << unsigned(ymd.day()) << std::endl;
    }
}

// 计算两个日期之间的天数
int daysBetween(year_month_day start, year_month_day end) {
    return (sys_days{end} - sys_days{start}).count();
}
```

### 高精度计时器

```cpp
#include <chrono>
#include <iostream>

class ScopedTimer {
    using Clock = std::chrono::steady_clock;
    std::string label_;
    Clock::time_point start_;
public:
    explicit ScopedTimer(std::string label = "")
        : label_(std::move(label)), start_(Clock::now()) {}

    ~ScopedTimer() {
        auto end = Clock::now();
        auto ms = std::chrono::duration_cast<std::chrono::microseconds>(end - start_);
        std::cout << "[" << label_ << "] 耗时: " << ms.count() << "us" << std::endl;
    }

    // 禁止拷贝和移动
    ScopedTimer(const ScopedTimer&) = delete;
    ScopedTimer& operator=(const ScopedTimer&) = delete;
};

// 使用 RAII 自动计时
void expensiveOperation() {
    ScopedTimer timer("expensiveOperation");
    // ... 操作代码
}  // 析构时自动输出耗时
```
