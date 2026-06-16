---
order: 59
title: RAII与资源管理
module: cpp
category: C++
difficulty: intermediate
description: 资源获取即初始化模式
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++20模块
  - cpp/C++23与C++26新特性
  - cpp/运算符重载
  - cpp/面向对象基础
prerequisites:
  - cpp/概述与现代标准
---

## 概述

RAII（Resource Acquisition Is Initialization，资源获取即初始化）是 C++ 最核心的编程范式之一。其核心思想是：将资源的生命周期绑定到对象的生命周期，通过构造函数获取资源，通过析构函数释放资源。由于 C++ 保证了栈对象离开作用域时析构函数必定被调用，RAII 确保了资源在任何执行路径（包括异常）下都能被正确释放。

RAII 是 C++ 区别于其他语言的重要特性。在 Java、C# 等依赖垃圾回收的语言中，非内存资源（文件句柄、网络连接、数据库连接等）需要手动关闭或使用 try-with-resources 语法。而在 C++ 中，RAII 让资源管理自动化且异常安全。

## 基础概念

### RAII 的三要素

1. **获取资源**：在构造函数中获取资源，如果获取失败则抛出异常
2. **释放资源**：在析构函数中释放资源，保证任何退出路径都能执行
3. **禁止或正确实现拷贝/移动**：资源通常是不可拷贝的，应删除拷贝操作或实现移动语义

### 资源的类型

| 资源类型 | 示例           | 获取方式  | 释放方式     |
| -------- | -------------- | --------- | ------------ |
| 内存     | 动态分配的对象 | new       | delete       |
| 文件     | 文件句柄       | fopen     | fclose       |
| 锁       | 互斥量         | lock      | unlock       |
| 网络     | Socket         | socket    | close        |
| 数据库   | 连接           | connect   | disconnect   |
| GDI      | 绘图对象       | CreatePen | DeleteObject |

## 快速上手

### 手动 RAII 封装

```cpp
#include <cstdio>
#include <stdexcept>

class FileHandle {
    FILE* file_;
public:
    // 构造时获取资源
    FileHandle(const char* path, const char* mode)
        : file_(std::fopen(path, mode)) {
        if (!file_) {
            throw std::runtime_error("无法打开文件");
        }
    }

    // 析构时释放资源
    ~FileHandle() {
        if (file_) std::fclose(file_);
    }

    // 禁止拷贝（文件句柄不可共享）
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    // 允许移动（转移文件句柄所有权）
    FileHandle(FileHandle&& other) noexcept
        : file_(other.file_) {
        other.file_ = nullptr;
    }

    FileHandle& operator=(FileHandle&& other) noexcept {
        if (this != &other) {
            if (file_) std::fclose(file_);
            file_ = other.file_;
            other.file_ = nullptr;
        }
        return *this;
    }

    // 提供访问接口
    FILE* get() const { return file_; }
};

// 使用
void processFile() {
    FileHandle file("data.txt", "r");
    // 使用 file.get() 进行操作
    // 离开作用域时自动关闭文件，即使抛出异常
}
```

### 标准库 RAII 类

| 类                   | 管理的资源 | 说明                  |
| -------------------- | ---------- | --------------------- |
| `std::string`        | 字符缓冲区 | 自动管理内存          |
| `std::vector`        | 动态数组   | 自动管理内存          |
| `std::unique_ptr`    | 堆对象     | 独占所有权            |
| `std::shared_ptr`    | 共享堆对象 | 引用计数共享所有权    |
| `std::lock_guard`    | 互斥锁     | 作用域内自动加锁/解锁 |
| `std::unique_lock`   | 互斥锁     | 更灵活的锁管理        |
| `std::fstream`       | 文件       | 自动关闭文件          |
| `std::scoped_thread` | 线程       | 析构时自动 join       |

## 详细用法

### 使用 std::lock_guard 管理锁

```cpp
#include <mutex>
#include <vector>

class ThreadSafeStack {
    std::vector<int> data_;
    std::mutex mtx_;

public:
    void push(int value) {
        std::lock_guard<std::mutex> lock(mtx_);  // 加锁
        data_.push_back(value);
        // lock 析构时自动解锁，即使 push_back 抛出异常
    }

    int pop() {
        std::lock_guard<std::mutex> lock(mtx_);  // 加锁
        if (data_.empty()) {
            throw std::runtime_error("栈为空");
        }
        int value = data_.back();
        data_.pop_back();
        return value;
        // lock 析构时自动解锁
    }
};
```

### 使用 std::unique_ptr 管理动态内存

```cpp
#include <memory>

class Widget {
public:
    void doWork() {}
};

// 工厂函数返回 unique_ptr
std::unique_ptr<Widget> createWidget() {
    return std::make_unique<Widget>();
}

void useWidget() {
    auto widget = createWidget();
    widget->doWork();
    // 离开作用域时自动 delete，无需手动释放
}
```

### 自定义 RAII 网络连接

