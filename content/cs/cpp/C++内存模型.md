---
order: 71
title: C++内存模型
module: cpp
category: C++
difficulty: advanced
description: C++原子操作与内存序
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/设计模式与C++
  - cpp/面向对象进阶
  - cpp/C++工具链
  - cpp/C++测试框架
prerequisites:
  - cpp/概述与现代标准
---

## 概述

C++ 内存模型定义了多线程程序中内存访问的语义规则，是编写正确并发程序的基础。C++11 引入了标准化的内存模型，通过原子操作和内存序（Memory Order）机制，为开发者提供了精细控制指令重排和可见性的工具。理解内存模型是编写无数据竞争、高性能并发代码的关键。

内存模型解决的核心问题是：在多核处理器上，一个线程对共享变量的修改何时对其他线程可见。不同架构的处理器有不同的内存一致性模型（x86 是强排序的 TSO，ARM 是弱排序的），C++ 内存模型提供了跨平台的统一抽象。

## 基础概念

### 数据竞争与 happens-before

当两个线程并发访问同一内存位置，且至少一个是写操作时，如果没有同步关系，就构成数据竞争，导致未定义行为。happens-before 关系是判断操作顺序的核心准则：

- 同一线程内的操作按程序序 happens-before
- 互斥锁的解锁 happens-before 后续的加锁
- 原子写（release）happens-before 对应的原子读（acquire）
- happens-before 具有传递性

### 内存序层级

| 内存序    | 说明                             | 性能 |
| --------- | -------------------------------- | ---- |
| `relaxed` | 无顺序保证，仅保证原子性         | 最高 |
| `acquire` | 读操作，后续读写不能重排到此之前 | 较高 |
| `release` | 写操作，之前读写不能重排到此之后 | 较高 |
| `acq_rel` | 同时具有 acquire 和 release 语义 | 中等 |
| `seq_cst` | 顺序一致，全局总序（默认）       | 最低 |

## 快速上手

### 原子计数器

```cpp
#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

std::atomic<int> counter{0};

void increment(int times) {
    for (int i = 0; i < times; ++i) {
        counter.fetch_add(1, std::memory_order_relaxed);
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 8; ++i) {
        threads.emplace_back(increment, 100000);
    }
    for (auto& t : threads) t.join();

    std::cout << "计数器: " << counter.load() << std::endl;  // 800000
    return 0;
}
```

### 使用原子标志做简单锁

```cpp
#include <atomic>

class SpinLock {
    std::atomic_flag flag_ = ATOMIC_FLAG_INIT;
public:
    void lock() {
        // 自旋等待，直到成功获取锁
        while (flag_.test_and_set(std::memory_order_acquire)) {
            // 可以加入退避策略减少总线争用
        }
    }
    void unlock() {
        flag_.clear(std::memory_order_release);
    }
};
```

## 详细用法

### relaxed -- 仅保证原子性

```cpp
#include <atomic>

std::atomic<int> counter{0};

// relaxed 不保证操作顺序，仅保证读写的原子性
// 适用于不需要同步的场景，如统计计数
counter.fetch_add(1, std::memory_order_relaxed);
int val = counter.load(std::memory_order_relaxed);

// 注意：relaxed 不保证其他变量的可见性
std::atomic<bool> ready{false};
int data = 0;

// 线程 A
data = 42;
ready.store(true, std::memory_order_relaxed);  // 危险！data 可能对其他线程不可见

// 线程 B
if (ready.load(std::memory_order_relaxed)) {
    // 不能保证看到 data == 42
}
```

### acquire/release -- 生产者-消费者同步

```cpp
#include <atomic>
#include <string>

std::atomic<bool> ready{false};
std::string shared_data;

// 生产者线程
void producer() {
    shared_data = "来自生产者的消息";
    // release 保证之前的写操作对 acquire 的读者可见
    ready.store(true, std::memory_order_release);
}

// 消费者线程
void consumer() {
    // acquire 保证之后的读操作不会重排到 load 之前
    while (!ready.load(std::memory_order_acquire)) {
        // 等待...
    }
    // 此时 shared_data 一定可见
    std::cout << shared_data << std::endl;
}
```

### acq_rel -- 读写双向同步

```cpp
#include <atomic>

// 适用于既需要读取之前状态又需要写入新状态的场景
std::atomic<int> sync_flag{0};

void synchronizedUpdate(int value) {
    // acq_rel 同时具有 acquire 和 release 语义
    // 读取旧值时保证看到之前的修改，写入新值时保证之前的修改可见
    int old = sync_flag.fetch_add(value, std::memory_order_acq_rel);
    // old 是之前的值，新值 = old + value
}
```

### seq_cst -- 顺序一致性

