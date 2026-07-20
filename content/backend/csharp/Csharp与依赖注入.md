---
order: 61
title: 'C#与依赖注入'
module: csharp
category: 'C#'
difficulty: intermediate
description: .NET依赖注入容器
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与MAUI'
  - 'csharp/C#与EF Core'
  - 'csharp/C#与最小API'
  - 'csharp/C#12与C#13新特性'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

依赖注入（Dependency Injection，简称 DI）是一种设计模式，核心思想是将对象所需的依赖从外部传入，而不是在对象内部创建。.NET 内置了功能完善的依赖注入容器，无需第三方库即可使用。它是 ASP.NET Core、MAUI 等 .NET 应用框架的基础设施。

为什么需要依赖注入？假设你有一个订单服务，它需要访问数据库和发送邮件。如果不使用依赖注入，你会在订单服务内部直接创建数据库连接和邮件客户端，这导致代码紧耦合、难以测试。使用依赖注入后，这些依赖从外部传入，你可以轻松替换为模拟实现进行单元测试。

## 基础概念

**服务**：在依赖注入中，"服务"指的是注册到容器中的任何对象。它可以是数据访问层、业务逻辑层、配置对象等。

**注册**：在应用启动时，将服务的接口和实现类关联起来，告诉容器"当有人请求 IUserService 时，提供 UserService 实例"。

**注入**：当创建一个类时，容器自动将其依赖的服务通过构造函数、属性或方法参数传入。

**生命周期**：.NET 依赖注入支持三种服务生命周期：Transient（瞬态）、Scoped（范围）和 Singleton（单例）。

**容器**：负责管理服务的注册、创建和销毁。.NET 内置容器是 `IServiceProvider`。

## 快速上手

最简单的依赖注入示例：

```csharp
using Microsoft.Extensions.DependencyInjection;

// 1. 定义服务接口
public interface IGreetingService
{
    string Greet(string name);
}

// 2. 实现服务
public class GreetingService : IGreetingService
{
    public string Greet(string name) => $"你好, {name}!";
}

// 3. 创建服务集合并注册服务
var services = new ServiceCollection();
services.AddTransient<IGreetingService, GreetingService>();

// 4. 构建服务提供者
var provider = services.BuildServiceProvider();

// 5. 获取服务实例
var greetingService = provider.GetRequiredService<IGreetingService>();
Console.WriteLine(greetingService.Greet("世界"));
// 输出: 你好, 世界!
```

在 ASP.NET Core 中，注册通常在 Program.cs 中完成：

```csharp
var builder = WebApplication.CreateBuilder(args);

// 注册服务
builder.Services.AddTransient<IGreetingService, GreetingService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

var app = builder.Build();

// 在端点中使用
app.MapGet("/greet", (IGreetingService service) =>
    service.Greet("用户"));

app.Run();
```

## 详细用法

### 三种生命周期

```csharp
// Transient - 每次请求都创建新实例
// 适合轻量级、无状态的服务
builder.Services.AddTransient<IEmailService, EmailService>();

// Scoped - 每个请求范围内共享一个实例
// 在 Web 应用中，每个 HTTP 请求是一个范围
// 适合需要共享状态的服务，如数据库上下文
builder.Services.AddScoped<IOrderService, OrderService>();

// Singleton - 整个应用生命周期内只有一个实例
// 适合线程安全的全局服务，如缓存、配置
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
```

通过实验观察三种生命周期的区别：

```csharp
public class DemoService
{
    // 每个实例有唯一标识
    public Guid Id { get; } = Guid.NewGuid();
}

// 注册为不同生命周期
services.AddTransient<DemoService>();       // 瞬态
services.AddScoped<DemoService>();          // 范围（注意：同一接口不能注册两次，这里仅作演示）
services.AddSingleton<DemoService>();       // 单例

// 测试
using var scope1 = provider.CreateScope();
var t1 = scope1.ServiceProvider.GetRequiredService<DemoService>();
var t2 = scope1.ServiceProvider.GetRequiredService<DemoService>();
// Transient: t1.Id != t2.Id（每次都是新实例）
// Scoped: t1.Id == t2.Id（同一范围内相同）
// Singleton: 所有请求都相同

using var scope2 = provider.CreateScope();
var t3 = scope2.ServiceProvider.GetRequiredService<DemoService>();
// Transient: t3.Id 与之前都不同
// Scoped: t3.Id != t1.Id（不同范围不同）
// Singleton: t3.Id == t1.Id（全局相同）
```

