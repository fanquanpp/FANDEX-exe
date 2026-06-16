---
order: 8
title: 'C# .NET平台与生态'
module: csharp
category: 'C#'
difficulty: intermediate
description: '.NET Runtime、BCL、NuGet 包管理、依赖注入、配置系统、日志、中间件管道、ASP.NET Core、EF Core、MAUI'
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/LINQ与函数式编程
  - csharp/高级特性
  - csharp/测试与工程化
  - csharp/游戏开发与Unity
prerequisites: []
---

## 1. .NET Runtime

### 1.1 运行时架构

```
┌──────────────────────────────────────────┐
│            应用程序代码                    │
├──────────────────────────────────────────┤
│           CoreCLR / CLR                   │
│  ┌─────────┐ ┌──────┐ ┌───────────────┐ │
│  │   JIT    │ │  GC  │ │ 类型系统/异常  │ │
│  │编译器    │ │ 回收 │ │ 线程池/同步    │ │
│  └─────────┘ └──────┘ └───────────────┘ │
├──────────────────────────────────────────┤
│           基础类库 (BCL)                  │
│  集合 │ IO │ 网络 │ LINQ │ 并行 │ 诊断  │
├──────────────────────────────────────────┤
│           操作系统抽象层                   │
│  Windows │ Linux │ macOS                  │
└──────────────────────────────────────────┘
```

### 1.2 GC 垃圾回收

```csharp
// GC 代机制
// 第0代：最短命的对象（局部变量等）
// 第1代：存活过一次 GC 的对象
// 第2代：长期存活的对象

// 手动触发 GC（通常不需要）
GC.Collect();
GC.Collect(2, GCCollectionMode.Forced);
GC.WaitForPendingFinalizers();

// GC 信息
Console.WriteLine($"GC 内存: {GC.GetTotalMemory(false) / 1024 / 1024} MB");
Console.WriteLine($"最大代: {GC.MaxGeneration}");

// 大对象堆 (LOH) - 85000+ 字节的对象
// .NET 8+ LOH 可压缩

// 避免 GC 压力的技巧
// 1. 使用 Span<T> / stackalloc 避免分配
// 2. 使用对象池 (ObjectPool<T>)
// 3. 使用 ValueTask 替代 Task
// 4. 使用 ArrayPool<T>.Shared 租用数组
var buffer = ArrayPool<byte>.Shared.Rent(1024);
try { /* 使用 buffer */ }
finally { ArrayPool<byte>.Shared.Return(buffer); }
```

### 1.3 JIT 编译

```csharp
// JIT 将 IL 代码编译为本机机器码
// .NET 8+ 默认启用 Dynamic PGO（配置文件引导优化）

// ReadyToRun (R2R) - 预编译，加快启动
// dotnet publish -c Release -r win-x64 -p:PublishReadyToRun=true

// Native AOT - 完全预编译为本机代码
// dotnet publish -c Release -r linux-x64 -p:PublishAot=true
// 优点：启动极快、内存小、无 JIT
// 限制：无运行时反射生成代码、无动态加载程序集
```

## 2. NuGet 包管理

### 2.1 包管理命令

```bash
# 搜索包
dotnet package search serilog

# 添加包
dotnet add package Serilog
dotnet add package Serilog --version 4.2.0
dotnet add package Serilog -v 4.*

# 移除包
dotnet remove package Serilog

# 列出包
dotnet list package
dotnet list package --outdated
dotnet list package --vulnerable

# 还原包
dotnet restore

# 清除缓存
dotnet nuget locals all --clear
```

### 2.2 常用 NuGet 包

| 分类     | 包名                               | 用途                        |
| :------- | :--------------------------------- | :-------------------------- |
| **日志** | Serilog / Serilog.Sinks.Console    | 结构化日志                  |
| **HTTP** | Refit / Polly                      | 声明式HTTP客户端 / 弹性策略 |
| **JSON** | System.Text.Json / Newtonsoft.Json | JSON 序列化                 |
| **验证** | FluentValidation                   | 强类型验证                  |
| **ORM**  | Microsoft.EntityFrameworkCore      | 对象关系映射                |
| **映射** | Mapster / AutoMapper               | 对象映射                    |
| **调度** | Quartz.NET / Hangfire              | 任务调度                    |
| **消息** | MassTransit / CAP                  | 消息总线                    |
| **文档** | Swashbuckle / NSwag                | OpenAPI 文档生成            |

## 3. 依赖注入

### 3.1 注册与使用

```csharp
var builder = WebApplication.CreateBuilder(args);

// 注册服务
builder.Services.AddTransient<IEmailService, SmtpEmailService>();  // 瞬态
builder.Services.AddScoped<IUserService, UserService>();            // 范围
builder.Services.AddSingleton<ICacheService, RedisCacheService>();  // 单例

// 工厂注册
builder.Services.AddSingleton(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new RedisCacheService(config["Redis:ConnectionString"]!);
});

// 键控服务 (.NET 8+)
builder.Services.AddKeyedSingleton<ICache, MemoryCache>("memory");
builder.Services.AddKeyedSingleton<ICache, RedisCache>("redis");

var app = builder.Build();
```

### 3.2 构造函数注入

```csharp
public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly IEmailService _email;
    private readonly ILogger<OrderService> _logger;

    // 构造函数注入
    public OrderService(
        IOrderRepository repo,
        IEmailService email,
        ILogger<OrderService> logger)
    {
        _repo = repo;
        _email = email;
        _logger = logger;
    }

    // 键控服务注入 (.NET 8+)
    public OrderService(
        IOrderRepository repo,
        [FromKeyedServices("redis")] ICache cache)
    {
        _repo = repo;
        _cache = cache;
    }
}
```