```cpp
#include <atomic>
#include <thread>
#include <assert>

std::atomic<bool> x{false}, y{false};
int z = 0;

// seq_cst 保证所有线程看到的操作顺序一致
// 避免了弱排序模型下可能出现的反直觉结果

void write_x() {
    x.store(true, std::memory_order_seq_cst);
}

void write_y() {
    y.store(true, std::memory_order_seq_cst);
}

void read_x_then_y() {
    while (!x.load(std::memory_order_seq_cst)) {}
    if (y.load(std::memory_order_seq_cst)) { ++z; }
}

void read_y_then_x() {
    while (!y.load(std::memory_order_seq_cst)) {}
    if (x.load(std::memory_order_seq_cst)) { ++z; }
}

// z 不可能为 0（seq_cst 保证）
```

## 常见场景

### 双重检查锁定（DCLP）

```cpp
#include <atomic>
#include <mutex>

class Singleton {
    static std::atomic<Singleton*> instance_;
    static std::mutex mtx_;

    Singleton() = default;

public:
    static Singleton* getInstance() {
        Singleton* tmp = instance_.load(std::memory_order_acquire);
        if (tmp == nullptr) {
            std::lock_guard<std::mutex> lock(mtx_);
            tmp = instance_.load(std::memory_order_relaxed);
            if (tmp == nullptr) {
                tmp = new Singleton();
                instance_.store(tmp, std::memory_order_release);
            }
        }
        return tmp;
    }
};

std::atomic<Singleton*> Singleton::instance_{nullptr};
std::mutex Singleton::mtx_;
```

### 无锁队列（单生产者单消费者）

```cpp
#include <atomic>
#include <optional>

template<typename T, size_t Capacity>
class SPSCQueue {
    alignas(64) std::atomic<size_t> head_{0};  // 避免伪共享
    alignas(64) std::atomic<size_t> tail_{0};
    T buffer_[Capacity];

public:
    bool push(const T& item) {
        size_t tail = tail_.load(std::memory_order_relaxed);
        size_t next_tail = (tail + 1) % Capacity;
        if (next_tail == head_.load(std::memory_order_acquire)) {
            return false;  // 队列已满
        }
        buffer_[tail] = item;
        tail_.store(next_tail, std::memory_order_release);
        return true;
    }

    std::optional<T> pop() {
        size_t head = head_.load(std::memory_order_relaxed);
        if (head == tail_.load(std::memory_order_acquire)) {
            return std::nullopt;  // 队列为空
        }
        T item = buffer_[head];
        head_.store((head + 1) % Capacity, std::memory_order_release);
        return item;
    }
};
```

## 注意事项

- 除非有明确的性能需求，否则使用默认的 `seq_cst`，错误的内存序选择比性能问题更危险
- `relaxed` 仅保证单变量的原子性，不提供任何同步语义，不要用它来同步其他变量的访问
- 避免在循环中使用 `seq_cst` 的 compare_exchange，通常 `acq_rel` 就足够
- 注意伪共享（False Sharing）问题，频繁修改的原子变量应避免位于同一缓存行，可使用 `alignas(64)` 对齐
- 原子操作不是锁，不能替代互斥量处理复杂的临界区逻辑
- `std::atomic` 不保证是 lock-free 的，可通过 `is_lock_free()` 检查，性能关键路径应使用 `is_always_lock_free` 确认

## 进阶用法

### Compare-Exchange 无锁算法

```cpp
#include <atomic>

// 无锁栈的节点
template<typename T>
struct Node {
    T data;
    Node* next;
};

template<typename T>
class LockFreeStack {
    std::atomic<Node<T>*> head_{nullptr};

public:
    void push(const T& value) {
        Node<T>* new_node = new Node<T>{value, nullptr};
        // 循环直到成功将新节点设为头节点
        new_node->next = head_.load(std::memory_order_relaxed);
        while (!head_.compare_exchange_weak(
            new_node->next,        // 期望值（会被更新为当前值）
            new_node,              // 欲写入的新值
            std::memory_order_release,
            std::memory_order_relaxed))
        {
            // CAS 失败，new_node->next 已被自动更新，重试即可
        }
    }
};
```

### 等待与通知机制（C++20）

```cpp
#include <atomic>
#include <thread>

std::atomic<int> signal{0};

// 等待方
void waiter() {
    // 阻塞等待直到 signal 的值发生变化
    signal.wait(0, std::memory_order_acquire);
    std::cout << "收到信号: " << signal.load() << std::endl;
}

// 通知方
void notifier() {
    signal.store(1, std::memory_order_release);
    signal.notify_one();  // 唤醒一个等待线程
    // signal.notify_all();  // 唤醒所有等待线程
}
```

### 内存屏障与 fence

```cpp
#include <atomic>

int data1 = 0, data2 = 0;
std::atomic<bool> flag1{false}, flag2{false};

// 使用 fence 实现更灵活的同步
void writer() {
    data1 = 100;
    data2 = 200;
    // fence 之前的写操作不会被重排到 fence 之后
    std::atomic_thread_fence(std::memory_order_release);
    flag1.store(true, std::memory_order_relaxed);
}

void reader() {
    while (!flag1.load(std::memory_order_relaxed)) {}
    // fence 之后的读操作不会被重排到 fence 之前
    std::atomic_thread_fence(std::memory_order_acquire);
    // 此时 data1 和 data2 一定可见
    std::cout << data1 << ", " << data2 << std::endl;
}
```
