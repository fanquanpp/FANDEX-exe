---
order: 60
title: 'C#与EF Core'
module: csharp
category: 'C#'
difficulty: intermediate
description: 'Entity Framework Core'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与Blazor'
  - 'csharp/C#与MAUI'
  - 'csharp/C#与依赖注入'
  - 'csharp/C#与最小API'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

Entity Framework Core（简称 EF Core）是 .NET 的对象关系映射（ORM）框架。它允许你用 C# 对象操作数据库，而不需要手写 SQL 语句。EF Core 支持多种数据库，包括 SQL Server、SQLite、PostgreSQL、MySQL 等，你可以用同一套 API 操作不同的数据库。

为什么需要 EF Core？传统方式需要手写大量 SQL 和数据转换代码，既繁琐又容易出错。EF Core 自动处理对象到数据库表的映射、SQL 生成和查询执行，让你专注于业务逻辑。它还提供了迁移功能，可以版本化管理数据库结构变更。

## 基础概念

**DbContext**：数据库上下文，是与数据库交互的主入口。每个 DbContext 代表一个数据库会话，包含一组 DbSet 属性对应数据库表。

**DbSet**：表示数据库中的一个表或视图。通过 DbSet 可以查询、添加、更新和删除数据。

**实体类**：普通的 C# 类，对应数据库中的表。类的属性对应表的列。

**迁移**：EF Core 通过迁移来管理数据库结构变更。每次修改实体类后，创建一个迁移来同步数据库。

**LINQ 查询**：EF Core 将 LINQ 查询翻译为 SQL 语句执行，你不需要手写 SQL。

## 快速上手

安装 EF Core 相关的 NuGet 包：

```bash
# 安装 EF Core 核心包
dotnet add package Microsoft.EntityFrameworkCore

# 安装数据库提供程序（以 SQLite 为例）
dotnet add package Microsoft.EntityFrameworkCore.Sqlite

# 安装迁移工具
dotnet add package Microsoft.EntityFrameworkCore.Design
```

创建最简单的 EF Core 应用：

```csharp
using Microsoft.EntityFrameworkCore;

// 1. 定义实体类
public class User
{
    public int Id { get; set; }           // 主键
    public string Name { get; set; } = ""; // 姓名
    public string Email { get; set; } = ""; // 邮箱
    public int Age { get; set; }           // 年龄
}

// 2. 创建数据库上下文
public class AppDbContext : DbContext
{
    // 定义数据库表
    public DbSet<User> Users => Set<User>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        // 配置数据库连接
        options.UseSqlite("Data Source=app.db");
    }
}

// 3. 使用
await using var db = new AppDbContext();

// 创建数据库和表（仅开发时使用）
await db.Database.EnsureCreatedAsync();

// 添加数据
db.Users.Add(new User { Name = "张三", Email = "zhang@example.com", Age = 25 });
db.Users.Add(new User { Name = "李四", Email = "li@example.com", Age = 30 });
await db.SaveChangesAsync();

// 查询数据
var users = await db.Users.Where(u => u.Age > 18).ToListAsync();
foreach (var user in users)
{
    Console.WriteLine($"{user.Name}, {user.Age}岁");
}
```

## 详细用法

### 配置实体映射

EF Core 支持两种配置方式：数据注解和 Fluent API。

```csharp
// 方式一：数据注解
public class Product
{
    [Key]                                    // 主键
    public int Id { get; set; }

    [Required]                               // 不允许为空
    [MaxLength(100)]                         // 最大长度
    public string Name { get; set; } = "";

    [Column("UnitPrice")]                    // 映射到数据库的列名
    public decimal Price { get; set; }

    [Range(0, 10000)]                        // 范围验证
    public int Stock { get; set; }

    [NotMapped]                              // 不映射到数据库
    public string DisplayName => $"{Name} ({Price:C})";
}

// 方式二：Fluent API（在 DbContext 中配置）
public class AppDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 配置 Product 实体
        modelBuilder.Entity<Product>(entity =>
        {
            // 配置表名
            entity.ToTable("Products");

            // 配置主键
            entity.HasKey(p => p.Id);

            // 配置属性
            entity.Property(p => p.Name)
                .IsRequired()           // 不允许为空
                .HasMaxLength(100);     // 最大长度

            entity.Property(p => p.Price)
                .HasColumnName("UnitPrice")  // 列名
                .HasPrecision(18, 2);        // 精度

            // 配置索引
            entity.HasIndex(p => p.Name).IsUnique();

            // 忽略属性
            entity.Ignore(p => p.DisplayName);
        });
    }
}
```

