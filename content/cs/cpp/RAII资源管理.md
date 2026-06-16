---
order: 100
title: RAII资源管理
module: cpp
category: 'dev-lang'
difficulty: advanced
description: 'C++ RAII资源管理详解：智能指针、锁守卫与确定性析构。'
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/STL容器与迭代器
  - cpp/并发编程
  - cpp/STL算法与函数对象
  - cpp/移动语义详解
prerequisites:
  - cpp/概述与现代标准
---

## 1. RAII 原则

RAII（Resource Acquisition Is Initialization）：资源获取即初始化，资源释放即析构。

```cpp
class FileHandle {
    FILE* file_;
public:
    FileHandle(const char* path, const char* mode)
        : file_(fopen(path, mode)) {
        if (!file_) throw std::runtime_error("Failed to open file");
    }
    ~FileHandle() { fclose(file_); }

    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    FILE* get() { return file_; }
};
```

## 2. 智能指针

```cpp
// unique_ptr：独占所有权
auto p1 = std::make_unique<int>(42);

// shared_ptr：共享所有权（引用计数）
auto p2 = std::make_shared<int>(42);

// weak_ptr：不增加引用计数
std::weak_ptr<int> wp = p2;
```

## 3. 锁守卫

```cpp
std::mutex mtx;

void safeOperation() {
    std::lock_guard<std::mutex> lock(mtx);
    // 临界区代码
    // 离开作用域自动 unlock
}

// 或使用 unique_lock（更灵活）
void flexibleOperation() {
    std::unique_lock<std::mutex> lock(mtx);
    // 可以手动 unlock/lock
    lock.unlock();
    lock.lock();
}
```

## 4. RAII 的优势

- 异常安全：即使抛出异常，析构函数也会执行
- 避免忘记释放资源
- 代码更简洁，无需手动管理
