---
order: 56
title: LuaJIT
module: lua
category: Lua
difficulty: advanced
description: LuaJIT与FFI
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/字符串模式匹配
  - lua/Lua与C交互
  - lua/Lua与Love2D
  - lua/Lua与Neovim
prerequisites:
  - lua/概述与环境配置
---

## 概述

LuaJIT 是 Lua 的高性能替代实现，通过 JIT（Just-In-Time）编译技术将热点 Lua 代码动态编译为本地机器码，性能通常比标准 Lua 解释器快 10-50 倍。LuaJIT 完全兼容 Lua 5.1 语法，并额外提供了 FFI（Foreign Function Interface）模块，可以直接在 Lua 中调用 C 函数和使用 C 数据结构，无需编写 C 绑定代码。

LuaJIT 被广泛用于对性能要求高的场景：游戏引擎（如 Love2D）、Web 服务器（如 OpenResty）、网络代理（如 Kong）等。如果你的项目对性能有要求，LuaJIT 通常是比标准 Lua 更好的选择。

## 基础概念

### JIT 编译

JIT 编译器在程序运行时监控代码的执行，将频繁执行的热点代码（hot trace）编译为本地机器码。编译后的代码直接在 CPU 上执行，不再需要解释器的逐行翻译，因此速度大幅提升。LuaJIT 的 JIT 编译器基于 trace（追踪）技术，记录循环和函数调用的执行路径，然后编译这些路径。

### FFI（Foreign Function Interface）

FFI 是 LuaJIT 的核心特性之一，它允许你在 Lua 代码中直接调用 C 函数、使用 C 数据类型，而不需要编写任何 C 代码或编译动态库。FFI 的性能接近原生 C 调用，比传统的 Lua C API 绑定快得多。

### LuaJIT 与标准 Lua 的区别

- LuaJIT 兼容 Lua 5.1 语法，不支持 Lua 5.2+ 的新特性（如 goto、位运算符等）
- LuaJIT 有自己的扩展：FFI、table.new、table.clear、jit 模块等
- LuaJIT 的 JIT 编译器在某些情况下会回退到解释模式（如过多的函数参数、深层递归等）

## 快速上手

### 安装 LuaJIT

```bash
# Linux
sudo apt install luajit    # Debian/Ubuntu
sudo yum install luajit    # CentOS/RHEL

# macOS
brew install luajit

# Windows
# 从 https://luajit.org/download.html 下载预编译版本
```

### 运行 LuaJIT

```bash
# 运行脚本
luajit myscript.lua

# 交互模式
luajit
```

### 最简 FFI 示例

```lua
local ffi = require("ffi")

-- 声明 C 函数签名
ffi.cdef[[
    int printf(const char *fmt, ...);
    int abs(int x);
]]

-- 直接调用 C 标准库函数
ffi.C.printf("Hello from C! %d\n", 42)
local result = ffi.C.abs(-100)
print("绝对值: " .. result)  -- 输出: 绝对值: 100
```

## 详细用法

### 1. FFI 基本类型

FFI 支持所有 C 基本类型：

```lua
local ffi = require("ffi")

-- 声明变量
local x = ffi.new("int", 42)           -- C int 类型
local y = ffi.new("double", 3.14)      -- C double 类型
local s = ffi.new("const char[6]", "hello")  -- C 字符数组

-- 也可以用简写语法
local x = ffi.new("int", 42)
print(x)  -- 输出: 42

-- 类型转换
local n = tonumber(ffi.new("int", 42))  -- cdata 转 Lua number
local s = ffi.string(ffi.new("const char[6]", "hello"))  -- cdata 转 Lua string
```

### 2. FFI 结构体

```lua
local ffi = require("ffi")

-- 声明 C 结构体
ffi.cdef[[
    typedef struct {
        float x;
        float y;
    } Point;

    typedef struct {
        char name[32];
        int age;
        float score;
    } Student;
]]

-- 创建结构体实例
local p = ffi.new("Point")
p.x = 10.0
p.y = 20.0
print(string.format("Point: (%.1f, %.1f)", p.x, p.y))

-- 创建并初始化
local s = ffi.new("Student")
ffi.copy(s.name, "Alice")  -- 复制字符串到 char 数组
s.age = 20
s.score = 95.5
print(string.format("学生: %s, 年龄: %d, 成绩: %.1f", ffi.string(s.name), s.age, s.score))
```

### 3. FFI 数组