```cpp
#include <stdexcept>

// 模拟网络连接
class NetworkConnection {
    int socket_;
public:
    NetworkConnection(const std::string& host, int port) {
        // 模拟连接
        socket_ = port;  // 简化示例
        if (socket_ < 0) {
            throw std::runtime_error("连接失败");
        }
    }

    ~NetworkConnection() {
        if (socket_ >= 0) {
            // 关闭连接
            std::cout << "关闭连接" << std::endl;
        }
    }

    // 禁止拷贝
    NetworkConnection(const NetworkConnection&) = delete;
    NetworkConnection& operator=(const NetworkConnection&) = delete;

    // 允许移动
    NetworkConnection(NetworkConnection&& other) noexcept
        : socket_(other.socket_) {
        other.socket_ = -1;
    }

    void send(const std::string& data) {
        std::cout << "发送: " << data << std::endl;
    }

    std::string receive() {
        return "响应数据";
    }
};
```

## 常见场景

### 数据库事务 RAII

```cpp
class Transaction {
    Database& db_;
    bool committed_ = false;
public:
    explicit Transaction(Database& db) : db_(db) {
        db_.beginTransaction();  // 开始事务
    }

    ~Transaction() {
        if (!committed_) {
            db_.rollback();  // 未提交则回滚
        }
    }

    void commit() {
        db_.commit();
        committed_ = true;
    }

    // 禁止拷贝和移动
    Transaction(const Transaction&) = delete;
    Transaction& operator=(const Transaction&) = delete;
};

// 使用
void updateUser(Database& db) {
    Transaction txn(db);  // 自动开始事务
    db.execute("UPDATE users SET name='张三' WHERE id=1");
    db.execute("UPDATE logs SET updated=NOW()");
    txn.commit();  // 提交事务
    // 如果中途抛出异常，析构函数自动回滚
}
```

### GDI 资源管理（Windows）

```cpp
#include <windows.h>

class ScopedPen {
    HPEN pen_;
    HPEN oldPen_;
    HDC hdc_;
public:
    ScopedPen(HDC hdc, int style, int width, COLORREF color)
        : hdc_(hdc) {
        pen_ = CreatePen(style, width, color);
        oldPen_ = (HPEN)SelectObject(hdc_, pen_);
    }

    ~ScopedPen() {
        SelectObject(hdc_, oldPen_);  // 恢复旧画笔
        DeleteObject(pen_);           // 删除新画笔
    }

    ScopedPen(const ScopedPen&) = delete;
    ScopedPen& operator=(const ScopedPen&) = delete;
};

// 使用
void drawLine(HDC hdc) {
    ScopedPen pen(hdc, PS_SOLID, 2, RGB(255, 0, 0));
    MoveToEx(hdc, 10, 10, nullptr);
    LineTo(hdc, 100, 100);
    // 离开作用域自动清理 GDI 资源
}
```

## 注意事项

- RAII 类必须正确处理拷贝和移动语义，不可拷贝的资源应使用 `= delete` 禁止拷贝
- 析构函数不应抛出异常，如果释放资源可能失败，应捕获异常并记录日志
- 移动操作必须将源对象置于有效的"空"状态，避免析构时重复释放
- 优先使用标准库的 RAII 类（unique_ptr、lock_guard 等），而非手动实现
- 避免在构造函数中获取多个资源，如果第二个资源获取失败，第一个资源可能泄漏；应使用成员对象的 RAII 分别管理

## 进阶用法

### scope_guard 通用资源守卫

```cpp
#include <functional>
#include <iostream>

// 通用的作用域守卫
class ScopeGuard {
    std::function<void()> cleanup_;
    bool active_ = true;
public:
    explicit ScopeGuard(std::function<void()> cleanup)
        : cleanup_(std::move(cleanup)) {}

    ~ScopeGuard() {
        if (active_) cleanup_();
    }

    void dismiss() { active_ = false; }  // 取消清理

    ScopeGuard(ScopeGuard&& other) noexcept
        : cleanup_(std::move(other.cleanup_)), active_(other.active_) {
        other.active_ = false;
    }

    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;
};

// 使用宏简化
#define SCOPE_GUARD(name, ...) \
    ScopeGuard name([&]() { __VA_ARGS__; })

// 使用示例
void complexOperation() {
    auto* buffer = malloc(1024);
    SCOPE_GUARD(guard, free(buffer););  // 确保释放

    auto* conn = openConnection();
    SCOPE_GUARD(connGuard, closeConnection(conn););  // 确保关闭

    // 如果操作成功，可以取消清理
    // guard.dismiss();
}
```

### 使用 unique_ptr 自定义删除器

```cpp
#include <memory>
#include <cstdio>

// 自定义删除器管理 FILE*
auto file_closer = [](FILE* f) {
    if (f) {
        std::fclose(f);
        std::cout << "文件已关闭" << std::endl;
    }
};

using unique_file = std::unique_ptr<FILE, decltype(file_closer)>;

unique_file openFile(const char* path, const char* mode) {
    FILE* f = std::fopen(path, mode);
    if (!f) throw std::runtime_error("无法打开文件");
    return unique_file(f, file_closer);
}

// 使用
void processFile() {
    auto file = openFile("data.txt", "r");
    // 使用 file.get() 读取文件
    // 离开作用域时自动关闭
}
```
