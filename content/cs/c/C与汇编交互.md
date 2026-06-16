---
order: 75
title: C与汇编交互
module: c
category: C
difficulty: advanced
description: 内联汇编与外部汇编
author: fanquanpp
updated: '2026-06-14'
related:
  - c/跨平台编程
  - c/嵌入式C编程
  - c/数组详解
  - c/预处理器与宏
prerequisites:
  - c/概述
---

## 概述

在性能关键的场景（如操作系统内核、驱动程序、加密算法、性能优化）中，C语言可能无法直接利用处理器的特定指令。C与汇编的交互允许开发者在C代码中嵌入汇编指令，或调用外部汇编函数。GCC和Clang使用扩展内联汇编语法，MSVC使用 `__asm` 语法。

## 基础概念

### 为什么需要汇编交互

- 访问C语言无法直接使用的处理器指令（如 `cpuid`、`rdtsc`）
- 实现极致的性能优化（如SIMD指令）
- 编写操作系统内核中与硬件直接交互的代码
- 实现上下文切换、中断处理等底层操作

### 内联汇编 vs 外部汇编

| 方式     | 优点                                | 缺点               |
| -------- | ----------------------------------- | ------------------ |
| 内联汇编 | 与C代码混合，编译器可优化寄存器分配 | 语法复杂，不可移植 |
| 外部汇编 | 完全控制，独立编译                  | 调用约定需手动处理 |

### GCC 内联汇编语法

```c
__asm__ __volatile__ (
    "汇编指令模板"
    : 输出操作数列表    // 可选
    : 输入操作数列表    // 可选
    : 修改的寄存器列表  // 可选
);
```

## 快速上手

### 基本内联汇编

```c
#include <stdio.h>

int main(void) {
    int result;

    // 最简单的内联汇编：将42放入eax寄存器
    __asm__ (
        "movl $42, %0"   // 汇编指令
        : "=r"(result)    // 输出：将寄存器值存入result
    );

    printf("结果: %d\n", result); // 输出: 42
    return 0;
}
```

### 读取时间戳计数器

```c
#include <stdio.h>
#include <stdint.h>

// 使用 rdtsc 读取CPU时间戳
static inline uint64_t rdtsc(void) {
    unsigned int lo, hi;
    __asm__ __volatile__ (
        "rdtsc"           // 读取时间戳计数器
        : "=a"(lo), "=d"(hi)  // 低32位存入eax，高32位存入edx
    );
    return ((uint64_t)hi << 32) | lo;
}

int main(void) {
    uint64_t start = rdtsc();
    // 执行一些操作
    for (volatile int i = 0; i < 1000000; i++);
    uint64_t end = rdtsc();

    printf("耗时: %llu 个时钟周期\n", end - start);
    return 0;
}
```

## 详细用法

### 操作数约束

约束字符告诉编译器如何分配寄存器或内存：

| 约束 | 说明           |
| ---- | -------------- |
| `r`  | 通用寄存器     |
| `m`  | 内存操作数     |
| `i`  | 立即数         |
| `a`  | eax/rax 寄存器 |
| `b`  | ebx/rbx 寄存器 |
| `c`  | ecx/rcx 寄存器 |
| `d`  | edx/rdx 寄存器 |
| `S`  | esi/rsi 寄存器 |
| `D`  | edi/rdi 寄存器 |

### 输入和输出操作数

```c
#include <stdio.h>

int main(void) {
    int a = 10, b = 20, sum;

    // 加法：将a和b相加，结果存入sum
    __asm__ (
        "addl %2, %0"      // %0 += %2
        : "=r"(sum)         // 输出操作数 %0
        : "0"(a), "r"(b)   // 输入操作数 %1=a（与%0同寄存器）, %2=b
    );

    printf("sum = %d\n", sum); // 输出: 30
    return 0;
}
```

### 修改寄存器列表

告诉编译器哪些寄存器被汇编代码修改了：

```c
#include <stdio.h>

int main(void) {
    int result;
    __asm__ (
        "movl $1, %%eax\n\t"   // 使用 %% 引用寄存器名
        "movl $2, %%ebx\n\t"
        "addl %%ebx, %%eax\n\t"
        "movl %%eax, %0"
        : "=r"(result)
        :
        : "eax", "ebx"          // 告诉编译器eax和ebx被修改
    );

    printf("结果: %d\n", result); // 输出: 3
    return 0;
}
```

### **volatile** 的作用

`__volatile__` 告诉编译器不要优化掉这段汇编代码：

```c
// 不加 volatile：编译器可能认为这段汇编没有副作用而删除它
__asm__ ("nop");

// 加 volatile：确保汇编代码不被优化掉
__asm__ __volatile__ ("nop");

// 对于有副作用的汇编（如I/O操作），必须加 volatile
__asm__ __volatile__ ("outb %0, $0x60" : : "a"(data));
```

## 常见场景

### 场景一：CPUID 获取CPU信息

```c
#include <stdio.h>
#include <stdint.h>

// 执行 cpuid 指令
void cpuid(uint32_t leaf, uint32_t *eax, uint32_t *ebx,
           uint32_t *ecx, uint32_t *edx) {
    __asm__ __volatile__ (
        "cpuid"
        : "=a"(*eax), "=b"(*ebx), "=c"(*ecx), "=d"(*edx)
        : "a"(leaf)
    );
}

int main(void) {
    uint32_t eax, ebx, ecx, edx;

    // 获取厂商字符串
    cpuid(0, &eax, &ebx, &ecx, &edx);

    char vendor[13];
    *(uint32_t *)(vendor)     = ebx;
    *(uint32_t *)(vendor + 4) = edx;
    *(uint32_t *)(vendor + 8) = ecx;
    vendor[12] = '\0';

    printf("CPU厂商: %s\n", vendor);
    return 0;
}
```

