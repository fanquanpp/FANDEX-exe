---
order: 64
title: Lua性能优化
module: lua
category: Lua
difficulty: intermediate
description: Lua性能优化技巧
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/Lua迭代器
  - 'lua/Lua与World of Warcraft'
  - lua/Lua调试技巧
  - lua/协程与异步
prerequisites:
  - lua/概述与环境配置
---

## 概述

Lua 是一种以简洁和高效著称的脚本语言，但即使如此，不当的编码方式仍然会导致性能问题。性能优化不是盲目地修改代码，而是在理解 Lua 运行机制的基础上，针对性地消除瓶颈。Lua 的性能瓶颈通常出现在全局变量访问、字符串拼接、表创建和热路径上的不必要操作。

对于大多数 Lua 应用，性能优化的第一步是使用 LuaJIT 替代标准 Lua 解释器，这通常能带来 10-50 倍的性能提升。在此基础上，再通过代码层面的优化进一步提升性能。

## 基础概念

### Lua 的性能特点

Lua 是解释型语言，每次执行变量查找、函数调用都有运行时开销。理解这些开销的来源是优化的基础：

- 全局变量存储在全局表中，每次访问都是一次哈希查找
- 局部变量存储在寄存器中，访问速度极快
- 字符串在 Lua 中是不可变的，每次拼接都会创建新字符串
- 表的创建和垃圾回收都有开销

### 优化的基本原则

- 先测量，再优化：用 os.clock 或 debug.sethook 测量耗时，找到真正的瓶颈
- 优化热路径：只优化执行频率最高的代码，冷代码不需要优化
- 使用局部变量：这是 Lua 性能优化中最重要的一条规则
- 减少垃圾回收压力：避免在循环中创建不必要的临时对象

## 快速上手

### 使用局部变量代替全局变量

这是最简单也最有效的优化：

```lua
-- 差：每次循环都访问全局变量 sin
for i = 1, 1000000 do
    local x = math.sin(i)  -- math 是全局表，sin 是哈希查找
end

-- 好：将全局函数缓存为局部变量
local sin = math.sin  -- 只查找一次
for i = 1, 1000000 do
    local x = sin(i)  -- 直接调用，无需哈希查找
end
```

### 测量代码执行时间

```lua
-- 简单的计时器
local startTime = os.clock()

-- 执行需要测量的代码
for i = 1, 1000000 do
    -- 你的代码
end

local elapsed = os.clock() - startTime
print(string.format("耗时: %.3f 秒", elapsed))
```

## 详细用法

### 1. 局部变量优化

在 Lua 中，局部变量的访问速度远快于全局变量。全局变量存储在全局表（\_G）中，每次访问都需要哈希查找；局部变量存储在栈寄存器中，访问是直接的：

```lua
-- 差：在循环中反复访问全局表
function processItems(items)
    for i = 1, #items do
        -- 每次循环都要查找全局的 table.insert
        table.insert(results, transform(items[i]))
    end
end

-- 好：将全局函数缓存为局部变量
function processItems(items)
    local insert = table.insert  -- 缓存全局函数
    local transform = transform  -- 缓存全局函数（如果是全局的）
    for i = 1, #items do
        insert(results, transform(items[i]))
    end
end
```

在模块级别缓存常用函数：

```lua
-- 模块顶部缓存常用函数
local tostring = tostring
local tonumber = tonumber
local pairs = pairs
local ipairs = ipairs
local table_insert = table.insert
local string_format = string.format

-- 后续代码中使用局部变量
function formatMessage(name, value)
    return string_format("%s = %s", name, tostring(value))
end
```

### 2. 表操作优化

表是 Lua 中最常用的数据结构，不当使用会产生大量垃圾回收压力：

