---
order: 62
title: Lua迭代器
module: lua
category: Lua
difficulty: intermediate
description: 自定义迭代器
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/模块与包
  - lua/Lua错误处理
  - 'lua/Lua与World of Warcraft'
  - lua/Lua性能优化
prerequisites:
  - lua/概述与环境配置
---

## 概述

Lua 的泛型 for 循环通过迭代器函数遍历集合。理解迭代器的工作原理和自定义方式，是编写优雅 Lua 代码的关键。Lua 提供了无状态迭代器和有状态迭代器两种模式。

## 基础概念

### 泛型 for 的工作机制

```lua
-- 泛型 for 的完整语法
for var_1, ..., var_n in explist do block end

-- 等价于以下代码：
local f, s, var = explist
while true do
  local var_1, ..., var_n = f(s, var)
  if var_1 == nil then break end
  var = var_1
  block
end

-- f: 迭代器函数
-- s: 恒定状态（不变量）
-- var: 控制变量
```

### 内置迭代器

| 迭代器 | 用途                 |
| ------ | -------------------- |
| pairs  | 遍历表的所有键值对   |
| ipairs | 遍历数组的连续整数键 |
| next   | 返回下一个键值对     |

## 快速上手

### 简单迭代器

```lua
-- 最简单的迭代器：闭包实现
function range(n)
  local i = 0
  return function()
    i = i + 1
    if i <= n then return i end
  end
end

for i in range(5) do
  print(i) -- 输出 1, 2, 3, 4, 5
end

-- 带步长的迭代器
function range(start, stop, step)
  step = step or 1
  local current = start - step
  return function()
    current = current + step
    if current <= stop then return current end
  end
end

for i in range(1, 10, 2) do
  print(i) -- 输出 1, 3, 5, 7, 9
end
```

### pairs 和 ipairs 的区别

```lua
local t = {10, 20, 30, key = "value"}

-- ipairs：只遍历连续整数键（1, 2, 3...）
for i, v in ipairs(t) do
  print(i, v) -- 1 10, 2 20, 3 30
end

-- pairs：遍历所有键值对
for k, v in pairs(t) do
  print(k, v) -- 包括 key = "value"
end

-- 注意：pairs 的遍历顺序不确定
-- 如果需要有序遍历，需要先排序键
local keys = {}
for k in pairs(t) do table.insert(keys, k) end
table.sort(keys, function(a, b) return tostring(a) < tostring(b) end)
for _, k in ipairs(keys) do
  print(k, t[k])
end
```

## 详细用法

### 无状态迭代器

```lua
-- 无状态迭代器：不依赖闭包，所有状态通过参数传递
-- 更高效，因为不需要创建闭包

-- 实现自定义的 ipairs
local function iter(t, i)
  i = i + 1
  local v = t[i]
  if v ~= nil then return i, v end
end

function myIpairs(t)
  return iter, t, 0
end

-- 使用
for i, v in myIpairs({"a", "b", "c"}) do
  print(i, v)
end

-- 反向遍历迭代器
local function revIter(t, i)
  i = i - 1
  if i > 0 then return i, t[i] end
end

function revIpairs(t)
  return revIter, t, #t + 1
end

for i, v in revIpairs({"a", "b", "c"}) do
  print(i, v) -- 3 c, 2 b, 1 a
end
```

### 有状态迭代器

```lua
-- 有状态迭代器：使用闭包保存状态
-- 适合复杂遍历逻辑

-- 遍历树形结构
function treeIter(root)
  local stack = {root}
  return function()
    if #stack == 0 then return nil end
    local node = table.remove(stack)
    -- 子节点入栈（右子树先入栈，左子树后入栈）
    if node.right then table.insert(stack, node.right) end
    if node.left then table.insert(stack, node.left) end
    return node
  end
end

-- 过滤迭代器
function filterIter(iterFn, predicate)
  return function()
    for value in iterFn do
      if predicate(value) then return value end
    end
  end
end

-- 使用
local items = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
local evens = filterIter(range(10), function(x) return x % 2 == 0 end)
for v in evens do print(v) end -- 2, 4, 6, 8, 10
```

### 文件行迭代器

```lua
-- io.lines 返回文件行迭代器
for line in io.lines("data.txt") do
  process(line)
end

-- 自定义 CSV 行迭代器
function csvLines(filename)
  local file = io.open(filename, "r")
  if not file then return nil end
  return function()
    local line = file:read()
    if not line then
      file:close()
      return nil
    end
    -- 解析 CSV 行
    local fields = {}
    for field in line:gmatch("([^,]*)") do
      table.insert(fields, field)
    end
    return unpack(fields)
  end
end

-- 使用
for name, age, city in csvLines("users.csv") do
  print(name, age, city)
end
```

## 常见场景

### 字符串迭代器

```lua
-- 逐字符迭代
function chars(s)
  local i = 0
  return function()
    i = i + 1
    if i <= #s then return s:sub(i, i) end
  end
end

for c in chars("Hello") do
  print(c) -- H, e, l, l, o
end

-- 单词迭代器
function words(s)
  return s:gmatch("%S+")
end

for w in words("hello world from lua") do
  print(w)
end
```

### 组合迭代器

```lua
-- map 迭代器：对每个元素应用函数
function mapIter(iterFn, transform)
  return function()
    local value = iterFn()
    if value ~= nil then return transform(value) end
  end
end

-- 使用
local doubled = mapIter(range(5), function(x) return x * 2 end)
for v in doubled do print(v) end -- 2, 4, 6, 8, 10

-- take 迭代器：只取前 n 个
function takeIter(iterFn, n)
  local count = 0
  return function()
    if count >= n then return nil end
    count = count + 1
    return iterFn()
  end
end

for v in takeIter(range(100), 5) do
  print(v) -- 1, 2, 3, 4, 5
end
```

## 注意事项

- 无状态迭代器比有状态迭代器更高效，优先使用
- ipairs 遇到 nil 值会停止遍历，即使后面还有元素
- pairs 的遍历顺序不确定，不要依赖遍历顺序
- 闭包迭代器会捕获变量，注意循环中的变量引用
- 迭代器函数返回 nil 时 for 循环结束
- 自定义迭代器应保持语义清晰，避免副作用

## 进阶用法

### 协程迭代器

```lua
-- 使用协程实现复杂迭代器
function traverseTree(root)
  return coroutine.wrap(function()
    if root then
      for v in traverseTree(root.left) do coroutine.yield(v) end
      coroutine.yield(root.value)
      for v in traverseTree(root.right) do coroutine.yield(v) end
    end
  end)
end

-- 中序遍历二叉树
for value in traverseTree(root) do
  print(value)
end

-- 生成排列
function permutations(arr)
  return coroutine.wrap(function()
    local n = #arr
    local function generate(k)
      if k == 1 then
        coroutine.yield(table.concat(arr, ","))
      else
        for i = 1, k do
          arr[i], arr[k] = arr[k], arr[i]
          generate(k - 1)
          arr[i], arr[k] = arr[k], arr[i]
        end
      end
    end
    generate(n)
  end)
end

for p in permutations({1, 2, 3}) do
  print(p)
end
```