### 3.3 生命周期

| 生命周期      | 创建时机     | 适用场景               |
| :------------ | :----------- | :--------------------- |
| **Transient** | 每次请求     | 轻量级无状态服务       |
| **Scoped**    | 每个请求范围 | 数据库上下文、工作单元 |
| **Singleton** | 应用生命周期 | 配置、缓存、连接池     |

> **警告**：不要从 Singleton 服务注入 Scoped 服务（会导致 Scoped 变成 Singleton 行为，即"俘虏依赖"）

## 4. 配置系统

```csharp
// appsettings.json
// {
//   "ConnectionStrings": { "Default": "Server=..." },
//   "Logging": { "LogLevel": { "Default": "Information" } },
//   "Jwt": { "Secret": "...", "ExpireMinutes": 60 }
// }

// 强类型配置
public class JwtOptions
{
    public required string Secret { get; init; }
    public int ExpireMinutes { get; init; } = 60;
}

// 注册配置
builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("Jwt"));

// 使用 IOptions
public class AuthService
{
    private readonly JwtOptions _options;

    public AuthService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    // IOptionsMonitor - 支持配置热更新
    public AuthService(IOptionsMonitor<JwtOptions> monitor)
    {
        var current = monitor.CurrentValue;
        monitor.OnChange(newOptions => { /* 配置变更回调 */ });
    }

    // IOptionsSnapshot - 每次请求获取最新值（Scoped）
    public AuthService(IOptionsSnapshot<JwtOptions> snapshot)
    {
        var value = snapshot.Value;
    }
}
```

## 5. 日志

```csharp
// 使用 ILogger<T>
public class UserService
{
    private readonly ILogger<UserService> _logger;

    public UserService(ILogger<UserService> logger) => _logger = logger;

    public void Register(string username)
    {
        _logger.LogInformation("用户注册: {Username}", username);
        _logger.LogWarning("用户名已存在: {Username}", username);
        _logger.LogError(exception, "注册失败: {Username}", username);
    }
}

// 日志级别
// Trace → Debug → Information → Warning → Error → Critical

// 高性能日志源生成器 (.NET 6+)
[LoggerMessage(Level = LogLevel.Information, Message = "用户 {UserId} 登录成功")]
partial void LogLoginSuccess(int userId);

[LoggerMessage(Level = LogLevel.Error, Message = "处理订单 {OrderId} 失败")]
partial void LogOrderFailed(int orderId, Exception ex);
```

## 6. ASP.NET Core

### 6.1 最小 API

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IUserService, UserService>();
var app = builder.Build();

// 路由
app.MapGet("/", () => "Hello World!");
app.MapGet("/users/{id}", (int id, IUserService svc) => svc.GetById(id));
app.MapPost("/users", (CreateUserRequest req, IUserService svc) => svc.Create(req));
app.MapPut("/users/{id}", (int id, UpdateUserRequest req, IUserService svc) => svc.Update(id, req));
app.MapDelete("/users/{id}", (int id, IUserService svc) => svc.Delete(id));

// 中间件
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

// 分组
var group = app.MapGroup("/api/v1/users")
    .RequireAuthorization()
    .WithTags("用户管理");

group.MapGet("/", GetAllUsers);
group.MapGet("/{id}", GetUser);

app.Run();
```

### 6.2 中间件管道

```csharp
// 内置中间件顺序
var app = builder.Build();

app.UseExceptionHandler();     // 异常处理
app.UseHsts();                 // HSTS
app.UseHttpsRedirection();     // HTTPS 重定向
app.UseStaticFiles();          // 静态文件
app.UseRouting();              // 路由
app.UseCors();                 // CORS
app.UseAuthentication();       // 认证
app.UseAuthorization();        // 授权
app.UseRateLimiter();          // 限流
app.MapControllers();          // 端点映射

// 自定义中间件
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next(context); // 调用下一个中间件
    sw.Stop();
    Console.WriteLine($"{context.Request.Path} - {sw.ElapsedMilliseconds}ms");
});
```

## 7. EF Core

### 7.1 定义 DbContext

```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);
    }
}
```

### 7.2 CRUD 操作

```csharp
public class UserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    // 查询
    public async Task<User?> GetByIdAsync(int id) =>
        await _db.Users.FindAsync(id);

    public async Task<List<User>> SearchAsync(string keyword) =>
        await _db.Users
            .Where(u => u.Name.Contains(keyword))
            .OrderBy(u => u.Name)
            .ToListAsync();

    // 添加
    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    // 更新
    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    // 删除
    public async Task DeleteAsync(int id)
    {
        await _db.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
    }
}
```

## 8. MAUI

```csharp
// .NET MAUI - 跨平台 UI 框架
// 支持: Windows, macOS, iOS, Android

// MauiProgram.cs
public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>();
        builder.Services.AddTransient<MainPage>();
        builder.Services.AddSingleton<IWeatherService, WeatherService>();
        return builder.Build();
    }
}

// XAML 页面
// <ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui">
//   <VerticalStackLayout Padding="20">
//     <Label Text="Hello MAUI!" FontSize="32" />
//     <Button Text="点击我" Clicked="OnButtonClicked" />
//   </VerticalStackLayout>
// </ContentPage>

// MVVM 模式
public partial class MainViewModel : ObservableObject
{
    [ObservableProperty]
    private string _message = "Hello, MAUI!";

    [RelayCommand]
    private async Task GreetAsync()
    {
        Message = $"点击时间: {DateTime.Now:T}";
        await Shell.Current.DisplayAlert("提示", Message, "确定");
    }
}
```