### 场景二：原子比较交换

```c
#include <stdio.h>
#include <stdbool.h>

// 使用 cmpxchg 指令实现原子比较交换
bool atomic_cas(int *ptr, int expected, int desired) {
    bool result;
    __asm__ __volatile__ (
        "lock cmpxchgl %2, %1\n\t"
        "sete %0"
        : "=r"(result), "+m"(*ptr)
        : "r"(desired), "a"(expected)
        : "memory"
    );
    return result;
}

int main(void) {
    int value = 10;

    if (atomic_cas(&value, 10, 20)) {
        printf("交换成功: value = %d\n", value); // value = 20
    }

    if (!atomic_cas(&value, 10, 30)) {
        printf("交换失败: value 仍为 %d\n", value); // value = 20
    }

    return 0;
}
```

### 场景三：内存屏障

```c
#include <stdio.h>

// 编译器内存屏障：防止编译器重排序
#define compiler_barrier() __asm__ __volatile__("" ::: "memory")

// 处理器内存屏障（x86）
#define memory_barrier() __asm__ __volatile__("mfence" ::: "memory")

// 读内存屏障
#define read_barrier() __asm__ __volatile__("lfence" ::: "memory")

// 写内存屏障
#define write_barrier() __asm__ __volatile__("sfence" ::: "memory")

int data = 0;
int flag = 0;

void producer(void) {
    data = 42;
    write_barrier(); // 确保data的写入在flag之前完成
    flag = 1;
}

void consumer(void) {
    read_barrier(); // 确保在读取flag之后才读取data
    if (flag) {
        printf("data = %d\n", data); // 保证输出42
    }
}
```

## 注意事项

### 可移植性

内联汇编是编译器扩展，不同编译器语法不同：

```c
// GCC/Clang
__asm__ ("movl $1, %0" : "=r"(result));

// MSVC
__asm { mov eax, 1 }
// 或
__asm mov eax, 1
```

### 寄存器保存

在内联汇编中修改的寄存器必须在修改列表中声明，否则编译器可能使用同一寄存器存储其他变量，导致数据损坏。

### AT&T vs Intel 语法

GCC默认使用AT&T语法（源在左，目的在右），MSVC使用Intel语法（目的在左，源在右）：

```c
// AT&T 语法（GCC默认）
// movl 源, 目的
__asm__ ("movl $42, %%eax");

// Intel 语法（可通过 .intel_syntax 切换）
// mov 目的, 源
// mov eax, 42
```

## 进阶用法

### 调用外部汇编函数

```c
// main.c
#include <stdio.h>

// 声明外部汇编函数
extern int add_asm(int a, int b);

int main(void) {
    int result = add_asm(10, 20);
    printf("10 + 20 = %d\n", result);
    return 0;
}
```

```asm
# add_asm.s - x86_64 汇编文件
.globl add_asm
add_asm:
    movl %edi, %eax    # 第一个参数在 edi
    addl %esi, %eax    # 第二个参数在 esi，加到 eax
    ret                 # 返回值在 eax
```

编译和链接：

```bash
gcc -c add_asm.s -o add_asm.o
gcc main.c add_asm.o -o program
```

### SIMD 指令加速

```c
#include <stdio.h>
#include <stdint.h>

// 使用 SSE 指令加速数组求和
int sum_sse(const int *arr, int n) {
    int result = 0;

    // SSE 可以一次处理4个int
    int i = 0;
    int sse_sum[4] = {0, 0, 0, 0};

    for (; i + 3 < n; i += 4) {
        __asm__ __volatile__ (
            "movdqu %1, %%xmm0\n\t"    // 加载4个int到xmm0
            "movdqu %0, %%xmm1\n\t"    // 加载当前累加值到xmm1
            "paddd %%xmm0, %%xmm1\n\t" // 4路并行加法
            "movdqu %%xmm1, %0"         // 存回累加值
            : "+m"(sse_sum)
            : "m"(arr[i])
            : "xmm0", "xmm1", "memory"
        );
    }

    // 汇总SSE结果
    for (int j = 0; j < 4; j++) result += sse_sum[j];

    // 处理剩余元素
    for (; i < n; i++) result += arr[i];

    return result;
}

int main(void) {
    int arr[12] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    printf("总和: %d\n", sum_sse(arr, 12));
    return 0;
}
```

### 使用 C11 \_Generic 隐藏平台差异

```c
#include <stdio.h>
#include <stdint.h>

// 读取时间戳：不同架构使用不同指令
static inline uint64_t read_timestamp(void) {
#if defined(__x86_64__) || defined(__i386__)
    unsigned int lo, hi;
    __asm__ __volatile__("rdtsc" : "=a"(lo), "=d"(hi));
    return ((uint64_t)hi << 32) | lo;
#elif defined(__aarch64__)
    uint64_t val;
    __asm__ __volatile__("mrs %0, cntvct_el0" : "=r"(val));
    return val;
#else
    return 0; // 不支持的架构
#endif
}

int main(void) {
    uint64_t ts = read_timestamp();
    printf("时间戳: %llu\n", ts);
    return 0;
}
```
