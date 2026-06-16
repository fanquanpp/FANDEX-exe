---
order: 55
title: Span与Memory
module: csharp
category: 'C#'
difficulty: advanced
description: 零分配内存操作
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/记录类型
  - csharp/泛型与协变逆变
  - csharp/源生成器
  - 'csharp/C#与Unity游戏开发'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

Span<T> 和 Memory<T> 是 .NET 提供的零分配内存操作类型，可以在不复制数据的情况下操作连续内存区域。Span<T> 只能存在于栈上，性能最优；Memory<T> 可以存储在堆上，适合跨 async 边界使用。两者是高性能 .NET 应用的核心工具。

## 基础概念

### Span<T> 与 Memory<T> 对比

| 特性       | Span<T>            | Memory<T>            |
| ---------- | ------------------ | -------------------- |
| 存储位置   | 只能在栈上         | 可以在堆上           |
| async 使用 | 不可以             | 可以                 |
| 性能       | 最优（无间接访问） | 略低（需要访问属性） |
| 生命周期   | 仅限当前方法调用   | 可跨方法             |
| 适用场景   | 同步数据处理       | 异步数据处理         |

### 支持的数据源

- 数组（T[]）
- stackalloc 分配的内存
- 字符串（通过 AsSpan）
- 指针（通过 unsafe 代码）
- Memory<T>（通过 .Span 属性）

## 快速上手

### Span<T> 基本操作

```csharp
// 从数组创建
int[] array = { 1, 2, 3, 4, 5 };
Span<int> span = array;

// 从 stackalloc 创建
Span<int> stackSpan = stackalloc int[100];
stackSpan[0] = 42;

// 切片操作
Span<int> slice = span[1..4]; // { 2, 3, 4 }

// 修改原数据
span[0] = 10; // array[0] 也变为 10

// 不需要 unsafe 的指针操作
void Process(Span<byte> buffer) {
    for (int i = 0; i < buffer.Length; i++)
        buffer[i] = (byte)(buffer[i] * 2);
}
```

### Memory<T> 基本操作

```csharp
// 从数组创建
Memory<int> memory = new int[1024];

// 获取 Span 进行操作
Span<int> span = memory.Span;
span[0] = 42;

// 可以在 async 方法中使用
async Task ProcessAsync(Memory<byte> buffer) {
    // 在异步操作间传递
    await NetworkStream.ReadAsync(buffer);
    ProcessBuffer(buffer.Span);
}
```

## 详细用法

### 字符串操作

```csharp
// 使用 Span 高效处理字符串
string text = "Hello, World!";
ReadOnlySpan<char> span = text.AsSpan();

// 切片
ReadOnlySpan<char> hello = span[..5];  // "Hello"
ReadOnlySpan<char> world = span[7..12]; // "World"

// 高效的字符串解析（避免 Substring 分配）
bool TryParseInt(ReadOnlySpan<char> span, out int result) {
    result = 0;
    foreach (char c in span) {
        if (c < '0' || c > '9') { result = 0; return false; }
        result = result * 10 + (c - '0');
    }
    return true;
}

// 使用
if (TryParseInt("12345".AsSpan(), out int number)) {
    Console.WriteLine(number); // 12345
}
```

### 高效的文件和网络 I/O

```csharp
// 使用 Span 处理二进制数据
void ProcessBinaryData(ReadOnlySpan<byte> data) {
    // 读取头部信息
    int magic = BitConverter.ToInt32(data[..4]);
    short version = BitConverter.ToInt16(data[4..6]);
    int length = BitConverter.ToInt32(data[6..10]);

    // 处理数据体
    ReadOnlySpan<byte> body = data[10..];
}

// 使用 Memory 进行异步读取
async Task ReadFileAsync(string path) {
    byte[] buffer = new byte[4096];
    Memory<byte> memory = buffer;

    using var fs = File.OpenRead(path);
    int bytesRead = await fs.ReadAsync(memory);
    ProcessBuffer(memory[..bytesRead].Span);
}
```

### 与其他 API 配合

```csharp
// 与 StringBuilder 配合
var sb = new StringBuilder();
sb.Append("Hello".AsSpan()); // 避免字符串复制

// 与 Guid 配合
if (Guid.TryParse("550e8400-e29b-41d4-a716-446655440000".AsSpan(), out var guid)) {
    Console.WriteLine(guid);
}

// 与 int.Parse 配合
int value = int.Parse("42".AsSpan()); // 避免子字符串分配

// 与 Base64 配合
byte[] bytes = Convert.FromBase64String("SGVsbG8=");
// 或使用 Span 版本
Convert.TryFromBase64("SGVsbG8=".AsSpan(), bytes, out int bytesWritten);
```

## 常见场景

### 高性能 JSON 解析

```csharp
// 使用 Utf8JsonReader + Span 解析 JSON
ReadOnlySpan<byte> json = "{\"name\":\"张三\",\"age\":25}"u8;
var reader = new Utf8JsonReader(json);

while (reader.Read()) {
    switch (reader.TokenType) {
        case JsonTokenType.PropertyName:
            string prop = reader.GetString();
            reader.Read();
            if (prop == "name")
                Console.WriteLine($"姓名: {reader.GetString()}");
            else if (prop == "age")
                Console.WriteLine($"年龄: {reader.GetInt32()}");
            break;
    }
}
```

### 零分配字符串拆分

```csharp
// 不使用 Split，零分配拆分字符串
void ParseCsvLine(ReadOnlySpan<char> line) {
    int start = 0;
    int column = 0;
    for (int i = 0; i <= line.Length; i++) {
        if (i == line.Length || line[i] == ',') {
            ReadOnlySpan<char> field = line[start..i];
            ProcessField(column, field);
            start = i + 1;
            column++;
        }
    }
}
```

## 注意事项

- Span<T> 不能作为类的字段、不能在 Lambda 中捕获、不能跨 async/await 使用
- Memory<T> 可以在堆上存储，但访问数据时需要通过 .Span 属性
- ReadOnlySpan<T> 用于不可变数据（如字符串），防止意外修改
- stackalloc 分配的内存在方法返回时自动释放，不要返回给调用者
- Span 切片不复制数据，修改切片会影响原始数据
- 在 Unity 中，Span 支持需要 Unity 2021.2+

## 进阶用法

### 自定义 Span 兼容 API

```csharp
// 设计同时支持数组和 Span 的 API
void Process(ReadOnlySpan<int> data) {
    // 核心实现使用 Span
}

// 重载支持数组
void Process(int[] data) => Process(data.AsSpan());

// 重载支持 Memory
void Process(Memory<int> data) => Process(data.Span);
```

### ref struct 与 Span

```csharp
// 使用 ref struct 创建 Span 兼容的类型
public ref struct SpanWriter {
    private Span<byte> _buffer;
    private int _position;

    public SpanWriter(Span<byte> buffer) {
        _buffer = buffer;
        _position = 0;
    }

    public void WriteInt(int value) {
        BitConverter.TryWriteBytes(_buffer[_position..], value);
        _position += sizeof(int);
    }

    public void WriteString(ReadOnlySpan<char> value) {
        int byteCount = Encoding.UTF8.GetByteCount(value);
        BitConverter.TryWriteBytes(_buffer[_position..], byteCount);
        _position += sizeof(int);
        Encoding.UTF8.GetBytes(value, _buffer[_position..]);
        _position += byteCount;
    }
}
```
