---
order: 50
title: LINQ深度解析
module: csharp
category: 'C#'
difficulty: intermediate
description: LINQ查询语法与方法语法
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/测试与工程化
  - csharp/游戏开发与Unity
  - csharp/异步编程详解
  - csharp/模式匹配
prerequisites:
  - csharp/概述与环境配置
---

## 概述

LINQ（Language Integrated Query）是 C# 的核心特性之一，提供统一的查询语法来操作各种数据源。LINQ 支持方法语法和查询语法两种风格，配合 Lambda 表达式可以实现简洁而强大的数据转换和过滤。

## 基础概念

### 两种语法风格

```csharp
// 方法语法（更常用，推荐）
var result = users
    .Where(u => u.Age > 18)
    .OrderBy(u => u.Name)
    .Select(u => new { u.Name, u.Age });

// 查询语法（类似 SQL，适合复杂 join）
var result2 = from u in users
              where u.Age > 18
              orderby u.Name
              select new { u.Name, u.Age };
```

### 常用操作符

| 操作符    | 说明         | 类型 |
| --------- | ------------ | ---- |
| Where     | 过滤         | 延迟 |
| Select    | 投影         | 延迟 |
| OrderBy   | 排序         | 延迟 |
| GroupBy   | 分组         | 延迟 |
| Join      | 内连接       | 延迟 |
| GroupJoin | 分组连接     | 延迟 |
| Distinct  | 去重         | 延迟 |
| Aggregate | 自定义聚合   | 立即 |
| Zip       | 合并两个序列 | 延迟 |
| ToList    | 转为列表     | 立即 |
| First     | 取第一个     | 立即 |
| Count     | 计数         | 立即 |

## 快速上手

### 过滤与投影

```csharp
// 过滤
var adults = users.Where(u => u.Age >= 18);
var beijingUsers = users.Where(u => u.City == "北京");

// 多条件过滤
var result = users.Where(u => u.Age > 18 && u.IsActive);

// 投影（转换数据）
var names = users.Select(u => u.Name);
var dtos = users.Select(u => new UserDTO { Name = u.Name, Email = u.Email });

// 展平投影
var allOrders = users.SelectMany(u => u.Orders);
var allTags = articles.SelectMany(a => a.Tags).Distinct();
```

### 排序与分组

```csharp
// 排序
var sorted = users.OrderBy(u => u.Age);              // 升序
var sorted2 = users.OrderByDescending(u => u.Age);   // 降序
var sorted3 = users.OrderBy(u => u.Age).ThenBy(u => u.Name); // 多级排序

// 分组
var groups = users.GroupBy(u => u.City);
foreach (var group in groups) {
    Console.WriteLine($"{group.Key}: {group.Count()} 人");
}

// 分组后投影
var stats = users.GroupBy(u => u.City)
    .Select(g => new {
        City = g.Key,
        Count = g.Count(),
        AvgAge = g.Average(u => u.Age)
    });
```

## 详细用法

### Join 操作

```csharp
// 内连接
var result = from u in users
             join o in orders on u.Id equals o.UserId
             select new { u.Name, o.Amount };

// 方法语法
var result2 = users.Join(orders,
    u => u.Id,
    o => o.UserId,
    (u, o) => new { u.Name, o.Amount });

// 左连接
var leftJoin = from u in users
               join o in orders on u.Id equals o.UserId into userOrders
               from o in userOrders.DefaultIfEmpty()
               select new { u.Name, Amount = o?.Amount ?? 0 };

// 分组连接
var groupJoin = users.GroupJoin(orders,
    u => u.Id,
    o => o.UserId,
    (u, os) => new { u.Name, Orders = os });
```

### 聚合操作

```csharp
// 基本聚合
var count = users.Count();
var totalAge = users.Sum(u => u.Age);
var avgAge = users.Average(u => u.Age);
var maxAge = users.Max(u => u.Age);
var minAge = users.Min(u => u.Age);

// 条件计数
var activeCount = users.Count(u => u.IsActive);

// 自定义聚合
var summary = orders.Aggregate(
    new { Total = 0m, Count = 0 },
    (acc, o) => new { Total = acc.Total + o.Amount, Count = acc.Count + 1 },
    acc => new { acc.Total, acc.Count, Average = acc.Total / acc.Count });

// 字符串聚合
var names = users.Select(u => u.Name).Aggregate((a, b) => $"{a}, {b}");
```

### 集合操作

```csharp
// 去重
var uniqueCities = users.Select(u => u.City).Distinct();

// 按属性去重
var uniqueUsers = users.DistinctBy(u => u.Email);

// 集合运算
var union = list1.Union(list2);       // 并集（去重）
var concat = list1.Concat(list2);     // 连接（不去重）
var intersect = list1.Intersect(list2); // 交集
var except = list1.Except(list2);     // 差集

// 分页
var page = users.OrderBy(u => u.Id).Skip((pageNum - 1) * pageSize).Take(pageSize);
```

## 常见场景

### 数据转换管道

```csharp
// 复杂的数据转换管道
var report = orders
    .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
    .GroupBy(o => o.Product.Category)
    .Select(g => new CategoryReport {
        Category = g.Key,
        TotalRevenue = g.Sum(o => o.Amount),
        OrderCount = g.Count(),
        TopProduct = g.GroupBy(o => o.Product.Name)
            .OrderByDescending(pg => pg.Count())
            .First()
            .Key
    })
    .OrderByDescending(r => r.TotalRevenue)
    .ToList();
```

### 字典和查找表

```csharp
// 转为字典
var userDict = users.ToDictionary(u => u.Id, u => u);

// 分组查找表
var usersByCity = users.ToLookup(u => u.City);
var beijingUsers = usersByCity["北京"]; // 获取北京的所有用户

// 带冲突处理的字典
var dict = users.ToDictionary(
    u => u.Email,
    u => u,
    StringComparer.OrdinalIgnoreCase);
```

## 注意事项

- 延迟执行的查询每次枚举都会重新计算，需要缓存时使用 ToList/ToArray
- SelectMany 用于展平嵌套集合，是 LINQ 中最强大的操作符之一
- Join 操作在内存集合中使用，数据库查询应使用导航属性
- 分组操作 GroupBy 返回的是 IGrouping<Key, Element> 序列
- 使用 Any() 替代 Count() > 0 判断是否存在元素，性能更好
- 复杂查询建议使用查询语法，更易读

## 进阶用法

### 自定义 LINQ 操作符

```csharp
// 扩展方法实现自定义操作符
public static IEnumerable<TSource> WhereIf<TSource>(
    this IEnumerable<TSource> source,
    bool condition,
    Func<TSource, bool> predicate) {
    return condition ? source.Where(predicate) : source;
}

// 使用：条件过滤
var result = users
    .WhereIf(!string.IsNullOrEmpty(nameFilter), u => u.Name.Contains(nameFilter))
    .WhereIf(minAge.HasValue, u => u.Age >= minAge.Value);
```

### PLINQ 并行查询

```csharp
// 使用 PLINQ 并行处理大数据集
var result = largeData.AsParallel()
    .Where(item => item.IsValid)
    .Select(item => Transform(item))
    .OrderBy(item => item.Priority)
    .ToList();

// 控制并行度
var result2 = largeData.AsParallel()
    .WithDegreeOfParallelism(4)
    .WithCancellation(cancellationToken)
    .Select(HeavyComputation)
    .ToList();
```
