---
order: 79
title: Java与WebAssembly
module: java
category: Java
difficulty: advanced
description: Java与Wasm交互
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与AI
  - java/Java与安全
  - java/Java与响应式编程
  - java/方法详解
prerequisites:
  - java/概述与开发环境
---

## 概述

WebAssembly（简称 Wasm）是一种低级的二进制指令格式，可以在现代浏览器中接近原生速度运行。它不是用来替代 JavaScript 的，而是与 JavaScript 协同工作，让性能关键型代码（如图像处理、音视频编解码、加密计算）在网页端也能高效执行。

Java 与 WebAssembly 的结合有两个方向：一是用 Java 调用已有的 Wasm 模块，二是将 Java 代码编译为 Wasm 在浏览器中运行。前者适合在服务端复用 Wasm 生态中的现有模块，后者适合将 Java 逻辑直接部署到前端。

为什么需要关注 Java 与 Wasm 的交互？因为 Wasm 生态正在快速增长，很多 C/C++/Rust 编写的高性能库已经编译为 Wasm 格式，Java 应用可以通过 Wasm 运行时直接调用这些模块，而不需要通过 JNI 桥接原生代码，部署更简单，安全性也更高。

## 基础概念

### WebAssembly 核心概念

Wasm 模块是一个二进制文件（.wasm），它定义了一组函数和内存。模块需要被实例化后才能调用。实例化时可以导入宿主环境提供的函数，模块也可以导出函数供宿主调用。

Wasm 使用线性内存模型，所有数据存储在一块连续的内存中，通过偏移量访问。Wasm 的值类型只有四种：i32、i64、f32、f64，所以 Java 的对象类型需要经过序列化或编码才能传递给 Wasm 函数。

### Java 中的 Wasm 运行时

目前 Java 生态中主要的 Wasm 运行时有两个：

- **Chicory**：纯 Java 实现的 Wasm 解释器，无需本地依赖，跨平台，适合嵌入 Java 应用
- **Wasmtime-Java**：基于 Wasmtime 的 JNI 绑定，性能更好但需要本地库

对于大多数场景，Chicory 是更简单的选择，因为它不需要安装任何本地依赖。

## 快速上手

### 添加 Chicory 依赖

在 Maven 项目中添加 Chicory 依赖：

```xml
<dependency>
  <groupId>com.dylibso.chicory</groupId>
  <artifactId>runtime</artifactId>
  <version>2024.10.1</version>
</dependency>
```

Gradle 项目中：

```groovy
implementation 'com.dylibso.chicory:runtime:2024.10.1'
```

### 最简示例：调用 Wasm 函数

假设有一个 Wasm 模块导出了一个 add 函数，接收两个 i32 参数并返回它们的和：

```java
import com.dylibso.chicory.runtime.Instance;
import java.nio.file.Paths;

public class WasmQuickStart {
    public static void main(String[] args) {
        // 加载并实例化 Wasm 模块
        Instance instance = Instance.builder(Paths.get("module.wasm")).build();

        // 调用导出函数 add，传入参数 3 和 5
        int result = instance.export("add").apply(3, 5)[0];

        System.out.println("3 + 5 = " + result); // 输出: 3 + 5 = 8
    }
}
```

这就是最基本的使用方式：加载模块、实例化、调用导出函数。

## 详细用法

### 1. 加载 Wasm 模块

Chicory 支持从文件路径、URL 或字节数组加载模块：

```java
import com.dylibso.chicory.runtime.Instance;
import com.dylibso.chicory.wasm.Module;
import java.nio.file.Paths;

// 方式一：从文件加载（最常用）
Instance instance1 = Instance.builder(Paths.get("module.wasm")).build();

// 方式二：从 Module 对象加载（可复用同一模块创建多个实例）
Module module = Module.builder(Paths.get("module.wasm")).build();
Instance instance2 = Instance.builder(module).build();
Instance instance3 = Instance.builder(module).build(); // 同一模块的不同实例

// 方式三：从字节数组加载
byte[] wasmBytes = Files.readAllBytes(Paths.get("module.wasm"));
Instance instance4 = Instance.builder(wasmBytes).build();
```

