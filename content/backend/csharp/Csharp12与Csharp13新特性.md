---
order: 63
title: 'C#12与C#13新特性'
module: csharp
category: 'C#'
difficulty: intermediate
description: '最新C#语言特性'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与依赖注入'
  - 'csharp/C#与最小API'
  - 'csharp/C#与反射'
  - csharp/LINQ延迟与立即执行
prerequisites:
  - csharp/概述与环境配置
---

## 概述

C# 语言持续演进，每个版本都带来新的语法特性和改进。C# 12 随 .NET 8 发布，引入了主构造函数、集合表达式等实用特性；C# 13 随 .NET 9 发布，带来了 params 集合、部分属性等增强。了解这些新特性可以帮助你写出更简洁、更高效的代码。

为什么需要关注新特性？新特性通常是为了解决现有语法的痛点而设计的。比如主构造函数减少了依赖注入中的样板代码，集合表达式让数组初始化更简洁。掌握这些特性不仅能提高编码效率，还能让代码更符合现代 C# 风格。

## 基础概念

**主构造函数**：将构造函数参数直接放在类声明中，整个类都可以使用这些参数。

**集合表达式**：用统一的方括号语法初始化各种集合类型，替代了之前多种不同的初始化语法。

**内联数组**：一种固定大小的结构体数组，用于高性能场景，运行时可以直接内联访问元素。

**params 集合**：`params` 关键字不再限于数组，可以用于任何集合类型。

**部分属性**：类似于部分方法，允许属性的声明和实现分离在不同文件中。

## 快速上手

确保你的项目使用 .NET 8 或更高版本：

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <!-- C# 12 默认可用，C# 13 需要 .NET 9 -->
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
</Project>
```

C# 12 最直观的新特性：

```csharp
// 主构造函数 - 参数直接放在类名后面
public class Person(string name, int age)
{
    public string Name { get; } = name;
    public int Age { get; set; } = age;

    public void Greet() => Console.WriteLine($"我是 {name}，{age} 岁");
}

// 集合表达式 - 统一的初始化语法
int[] arr = [1, 2, 3];
List<string> list = ["hello", "world"];
Span<int> span = [10, 20, 30];
```

## 详细用法

### C# 12 主构造函数

主构造函数最常见的用途是简化依赖注入：

```csharp
// 传统写法
public class UserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository;
        _logger = logger;
    }
}

// 主构造函数写法 - 更简洁
public class UserService(IUserRepository repository, ILogger<UserService> logger)
{
    public User? GetUser(int id)
    {
        logger.LogInformation("获取用户 {Id}", id);
        return repository.GetById(id);
    }
}
```

主构造函数参数可以在整个类中使用：

```csharp
public class Calculator(double initialValue)
{
    // 参数可以在属性初始化中使用
    public double Value { get; set; } = initialValue;

    // 参数可以在方法中使用
    public double Add(double x) => initialValue + x;

    // 如果需要可变性，可以赋值给字段或属性
    public void Reset() => Value = initialValue;
}
```

主构造函数可以与其他构造函数共存：

```csharp
public class Person(string name, int age)
{
    public string Name { get; } = name;
    public int Age { get; set; } = age;

    // 无参构造函数调用主构造函数
    public Person() : this("未知", 0) { }

    // 只传名字的构造函数
    public Person(string name) : this(name, 18) { }
}
```

### C# 12 集合表达式

集合表达式提供了统一的集合初始化语法：

```csharp
// 数组
int[] numbers = [1, 2, 3, 4, 5];

// List<T>
List<string> names = ["Alice", "Bob", "Charlie"];

// Span<T> 和 ReadOnlySpan<T>
Span<double> span = [1.0, 2.0, 3.0];
ReadOnlySpan<int> readOnly = [10, 20, 30];

// HashSet<T>
HashSet<string> set = ["apple", "banana", "cherry"];

// 不可变集合
ImmutableArray<int> immutable = [1, 2, 3];
```

集合表达式支持展开运算符：

```csharp
int[] a = [1, 2, 3];
int[] b = [4, 5, 6];

