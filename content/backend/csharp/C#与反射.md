---
order: 64
title: 'C#与反射'
module: csharp
category: 'C#'
difficulty: advanced
description: 反射与表达式树
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与最小API'
  - 'csharp/C#12与C#13新特性'
  - csharp/LINQ延迟与立即执行
  - 'csharp/async-await状态机'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

反射（Reflection）是 C# 在运行时检查和操作类型信息的能力。通过反射，你可以在程序运行时获取类、方法、属性、字段等成员的信息，甚至动态调用方法、创建实例和修改属性值。表达式树（Expression Trees）则是将代码表示为数据结构的技术，它让你可以在运行时分析、修改和编译代码逻辑。

为什么需要反射？框架和库经常需要在运行时发现和使用类型，比如依赖注入容器需要扫描程序集找到服务类，序列化库需要读取对象属性来生成 JSON，ORM 需要将数据库列映射到对象属性。表达式树则让 EF Core 能将 LINQ 查询翻译为 SQL，而不是在内存中执行。

## 基础概念

**Type 对象**：每个 .NET 类型在运行时都有一个对应的 Type 对象，包含该类型的所有元数据信息。通过 Type 对象可以获取属性、方法、字段、构造函数等成员。

**Assembly**：程序集，是 .NET 代码的部署单元。通过 Assembly 可以获取其中定义的所有类型。

**BindingFlags**：控制反射搜索的范围，比如是否包含非公共成员、是否包含静态成员等。

**表达式树**：将 Lambda 表达式表示为树形数据结构。编译器可以将 Lambda 转换为委托（可执行代码）或表达式树（数据），取决于目标类型。

**MethodInfo/PropertyInfo/FieldInfo**：分别表示方法、属性和字段的元数据，可以通过它们动态调用方法或读写属性。

## 快速上手

最基本的反射操作：

```csharp
using System.Reflection;

// 1. 获取 Type 对象的三种方式
Type type1 = typeof(string);                    // 使用 typeof 关键字
Type type2 = "hello".GetType();                 // 从实例获取
Type type3 = Type.GetType("System.String");     // 通过名称获取

// 2. 获取类型信息
Console.WriteLine(type1.Name);          // String
Console.WriteLine(type1.Namespace);     // System
Console.WriteLine(type1.IsClass);       // True
Console.WriteLine(type1.IsValueType);   // False

// 3. 获取并调用方法
var method = typeof(string).GetMethod("Substring", new[] { typeof(int) });
var result = method!.Invoke("Hello World", new object[] { 6 });
Console.WriteLine(result); // World

// 4. 获取和设置属性
public class User
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
}

var user = new User { Name = "张三", Age = 25 };
var prop = typeof(User).GetProperty("Name")!;
Console.WriteLine(prop.GetValue(user)); // 张三
prop.SetValue(user, "李四");
Console.WriteLine(user.Name);           // 李四
```

## 详细用法

### 获取类型成员

```csharp
public class Sample
{
    public string PublicField = "";
    private int _privateField;
    public string Name { get; set; } = "";
    public int Age { get; private set; }
    public void PublicMethod() { }
    private void PrivateMethod() { }
    public static void StaticMethod() { }
}

var type = typeof(Sample);

// 获取所有公共属性
var properties = type.GetProperties();
foreach (var prop in properties)
{
    Console.WriteLine($"属性: {prop.Name}, 类型: {prop.PropertyType.Name}");
}

// 获取所有公共方法
var methods = type.GetMethods();
foreach (var method in methods)
{
    Console.WriteLine($"方法: {method.Name}, 返回类型: {method.ReturnType.Name}");
}

// 获取所有公共字段
var fields = type.GetFields();
foreach (var field in fields)
{
    Console.WriteLine($"字段: {field.Name}, 类型: {field.FieldType.Name}");
}

// 获取非公共成员（使用 BindingFlags）
var privateFields = type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance);
foreach (var field in privateFields)
{
    Console.WriteLine($"私有字段: {field.Name}");
}

// 获取静态成员
var staticMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Static);
```

### 动态创建实例

```csharp
public class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }

    public Product() { }

    public Product(string name, decimal price)
    {
        Name = name;
        Price = price;
    }
}

// 方式一：使用 Activator
var product1 = (Product)Activator.CreateInstance(typeof(Product))!;
var product2 = (Product)Activator.CreateInstance(typeof(Product),
    new object[] { "手机", 3999m })!;

// 方式二：使用构造函数反射
var constructor = typeof(Product).GetConstructor(new[] { typeof(string), typeof(decimal) })!;
var product3 = (Product)constructor.Invoke(new object[] { "电脑", 5999m });

// 方式三：泛型 Activator（更高效）
var product4 = Activator.CreateInstance<Product>();
```

### 动态调用方法