```lua
local ffi = require("ffi")

-- 创建 C 数组
local arr = ffi.new("int[10]")  -- 10 个 int 的数组
for i = 0, 9 do  -- C 数组索引从 0 开始
    arr[i] = i * 10
end

-- 遍历数组
for i = 0, 9 do
    print(arr[i])
end

-- 创建并初始化数组
local values = ffi.new("double[5]", {1.0, 2.0, 3.0, 4.0, 5.0})

-- 数组长度
print(ffi.sizeof(values) / ffi.sizeof("double"))  -- 输出: 5
```

### 4. FFI 调用 C 库函数

```lua
local ffi = require("ffi")

-- 声明 C 标准库函数
ffi.cdef[[
    // 数学函数
    double sin(double x);
    double cos(double x);
    double sqrt(double x);

    // 字符串函数
    size_t strlen(const char *s);
    int strcmp(const char *s1, const char *s2);

    // 内存操作
    void *malloc(size_t size);
    void free(void *ptr);
    void *memset(void *s, int c, size_t n);
    void *memcpy(void *dest, const void *src, size_t n);
]]

-- 调用数学函数
local angle = 3.14159 / 4  -- 45 度
print(string.format("sin(45) = %.4f", ffi.C.sin(angle)))
print(string.format("cos(45) = %.4f", ffi.C.cos(angle)))
print(string.format("sqrt(2) = %.4f", ffi.C.sqrt(2.0)))

-- 调用字符串函数
local len = ffi.C.strlen("Hello, World!")
print("字符串长度: " .. tonumber(len))
```

### 5. FFI 加载自定义 C 库

```lua
local ffi = require("ffi")

-- 声明库中的函数
ffi.cdef[[
    int mylib_add(int a, int b);
    const char* mylib_greet(const char* name);
]]

-- 加载动态库
local mylib = ffi.load("mylib")  -- 加载 libmylib.so 或 mylib.dll

-- 调用库函数
local sum = mylib.mylib_add(3, 5)
print("3 + 5 = " .. sum)

local greeting = ffi.string(mylib.mylib_greet("World"))
print(greeting)
```

### 6. JIT 控制模块

LuaJIT 提供了 jit 模块来控制 JIT 编译器的行为：

```lua
-- 查看 JIT 状态
print(jit.version)   -- LuaJIT 版本
print(jit.os)        -- 操作系统
print(jit.arch)      -- CPU 架构
print(jit.status())  -- JIT 是否启用

-- 关闭 JIT（调试用）
jit.off()

-- 重新启用 JIT
jit.on()

-- 对特定函数关闭 JIT
local function hotFunction()
    -- 这个函数不会被 JIT 编译
end
jit.off(hotFunction)

-- 查看 JIT 编译的 trace
jit.opt.start("hotloop=10")  -- 循环执行 10 次后开始 JIT 编译
jit.opt.start("hotexit=5")   -- 退出分支执行 5 次后开始编译
```

### 7. JIT 优化选项

```lua
-- 设置 JIT 优化级别
jit.opt.start(2)  -- 0-2，2 是最高优化级别（默认）

-- 常用优化选项
jit.opt.start("hotloop=10")     -- 循环多少次后触发 JIT
jit.opt.start("hotexit=5")      -- 退出分支多少次后触发 JIT
jit.opt.start("tryside=4")      -- 尝试录制 trace 的深度
jit.opt.start("maxtrace=1000")  -- 最大 trace 数量
jit.opt.start("maxrecord=4000") -- 单个 trace 最大录制指令数
```

## 常见场景

### 场景一：高性能数学计算

使用 FFI 的 C 类型进行数学运算比 Lua 原生 number 更快：

```lua
local ffi = require("ffi")

-- 使用 FFI 数组进行向量运算
function vectorAdd(a, b, n)
    local result = ffi.new("double[?]", n)
    for i = 0, n - 1 do
        result[i] = a[i] + b[i]
    end
    return result
end

-- 创建大数组
local n = 1000000
local a = ffi.new("double[?]", n)
local b = ffi.new("double[?]", n)
for i = 0, n - 1 do
    a[i] = math.random()
    b[i] = math.random()
end

-- 执行向量加法
local result = vectorAdd(a, b, n)
```

### 场景二：与系统 API 交互

```lua
local ffi = require("ffi")

-- 声明系统函数（Linux）
ffi.cdef[[
    typedef long time_t;
    time_t time(time_t *tloc);
    int getpid();
]]

-- 获取当前时间戳
local timestamp = tonumber(ffi.C.time(nil))
print("时间戳: " .. timestamp)

-- 获取进程 ID
local pid = ffi.C.getpid()
print("进程 ID: " .. pid)
```

## 注意事项与常见错误