// 使用 .. 展开另一个集合
int[] combined = [..a, ..b, 7, 8];
// 结果: [1, 2, 3, 4, 5, 6, 7, 8]

// 展开与混合使用
List<int> result = [0, ..a, 100, ..b, 200];
// 结果: [0, 1, 2, 3, 100, 4, 5, 6, 200]

// 实际应用：合并配置
string[] defaults = ["config.json", "appsettings.json"];
string[] overrides = ["local.json"];
string[] allConfigs = [..defaults, ..overrides];
```

### C# 12 ref readonly 参数

```csharp
// ref readonly 参数：传入引用但不允许修改
// 适合大型结构体，避免拷贝同时保证安全
public readonly struct BigMatrix
{
    public double M00, M01, M10, M11;
}

// 使用 ref readonly 传入大型结构体
public double Determinant(ref readonly BigMatrix m)
{
    return m.M00 * m.M11 - m.M01 * m.M10;
}

// 调用时使用 ref
var matrix = new BigMatrix { M00 = 1, M01 = 2, M10 = 3, M11 = 4 };
var det = Determinant(ref matrix);

// 也可以传入 in 参数
var det2 = Determinant(in matrix);
```

### C# 12 内联数组

```csharp
// 内联数组：固定大小的缓冲区，直接存储在结构体中
// 用于高性能场景，避免堆分配
[System.Runtime.CompilerServices.InlineArray(4)]
public struct Buffer4<T>
{
    private T _element0; // 只需声明第一个元素
    // 编译器自动生成其余 3 个元素的存储空间
}

// 使用内联数组
var buffer = new Buffer4<int>();
buffer[0] = 10;
buffer[1] = 20;
buffer[2] = 30;
buffer[3] = 40;

// 可以遍历
foreach (var item in buffer)
{
    Console.WriteLine(item);
}
```

### C# 12 别名任意类型

```csharp
// C# 12 之前，using 别名只能用于命名类型
// C# 12 允许为元组、指针、数组等创建别名

using Point = (int X, int Y);           // 元组别名
using Matrix = double[,];               // 二维数组别名
using Callback = delegate*<int, void>;   // 函数指针别名

// 使用别名
Point p = (10, 20);
Console.WriteLine($"X: {p.X}, Y: {p.Y}");

Matrix m = new double[3, 3];
```

### C# 13 params 集合

```csharp
// C# 13 之前：params 只支持数组
public void Print(params string[] items) { }

// C# 13：params 支持任何集合类型
public void Print(params ReadOnlySpan<string> items)
{
    foreach (var item in items)
    {
        Console.WriteLine(item);
    }
}

// 调用方式不变
Print("hello", "world", "!");

// 也可以使用 List<T>
public void Process(params List<int> numbers)
{
    numbers.Add(999);
}

// 使用 ReadOnlySpan<T> 的 params 避免了数组分配
// 在性能敏感场景中非常有用
```

### C# 13 部分属性

```csharp
// 部分属性：声明和实现分离
// 通常用于源生成器场景
public partial class ViewModel
{
    // 声明部分：只有签名
    public partial string Name { get; set; }
}

// 实现部分：通常由源生成器生成
public partial class ViewModel
{
    private string _name = "";
    public partial string Name
    {
        get => _name;
        set => _name = value;
    }
}
```

### C# 13 扩展类型

```csharp
// C# 13 引入了扩展类型（Extension types）
// 允许为现有类型添加新成员，而不修改原始类型

extension StringExtensions for string
{
    // 为 string 添加方法
    public bool IsNullOrEmpty() => string.IsNullOrEmpty(this);

    // 为 string 添加属性
    public string Reversed => new string(this.Reverse().ToArray());
}

// 使用扩展
string name = "hello";
if (name.IsNullOrEmpty())
{
    Console.WriteLine("空字符串");
}
Console.WriteLine(name.Reversed); // "olleh"
```

### C# 13 锁对象

```csharp
// C# 13 引入了专用的锁对象，替代 lock 语句
// 提供更好的性能和更安全的锁管理

// 传统写法
private readonly object _lockObj = new();
lock (_lockObj)
{
    // 临界区代码
}

