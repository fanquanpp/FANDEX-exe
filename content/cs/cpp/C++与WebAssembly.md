---
order: 83
title: C++与WebAssembly
module: cpp
category: C++
difficulty: advanced
description: C++编译为WebAssembly
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++与Rust对比
  - cpp/C++代码规范
  - cpp/C++反射与元编程
  - cpp/C++数学库
prerequisites:
  - cpp/概述与现代标准
---

## 概述

WebAssembly（Wasm）是一种低级二进制格式，可以在现代浏览器中接近原生速度运行。C++ 作为系统级语言，可以通过 Emscripten 等工具链编译为 WebAssembly，使得现有的 C++ 代码库能够直接在 Web 平台上运行。这为计算密集型应用（如图像处理、游戏引擎、科学计算）提供了在浏览器中高性能执行的途径。

C++ 编译为 WebAssembly 后，既可以在浏览器中通过 JavaScript 调用，也可以在 Node.js 环境中运行，还可以通过 WASI（WebAssembly System Interface）在服务端执行，实现"一次编译，多处运行"。

## 基础概念

### WebAssembly 的特点

- 接近原生的执行速度，通过 JIT 编译为机器码
- 沙箱化执行，内存安全，无法直接访问宿主环境
- 紧凑的二进制格式，加载和解析速度快
- 支持与 JavaScript 双向互操作
- WASI 扩展了文件系统、网络等系统级访问能力

### 工具链概览

| 工具           | 说明                                                     |
| -------------- | -------------------------------------------------------- |
| Emscripten     | 最成熟的 C++ 到 Wasm 工具链，提供完整的 POSIX 兼容层     |
| Clang/WASI SDK | 轻量级方案，直接使用 Clang 编译为 Wasm                   |
| wasm-pack      | Rust 专用，但生成的 Wasm 模块可被 C++ 项目参考           |
| WABT           | WebAssembly 二进制工具集，包含 wasm2wat、wat2wasm 等工具 |

## 快速上手

### 安装 Emscripten

```bash
# 克隆 Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# 安装最新版本
./emsdk install latest
./emsdk activate latest

# 激活环境变量
source ./emsdk_env.sh
```

### 编译第一个程序

```cpp
// hello.cpp
#include <iostream>

int main() {
    std::cout << "Hello from WebAssembly!" << std::endl;
    return 0;
}
```

```bash
# 编译为 JavaScript 加载器 + Wasm
emcc hello.cpp -o hello.js

# 编译为独立 HTML 页面（便于测试）
emcc hello.cpp -o hello.html

# 使用 Node.js 运行
node hello.js
```

### 与 JavaScript 交互

```cpp
// bridge.cpp
#include <emscripten.h>

// 标记函数不被优化移除，导出给 JavaScript 调用
EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
    return a + b;
}

EMSCRIPTEN_KEEPALIVE
double multiply(double a, double b) {
    return a * b;
}
```

```javascript
// 在 JavaScript 中调用 C++ 函数
const Module = await createModule();

// 通过 _ 前缀访问导出的 C 函数
const result = Module._add(10, 20); // 30
const product = Module._multiply(3.5, 2); // 7.0
```

## 详细用法

### 内存管理

WebAssembly 使用线性内存模型，C++ 的堆内存映射到 Wasm 的线性内存中：

```cpp
#include <emscripten.h>
#include <cstdlib>

// 导出内存分配函数，供 JavaScript 使用
EMSCRIPTEN_KEEPALIVE
void* allocateBuffer(int size) {
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void freeBuffer(void* ptr) {
    free(ptr);
}

// 操作共享内存
EMSCRIPTEN_KEEPALIVE
void fillArray(int* arr, int size, int value) {
    for (int i = 0; i < size; ++i) {
        arr[i] = value + i;
    }
}
```

```javascript
// JavaScript 端操作 Wasm 内存
const size = 100;
const ptr = Module._allocateBuffer(size * 4); // 分配 100 个 int

// 通过 HEAP32 视图访问 Wasm 内存
const view = new Int32Array(Module.HEAP32.buffer, ptr, size);
Module._fillArray(ptr, size, 42);

// 读取结果
console.log(view[0]); // 42
console.log(view[1]); // 43

// 释放内存
Module._freeBuffer(ptr);
```

### Embind 绑定 C++ 类

Embind 提供了更高级的类型绑定机制，支持类、枚举和函数的自动绑定：

```cpp
#include <emscripten/bind.h>

class Calculator {
    double lastResult_ = 0;
public:
    double add(double a, double b) {
        lastResult_ = a + b;
        return lastResult_;
    }

    double getLastResult() const { return lastResult_; }
};

// 定义绑定
EMSCRIPTEN_BINDINGS(calculator) {
    emscripten::class_<Calculator>("Calculator")
        .constructor<>()
        .function("add", &Calculator::add)
        .function("getLastResult", &Calculator::getLastResult);
}
```

```javascript
// JavaScript 中像使用原生对象一样使用
const calc = new Module.Calculator();
const result = calc.add(10, 20); // 30
const last = calc.getLastResult(); // 30
calc.delete(); // 手动释放 C++ 对象
```

### 从 JavaScript 调用 C++ 回调

