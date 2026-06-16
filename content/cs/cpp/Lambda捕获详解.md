---
order: 105
title: Lambda捕获详解
module: cpp
category: 'dev-lang'
difficulty: advanced
description: 'C++ Lambda捕获详解：值捕获、引用捕获、初始化捕获、*this。'
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/虚函数表与多态内存布局
  - cpp/智能指针循环引用
  - cpp/类型萃取与SFINAE
  - cpp/可变参数模板与折叠表达式
prerequisites:
  - cpp/概述与现代标准
---

## 概述

Lambda 表达式的捕获机制决定了 Lambda 函数体如何访问外部变量。捕获是 Lambda 最强大也最危险的特性：正确的捕获使代码简洁优雅，错误的捕获则导致悬空引用、意外修改等难以排查的 bug。理解每种捕获方式的语义和生命周期影响，是编写安全 Lambda 的前提。

C++ 标准在持续改进捕获机制：C++14 引入初始化捕获（移动捕获），C++17 引入 \*this 捕获，C++20 引入模板 Lambda，C++23 引入递归 Lambda（显式对象参数）。每一代标准都在解决前一代的痛点。

## 基础概念

### 捕获的本质

Lambda 捕获的本质是将外部变量"带入"Lambda 的闭包对象中。闭包对象是一个编译器生成的匿名类，捕获的变量成为该类的成员变量。值捕获相当于拷贝成员，引用捕获相当于引用成员。

### 捕获方式一览

| 捕获方式     | 语法         | 说明                      |
| ------------ | ------------ | ------------------------- |
| 值捕获       | `[x]`        | 拷贝 x 到闭包             |
| 引用捕获     | `[&x]`       | 闭包持有 x 的引用         |
| 全部值捕获   | `[=]`        | 拷贝所有使用的变量        |
| 全部引用捕获 | `[&]`        | 引用所有使用的变量        |
| 混合捕获     | `[=, &x]`    | 默认值捕获，x 引用捕获    |
| 初始化捕获   | `[p = expr]` | C++14，移动捕获或计算捕获 |
| this 捕获    | `[this]`     | 捕获当前对象的指针        |
| \*this 捕获  | `[*this]`    | C++17，拷贝当前对象       |

## 快速上手

### 基本捕获方式

```cpp
int x = 10;
int y = 20;

// 值捕获：拷贝 x 的值，Lambda 内修改不影响外部
auto f1 = [x]() { return x; };

// 引用捕获：持有 x 的引用，Lambda 内修改影响外部
auto f2 = [&x]() { return ++x; };

// 全部值捕获：拷贝所有使用的变量
auto f3 = [=]() { return x + y; };

// 全部引用捕获：引用所有使用的变量
auto f4 = [&]() { return x + y; };

// 混合捕获：x 值捕获，y 引用捕获
auto f5 = [x, &y]() { return x + y; };
```

### mutable 修改值捕获的变量

```cpp
int count = 0;

// 值捕获默认是 const 的，需要 mutable 才能修改
auto counter = [count]() mutable {
    return ++count;  // 修改的是闭包中的副本
};

std::cout << counter() << std::endl;  // 1
std::cout << counter() << std::endl;  // 2
std::cout << count << std::endl;      // 0（外部变量未改变）
```

## 详细用法

### 初始化捕获（C++14）

初始化捕获是最灵活的捕获方式，支持移动捕获和计算捕获：

```cpp
#include <memory>
#include <string>

// 移动捕获：将 unique_ptr 移入闭包
auto ptr = std::make_unique<int>(42);
auto f = [p = std::move(ptr)]() { return *p; };
// ptr 此后为 nullptr

// 计算捕获：在捕获时计算表达式
int x = 10;
auto g = [value = x * 2]() { return value; };  // value = 20

// 捕获字符串的副本
std::string name = "张三";
auto h = [n = std::move(name)]() { return n; };
// name 此后为空字符串
```

### this 捕获与 \*this 捕获

```cpp
#include <functional>

struct Worker {
    int id;
    std::string name;

    // [this] 捕获对象指针，Lambda 依赖对象生命周期
    auto getCallbackThis() {
        return [this]() { return id; };
        // 危险：如果 Worker 对象被销毁，this 变为悬空指针
    }

    // [*this] 捕获对象副本，Lambda 独立持有对象拷贝
    auto getCallbackCopy() {
        return [*this]() { return id; };
        // 安全：即使 Worker 对象被销毁，Lambda 仍持有副本
    }
};

// 典型陷阱：异步回调中使用 [this]
struct AsyncWorker {
    int data = 42;

    void startAsync() {
        // 危险：如果 AsyncWorker 在回调前被销毁，this 悬空
        std::thread([this]() {
            std::cout << data << std::endl;  // 可能崩溃
        }).detach();
    }

    void startAsyncSafe() {
        // 安全：拷贝对象到闭包中
        std::thread([*this]() {
            std::cout << data << std::endl;  // 安全
        }).detach();
    }
};
```

