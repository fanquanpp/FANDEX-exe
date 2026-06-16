---
order: 51
title: unsafe与指针
module: go
category: Go
difficulty: advanced
description: unsafe包与指针运算
author: fanquanpp
updated: '2026-06-14'
related:
  - go/反射
  - go/内存对齐
  - go/Go与CGO
  - go/Go与性能分析
prerequisites:
  - go/概述与环境配置
---

## 概述

Go 的 `unsafe` 包提供了绕过 Go 类型系统和内存安全检查的能力。它允许进行指针运算、类型转换和内存操作。虽然名为"unsafe"（不安全），但在某些底层编程场景中是必需的，如与 C 代码交互、高性能序列化、内存池实现等。使用 unsafe 需要格外小心，因为它破坏了 Go 的内存安全保证。

## 基础概念

在开始编码之前，需要理解 unsafe 的几个核心概念：

- **unsafe.Pointer**：通用指针类型，可以与任意指针类型互相转换。是其他指针类型之间转换的桥梁。
- **uintptr**：整数类型，足以存储指针的值。可以参与算术运算，但不会被 GC 追踪。
- **指针运算**：通过 uintptr 进行地址加减，实现类似 C 语言的指针偏移。
- **Sizeof/Alignof/Offsetof**：获取类型的大小、对齐要求和结构体字段的偏移量。

## 快速上手

最简单的 unsafe 用法 -- 获取类型大小：

```go
package main

import (
    "fmt"
    "unsafe"
)

func main() {
    // 获取类型的大小（字节）
    fmt.Println("int 大小:", unsafe.Sizeof(int(0)))           // 8（64位系统）
    fmt.Println("string 大小:", unsafe.Sizeof("hello"))       // 16（指针+长度）
    fmt.Println("slice 大小:", unsafe.Sizeof([]int{1, 2, 3})) // 24（指针+长度+容量）

    // 获取对齐要求
    fmt.Println("int 对齐:", unsafe.Alignof(int(0)))

    type User struct {
        Name string
        Age  int
    }
    // 获取字段偏移量
    fmt.Println("Name 偏移:", unsafe.Offsetof(User{}.Name)) // 0
    fmt.Println("Age 偏移:", unsafe.Offsetof(User{}.Age))   // 16
}
```

## 详细用法

### 1. unsafe.Pointer 转换规则

Go 对 unsafe.Pointer 的使用有严格的规则，合法的转换模式只有以下几种：

```go
// 模式1：*T -> unsafe.Pointer -> *T（双向转换）
var x int = 42
p := unsafe.Pointer(&x)  // *int -> unsafe.Pointer
px := (*int)(p)           // unsafe.Pointer -> *int

// 模式2：*T -> unsafe.Pointer -> uintptr（计算地址）
addr := uintptr(unsafe.Pointer(&x))

// 模式3：uintptr -> unsafe.Pointer -> *T（从计算后的地址创建指针）
// 注意：uintptr 不会被 GC 追踪，中间不能有 GC
newAddr := addr + unsafe.Sizeof(x)
newPtr := (*int)(unsafe.Pointer(newAddr))
```

### 2. 类型转换

unsafe 可以实现普通类型转换无法完成的操作：

```go
// 将 []byte 转换为 string（零拷贝）
func bytesToString(b []byte) string {
    return *(*string)(unsafe.Pointer(&b))
}

// 将 string 转换为 []byte（零拷贝，得到的 slice 不能修改）
func stringToBytes(s string) []byte {
    return *(*[]byte)(unsafe.Pointer(&s))
}
```

注意：这种转换是危险的。如果原始数据被修改或释放，转换后的值也会受影响。

### 3. 结构体字段访问

通过偏移量访问结构体字段：

```go
type User struct {
    Name string
    Age  int
    City string
}

user := User{Name: "小明", Age: 25, City: "北京"}

// 通过偏移量访问 Age 字段
ageOffset := unsafe.Offsetof(user.Age)
agePtr := (*int)(unsafe.Pointer(uintptr(unsafe.Pointer(&user)) + ageOffset))
fmt.Println("Age:", *agePtr) // 25

// 修改字段
*agePtr = 30
fmt.Println(user.Age) // 30
```

### 4. Slice 底层结构

利用 unsafe 访问 slice 的底层字段：

```go
// slice 的底层结构
type SliceHeader struct {
    Data unsafe.Pointer // 数据指针
    Len  int            // 长度
    Cap  int            // 容量
}

s := make([]int, 3, 10)
header := (*SliceHeader)(unsafe.Pointer(&s))
fmt.Printf("数据指针: %v, 长度: %d, 容量: %d\n", header.Data, header.Len, header.Cap)

// 修改 slice 的长度（危险！）
header.Len = 5 // 直接修改长度
```

