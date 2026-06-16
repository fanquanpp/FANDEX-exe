---
order: 100
title: LINQ延迟与立即执行
module: csharp
category: 'dev-lang'
difficulty: advanced
description: 'C# LINQ延迟执行与立即执行详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#12与C#13新特性'
  - 'csharp/C#与反射'
  - 'csharp/async-await状态机'
  - csharp/委托与事件底层原理
prerequisites:
  - csharp/概述与环境配置
---

## 概述

LINQ 的执行方式分为延迟执行和立即执行两种。延迟执行在枚举时才计算结果，适合链式操作和查询组合；立即执行在调用时立即计算并返回结果。理解两者的区别是避免 Bug 和优化性能的关键。

## 基础概念

### 延迟执行 vs 立即执行

| 特性     | 延迟执行               | 立即执行             |
| -------- | ---------------------- | -------------------- |
| 执行时机 | 枚举时（如 foreach）   | 调用时立即执行       |
| 返回类型 | IEnumerable<T>         | 具体值或集合         |
| 多次枚举 | 每次重新计算           | 结果已缓存           |
| 适用操作 | Where, Select, OrderBy | ToList, Count, First |

## 快速上手

### 延迟执行

```csharp
// 延迟执行：定义查询时不执行，枚举时才执行
var query = numbers.Where(n => n > 3);  // 不执行
var results = query.ToList();           // 此时才执行

// 延迟执行的方法
// Where, Select, OrderBy, GroupBy, Skip, Take,
// Concat, Union, SelectMany, Reverse, ...
```

### 立即执行

```csharp
// 立即执行：调用时立即计算结果
var count = numbers.Count();            // 立即执行
var list = numbers.ToList();            // 立即执行
var first = numbers.First();            // 立即执行
var any = numbers.Any(n => n > 5);      // 立即执行
var dict = numbers.ToDictionary(n => n); // 立即执行

// 立即执行的方法
// ToList, ToArray, ToDictionary, ToLookup,
// Count, LongCount, First, FirstOrDefault,
// Last, Single, Any, All, Aggregate, ...
```

## 详细用法

### 延迟执行的陷阱

```csharp
// 陷阱一：修改源数据后查询结果变化
var numbers = new List<int> { 1, 2, 3 };
var query = numbers.Where(n => n > 1);
numbers.Add(4);  // 修改源数据
query.Count();   // 3（包含新添加的 4）

// 解决：使用 ToList() 冻结结果
var frozen = numbers.Where(n => n > 1).ToList();
numbers.Add(5);
frozen.Count();  // 仍然是之前的结果

// 陷阱二：闭包捕获变量
var filters = new List<Func<int, bool>>();
for (int i = 0; i < 3; i++) {
    filters.Add(n => n > i); // 所有过滤器都捕获同一个 i
}
// 循环结束后 i = 3，所有过滤器都是 n > 3

// 解决：使用局部变量
for (int i = 0; i < 3; i++) {
    int threshold = i; // 每次循环创建新的局部变量
    filters.Add(n => n > threshold);
}
```

### 多次枚举问题

```csharp
// 问题：延迟查询被多次枚举，每次都重新计算
var query = expensiveDataSource.Where(Filter).Select(Transform);

// 第一次枚举：执行完整查询
foreach (var item in query) { Process(item); }

// 第二次枚举：再次执行完整查询（浪费！）
var count = query.Count();

// 解决：使用 ToList() 缓存结果
var cached = query.ToList();
foreach (var item in cached) { Process(item); }
var count = cached.Count;
```

### IQueryable vs IEnumerable

```csharp
// IEnumerable：客户端执行，在内存中过滤
IEnumerable<User> users = dbContext.Users.AsEnumerable();
var result = users.Where(u => u.Age > 18); // 全部加载到内存再过滤

// IQueryable：服务端执行，翻译为 SQL
IQueryable<User> users = dbContext.Users;
var result = users.Where(u => u.Age > 18); // 翻译为 WHERE Age > 18

// 对比
| 类型        | 执行位置         | 适用场景   |
| ----------- | ---------------- | ---------- |
| IEnumerable | 客户端（内存）   | 内存集合   |
| IQueryable  | 服务端（数据库） | 数据库查询 |

// 常见错误：过早转为 IEnumerable
var users = dbContext.Users
    .AsEnumerable()  // 错误！后续操作在内存中执行
    .Where(u => u.Age > 18); // 应该在数据库过滤
```

## 常见场景

### 动态查询构建

```csharp
// 利用延迟执行构建动态查询
IQueryable<User> query = dbContext.Users;

if (!string.IsNullOrEmpty(nameFilter))
    query = query.Where(u => u.Name.Contains(nameFilter));

if (minAge.HasValue)
    query = query.Where(u => u.Age >= minAge.Value);

if (cityFilter != null)
    query = query.Where(u => u.City == cityFilter);

// 所有条件组合完成后，一次执行
var results = await query.ToListAsync();
```

### 流式处理大数据

```csharp
// 利用延迟执行处理大数据集，避免一次性加载
var largeData = File.ReadLines("large.csv") // 延迟读取
    .Select(ParseLine)
    .Where(item => item.IsValid)
    .GroupBy(item => item.Category)
    .Select(g => new { Category = g.Key, Count = g.Count() });

// 枚举时逐行处理，内存占用低
foreach (var group in largeData) {
    Console.WriteLine($"{group.Category}: {group.Count}");
}
```

## 注意事项

- 延迟查询每次枚举都会重新执行，需要缓存时使用 ToList/ToArray
- 修改源数据会影响延迟查询的结果，注意时序
- IQueryable 的链式调用在数据库端执行，不要过早转为 IEnumerable
- 闭包中捕获循环变量时注意延迟执行的影响
- 立即执行方法（如 First）在空序列上会抛出异常，使用 FirstOrDefault 更安全
- Any() 比 Count() > 0 更高效，因为 Any 找到第一个匹配就返回

## 进阶用法

### 自定义延迟操作符

```csharp
// 使用 yield return 实现自定义延迟操作符
public static IEnumerable<T> WhereNot<T>(
    this IEnumerable<T> source, Func<T, bool> predicate) {
    foreach (var item in source) {
        if (!predicate(item))
            yield return item; // 延迟返回
    }
}

// 使用
var result = numbers.WhereNot(n => n % 2 == 0); // 过滤偶数
```

### 异步 LINQ

```csharp
// 使用 System.Linq.Async 进行异步 LINQ 操作
var results = await asyncEnumerable
    .WhereAwait(async item => await FilterAsync(item))
    .SelectAwait(async item => await TransformAsync(item))
    .ToListAsync();

// IAsyncEnumerable 延迟执行
async IAsyncEnumerable<int> GenerateNumbersAsync() {
    for (int i = 0; i < 100; i++) {
        await Task.Delay(100);
        yield return i; // 延迟产生
    }
}
```
