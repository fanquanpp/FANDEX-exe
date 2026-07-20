---
order: 62
title: 'C#与最小API'
module: csharp
category: 'C#'
difficulty: beginner
description: '.NET Minimal API'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与EF Core'
  - 'csharp/C#与依赖注入'
  - 'csharp/C#12与C#13新特性'
  - 'csharp/C#与反射'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

Minimal API 是 .NET 6 引入的一种极简 Web API 构建方式。与传统的 Controller 模式不同，Minimal API 允许你在 Program.cs 中用最少的代码直接定义路由和处理逻辑，无需创建控制器类、无需大量样板代码。它特别适合构建微服务、轻量级 API 和快速原型。

为什么需要 Minimal API？传统 ASP.NET Core 的 Controller 模式虽然功能完善，但对于简单的 API 来说显得过于笨重。一个只需要返回字符串的接口，用 Controller 需要创建类、添加特性、注入依赖等步骤，而 Minimal API 只需一行代码。它让开发更快速、代码更简洁。

## 基础概念

**路由映射**：Minimal API 通过 `app.MapGet`、`app.MapPost` 等方法将 HTTP 方法和路径映射到处理函数。每个映射就是一个 API 端点。

**处理函数**：路由映射的处理函数可以是 Lambda 表达式、局部函数或静态方法。框架会自动从请求中提取参数并传递给处理函数。

**依赖注入**：Minimal API 完全支持 .NET 的依赖注入系统，你可以通过参数注入服务，无需在构造函数中声明。

**中间件**：与传统的 ASP.NET Core 应用一样，Minimal API 也使用中间件管道来处理请求。你可以在路由映射之前添加认证、日志、异常处理等中间件。

## 快速上手

创建一个最简单的 Minimal API 项目：

```bash
# 创建 Minimal API 项目
dotnet new web -n MyMinimalApi

# 进入项目目录
cd MyMinimalApi

# 运行项目
dotnet run
```

最简单的 Program.cs 只需要几行代码：

```csharp
// 创建 WebApplication
var app = WebApplication.CreateBuilder(args).Build();

// 定义一个 GET 端点
app.MapGet("/", () => "Hello World!");

// 启动应用
app.Run();
```

运行后访问 `http://localhost:5000`，浏览器会显示 "Hello World!"。

## 详细用法

### 定义各种 HTTP 方法的端点

```csharp
var app = WebApplication.CreateBuilder(args).Build();

// GET 请求 - 获取数据
app.MapGet("/hello", () => "你好，世界！");

// GET 请求 - 带路由参数
app.MapGet("/users/{id}", (int id) =>
{
    return $"用户 ID: {id}";
});

// GET 请求 - 带查询参数
app.MapGet("/search", (string keyword, int page = 1) =>
{
    return $"搜索: {keyword}, 第 {page} 页";
});

// POST 请求 - 创建数据
app.MapPost("/users", (User user) =>
{
    return Results.Created($"/users/{user.Id}", user);
});

// PUT 请求 - 更新数据
app.MapPut("/users/{id}", (int id, User user) =>
{
    return Results.Ok($"用户 {id} 已更新");
});

// DELETE 请求 - 删除数据
app.MapDelete("/users/{id}", (int id) =>
{
    return Results.Ok($"用户 {id} 已删除");
});

app.Run();

// 数据模型
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}
```

### 返回不同类型的响应

```csharp
// 返回纯文本
app.MapGet("/text", () => "这是一段纯文本");

// 返回 JSON 对象
app.MapGet("/json", () => new { Name = "张三", Age = 25 });

// 返回自定义状态码
app.MapGet("/notfound", () => Results.NotFound("资源不存在"));

// 返回带状态码的响应
app.MapGet("/created", () => Results.Created("/items/1", new { Id = 1, Name = "新项目" }));

// 返回错误响应
app.MapGet("/error", () => Results.Problem("服务器内部错误", statusCode: 500));

// 根据条件返回不同结果
app.MapGet("/users/{id}", (int id) =>
{
    if (id <= 0)
        return Results.BadRequest("ID 必须大于 0");

    var user = new { Id = id, Name = "用户" + id };
    return user != null
        ? Results.Ok(user)
        : Results.NotFound();
});
```

