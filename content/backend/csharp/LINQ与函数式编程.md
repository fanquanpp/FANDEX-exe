---
order: 6
title: 'C# LINQ与函数式编程'
module: csharp
category: 'C#'
difficulty: intermediate
description: 'LINQ 查询语法与方法语法、延迟执行、标准查询运算符、PLINQ、表达式树、局部函数、模式匹配进阶'
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/泛型与集合
  - csharp/异步编程
  - csharp/高级特性
  - csharp/NET平台与生态
prerequisites: []
---

## 1. LINQ 查询语法与方法语法

### 1.1 两种语法对比

```csharp
var products = new List<Product>
{
    new("笔记本", 5999m, "电子"),
    new("手机", 3999m, "电子"),
    new("T恤", 199m, "服装"),
    new("耳机", 899m, "电子"),
    new("运动鞋", 599m, "服装"),
};

// 查询语法（Query Syntax）
var query1 = from p in products
             where p.Price > 500
             orderby p.Price descending
             select new { p.Name, p.Price };

// 方法语法（Method Syntax / Fluent API）
var query2 = products
    .Where(p => p.Price > 500)
    .OrderByDescending(p => p.Price)
    select new { p.Name, p.Price };

// 查询语法在 join 和 group 时更清晰
var query3 = from p in products
             group p by p.Category into g
             select new
             {
                 Category = g.Key,
                 Count = g.Count(),
                 AvgPrice = g.Average(p => p.Price)
             };
```

### 1.2 SelectMany - 扁平化

```csharp
var orders = new List<Order>
{
    new(1, [new Item("A", 2), new Item("B", 1)]),
    new(2, [new Item("C", 3), new Item("D", 2)]),
};

// 查询语法
var allItems = from o in orders
               from i in o.Items
               select i;

// 方法语法
var allItems2 = orders.SelectMany(o => o.Items);

// 带结果选择器
var results = orders.SelectMany(
    o => o.Items,
    (order, item) => new { order.Id, item.Name, item.Quantity }
);
```

## 2. 延迟执行

### 2.1 延迟执行 vs 立即执行

```csharp
var numbers = new List<int> { 1, 2, 3, 4, 5 };

// 延迟执行 - 定义查询但不执行
var query = numbers.Where(n => n > 2); // 此时未执行

numbers.Add(6); // 修改源数据

// 执行查询（每次枚举都重新计算）
foreach (var n in query)
{
    Console.WriteLine(n); // 3, 4, 5, 6（包含新增的6）
}

// 立即执行方法
int count = query.Count();                    // 立即执行
List<int> list = query.ToList();              // 立即执行并缓存
int[] array = query.ToArray();                // 立即执行并缓存
Dictionary<string, int> dict = query.ToDictionary(
    n => n.ToString(), n => n);               // 立即执行
```

### 2.2 延迟执行陷阱

```csharp
//  陷阱：闭包捕获循环变量
var actions = new List<Func<int>>();
for (int i = 0; i < 5; i++)
{
    actions.Add(() => i); // 所有 lambda 共享同一个 i
}
// actions 全部返回 5

//  解决：局部变量捕获
for (int i = 0; i < 5; i++)
{
    int local = i;
    actions.Add(() => local); // 每个 lambda 捕获各自的 local
}

//  陷阱：多次枚举
var filtered = products.Where(p => p.Price > 100);
// 每次遍历都重新查询！
var count = filtered.Count();      // 查询1次
foreach (var p in filtered) { }    // 又查询1次

//  解决：缓存结果
var cached = products.Where(p => p.Price > 100).ToList();
```

## 3. 标准查询运算符

### 3.1 筛选与投影

```csharp
// Where - 条件筛选
var active = users.Where(u => u.IsActive);

// OfType - 类型筛选
var strings = mixed.OfType<string>();

// Select - 投影
var names = users.Select(u => u.Name);

// SelectMany - 扁平化投影
var allTags = articles.SelectMany(a => a.Tags).Distinct();

// Zip - 合并两个序列
var combined = names.Zip(ages, (name, age) => $"{name}: {age}");

// Chunk (.NET 6+) - 分块
var chunks = largeList.Chunk(100); // 每块100个
```

### 3.2 排序与分组