```csharp
public class Calculator
{
    public int Add(int a, int b) => a + b;
    public static double Multiply(double a, double b) => a * b;
}

var calc = new Calculator();

// 调用实例方法
var addMethod = typeof(Calculator).GetMethod("Add")!;
var sum = (int)addMethod.Invoke(calc, new object[] { 3, 5 })!;
Console.WriteLine(sum); // 8

// 调用静态方法
var multiplyMethod = typeof(Calculator).GetMethod("Multiply")!;
var product = (double)multiplyMethod.Invoke(null, new object[] { 2.5, 4.0 })!;
Console.WriteLine(product); // 10

// 调用带 ref/out 参数的方法
var tryParseMethod = typeof(int).GetMethod("TryParse",
    new[] { typeof(string), typeof(int).MakeByRefType() })!;
object[] args = new object[] { "42", 0 };
var success = (bool)tryParseMethod.Invoke(null, args)!;
Console.WriteLine($"解析成功: {success}, 值: {args[1]}"); // 解析成功: True, 值: 42
```

### 特性读取

```csharp
// 自定义特性
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public class DisplayNameAttribute : Attribute
{
    public string Name { get; }
    public DisplayNameAttribute(string name) => Name = name;
}

[DisplayName("用户信息")]
public class UserModel
{
    [DisplayName("用户名")]
    public string Name { get; set; } = "";

    [DisplayName("年龄")]
    public int Age { get; set; }
}

// 读取类上的特性
var classAttr = typeof(UserModel).GetCustomAttribute<DisplayNameAttribute>();
Console.WriteLine(classAttr?.Name); // 用户信息

// 读取属性上的特性
foreach (var prop in typeof(UserModel).GetProperties())
{
    var propAttr = prop.GetCustomAttribute<DisplayNameAttribute>();
    Console.WriteLine($"{prop.Name} -> {propAttr?.Name}");
}
// Name -> 用户名
// Age -> 年龄
```

### 扫描程序集

```csharp
// 获取当前程序集中所有实现某接口的类型
var types = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => typeof(IRepository).IsAssignableFrom(t) && !t.IsInterface)
    .ToList();

foreach (var type in types)
{
    Console.WriteLine($"找到仓储实现: {type.Name}");
}

// 加载外部程序集并扫描
var assembly = Assembly.LoadFrom("MyPlugin.dll");
var pluginTypes = assembly.GetTypes()
    .Where(t => typeof(IPlugin).IsAssignableFrom(t) && !t.IsAbstract)
    .ToList();

// 动态创建插件实例
foreach (var pluginType in pluginTypes)
{
    var plugin = (IPlugin)Activor.CreateInstance(pluginType)!;
    plugin.Initialize();
}
```

### 表达式树基础

```csharp
using System.Linq.Expressions;

// 1. Lambda 表达式可以编译为委托或表达式树
Func<int, bool> delegateFunc = x => x > 10;           // 委托
Expression<Func<int, bool>> expressionTree = x => x > 10; // 表达式树

// 2. 表达式树可以编译为委托
var compiled = expressionTree.Compile();
bool result = compiled(15); // True

// 3. 表达式树可以分析结构
Console.WriteLine(expressionTree.Body);              // x > 10
Console.WriteLine(expressionTree.Parameters[0]);     // x

// 4. 手动构建表达式树
// 等价于 x => x > 10
ParameterExpression param = Expression.Parameter(typeof(int), "x");
ConstantExpression constant = Expression.Constant(10, typeof(int));
BinaryExpression body = Expression.GreaterThan(param, constant);
var lambda = Expression.Lambda<Func<int, bool>>(body, param);

// 编译并执行
var func = lambda.Compile();
Console.WriteLine(func(15)); // True
Console.WriteLine(func(5));  // False
```

### 表达式树用于动态查询

```csharp
// 动态构建过滤条件
public static IQueryable<T> WhereDynamic<T>(
    IQueryable<T> source, string propertyName, object value)
{
    var parameter = Expression.Parameter(typeof(T), "x");
    var property = Expression.Property(parameter, propertyName);
    var constant = Expression.Constant(value);
    var equality = Expression.Equal(property, constant);
    var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

    return source.Where(lambda);
}

// 使用
var users = new List<User>
{
    new() { Name = "张三", Age = 25 },
    new() { Name = "李四", Age = 30 },
    new() { Name = "王五", Age = 25 }
}.AsQueryable();

// 动态按属性名过滤
var result = WhereDynamic(users, "Name", "张三");
Console.WriteLine(result.Count()); // 1

// 动态按年龄过滤
var age25 = WhereDynamic(users, "Age", 25);
Console.WriteLine(age25.Count()); // 2
```

### 表达式树用于属性访问

```csharp
// 高效的属性获取器（避免每次反射调用）
public static Func<T, object> CreatePropertyGetter<T>(string propertyName)
{
    var parameter = Expression.Parameter(typeof(T), "obj");
    var property = Expression.Property(parameter, propertyName);
    var convert = Expression.Convert(property, typeof(object));
    var lambda = Expression.Lambda<Func<T, object>>(convert, parameter);
    return lambda.Compile();
}

// 使用
var getter = CreatePropertyGetter<User>("Name");
var user = new User { Name = "张三" };
Console.WriteLine(getter(user)); // 张三

// 比直接反射快很多，因为编译后的委托是直接调用
```

## 常见场景

### 简单的对象映射器