### 关系配置

```csharp
// 一对多关系
public class Blog
{
    public int Id { get; set; }
    public string Title { get; set; } = "";

    // 导航属性：一个博客有多篇文章
    public List<Post> Posts { get; set; } = new();
}

public class Post
{
    public int Id { get; set; }
    public string Content { get; set; } = "";

    // 外键
    public int BlogId { get; set; }

    // 导航属性：一篇文章属于一个博客
    public Blog Blog { get; set; } = null!;
}

// Fluent API 配置关系
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(b => b.Posts)          // 博客有多篇文章
        .WithOne(p => p.Blog)           // 文章属于一个博客
        .HasForeignKey(p => p.BlogId)   // 外键
        .OnDelete(DeleteBehavior.Cascade); // 级联删除
}

// 多对多关系
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Course> Courses { get; set; } = new();
}

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public List<Student> Students { get; set; } = new();
}

// EF Core 会自动创建中间表，也可以显式配置
modelBuilder.Entity<Student>()
    .HasMany(s => s.Courses)
    .WithMany(c => c.Students)
    .UsingEntity(j => j.ToTable("StudentCourses"));
```

### 查询数据

```csharp
// 基本查询
var allUsers = await db.Users.ToListAsync();

// 条件查询
var adults = await db.Users
    .Where(u => u.Age >= 18)
    .OrderBy(u => u.Name)
    .ToListAsync();

// 查找单个记录
var user = await db.Users.FindAsync(1);              // 按主键查找
var first = await db.Users.FirstAsync(u => u.Name == "张三"); // 按条件查找
var maybe = await db.Users.FirstOrDefaultAsync(u => u.Age > 50); // 可能为 null

// 投影查询（只选择需要的列）
var names = await db.Users
    .Select(u => new { u.Name, u.Email })
    .ToListAsync();

// 分页查询
var page = 2;
var pageSize = 10;
var pagedUsers = await db.Users
    .OrderBy(u => u.Id)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// 关联查询
var blogsWithPosts = await db.Blogs
    .Include(b => b.Posts)               // 预加载关联数据
    .Where(b => b.Title.Contains("技术"))
    .ToListAsync();

// 分组查询
var ageGroups = await db.Users
    .GroupBy(u => u.Age / 10 * 10)
    .Select(g => new { AgeRange = g.Key, Count = g.Count() })
    .ToListAsync();

// 原始 SQL 查询
var results = await db.Users
    .FromSqlRaw("SELECT * FROM Users WHERE Age > {0}", 18)
    .ToListAsync();
```

### 增删改操作

```csharp
// 添加单条记录
db.Users.Add(new User { Name = "王五", Email = "wang@example.com", Age = 28 });
await db.SaveChangesAsync();

// 添加多条记录
db.Users.AddRange(
    new User { Name = "赵六", Age = 22 },
    new User { Name = "孙七", Age = 35 }
);
await db.SaveChangesAsync();

// 更新记录
var user = await db.Users.FindAsync(1);
if (user is not null)
{
    user.Name = "张三丰";
    user.Age = 26;
    await db.SaveChangesAsync();
}

// 更新而不先查询（更高效）
db.Users.Where(u => u.Age < 18)
    .ExecuteUpdate(setters => setters
        .SetProperty(u => u.Age, u => u.Age + 1));

// 删除记录
var user = await db.Users.FindAsync(1);
if (user is not null)
{
    db.Users.Remove(user);
    await db.SaveChangesAsync();
}

// 批量删除（不加载到内存）
await db.Users.Where(u => u.Age < 18).ExecuteDeleteAsync();
```

### 迁移