```lua
-- 差：在循环中反复创建新表
function getPoints(count)
    local points = {}
    for i = 1, count do
        -- 每次迭代都创建一个新表
        table.insert(points, {x = i, y = i * 2})
    end
    return points
end

-- 好：预分配表大小，减少扩容
function getPoints(count)
    local points = {}
    -- 预分配足够的空间（Lua 5.3+ 的 table.new 或手动设置）
    for i = 1, count do
        points[i] = {x = i, y = i * 2}  -- 直接赋值比 table.insert 快
    end
    return points
end

-- 更好：复用表对象，避免频繁创建和回收
local pointPool = {}  -- 对象池

function acquirePoint(x, y)
    local point = table.remove(pointPool) or {}  -- 从池中取或创建新表
    point.x = x
    point.y = y
    return point
end

function releasePoint(point)
    point.x = nil
    point.y = nil
    table.insert(pointPool, point)  -- 放回池中
end
```

### 3. 字符串拼接优化

Lua 中的字符串是不可变的，每次拼接都会创建一个新的字符串对象：

```lua
-- 差：使用 .. 在循环中拼接字符串
local result = ""
for i = 1, 10000 do
    result = result .. "line " .. i .. "\n"  -- 每次都创建新字符串
end

-- 好：将片段收集到表中，最后用 table.concat 拼接
local parts = {}
for i = 1, 10000 do
    parts[i] = "line " .. i .. "\n"  -- 每个片段只创建一次
end
local result = table.concat(parts)  -- 一次性拼接，效率高

-- 更好：如果知道大概数量，预分配表大小
local parts = {}
for i = 1, 10000 do
    parts[i] = "line " .. i
end
local result = table.concat(parts, "\n") .. "\n"  -- 用分隔符拼接
```

### 4. 避免在热路径创建闭包

闭包的创建有运行时开销，不要在频繁执行的代码中创建闭包：

```lua
-- 差：每次调用都创建新的闭包
function processAll(items)
    for i = 1, #items do
        -- 每次迭代都创建一个新闭包
        local function transform(x)
            return x * 2
        end
        items[i] = transform(items[i])
    end
end

-- 好：将闭包定义移到循环外部
function processAll(items)
    local function transform(x)
        return x * 2
    end
    for i = 1, #items do
        items[i] = transform(items[i])
    end
end

-- 更好：如果逻辑简单，直接内联
function processAll(items)
    for i = 1, #items do
        items[i] = items[i] * 2  -- 直接计算，无需函数调用
    end
end
```

### 5. 数组 vs 哈希表

Lua 的表同时支持数组和哈希两种模式。数组部分（连续整数键）的访问比哈希部分快：

```lua
-- 数组模式：键是连续整数，访问最快
local arr = {10, 20, 30, 40, 50}
print(arr[1])  -- 数组访问，O(1)

-- 哈希模式：键是字符串或不连续整数，需要哈希查找
local dict = {name = "Alice", age = 25}
print(dict.name)  -- 哈希查找，比数组慢

-- 如果只需要序列数据，用数组而不是哈希
-- 差：用哈希存储序列数据
local items = {}
items["1"] = "apple"
items["2"] = "banana"

-- 好：用数组存储序列数据
local items = {"apple", "banana"}
```

### 6. 使用 table.insert 的位置参数

```lua
-- 差：table.insert 默认插入末尾，但每次调用都有函数调用开销
for i = 1, 1000 do
    table.insert(list, value)
end

-- 好：直接用索引赋值（如果知道位置）
for i = 1, 1000 do
    list[i] = value
end

-- 如果必须插入到末尾且不知道总数量
-- table.insert(t, value) 等价于 t[#t + 1] = value
-- 但 # 操作符对大表有遍历开销，table.insert 内部做了优化
```

### 7. 减少函数调用开销

函数调用在 Lua 中有固定开销。在极高性能要求的场景中，可以内联简单逻辑：

```lua
-- 差：简单逻辑包装成函数
function isPositive(x)
    return x > 0
end
for i = 1, 1000000 do
    if isPositive(values[i]) then
        -- 处理
    end
end

-- 好：直接内联判断
for i = 1, 1000000 do
    if values[i] > 0 then
        -- 处理
    end
end
```

## 常见场景

### 场景一：游戏循环优化

游戏主循环每秒执行 60 次，必须保证每次在 16ms 内完成：