// C# 13 新写法
private readonly Lock _lock = new();
using (_lock.EnterScope())
{
    // 临界区代码
    // 离开 using 块时自动释放锁
}

// Lock 对象的优势：
// 1. 更好的性能（不需要额外的对象分配）
// 2. 支持异步场景
// 3. 可以检测死锁和重入
```

### C# 13 其他改进

```csharp
// 1. 更好的 ref 安全性
// 方法可以返回对局部变量的安全引用

// 2. 允许在迭代器方法中使用 ref 结构体
// 之前在 async 方法中不能使用 Span<T> 等 ref 结构体
// C# 13 放宽了部分限制

// 3. 隐式索引器访问
// 在对象初始化器中可以使用索引
var dict = new Dictionary<string, int>
{
    ["one"] = 1,
    ["two"] = 2
};

// 4. 方法组自然类型改进
// 方法组的类型推断更加智能
Func<string, bool> predicate = string.IsNullOrEmpty;
// 之前需要显式指定类型参数
```

## 常见场景

### 使用主构造函数简化服务类

```csharp
// 在 ASP.NET Core 中使用主构造函数
public class OrderController(
    IOrderService orderService,
    ILogger<OrderController> logger,
    IConfiguration config) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        logger.LogInformation("获取订单 {Id}", id);
        var order = await orderService.GetByIdAsync(id);
        return order is not null ? Ok(order) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderRequest request)
    {
        var maxItems = config.GetValue<int>("MaxOrderItems");
        if (request.Items.Count > maxItems)
            return BadRequest($"订单项不能超过 {maxItems} 个");

        var order = await orderService.CreateAsync(request);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }
}
```

### 使用集合表达式构建数据管道

```csharp
// 使用集合表达式和展开运算符构建数据管道
public class DataPipeline
{
    private readonly int[] _defaults = [1, 2, 3];
    private readonly List<int> _overrides = [];

    public int[] GetPipeline()
    {
        // 合并默认值、覆盖值和计算值
        var computed = CalculateValues();
        return [.._defaults, .._overrides, ..computed, 99];
    }

    private int[] CalculateValues() => [10, 20, 30];
}
```

## 注意事项

**主构造函数参数不是成员**：主构造函数的参数不是类的字段或属性，它们只在类体内可用。如果需要在类外部访问，必须显式声明属性。

**主构造函数参数的可变性**：主构造函数参数在方法中是只读的（除非使用 `ref`），如果需要修改，应赋值给可变字段。

**集合表达式的类型推断**：集合表达式依赖目标类型推断。如果目标类型不明确，需要显式指定类型：`List<int> list = [1, 2, 3];` 而不是 `var list = [1, 2, 3];`。

**版本兼容性**：使用新特性需要确保运行时环境支持对应的 .NET 版本。C# 12 需要 .NET 8+，C# 13 需要 .NET 9+。

**扩展类型尚在演进**：C# 13 的扩展类型是较新的特性，具体语法和行为可能在后续版本中调整。

## 进阶用法

### 主构造函数与继承

```csharp
// 基类使用主构造函数
public class Entity(long id)
{
    public long Id { get; } = id;
}

// 派生类也使用主构造函数，并调用基类主构造函数
public class User(long id, string name, string email) : Entity(id)
{
    public string Name { get; } = name;
    public string Email { get; } = email;
}

// 多层继承
public class AdminUser(long id, string name, string email, string[] permissions)
    : User(id, name, email)
{
    public bool HasPermission(string perm) =>
        permissions.Contains(perm);
}
```

### 集合表达式与 LINQ 结合

```csharp
// 集合表达式与 LINQ 查询结合使用
var numbers = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 使用集合表达式构建结果
var result = numbers switch
{
    [] => "空集合",
    [var single] => $"只有一个元素: {single}",
    [var first, var second] => $"两个元素: {first}, {second}",
    [.. var all] => $"共 {all.Length} 个元素"
};

// 在模式匹配中使用集合表达式
string Classify(int[] arr) => arr switch
{
    [] => "空",
    [1, ..] => "以1开头",
    [.., 9] => "以9结尾",
    [1, .., 9] => "以1开头以9结尾",
    _ => "其他"
};
```