```csharp
// OrderBy / OrderByDescending
var sorted = products.OrderBy(p => p.Price);

// ThenBy / ThenByDescending
var multi = products.OrderBy(p => p.Category).ThenBy(p => p.Price);

// Reverse
var reversed = list.Reverse();

// GroupBy
var grouped = products.GroupBy(p => p.Category);
var grouped2 = products.GroupBy(
    p => p.Category,
    p => p.Name,                    // 元素选择器
    (key, names) => new             // 结果选择器
    {
        Category = key,
        Names = names.ToList()
    }
);

// ToLookup - 立即执行的分组
var lookup = products.ToLookup(p => p.Category);
var electronics = lookup["电子"]; // O(1) 查找
```

### 3.3 聚合与量化

```csharp
// 聚合
int sum = numbers.Sum();
double avg = numbers.Average();
int max = numbers.Max();
int min = numbers.Min();

// 自定义聚合
string joined = words.Aggregate((a, b) => $"{a}, {b}");

// 带种子值的聚合
int total = orders.Aggregate(0, (sum, o) => sum + o.Amount);

// 量化
bool any = products.Any(p => p.Price > 1000);   // 是否存在
bool all = products.All(p => p.Price > 0);       // 是否全部满足
bool contains = numbers.Contains(42);

// .NET 9 新方法
var counts = words.CountBy(w => w.Length);
// 结果: [{ Key: 3, Value: 5 }, { Key: 5, Value: 3 }]

var aggregated = orders.AggregateBy(
    o => o.CustomerId, 0m, (sum, o) => sum + o.Amount);
```

### 3.4 集合操作

```csharp
// Distinct - 去重
var unique = numbers.Distinct();
var uniqueBy = products.DistinctBy(p => p.Category); // .NET 6+

// Union - 并集
var union = set1.Union(set2);

// Intersect - 交集
var intersect = set1.Intersect(set2);

// Except - 差集
var except = set1.Except(set2);

// Skip / Take - 分页
var page = items.Skip((pageNum - 1) * pageSize).Take(pageSize);

// SkipWhile / TakeWhile - 条件跳过/取值
var result = numbers.SkipWhile(n => n < 5).TakeWhile(n => n < 10);

// DefaultIfEmpty - 空集合默认值
var nonEmpty = emptyList.DefaultIfEmpty(new Product("默认", 0, ""));
```

### 3.5 Join 操作

```csharp
// 内连接
var innerJoin = from p in products
                join c in categories on p.CategoryId equals c.Id
                select new { p.Name, CategoryName = c.Name };

// 方法语法
var innerJoin2 = products.Join(
    categories,
    p => p.CategoryId,
    c => c.Id,
    (p, c) => new { p.Name, CategoryName = c.Name }
);

// 分组连接
var groupJoin = from c in categories
                join p in products on c.Id equals p.CategoryId into productsGroup
                select new { c.Name, Products = productsGroup };

// 左外连接
var leftJoin = from c in categories
               join p in products on c.Id equals p.CategoryId into productsGroup
               from p in productsGroup.DefaultIfEmpty()
               select new { c.Name, ProductName = p?.Name ?? "无" };
```

## 4. PLINQ

```csharp
// AsParallel - 并行 LINQ
var result = numbers.AsParallel()
    .Where(n => IsPrime(n))
    .Select(n => n * n)
    .OrderBy(n => n)
    .ToList();

// 控制并行度
var result2 = numbers.AsParallel()
    .WithDegreeOfParallelism(4)
    .WithCancellation(ct)
    .Select(HeavyTransform);

// ForAll - 并行遍历（无序）
numbers.AsParallel()
    .Where(n => n > 100)
    .ForAll(n => Process(n)); // 不保证顺序

// 保留顺序
var ordered = numbers.AsParallel()
    .AsOrdered()
    .Select(Transform);

// 注意：PLINQ 不总是更快
// 1. 集合小时开销大于收益
// 2. 有副作用时不安全
// 3. I/O 操作不适合 PLINQ
```

## 5. 表达式树

### 5.1 基本概念

```csharp
// Lambda 表达式 vs 表达式树
Func<int, int, int> add = (a, b) => a + b;           // 委托
Expression<Func<int, int, int>> addExpr = (a, b) => a + b; // 表达式树

// 编译执行
var compiled = addExpr.Compile();
int result = compiled(3, 4); // 7

// 检查表达式结构
Console.WriteLine(addExpr);          // (a, b) => (a + b)
Console.WriteLine(addExpr.Body);     // (a + b)
Console.WriteLine(addExpr.NodeType); // Lambda
```

### 5.2 构建表达式树