### 构造函数注入

这是最常用的注入方式：

```csharp
// 定义多个服务
public interface IUserRepository
{
    User? GetById(int id);
}

public interface ILoggerService
{
    void Log(string message);
}

// 通过构造函数注入依赖
public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly ILoggerService _logger;

    // 构造函数注入：容器自动传入已注册的服务
    public UserService(IUserRepository repository, ILoggerService logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public User? GetUser(int id)
    {
        _logger.Log($"正在获取用户 {id}");
        return _repository.GetById(id);
    }
}
```

### 多种注册方式

```csharp
// 1. 接口与实现类注册
services.AddTransient<IService, ServiceImpl>();

// 2. 直接注册实现类（不需要接口）
services.AddTransient<MyService>();

// 3. 工厂方法注册
services.AddTransient<ISettings>(provider =>
{
    // 可以在工厂中访问其他服务
    var config = provider.GetRequiredService<IConfiguration>();
    return new Settings
    {
        DbConnection = config.GetConnectionString("Default"),
        CacheExpiry = TimeSpan.FromMinutes(30)
    };
});

// 4. 带参数的实例注册
services.AddSingleton(new CacheOptions { MaxSize = 1000 });

// 5. 泛型注册
services.AddTransient(typeof(IRepository<>), typeof(Repository<>));
// 等价于为每种类型都注册了 IRepository<T> -> Repository<T>

// 6. 尝试注册（避免重复注册）
services.TryAddTransient<IService, ServiceImpl>();
// 如果 IService 已注册，则不会重复添加
```

### 服务解析

```csharp
// 1. GetRequiredService - 必须存在，否则抛异常
var service = provider.GetRequiredService<IService>();

// 2. GetService - 可选，不存在返回 null
var service = provider.GetService<IService>();
if (service is not null)
{
    // 使用服务
}

// 3. 从 IServiceProvider 解析多个服务
var allServices = provider.GetServices<IService>();

// 4. 在构造函数中注入 IEnumerable 解析多个实现
public class CompositeService
{
    // 注入所有 IHandler 的实现
    public CompositeService(IEnumerable<IHandler> handlers)
    {
        foreach (var handler in handlers)
        {
            handler.Handle();
        }
    }
}
```

### 范围服务

在非 Web 场景中手动创建服务范围：

```csharp
// 创建根服务提供者
var services = new ServiceCollection();
services.AddScoped<IScopedService, ScopedService>();
var provider = services.BuildServiceProvider();

// 创建服务范围
using var scope = provider.CreateScope();
var scopedService = scope.ServiceProvider.GetRequiredService<IScopedService>();

// 范围结束时，Scoped 服务会被释放
```

### 服务释放

实现 `IDisposable` 或 `IAsyncDisposable` 的服务会被容器自动释放：

```csharp
public class DatabaseService : IDisposable
{
    public void Dispose()
    {
        // 释放数据库连接等资源
        Console.WriteLine("DatabaseService 已释放");
    }
}

// 注册时指定生命周期
services.AddScoped<DatabaseService>();

// 使用 using 确保范围结束时释放
using var scope = provider.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<DatabaseService>();
// scope 结束时自动调用 db.Dispose()
```

## 常见场景

### 分层架构中的依赖注入