### 依赖注入

Minimal API 支持通过参数注入服务：

```csharp
var builder = WebApplication.CreateBuilder(args);

// 注册服务
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddDbContext<AppDbContext>();

var app = builder.Build();

// 通过参数注入服务
app.MapGet("/users/{id}", (int id, IUserService userService) =>
{
    var user = userService.GetById(id);
    return user is not null
        ? Results.Ok(user)
        : Results.NotFound();
});

// 注入多个服务
app.MapPost("/users", (User user, IUserService userService, ICacheService cache) =>
{
    var created = userService.Create(user);
    cache.Set($"user_{created.Id}", created);
    return Results.Created($"/users/{created.Id}", created);
});

// 注入 HttpContext
app.MapGet("/info", (HttpContext context) =>
{
    return new
    {
        Path = context.Request.Path,
        Method = context.Request.Method,
        Headers = context.Request.Headers.Count
    };
});

app.Run();
```

### 请求体和表单数据

```csharp
// 从请求体读取 JSON
app.MapPost("/users", (User user) =>
{
    return Results.Ok($"创建用户: {user.Name}");
});

// 从表单读取数据
app.MapPost("/upload", async (IFormFile file) =>
{
    // 保存上传的文件
    using var stream = File.Create($"uploads/{file.FileName}");
    await file.CopyToAsync(stream);
    return Results.Ok($"已上传: {file.FileName}");
});

// 读取请求体为字符串
app.MapPost("/raw", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var body = await reader.ReadToEndAsync();
    return Results.Ok(body);
});
```

### 分组路由

当端点变多时，可以使用路由分组来组织：

```csharp
var app = WebApplication.CreateBuilder(args).Build();

// 创建路由分组
var users = app.MapGroup("/users")
    .WithTags("用户管理");  // 在 Swagger 中分组显示

users.MapGet("/", () => "获取所有用户");
users.MapGet("/{id}", (int id) => $"获取用户 {id}");
users.MapPost("/", (User user) => Results.Created($"/users/{user.Id}", user));
users.MapPut("/{id}", (int id, User user) => Results.Ok($"更新用户 {id}"));
users.MapDelete("/{id}", (int id) => Results.Ok($"删除用户 {id}"));

// 另一个分组
var products = app.MapGroup("/products")
    .WithTags("产品管理");

products.MapGet("/", () => "获取所有产品");
products.MapGet("/{id}", (int id) => $"获取产品 {id}");

app.Run();
```

### 添加认证和授权

```csharp
var builder = WebApplication.CreateBuilder(args);

// 添加 JWT 认证
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        // 配置 JWT 选项
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// 先添加认证中间件
app.UseAuthentication();
app.UseAuthorization();

// 需要认证的端点
app.MapGet("/profile", (HttpContext context) =>
{
    var userName = context.User.Identity?.Name;
    return $"你好, {userName}";
}).RequireAuthorization();

// 匿名可访问的端点
app.MapGet("/public", () => "这是公开信息");

app.Run();
```

### 添加 Swagger 文档

```csharp
var builder = WebApplication.CreateBuilder(args);

// 添加 Swagger 服务
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 启用 Swagger
app.UseSwagger();
app.UseSwaggerUI();

// 端点描述信息
app.MapGet("/users", () => "所有用户")
    .WithDescription("获取所有用户的列表")
    .WithTags("用户")
    .WithName("GetUsers");

app.Run();
```

## 常见场景

### 完整的 CRUD API

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<TodoService>();
var app = builder.Build();

// 获取所有待办事项
app.MapGet("/todos", (TodoService service) =>
    Results.Ok(service.GetAll()));

// 获取单个待办事项
app.MapGet("/todos/{id}", (int id, TodoService service) =>
{
    var todo = service.GetById(id);
    return todo is not null
        ? Results.Ok(todo)
        : Results.NotFound($"待办事项 {id} 不存在");
});