```cpp
#include <emscripten.h>
#include <functional>
#include <string>

// 使用 JavaScript 的 console.log
EM_JS(void, js_console_log, (const char* msg), {
    console.log(UTF8ToString(msg));
});

void logMessage(const std::string& msg) {
    js_console_log(msg.c_str());
}

// 在 C++ 中调用 JavaScript 函数
EM_JS(double, js_get_timestamp, (), {
    return performance.now();
});

void measureTime() {
    double start = js_get_timestamp();
    // 执行耗时操作...
    double end = js_get_timestamp();
    std::string msg = "耗时: " + std::to_string(end - start) + "ms";
    js_console_log(msg.c_str());
}
```

## 常见场景

### 图像处理

```cpp
#include <emscripten.h>
#include <cstdint>

// 灰度化图像数据（RGBA 格式）
EMSCRIPTEN_KEEPALIVE
void grayscale(uint8_t* data, int width, int height) {
    int totalPixels = width * height;
    for (int i = 0; i < totalPixels; ++i) {
        int idx = i * 4;
        // 加权灰度公式
        uint8_t gray = static_cast<uint8_t>(
            0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        );
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = gray;
        // data[idx + 3] 是 alpha，保持不变
    }
}
```

```javascript
// 在 Canvas 上使用
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// 将像素数据复制到 Wasm 内存
const ptr = Module._allocateBuffer(imageData.data.length);
Module.HEAPU8.set(imageData.data, ptr);

// 调用 C++ 处理函数
Module._grayscale(ptr, canvas.width, canvas.height);

// 将结果复制回 Canvas
imageData.data.set(new Uint8Array(Module.HEAPU8.buffer, ptr, imageData.data.length));
ctx.putImageData(imageData, 0, 0);
Module._freeBuffer(ptr);
```

### WASI 服务端运行

```bash
# 使用 WASI SDK 编译（不依赖浏览器 API）
clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot \
      --target=wasm32-wasi \
      -O2 \
      server_app.cpp -o app.wasm

# 使用 Wasmtime 运行
wasmtime app.wasm
```

## 注意事项

- WebAssembly 不支持异常（默认情况下），Emscripten 提供了异常模拟但性能开销大，建议编译时使用 `-fno-exceptions` 或启用 Wasm 异常提案
- C++ 标准库的支持有限，Emscripten 基于 musl libc 提供了大部分 POSIX API，但线程支持需要启用 SharedArrayBuffer
- 浏览器对 Wasm 模块的大小有限制，大型项目应使用 `-Os` 优化体积，并通过 `-s MODULARIZE=1` 实现按需加载
- 文件系统是虚拟的，Emscripten 提供了 MEMFS（内存文件系统）和 IDBFS（IndexedDB 持久化），但不等同于真实文件系统
- 多线程需要浏览器支持 SharedArrayBuffer，且需要设置正确的 CORS 头（`Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy`）
- 调试体验不如原生环境，建议先在本地测试 C++ 逻辑，再编译为 Wasm 进行集成测试

## 进阶用法

### 动态链接与代码拆分

```bash
# 将公共库编译为 Wasm 动态库
emcc utils.cpp -o utils.wasm -s SIDE_MODULE=1

# 主模块动态链接
emcc main.cpp -o main.js -s MAIN_MODULE=1 -s RUNTIME_LINKED_LIBS=["utils.wasm"]
```

### SIMD 加速

```cpp
#include <wasm_simd128.h>

// 使用 Wasm SIMD 指令加速向量运算
void addVectorsSimd(const float* a, const float* b, float* result, int count) {
    int i = 0;
    // 每次处理 4 个 float（128 位 SIMD）
    for (; i + 3 < count; i += 4) {
        v128_t va = wasm_v128_load(&a[i]);
        v128_t vb = wasm_v128_load(&b[i]);
        v128_t vr = wasm_f32x4_add(va, vb);
        wasm_v128_store(&result[i], vr);
    }
    // 处理剩余元素
    for (; i < count; ++i) {
        result[i] = a[i] + b[i];
    }
}
```

```bash
# 编译时启用 SIMD 支持
emcc simd.cpp -o simd.js -msimd128 -O3
```

### Web Workers 多线程

```cpp
#include <emscripten.h>
#include <pthread.h>

struct WorkerData {
    int start;
    int end;
    int* data;
};

void* processRange(void* arg) {
    WorkerData* wd = static_cast<WorkerData*>(arg);
    for (int i = wd->start; i < wd->end; ++i) {
        wd->data[i] *= 2;  // 示例：每个元素翻倍
    }
    return nullptr;
}

EMSCRIPTEN_KEEPALIVE
void parallelProcess(int* data, int size, int numThreads) {
    pthread_t* threads = new pthread_t[numThreads];
    WorkerData* args = new WorkerData[numThreads];

    int chunkSize = size / numThreads;
    for (int i = 0; i < numThreads; ++i) {
        args[i] = {i * chunkSize, (i + 1) * chunkSize, data};
        pthread_create(&threads[i], nullptr, processRange, &args[i]);
    }

    for (int i = 0; i < numThreads; ++i) {
        pthread_join(threads[i], nullptr);
    }

    delete[] threads;
    delete[] args;
}
```