### 2. 调用导出函数

Wasm 函数的参数和返回值都是基本类型（i32、i64、f32、f64），通过 apply 方法传递和接收：

```java
// 调用无参函数
int[] emptyResult = instance.export("getCount").apply();

// 调用多参数函数
int[] addResult = instance.export("add").apply(10, 20);

// 调用返回多个值的函数（Wasm 支持多返回值）
int[] multiResult = instance.export("swap").apply(100, 200);
int first = multiResult[0];  // 第一个返回值
int second = multiResult[1]; // 第二个返回值

// 处理 64 位整数
long[] longResult = instance.export("hash").apply(42L);
```

### 3. 操作 Wasm 线性内存

当需要传递复杂数据（如字符串、数组）时，需要通过 Wasm 的线性内存来交换数据：

```java
import com.dylibso.chicory.runtime.Instance;
import com.dylibso.chicory.runtime.Memory;

Instance instance = Instance.builder(Paths.get("process.wasm")).build();
Memory memory = instance.memory();

// 向 Wasm 内存写入字符串
String text = "Hello Wasm";
int offset = 0; // 写入的起始偏移量
for (int i = 0; i < text.length(); i++) {
    // 将每个字符写入内存的对应位置
    memory.writeByte(offset + i, (byte) text.charAt(i));
}
// 写入字符串结束符
memory.writeByte(offset + text.length(), (byte) 0);

// 调用处理函数，传入偏移量
int resultOffset = instance.export("processString").apply(offset)[0];

// 从 Wasm 内存读取返回的字符串
StringBuilder sb = new StringBuilder();
int readPos = resultOffset;
while (true) {
    byte b = memory.readByte(readPos);
    if (b == 0) break; // 遇到结束符停止
    sb.append((char) b);
    readPos++;
}
String result = sb.toString();
```

### 4. 导入宿主函数给 Wasm

Wasm 模块可以导入宿主环境提供的函数，Chicory 允许你在 Java 端实现这些导入：

```java
import com.dylibso.chicory.runtime.HostFunction;
import com.dylibso.chicory.runtime.Instance;
import com.dylibso.chicory.runtime.WasmValue;

// 定义一个宿主函数，供 Wasm 模块调用
HostFunction logFunc = new HostFunction(
    "env",           // 导入模块名
    "log",           // 导入函数名
    List.of(WasmValue.Type.I32),  // 参数类型
    List.of(),                       // 返回值类型
    (instance, args) -> {
        // 从 Wasm 内存读取字符串并打印
        int ptr = args[0].asInt();
        Memory mem = instance.memory();
        StringBuilder msg = new StringBuilder();
        while (mem.readByte(ptr) != 0) {
            msg.append((char) mem.readByte(ptr));
            ptr++;
        }
        System.out.println("[Wasm] " + msg.toString());
        return new WasmValue[0]; // 无返回值
    }
);

// 实例化时注入宿主函数
Instance instance = Instance.builder(Paths.get("module.wasm"))
    .addHostFunction(logFunc)
    .build();
```

### 5. 将 Java 编译为 Wasm

如果目标是把 Java 代码运行在浏览器中，可以使用 TeaVM 或 CheerpJ 等工具：

**TeaVM 方式**：将 Java 字节码转译为 JavaScript/Wasm

```xml
<!-- Maven 插件配置 -->
<plugin>
  <groupId>org.teavm</groupId>
  <artifactId>teavm-maven-plugin</artifactId>
  <version>0.10.2</version>
  <configuration>
    <targetType>WEBASSEMBLY</targetType>
    <mainClass>com.example.ClientMain</mainClass>
  </configuration>
</plugin>
```

```java
// Java 端代码，会被编译为 Wasm
public class ClientMain {
    public static void main(String[] args) {
        // 这段代码将运行在浏览器中
        System.out.println("Hello from Java-Wasm!");
    }
}
```

## 常见场景

### 场景一：在服务端调用 Wasm 图像处理库

很多图像处理库（如 libwebp、libavif）已经编译为 Wasm，Java 应用可以通过 Chicory 调用：

