---
order: 71
title: Go与CGO
module: go
category: Go
difficulty: advanced
description: CGO与C互操作
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与Fuzzing
  - go/Go与性能分析
  - go/Go与Wasm
  - go/Go与代码生成
prerequisites:
  - go/概述与环境配置
---

## 概述

CGO 是 Go 调用 C 代码的桥梁。通过 CGO，Go 程序可以调用现有的 C 库，复用成熟的 C 生态。这在需要使用系统底层 API、高性能计算库或遗留 C 代码时非常有用。但 CGO 也会带来性能开销和构建复杂性，应谨慎使用。

## 基础概念

在开始编码之前，需要理解 CGO 的几个核心概念：

- **CGO 指令**：紧邻 `import "C"` 之前的注释块，用于包含 C 头文件、定义 C 类型和函数。
- **C 类型映射**：Go 和 C 之间的类型转换，如 Go 的 `int32` 对应 C 的 `int32_t`。
- **C.GoString / C.CString**：Go 字符串和 C 字符串之间的转换函数。
- **交叉编译限制**：启用 CGO 后，交叉编译需要对应平台的 C 工具链，不如纯 Go 方便。

## 快速上手

最简单的 CGO 示例：

```go
package main

/*
#include <stdio.h>
#include <stdlib.h>

// 在 C 注释块中定义 C 函数
void say_hello(const char* name) {
    printf("你好，%s！来自 C 语言\n", name);
}
*/
import "C" // 必须紧邻 C 注释块，中间不能有空行
import "unsafe"

func main() {
    // 将 Go 字符串转为 C 字符串
    name := C.CString("小明")
    defer C.free(unsafe.Pointer(name)) // C 字符串需要手动释放

    // 调用 C 函数
    C.say_hello(name)
}
```

## 详细用法

### 1. 调用 C 标准库函数

```go
/*
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
*/
import "C"

// 调用 printf
C.printf(C.CString("数字: %d\n"), C.int(42))

// 调用 malloc/free
ptr := C.malloc(C.size_t(100))
defer C.free(ptr)
C.memset(ptr, 0, C.size_t(100))
```

### 2. 字符串转换

Go 字符串和 C 字符串的内存管理方式不同，需要显式转换：

```go
// Go 字符串 -> C 字符串（需要手动释放）
cStr := C.CString("你好")
defer C.free(unsafe.Pointer(cStr))

// C 字符串 -> Go 字符串（自动管理内存）
goStr := C.GoString(cStr)

// C 字符串 -> Go 字节切片（指定长度）
goBytes := C.GoBytes(unsafe.Pointer(cStr), C.int(5))

// C 字符数组 -> Go 字符串（带长度）
goStr2 := C.GoStringN(cStr, C.int(10))
```

### 3. 调用外部 C 库

使用 pkg-config 或手动指定链接标志：

```go
/*
#cgo pkg-config: libxml-2.0
#include <libxml/parser.h>
*/
import "C"
```

手动指定编译和链接标志：

```go
/*
#cgo CFLAGS: -I/usr/local/include/mylib
#cgo LDFLAGS: -L/usr/local/lib -lmylib
#include <mylib.h>
*/
import "C"
```

### 4. 在 C 中回调 Go 函数

```go
/*
extern void call_go_func(void* ctx, int result);

// C 函数接收回调
void async_operation(void* ctx) {
    int result = do_something();
    call_go_func(ctx, result);
}
*/
import "C"

import "unsafe"

// 导出 Go 函数供 C 调用
//export call_go_func
func call_go_func(ctx unsafe.Pointer, result C.int) {
    fmt.Printf("C 回调结果: %d\n", int(result))
}
```

### 5. 传递结构体

```go
/*
typedef struct {
    int x;
    int y;
} Point;

Point create_point(int x, int y) {
    Point p;
    p.x = x;
    p.y = y;
    return p;
}
*/
import "C"

// 在 Go 中使用 C 结构体
p := C.create_point(10, 20)
fmt.Printf("Point: (%d, %d)\n", p.x, p.y)
```

### 6. 条件编译

根据平台条件编译不同的 C 代码：

```go
/*
#cgo linux CFLAGS: -DLINUX
#cgo windows CFLAGS: -DWINDOWS
#cgo darwin CFLAGS: -DDARWIN

#ifdef LINUX
const char* platform() { return "Linux"; }
#elif defined(WINDOWS)
const char* platform() { return "Windows"; }
#elif defined(DARWIN)
const char* platform() { return "macOS"; }
#endif
*/
import "C"

fmt.Println("平台:", C.GoString(C.platform()))
```

## 常见场景

### 场景一：使用 SQLite

```go
/*
#cgo CFLAGS: -I/usr/include/sqlite3
#cgo LDFLAGS: -lsqlite3
#include <sqlite3.h>
*/
import "C"

func OpenDB(path string) (*C.sqlite3, error) {
    var db *C.sqlite3
    cPath := C.CString(path)
    defer C.free(unsafe.Pointer(cPath))
    rc := C.sqlite3_open(cPath, &db)
    if rc != C.SQLITE_OK {
        return nil, fmt.Errorf("打开数据库失败")
    }
    return db, nil
}
```

### 场景二：使用系统 API

```go
/*
#cgo windows LDFLAGS: -lkernel32
#include <windows.h>
*/
import "C"

func GetSystemInfo() {
    var si C.SYSTEM_INFO
    C.GetSystemInfo(&si)
    fmt.Printf("处理器数量: %d\n", si.dwNumberOfProcessors)
}
```

### 场景三：性能关键代码用 C 实现

```go
/*
#include <string.h>

int fast_memcmp(const void* s1, const void* s2, size_t n) {
    return memcmp(s1, s2, n);
}
*/
import "C"
```

## 注意事项与常见错误

1. **import "C" 前不能有空行**：C 注释块和 `import "C"` 之间不能有空行，否则 CGO 不会识别。

2. **C.CString 内存泄漏**：`C.CString` 在 C 堆上分配内存，Go 的垃圾回收器不会管理它。必须用 `C.free` 释放。

3. **CGO 调用开销**：每次 CGO 调用约需 50-100ns 的额外开销（栈切换等），不适合高频调用。热路径应避免使用 CGO。

4. **交叉编译困难**：启用 CGO 后，交叉编译需要对应平台的 C 交叉编译工具链。设置 `CGO_ENABLED=0` 可以禁用 CGO。

5. **Goroutine 调度阻塞**：C 函数执行期间，关联的 goroutine 不会参与调度。如果 C 函数阻塞，会占用系统线程。

6. **构建速度**：CGO 项目构建比纯 Go 项目慢很多，因为需要调用 C 编译器。

7. **//export 指令**：导出给 C 调用的 Go 函数前必须有 `//export 函数名` 注释，且函数必须是 `func` 类型。

## 进阶用法

### 禁用 CGO

```bash
# 编译时禁用 CGO
CGO_ENABLED=0 go build -o myapp .
```

### 使用 cgo 检查工具

```bash
# 查看 CGO 调用详情
go tool cgo -godefs main.go
```

### 与 C++ 交互

CGO 不直接支持 C++，但可以通过 C 包装层间接调用：

```go
/*
#ifdef __cplusplus
extern "C" {
#endif

// C 包装函数声明
void cpp_wrapper_func();

#ifdef __cplusplus
}
#endif
*/
import "C"
```