### 5. String 底层结构

```go
// string 的底层结构
type StringHeader struct {
    Data unsafe.Pointer // 数据指针
    Len  int            // 长度
}

s := "你好，世界"
header := (*StringHeader)(unsafe.Pointer(&s))
fmt.Printf("数据指针: %v, 长度: %d\n", header.Data, header.Len)
```

### 6. Sizeof、Alignof、Offsetof

```go
type Config struct {
    Debug bool    // 1 字节，但会填充到 8 字节对齐
    Port  int     // 8 字节
    Host  string  // 16 字节
}

cfg := Config{}

// Sizeof：类型占用的字节数（包含填充）
fmt.Println("Config 大小:", unsafe.Sizeof(cfg)) // 32

// Alignof：类型的对齐要求
fmt.Println("Config 对齐:", unsafe.Alignof(cfg)) // 8

// Offsetof：字段在结构体中的偏移量
fmt.Println("Debug 偏移:", unsafe.Offsetof(cfg.Debug)) // 0
fmt.Println("Port 偏移:", unsafe.Offsetof(cfg.Port))   // 8（填充了7字节）
fmt.Println("Host 偏移:", unsafe.Offsetof(cfg.Host))   // 16
```

## 常见场景

### 场景一：高性能字符串/字节转换

```go
// 零拷贝转换，避免内存分配
func FastBytesToString(b []byte) string {
    return *(*string)(unsafe.Pointer(&b))
}

func FastStringToBytes(s string) []byte {
    return *(*[]byte)(unsafe.Pointer(&s))
}
```

### 场景二：访问未导出字段

```go
// 访问其他包中未导出的字段（不推荐，但有时必要）
type secret struct {
    hidden int
}

s := secret{hidden: 42}
hiddenPtr := (*int)(unsafe.Pointer(uintptr(unsafe.Pointer(&s)) + unsafe.Offsetof(s.hidden)))
fmt.Println("hidden:", *hiddenPtr)
```

### 场景三：内存池

```go
// 简单的内存池，复用 []byte
type BytePool struct {
    pool [][]byte
    size int
}

func (p *BytePool) Get() []byte {
    if len(p.pool) == 0 {
        return make([]byte, p.size)
    }
    buf := p.pool[len(p.pool)-1]
    p.pool = p.pool[:len(p.pool)-1]
    // 重置长度
    header := (*SliceHeader)(unsafe.Pointer(&buf))
    header.Len = p.size
    return buf
}
```

## 注意事项与常见错误

1. **unsafe.Pointer 不是任意转换**：不能直接在 *T1 和 *T2 之间转换，必须经过 unsafe.Pointer。且 *T1 和 *T2 必须有相同的内存布局。

2. **uintptr 不会被 GC 追踪**：将指针转为 uintptr 后，如果发生 GC，原来的对象可能被回收。不要将 uintptr 存储在变量中跨 GC 使用。

3. **不要依赖内存布局**：结构体的内存布局可能因 Go 版本、平台、编译优化而不同。使用 unsafe.Offsetof 而非硬编码偏移量。

4. **string 是不可变的**：通过 unsafe 将 string 转为 []byte 后修改内容，会导致未定义行为。

5. **指针运算越界**：指针偏移超出对象的内存范围会导致未定义行为，可能崩溃或数据损坏。

6. **可移植性差**：使用 unsafe 的代码在不同平台（32/64 位、不同操作系统）上可能行为不同。

7. **违反 Go 1 兼容性保证**：Go 团队明确表示，使用 unsafe 的代码不享受 Go 1 兼容性保证。

## 进阶用法

### sync.Pool 与 unsafe

标准库的 sync.Pool 内部使用了 unsafe 来实现高效的对象复用。

### 原子操作

unsafe.Pointer 配合 atomic 包实现原子指针操作：

```go
import "sync/atomic"

var ptr unsafe.Pointer

// 原子存储
atomic.StorePointer(&ptr, unsafe.Pointer(&data))

// 原子加载
p := (*MyType)(atomic.LoadPointer(&ptr))

// 原子交换
old := atomic.SwapPointer(&ptr, unsafe.Pointer(&newData))
```

### reflect.SliceHeader 和 reflect.StringHeader

标准库提供了这些类型用于安全地操作 slice 和 string 的底层结构：

```go
import "reflect"

// 创建 string 从 []byte
hdr := reflect.StringHeader{
    Data: (*reflect.SliceHeader)(unsafe.Pointer(&bytes)).Data,
    Len:  len(bytes),
}
s := *(*string)(unsafe.Pointer(&hdr))
```