// 创建待办事项
app.MapPost("/todos", (TodoItem item, TodoService service) =>
{
    var created = service.Create(item);
    return Results.Created($"/todos/{created.Id}", created);
});

// 更新待办事项
app.MapPut("/todos/{id}", (int id, TodoItem item, TodoService service) =>
{
    var updated = service.Update(id, item);
    return updated is not null
        ? Results.Ok(updated)
        : Results.NotFound();
});

// 删除待办事项
app.MapDelete("/todos/{id}", (int id, TodoService service) =>
{
    var deleted = service.Delete(id);
    return deleted
        ? Results.Ok("已删除")
        : Results.NotFound();
});

app.Run();

// 数据模型
public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
}

// 简单的服务实现
public class TodoService
{
    private readonly List<TodoItem> _items = new();
    private int _nextId = 1;

    public List<TodoItem> GetAll() => _items;

    public TodoItem? GetById(int id) => _items.FirstOrDefault(x => x.Id == id);

    public TodoItem Create(TodoItem item)
    {
        item.Id = _nextId++;
        _items.Add(item);
        return item;
    }

    public TodoItem? Update(int id, TodoItem updated)
    {
        var item = GetById(id);
        if (item is null) return null;
        item.Title = updated.Title;
        item.IsDone = updated.IsDone;
        return item;
    }

    public bool Delete(int id) => _items.RemoveAll(x => x.Id == id) > 0;
}
```

### 全局异常处理

```csharp
var app = WebApplication.CreateBuilder(args).Build();

// 添加异常处理中间件
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new
        {
            Error = "服务器内部错误",
            Detail = ex.Message
        });
    }
});

app.MapGet("/error-test", () =>
{
    throw new InvalidOperationException("这是一个测试异常");
});

app.Run();
```

## 注意事项

**不适合复杂应用**：如果你的 API 有大量的业务逻辑和复杂的请求处理流程，Controller 模式可能更适合。Minimal API 的优势在于简洁，而不是替代 Controller 的所有功能。

**参数绑定限制**：Minimal API 的参数绑定相对简单，复杂场景（如自定义模型绑定器）需要额外处理。`[FromBody]`、`[FromQuery]` 等特性在 .NET 7+ 中可用。

**过滤器差异**：Minimal API 不支持 Controller 中的 Action 过滤器（如 `[Authorize]` 过滤器）。需要使用 `AddFilter` 方法或中间件来实现类似功能。

**开放 API 支持**：Minimal API 对 Swagger/OpenAPI 的支持在 .NET 7+ 中逐步完善，早期版本需要手动添加描述信息。

## 进阶用法

### 自定义参数绑定

```csharp
// 自定义类型绑定
app.MapGet("/search", (SearchQuery query) =>
{
    return $"搜索: {query.Keyword}, 页码: {query.Page}";
});

// 定义可绑定的类型
public class SearchQuery : IBindableFromHttpContext<SearchQuery>
{
    public string Keyword { get; set; } = "";
    public int Page { get; set; } = 1;

    public static ValueTask<SearchQuery> BindAsync(HttpContext context, ParameterInfo parameter)
    {
        var keyword = context.Request.Query["q"].ToString();
        var page = int.TryParse(context.Request.Query["page"], out var p) ? p : 1;
        return ValueTask.FromResult(new SearchQuery { Keyword = keyword, Page = page });
    }
}
```

### 端点过滤器

```csharp
// 定义验证过滤器
app.MapPost("/users", (User user) => Results.Created("/users/1", user))
    .AddFilter(async (context, next) =>
    {
        // 在处理请求之前执行验证
        var user = context.GetArgument<User>(0);
        if (string.IsNullOrEmpty(user.Name))
            return Results.BadRequest("用户名不能为空");

        // 调用下一个处理器
        return await next(context);
    });

// 定义日志过滤器
app.MapGet("/users", () => "所有用户")
    .AddFilter(async (context, next) =>
    {
        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("请求: {Path}", context.HttpContext.Request.Path);
        var result = await next(context);
        logger.LogInformation("响应完成");
        return result;
    });
```