```csharp
// 数据访问层
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User> CreateAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    // 注入数据库上下文
    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id) =>
        await _context.Users.FindAsync(id);

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}

// 业务逻辑层
public interface IUserService
{
    Task<UserDto> GetUserAsync(int id);
}

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    // 注入仓储和日志
    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<UserDto> GetUserAsync(int id)
    {
        _logger.LogInformation("获取用户 {Id}", id);
        var user = await _repository.GetByIdAsync(id);
        return user is not null
            ? new UserDto { Name = user.Name, Email = user.Email }
            : throw new NotFoundException("用户不存在");
    }
}

// 在 Program.cs 中注册所有层
builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
```

### 装饰器模式

```csharp
// 定义服务接口
public interface IDataService
{
    string GetData();
}

// 基础实现
public class DataService : IDataService
{
    public string GetData() => "原始数据";
}

// 缓存装饰器
public class CachedDataService : IDataService
{
    private readonly IDataService _inner;
    private string? _cached;

    // 注入内部服务
    public CachedDataService(IDataService inner)
    {
        _inner = inner;
    }

    public string GetData()
    {
        // 有缓存则返回缓存
        if (_cached is not null) return _cached;
        // 无缓存则调用内部服务并缓存结果
        _cached = _inner.GetData();
        return _cached;
    }
}

// 注册装饰器
services.AddTransient<DataService>();
services.AddTransient<IDataService>(provider =>
{
    var inner = provider.GetRequiredService<DataService>();
    return new CachedDataService(inner);
});
```

## 注意事项

**不要在 Singleton 中注入 Scoped 服务**：Singleton 服务的生命周期比 Scoped 长，如果 Singleton 持有 Scoped 服务的引用，Scoped 服务实际上变成了 Singleton，可能导致并发问题。容器会在运行时检测并抛出异常。

**避免服务定位反模式**：不要在代码中到处调用 `GetRequiredService`，这会让依赖关系隐藏在代码深处。优先使用构造函数注入，让依赖关系清晰可见。

**循环依赖**：如果 A 依赖 B，B 又依赖 A，容器无法创建实例。解决方法是重构代码消除循环，或使用懒加载打破循环。

**构造函数不要做繁重操作**：构造函数应该只保存依赖引用，不要在构造函数中执行数据库查询、文件读写等耗时操作。这些应该在初始化方法中完成。

**注册顺序**：当同一接口注册多个实现时，最后注册的会作为默认实现。使用 `IEnumerable<T>` 可以获取所有实现。

## 进阶用法

### 使用 Scrutor 自动注册

Scrutor 库可以根据约定自动批量注册服务：

```csharp
// 安装 Scrutor 包
// dotnet add package Scrutor

// 按命名约定批量注册
services.Scan(scan => scan
    // 从当前程序集扫描
    .FromAssemblyOf<Program>()
    // 找到所有以 "Service" 结尾的类
    .AddClasses(classes => classes.Where(c => c.Name.EndsWith("Service")))
    // 注册为对应的接口
    .AsImplementedInterfaces()
    // 使用 Scoped 生命周期
    .WithScopedLifetime()
);
```

### Keyed Services（.NET 8+）

.NET 8 引入了键控服务，允许为同一接口注册多个实现并通过键区分：

```csharp
// 注册键控服务
builder.Services.AddKeyedSingleton<ICache, MemoryCache>("memory");
builder.Services.AddKeyedSingleton<ICache, RedisCache>("redis");

// 通过键注入
public class MyService
{
    private readonly ICache _memoryCache;
    private readonly ICache _redisCache;

    public MyService(
        [FromKeyedServices("memory")] ICache memoryCache,
        [FromKeyedServices("redis")] ICache redisCache)
    {
        _memoryCache = memoryCache;
        _redisCache = redisCache;
    }
}
```

### 自动激活

```csharp
// 应用启动时立即创建单例服务
builder.Services.AddSingleton<BackgroundWorker>();
builder.Services.AddHostedService(provider =>
{
    // 强制在启动时创建服务
    _ = provider.GetRequiredService<BackgroundWorker>();
    return provider.GetRequiredService<BackgroundWorker>();
});
```