```csharp
// 手动构建: (int x) => x > 10
ParameterExpression param = Expression.Parameter(typeof(int), "x");
ConstantExpression constant = Expression.Constant(10);
BinaryExpression body = Expression.GreaterThan(param, constant);
Expression<Func<int, bool>> expr =
    Expression.Lambda<Func<int, bool>>(body, param);

var func = expr.Compile();
Console.WriteLine(func(15)); // True

// 动态组合表达式
Expression<Func<Product, bool>> IsExpensive = p => p.Price > 1000;
Expression<Func<Product, bool>> IsElectronic = p => p.Category == "电子";

// AND 组合
var combined = Expression.Lambda<Func<Product, bool>>(
    Expression.AndAlso(IsExpensive.Body, IsElectronic.Body),
    IsExpensive.Parameters[0]);
```

### 5.3 EF Core 中的表达式树

```csharp
// EF Core 利用表达式树将 LINQ 翻译为 SQL
// 方法语法中的 Lambda 被编译为表达式树
var products = await _context.Products
    .Where(p => p.Price > 100)      // 表达式树 → SQL WHERE
    .OrderBy(p => p.Name)            // → ORDER BY
    .Select(p => new { p.Name, p.Price }) // → SELECT
    .ToListAsync();

//  表达式树中不能包含 C# 方法调用
var bad = _context.Products
    .Where(p => IsValid(p.Name)); // 无法翻译为 SQL！

//  先在内存中处理或使用可翻译的表达式
var good = _context.Products
    .Where(p => p.Name.StartsWith("A") && p.Price > 100);
```

## 6. 局部函数

```csharp
public IEnumerable<int> GetFactors(int number)
{
    if (number < 1)
        throw new ArgumentException("必须为正整数", nameof(number));

    // 局部函数 - 可以访问外部变量
    IEnumerable<int> GetFactorsInternal()
    {
        for (int i = 1; i <= number; i++)
        {
            if (number % i == 0)
                yield return i;
        }
    }

    return GetFactorsInternal();
}

// 静态局部函数（不捕获外部变量，性能更好）
public int Calculate(int x, int y)
{
    return Multiply(x, y) + Add(x, y);

    static int Multiply(int a, int b) => a * b;
    static int Add(int a, int b) => a + b;
}

// 局部函数用于迭代器中的参数验证
public static IEnumerable<T> Take<T>(IEnumerable<T> source, int count)
{
    if (source is null) throw new ArgumentNullException(nameof(source));
    if (count < 0) throw new ArgumentOutOfRangeException(nameof(count));

    return Iterator();

    IEnumerable<T> Iterator()
    {
        var i = 0;
        foreach (var item in source)
        {
            if (i++ >= count) yield break;
            yield return item;
        }
    }
}
```

## 7. 模式匹配进阶

### 7.1 完整的模式匹配体系

```csharp
// 声明模式
if (obj is string s) { }
if (obj is int[] arr) { }
if (obj is List<int> list) { }

// 类型模式（C# 9+，不需要变量名）
if (obj is string) { }
switch (obj)
{
    case int: return "整数";
    case string: return "字符串";
}

// 属性模式
if (person is { Age: >= 18, Name: "张三" }) { }

// 嵌套属性模式
if (order is { Customer.VipLevel: >= 3, Amount: > 1000m }) { }

// 模式组合
if (n is > 0 and < 100 and not 50) { }
if (c is 'a' or 'e' or 'i' or 'o' or 'u') { }

// 列表模式（C# 11）
if (arr is [1, 2, 3]) { }              // 精确匹配
if (arr is [1, .., 3]) { }             // 首尾匹配
if (arr is [var first, .., var last]) { } // 提取首尾

// 对模式匹配使用 when 守卫
var category = shape switch
{
    Circle { Radius: > 10 } c => "大圆",
    Circle c => "小圆",
    Rectangle { Width: var w, Height: var h } when w == h => "正方形",
    Rectangle r => "矩形",
    _ => "未知"
};
```

### 7.2 函数式风格

```csharp
// 不可变数据管道
var result = products
    .Where(p => p.Price > 100)
    .GroupBy(p => p.Category)
    .Select(g => new
    {
        Category = g.Key,
        Total = g.Sum(p => p.Price),
        Items = g.Select(p => p.Name).ToList()
    })
    .OrderByDescending(x => x.Total)
    .ToList();

// 使用 record 保证不可变性
public record ProcessedData(
    string Category,
    decimal Total,
    IReadOnlyList<string> Items
);

// 管道式处理
var pipeline = products
    .Filter(p => p.Price > 100)
    .GroupBy(p => p.Category)
    .Map(g => new ProcessedData(
        g.Key,
        g.Sum(p => p.Price),
        g.Select(p => p.Name).ToList()
    ))
    .SortByDescending(x => x.Total);
```
