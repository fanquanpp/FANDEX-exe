---
order: 104
title: 'Entity-Framework-Core迁移与优化'
module: csharp
category: 'dev-lang'
difficulty: advanced
description: 'Entity Framework Core迁移与性能优化详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/委托与事件底层原理
  - csharp/反射与特性应用
  - 'csharp/ASP-NET-Core中间件管道'
  - csharp/依赖注入生命周期
prerequisites:
  - csharp/概述与环境配置
---

## 1. 迁移命令

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet ef migrations remove  # 撤销上次迁移
```

## 2. 常见优化

### 2.1 N+1 问题

```csharp
//  N+1 查询
var blogs = context.Blogs.ToList();
foreach (var blog in blogs) {
    var posts = blog.Posts.ToList();  // 每个博客一次查询
}

//  Eager Loading
var blogs = context.Blogs.Include(b => b.Posts).ToList();
```

### 2.2 选择性加载

```csharp
// 只查询需要的列
var results = context.Users
    .Where(u => u.Active)
    .Select(u => new { u.Id, u.Name })
    .ToList();
```

### 2.3 批量操作

```csharp
// 使用 EFCore.BulkExtensions
context.BulkInsert(entities);
context.BulkUpdate(entities);
```

### 2.4 分割查询

```csharp
context.Blogs
    .Include(b => b.Posts)
    .AsSplitQuery()  // 拆分为多个 SQL 查询
    .ToList();
```
