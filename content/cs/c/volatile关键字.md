---
order: 106
title: volatile关键字
module: c
category: 'dev-lang'
difficulty: advanced
description: C语言volatile关键字作用与使用场景。
author: fanquanpp
updated: '2026-06-14'
related:
  - c/函数指针回调与跳转表
  - c/动态库与静态库
  - c/位域
  - c/文件IO操作
prerequisites:
  - c/概述
---

## 1. volatile 的作用

告诉编译器该变量可能被外部因素修改，禁止优化：

```c
// 无 volatile：编译器可能优化掉循环中的读取
int *p = (int*)0x1000;
while (*p) { /* 编译器可能只读一次 */ }

// 有 volatile：每次循环都重新读取
volatile int *p = (volatile int*)0x1000;
while (*p) { /* 每次都从内存读取 */ }
```

## 2. 使用场景

### 2.1 硬件寄存器

```c
volatile uint32_t *GPIO_REG = (volatile uint32_t *)0x40020000;
*GPIO_REG = 0x01;  // 写入硬件寄存器
```

### 2.2 中断服务程序共享变量

```c
volatile int flag = 0;

void ISR() {
    flag = 1;  // 中断中修改
}

int main() {
    while (!flag) { /* 等待中断 */ }
}
```

### 2.3 多线程共享变量

```c
volatile int shared = 0;
// 注意：volatile 不保证原子性！
// 多线程应使用 atomic 或锁
```

## 3. volatile 不保证原子性

```c
volatile int counter = 0;
counter++;  // 不是原子操作（读-改-写三步）
// 应使用 atomic_fetch_add
```