### 捕获与智能指针

```cpp
#include <memory>

class Resource {
public:
    void use() {}
};

// 通过 shared_ptr 捕获，延长资源生命周期
auto createCallback() {
    auto res = std::make_shared<Resource>();

    // 捕获 shared_ptr 的副本，引用计数 +1
    return [res]() {
        res->use();  // 安全：res 保持资源存活
    };
    // 离开作用域时，原始 res 析构，但闭包中的副本仍持有
}

// 通过 weak_ptr 捕获，避免循环引用
auto createWeakCallback(std::shared_ptr<Resource> res) {
    std::weak_ptr<Resource> weak = res;
    return [weak]() {
        if (auto locked = weak.lock()) {
            locked->use();  // 资源仍存活
        } else {
            // 资源已被释放
        }
    };
}
```

## 常见场景

### 回调函数中的捕获

```cpp
#include <vector>
#include <algorithm>
#include <functional>

// 事件处理器
class EventHandler {
    std::vector<std::function<void()>> handlers_;
public:
    void onEvent(std::function<void()> handler) {
        handlers_.push_back(std::move(handler));
    }

    void triggerAll() {
        for (auto& h : handlers_) h();
    }
};

// 安全地注册回调
void registerCallbacks(EventHandler& handler) {
    int threshold = 100;
    std::string message = "超过阈值";

    // 值捕获：安全，不依赖外部变量生命周期
    handler.onEvent([threshold, message]() {
        std::cout << message << ": " << threshold << std::endl;
    });
}
```

### 并行算法中的捕获

```cpp
#include <algorithm>
#include <vector>
#include <mutex>

// 并行处理中的线程安全捕获
void parallelProcess(std::vector<int>& data) {
    std::mutex mtx;
    int sum = 0;

    std::for_each(data.begin(), data.end(), [&mtx, &sum](int val) {
        std::lock_guard<std::mutex> lock(mtx);
        sum += val;
    });

    std::cout << "总和: " << sum << std::endl;
}
```

## 注意事项

- 引用捕获可能导致悬空引用，这是 Lambda 捕获中最常见的 bug 来源。如果 Lambda 的生命周期可能超过被引用变量的生命周期，不要使用引用捕获
- 值捕获的是创建 Lambda 时的变量快照，后续对原变量的修改不会反映到 Lambda 中
- 避免使用 `[=]` 和 `[&]` 的默认捕获，显式列出每个捕获的变量更安全、更清晰
- `[=]` 默认捕获在 C++20 中已弃用捕获 this 的隐式行为，应显式写 `[=, this]` 或 `[=, *this]`
- 在异步场景（线程、回调、定时器）中，优先使用值捕获或智能指针捕获
- `mutable` Lambda 的闭包对象不是 const 的，可以修改值捕获的变量，但修改的是副本

## 进阶用法

### C++23 显式对象参数（递归 Lambda）

```cpp
// C++23: 使用显式对象参数实现递归 Lambda
auto fibonacci = [](this auto self, int n) -> int {
    return n <= 1 ? n : self(n - 1) + self(n - 2);
};

std::cout << fibonacci(10) << std::endl;  // 55

// 显式对象参数也可以用于推导 this 类型
struct Processor {
    template<typename Self>
    auto process(this Self&& self, int data) {
        // self 的类型根据值类别推导
        return self.transform(data);
    }

    int transform(int x) { return x * 2; }
};
```

### 捕获包展开（C++20）

```cpp
#include <tuple>

// 在 Lambda 中展开参数包
template<typename... Args>
void forEach(Args... args) {
    // 使用初始化捕获展开参数包
    [... captures = std::move(args)]() {
        ((std::cout << captures << " "), ...);  // 折叠表达式
    }();
}

// 使用
forEach(1, "hello", 3.14);  // 输出: 1 hello 3.14
```

### 无状态 Lambda 与函数指针转换

```cpp
// 无捕获的 Lambda 可以隐式转换为函数指针
auto callback = [](int value) { return value * 2; };

// 转换为函数指针
int (*func_ptr)(int) = callback;

// 适用于 C 回调接口
void registerCallback(int (*cb)(int)) {
    std::cout << cb(21) << std::endl;
}

registerCallback([](int v) { return v * 2; });  // 输出 42
```
