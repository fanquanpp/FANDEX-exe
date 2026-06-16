---
order: 105
title: 'ASP-NET-Core中间件管道'
module: csharp
category: 'dev-lang'
difficulty: advanced
description: 'ASP.NET Core中间件管道详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/反射与特性应用
  - 'csharp/Entity-Framework-Core迁移与优化'
  - csharp/依赖注入生命周期
  - csharp/GC代机制
prerequisites:
  - csharp/概述与环境配置
---

## 1. 管道模型

```
Request → Middleware1 → Middleware2 → Middleware3 → Endpoint
                                                    ↓
Response ← Middleware1 ← Middleware2 ← Middleware3 ← Handler
```

## 2. 内置中间件

```csharp
var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

## 3. 自定义中间件

```csharp
app.Use(async (context, next) => {
    // 前置逻辑
    var sw = Stopwatch.StartNew();

    await next();  // 调用下一个中间件

    // 后置逻辑
    sw.Stop();
    context.Response.Headers.Add("X-Elapsed-Ms", sw.ElapsedMilliseconds.ToString());
});
```

## 4. 中间件顺序

顺序很重要！错误的顺序可能导致功能异常：

```
1. UseExceptionHandler / UseDeveloperExceptionPage
2. UseHsts
3. UseHttpsRedirection
4. UseStaticFiles
5. UseRouting
6. UseCors
7. UseAuthentication
8. UseAuthorization
9. MapControllers
```