```bash
# 创建迁移
dotnet ef migrations add InitialCreate

# 更新数据库到最新迁移
dotnet ef database update

# 回滚到指定迁移
dotnet ef database update PreviousMigrationName

# 删除最后一次迁移（未应用到数据库时）
dotnet ef migrations remove

# 查看迁移状态
dotnet ef migrations list
```

```csharp
// 迁移文件示例
public partial class AddEmailColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 添加列
        migrationBuilder.AddColumn<string>(
            name: "Email",
            table: "Users",
            type: "TEXT",
            maxLength: 200,
            nullable: false,
            defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // 回滚操作
        migrationBuilder.DropColumn(
            name: "Email",
            table: "Users");
    }
}
```

### 在 ASP.NET Core 中使用

```csharp
// Program.cs 中注册 DbContext
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// 在 Minimal API 中使用
app.MapGet("/users", async (AppDbContext db) =>
    await db.Users.ToListAsync());

app.MapGet("/users/{id}", async (int id, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.MapPost("/users", async (User user, AppDbContext db) =>
{
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{user.Id}", user);
});

app.Run();
```

## 常见场景

### 乐观并发控制

```csharp
public class Document
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";

    // 并发令牌：每次更新时自动检查
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}

// 更新时如果版本不匹配会抛出 DbUpdateConcurrencyException
try
{
    doc.Content = "新内容";
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException)
{
    // 处理并发冲突
    var entry = db.Entry(doc);
    var dbValues = await entry.GetDatabaseValuesAsync();
    if (dbValues is null)
    {
        // 记录已被删除
    }
    else
    {
        // 记录已被其他人修改，可以选择合并或覆盖
        entry.OriginalValues.SetValues(dbValues);
        await db.SaveChangesAsync();
    }
}
```

### 软删除

```csharp
public class Article
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDeleted { get; set; }  // 软删除标记
    public DateTime? DeletedAt { get; set; }
}

// 配置全局查询过滤器
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Article>()
        .HasQueryFilter(a => !a.IsDeleted); // 默认不查询已删除的
}

// 查询时自动过滤已删除的记录
var articles = await db.Articles.ToListAsync(); // 不包含 IsDeleted=true 的

// 如果需要查询包含已删除的记录
var allArticles = await db.Articles
    .IgnoreQueryFilters()
    .ToListAsync();

// 软删除操作
article.IsDeleted = true;
article.DeletedAt = DateTime.UtcNow;
await db.SaveChangesAsync();
```

## 注意事项

**N+1 查询问题**：在循环中访问导航属性会导致每次循环都发送一次查询。使用 `Include` 预加载关联数据来避免。

**变更追踪**：EF Core 默认跟踪查询出来的实体。如果只需要读取数据不修改，使用 `AsNoTracking()` 提高查询性能。

**SaveChanges 的原子性**：`SaveChanges` 中的所有操作在一个事务中执行，要么全部成功要么全部回滚。

**迁移在生产环境**：不要在生产环境直接运行 `dotnet ef database update`。应该在部署流程中管理迁移，或使用脚本生成工具。

**大结果集**：查询大量数据时使用分页，避免将整个表加载到内存。

## 进阶用法

### 全局查询过滤器

```csharp
// 为多租户应用配置全局过滤器
public class Tenant
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class TenantEntity
{
    public int TenantId { get; set; }
}

// 在 DbContext 中配置
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // 为所有实现 ITenantEntity 的实体添加租户过滤器
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
        if (typeof(TenantEntity).IsAssignableFrom(entityType.ClrType))
        {
            modelBuilder.Entity(entityType.ClrType)
                .HasQueryFilter(e => EF.Property<int>(e, "TenantId") == _currentTenantId);
        }
    }
}
```

### 原始 SQL 与存储过程

```csharp
// 执行存储过程
var results = await db.Users
    .FromSqlRaw("EXEC GetActiveUsers @ageThreshold = {0}", 18)
    .ToListAsync();

// 执行非查询 SQL
await db.Database.ExecuteSqlRawAsync(
    "UPDATE Users SET Status = 'Active' WHERE LastLogin > {0}",
    DateTime.Now.AddDays(-30));
```