```lua
-- 缓存所有常用函数
local update_entities = update_entities
local render_frame = render_frame
local process_input = process_input
local collectgarbage = collectgarbage

-- 游戏主循环
function gameLoop(dt)
    process_input(dt)       -- 处理输入
    update_entities(dt)     -- 更新实体
    render_frame()          -- 渲染帧

    -- 在空闲时执行增量垃圾回收，避免一次性大回收造成卡顿
    collectgarbage("step", 2)
end
```

### 场景二：大量数据处理

处理大量数据时，减少中间对象的创建：

```lua
-- 差：创建大量中间表
function filterAndTransform(data)
    local filtered = {}
    for i = 1, #data do
        if data[i] > 0 then
            table.insert(filtered, {value = data[i] * 2})  -- 创建中间表
        end
    end
    return filtered
end

-- 好：原地修改或使用简单值
function filterAndTransform(data)
    local result = {}
    local j = 1
    for i = 1, #data do
        if data[i] > 0 then
            result[j] = data[i] * 2  -- 直接存储数值，不创建表
            j = j + 1
        end
    end
    return result
end
```

## 注意事项与常见错误

### 过早优化

不要在没有性能数据的情况下优化代码。先用 os.clock 测量，找到真正的瓶颈再优化。大部分代码不需要优化，只有热路径（执行频率最高的代码）才值得优化。

### 不要忽略算法复杂度

代码层面的优化通常只能提升常数倍的性能。如果算法复杂度是 O(n^2)，换成 O(n log n) 的算法比任何代码层面的优化都有效。

### collectgarbage 的使用

Lua 的垃圾回收器是自动运行的，但你可以控制它的行为：

```lua
-- 在性能敏感的操作前暂停垃圾回收
collectgarbage("stop")
-- 执行性能敏感的操作...
-- 操作完成后恢复垃圾回收
collectgarbage("restart")
collectgarbage("step")  -- 手动执行一步回收
```

但不要长时间暂停垃圾回收，否则内存会持续增长。

### LuaJIT 的注意事项

LuaJIT 有自己的优化策略，有些在标准 Lua 中有效的优化在 LuaJIT 中可能不需要。例如，LuaJIT 的 JIT 编译器会自动消除一些不必要的表查找。使用 LuaJIT 时，建议先用默认方式编写代码，再根据 JIT 的 trace 日志决定优化方向。

## 进阶用法

### 使用 LuaJIT 获得更好性能

LuaJIT 是 Lua 的高性能实现，通过 JIT（即时编译）技术将热点代码编译为本地机器码：

```lua
-- LuaJIT 特有的 table.new 和 table.clear
-- table.new(narray, nhash)：预分配表的数组部分和哈希部分大小
local new = require("table.new")
local t = new(1000, 10)  -- 预分配 1000 个数组槽位和 10 个哈希槽位

-- table.clear(t)：快速清空表，比创建新表快
local clear = require("table.clear")
clear(t)  -- 清空表但保留已分配的内存
```

### FFI 调用 C 函数

LuaJIT 的 FFI 可以直接调用 C 函数，性能接近原生 C：

```lua
local ffi = require("ffi")

-- 声明 C 函数
ffi.cdef[[
    int abs(int x);
    double sqrt(double x);
]]

-- 直接调用 C 函数，无需 Lua/C 绑定
local x = ffi.C.abs(-42)     -- 调用 C 标准库的 abs
local y = ffi.C.sqrt(144.0)  -- 调用 C 标准库的 sqrt
```

### 增量垃圾回收

对于需要稳定帧率的应用（如游戏），使用增量垃圾回收避免长时间停顿：

```lua
-- 设置垃圾回收的参数
-- pause：回收器在再次运行前等待的倍数（默认 200，即内存增长 2 倍时运行）
-- stepmul：回收步长的倍数（默认 200，步长 = 内存分配量 * stepmul / 100）
collectgarbage("setpause", 200)
collectgarbage("setstepmul", 400)

-- 在每帧结束时执行小步回收
function onFrameEnd()
    collectgarbage("step", 1)  -- 执行一步回收
end
```