### FFI cdata 不是 Lua 类型

FFI 创建的 cdata 对象不是 Lua 的 table 或 number，不能直接用于 Lua 的标准函数：

```lua
local ffi = require("ffi")
local x = ffi.new("int", 42)

-- 错误：cdata 不能直接用于字符串拼接
-- print("x = " .. x)  -- 可能报错

-- 正确：先转换为 Lua 类型
print("x = " .. tonumber(x))

-- 正确：使用 ffi.string 转换字符串
local s = ffi.new("const char[6]", "hello")
print(ffi.string(s))  -- 转换为 Lua string
```

### JIT 回退（NYI）

某些 Lua 特性不被 JIT 编译器支持，会回退到解释模式：

```lua
-- 以下操作会导致 JIT 回退：
-- table.getn()、table.maxn()
-- 使用 ... 可变参数的深层嵌套
-- 对 cdata 调用 __tostring 元方法
-- 深层递归调用

-- 检查是否有 JIT 回退
jit.opt.start("jiton")  -- 确保 JIT 开启
-- 使用 -jv 或 -jdump 参数运行查看 trace 日志
-- luajit -jv myscript.lua
```

### 内存管理

FFI 分配的 cdata 不受 Lua 垃圾回收器管理（除非通过 ffi.gc 注册析构函数）：

```lua
-- 为 cdata 注册析构函数
ffi.cdef[[
    void *malloc(size_t size);
    void free(void *ptr);
]]

local function managedMalloc(size)
    local ptr = ffi.C.malloc(size)
    if ptr == nil then
        error("内存分配失败")
    end
    -- 注册析构函数，当 ptr 被 GC 回收时自动调用 free
    return ffi.gc(ptr, ffi.C.free)
end

local buf = managedMalloc(1024)
-- buf 被 GC 回收时，ffi.C.free(buf) 会自动调用
```

### LuaJIT 的 1GB 限制

32 位 LuaJIT 的 GC 内存限制约为 1GB。如果需要处理大量数据，考虑使用 FFI 分配的 C 内存（不受此限制），或使用 64 位 LuaJIT。

## 进阶用法

### FFI 回调函数

FFI 允许将 Lua 函数作为 C 回调传递：

```lua
local ffi = require("ffi")

ffi.cdef[[
    typedef void (*CallbackFunc)(int value);
    void register_callback(CallbackFunc cb);
    void trigger_callback(int value);
]]

-- 创建回调函数
local callback = ffi.cast("CallbackFunc", function(value)
    print("回调被调用，值: " .. value)
end)

-- 传递回调给 C 函数
-- register_callback(callback)
-- trigger_callback(42)

-- 回调使用完毕后释放
callback:free()
```

注意：FFI 回调有性能开销，因为每次调用都需要从 C 栈切换到 Lua 栈。不要在高频调用的场景中使用 FFI 回调。

### table.new 和 table.clear

LuaJIT 提供了两个实用的表操作函数：

```lua
local new = require("table.new")
local clear = require("table.clear")

-- table.new(narray, nhash)：预分配表空间
-- narray：数组部分预分配的槽位数
-- nhash：哈希部分预分配的槽位数
local t = new(1000, 50)  -- 预分配 1000 个数组槽位和 50 个哈希槽位

-- table.clear(t)：快速清空表
-- 比创建新表快，因为复用了已分配的内存
clear(t)  -- 清空表但保留内存分配
```

### 使用 FFI 实现高性能数据结构

```lua
local ffi = require("ffi")

-- 高性能环形缓冲区
ffi.cdef[[
    typedef struct {
        int head;
        int tail;
        int capacity;
        int data[?];  -- 柔性数组
    } RingBuffer;
]]

function createRingBuffer(capacity)
    local rb = ffi.new("RingBuffer", capacity + 1)
    rb.head = 0
    rb.tail = 0
    rb.capacity = capacity + 1
    return rb
end

function rbPush(rb, value)
    local next = (rb.tail + 1) % rb.capacity
    if next == rb.head then
        return false  -- 缓冲区已满
    end
    rb.data[rb.tail] = value
    rb.tail = next
    return true
end

function rbPop(rb)
    if rb.head == rb.tail then
        return nil  -- 缓冲区为空
    end
    local value = rb.data[rb.head]
    rb.head = (rb.head + 1) % rb.capacity
    return value
end

-- 使用
local buf = createRingBuffer(1000)
rbPush(buf, 42)
rbPush(buf, 100)
print(rbPop(buf))  -- 输出: 42
print(rbPop(buf))  -- 输出: 100
```