```java
// 加载图像处理 Wasm 模块
Instance imageProcessor = Instance.builder(Paths.get("image-utils.wasm")).build();

// 将图像数据写入 Wasm 内存
byte[] imageData = Files.readAllBytes(Paths.get("input.png"));
int dataPtr = imageProcessor.export("allocate").apply(imageData.length)[0];
Memory mem = imageProcessor.memory();
for (int i = 0; i < imageData.length; i++) {
    mem.writeByte(dataPtr + i, imageData[i]);
}

// 调用处理函数
int resultPtr = imageProcessor.export("convertToWebP").apply(dataPtr, imageData.length)[0];

// 读取处理结果...
```

### 场景二：使用 Wasm 沙箱执行不可信代码

Wasm 的沙箱特性使其适合执行不可信的计算逻辑：

```java
// 加载用户提交的计算模块，在沙箱中运行
Instance sandbox = Instance.builder(Paths.get("user-code.wasm"))
    .withMaxMemory(10) // 限制内存使用（单位：页，每页 64KB）
    .build();

// 安全地执行计算，Wasm 无法访问 Java 堆或文件系统
try {
    int[] result = sandbox.export("compute").apply(inputData);
} catch (Exception e) {
    // Wasm 执行出错不会影响 Java 进程
    System.err.println("计算失败: " + e.getMessage());
}
```

## 注意事项与常见错误

### 类型不匹配

Wasm 只有四种基本值类型，Java 的 long 对应 i64，但很多 Wasm 函数使用 i32。传递参数时注意类型对应关系：

```java
// 错误：Wasm 函数期望 i32，但传入了 long
instance.export("process").apply(100L); // 可能导致类型错误

// 正确：确保传入 int 类型
instance.export("process").apply(100);
```

### 内存越界

Wasm 线性内存大小有限，默认可能只有几页（每页 64KB）。写入大量数据前需要确认内存空间足够：

```java
// 检查内存页数
int pages = instance.memory().pages();
int totalBytes = pages * 65536; // 每页 64KB

// 如果空间不足，可以增长内存
instance.memory().grow(10); // 增加 10 页
```

### 编码问题

Wasm 内存操作的是原始字节，Java 字符串需要手动编码为 UTF-8 字节再写入：

```java
import java.nio.charset.StandardCharsets;

String text = "你好世界";
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
for (int i = 0; i < bytes.length; i++) {
    memory.writeByte(offset + i, bytes[i]);
}
```

### 不要混淆两个方向

Java 调用 Wasm（Chicory）和 Java 编译为 Wasm（TeaVM）是两个不同的场景。前者是在 Java 进程中运行 Wasm 模块，后者是把 Java 代码变成 Wasm 在浏览器中运行。根据需求选择正确的工具。

## 进阶用法

### Wasm 组件模型

Wasm 组件模型是 Wasm 规范的新进展，支持更丰富的类型系统（字符串、记录、变体等），不再局限于四种基本类型。Chicory 正在逐步支持组件模型，未来可以直接传递字符串和结构体，无需手动操作内存。

### WASI 支持

WASI（WebAssembly System Interface）为 Wasm 提供了标准化的系统接口（文件访问、网络等）。Chicory 支持 WASI 预览版，可以让 Wasm 模块在受控环境中访问系统资源：

```java
import com.dylibso.chicory.wasi.WasiOptions;

// 启用 WASI 支持，允许 Wasm 访问标准输入输出
Instance instance = Instance.builder(Paths.get("wasi-module.wasm"))
    .withWasi(WasiOptions.builder()
        .withStdout(System.out)
        .withStderr(System.err)
        .build())
    .build();
```

### 性能考量

Chicory 是纯 Java 解释器，执行 Wasm 的速度比原生 Wasm 运行时（如 Wasmtime、Wasmer）慢。如果性能是关键需求，考虑使用 Wasmtime-Java。如果部署便利性更重要（不想安装本地库），Chicory 是更好的选择。

对于计算密集型任务，建议先用 Chicory 原型验证，再根据性能需求决定是否切换到 Wasmtime-Java。