```csharp
public static TTarget MapTo<TSource, TTarget>(TSource source) where TTarget : new()
{
    var target = new TTarget();
    var sourceProps = typeof(TSource).GetProperties();
    var targetProps = typeof(TTarget).GetProperties();

    foreach (var sourceProp in sourceProps)
    {
        // 找到目标类型中同名且类型兼容的属性
        var targetProp = targetProps.FirstOrDefault(p =>
            p.Name == sourceProp.Name &&
            p.PropertyType.IsAssignableFrom(sourceProp.PropertyType));

        if (targetProp is not null && targetProp.CanWrite)
        {
            var value = sourceProp.GetValue(source);
            targetProp.SetValue(target, value);
        }
    }

    return target;
}

// 使用
public class UserDto { public string Name { get; set; } = ""; public int Age { get; set; } }
public class UserViewModel { public string Name { get; set; } = ""; public int Age { get; set; } }

var dto = new UserDto { Name = "张三", Age = 25 };
var vm = MapTo<UserDto, UserViewModel>(dto);
Console.WriteLine(vm.Name); // 张三
```

### 插件系统

```csharp
// 定义插件接口
public interface IPlugin
{
    string Name { get; }
    void Execute();
}

// 加载插件
public class PluginLoader
{
    public List<IPlugin> LoadPlugins(string directory)
    {
        var plugins = new List<IPlugin>();

        foreach (var file in Directory.GetFiles(directory, "*.dll"))
        {
            var assembly = Assembly.LoadFrom(file);
            var pluginTypes = assembly.GetTypes()
                .Where(t => typeof(IPlugin).IsAssignableFrom(t)
                         && !t.IsAbstract
                         && t.GetConstructor(Type.EmptyTypes) is not null);

            foreach (var type in pluginTypes)
            {
                var plugin = (IPlugin)Activator.CreateInstance(type)!;
                plugins.Add(plugin);
            }
        }

        return plugins;
    }
}
```

## 注意事项

**性能开销**：反射比直接调用慢几十到上百倍。在性能敏感的场景中，应该缓存反射结果或使用表达式树编译为委托。

**破坏封装**：反射可以访问私有成员，但这破坏了类型的封装性。只在必要时使用，比如测试或框架开发。

**AOT 兼容性**：.NET AOT（预先编译）场景下，反射可能不可用或受限。如果目标是 AOT，应使用源生成器替代反射。

**表达式树的限制**：不是所有 C# 语法都能表示为表达式树。语句块、循环、try-catch 等不能直接用表达式树表示。

**安全风险**：反射可以绕过访问修饰符，在处理用户输入时要小心，避免通过反射执行任意代码。

## 进阶用法

### 反射 Emit 动态生成类型

```csharp
using System.Reflection.Emit;

// 在运行时动态创建一个类
var assemblyName = new AssemblyName("DynamicAssembly");
var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.Run);
var moduleBuilder = assemblyBuilder.DefineDynamicModule("MainModule");

// 定义类型
var typeBuilder = moduleBuilder.DefineType("DynamicClass", TypeAttributes.Public | TypeAttributes.Class);

// 添加属性 Name
var fieldBuilder = typeBuilder.DefineField("_name", typeof(string), FieldAttributes.Private);
var propBuilder = typeBuilder.DefineProperty("Name", PropertyAttributes.None, typeof(string), null);

// 生成 get 方法
var getMethod = typeBuilder.DefineMethod("get_Name",
    MethodAttributes.Public | MethodAttributes.SpecialName, typeof(string), null);
var getIl = getMethod.GetILGenerator();
getIl.Emit(OpCodes.Ldarg_0);
getIl.Emit(OpCodes.Ldfld, fieldBuilder);
getIl.Emit(OpCodes.Ret);
propBuilder.SetGetMethod(getMethod);

// 生成 set 方法
var setMethod = typeBuilder.DefineMethod("set_Name",
    MethodAttributes.Public | MethodAttributes.SpecialName, null, new[] { typeof(string) });
var setIl = setMethod.GetILGenerator();
setIl.Emit(OpCodes.Ldarg_0);
setIl.Emit(OpCodes.Ldarg_1);
setIl.Emit(OpCodes.Stfld, fieldBuilder);
setIl.Emit(OpCodes.Ret);
propBuilder.SetSetMethod(setMethod);

// 创建类型
var dynamicType = typeBuilder.CreateType()!;
var instance = Activator.CreateInstance(dynamicType)!;
dynamicType.GetProperty("Name")!.SetValue(instance, "动态创建");
Console.WriteLine(dynamicType.GetProperty("Name")!.GetValue(instance)); // 动态创建
```

### 使用 Source Generator 替代反射

```csharp
// 传统方式：运行时反射
var properties = typeof(User).GetProperties();
foreach (var prop in properties)
{
    var value = prop.GetValue(user);
    Console.WriteLine($"{prop.Name} = {value}");
}

// 现代方式：编译时代码生成（更快、AOT 友好）
// 使用 [GenerateSerializer] 等特性让源生成器在编译时生成序列化代码
// 运行时无需反射，性能接近手写代码
```
