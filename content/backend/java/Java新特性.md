---
order: 60
title: Java新特性
module: java
category: Java
difficulty: intermediate
description: 'Java 17-21新特性'
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java序列化
  - java/JavaIO与NIO
  - java/运算符与表达式
  - java/Spring基础
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 从 17 到 21 版本引入了大量现代语言特性，包括 Record 类、密封类、模式匹配、虚拟线程等。这些特性使 Java 代码更简洁、更安全、更易表达业务意图。Java 17 是当前的 LTS 版本，Java 21 是最新的 LTS 版本，企业应优先升级到这两个版本。

## 基础概念

### 版本路线

| 版本    | 类型 | 关键特性                                 |
| ------- | ---- | ---------------------------------------- |
| Java 17 | LTS  | 密封类、模式匹配预览、强封装             |
| Java 19 | 特性 | 虚拟线程预览、结构化并发预览             |
| Java 20 | 特性 | 作用域值预览、记录模式预览               |
| Java 21 | LTS  | 虚拟线程正式、模式匹配正式、记录模式正式 |

### 特性分类

- **语法增强**：Record、密封类、模式匹配、switch 表达式
- **并发改进**：虚拟线程、结构化并发、作用域值
- **API 增强**：新 String 方法、新集合工厂方法、新 IO 方法

## 快速上手

### Record 类（Java 16+）

```java
// Record 自动生成构造器、getter、equals、hashCode、toString
public record Point(int x, int y) {
    // 紧凑构造器：用于参数验证
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("坐标不能为负数");
        }
    }

    // 自定义方法
    public double distanceTo(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }
}

var p = new Point(3, 4);
p.x();   // 3（注意：没有 getX()，直接用 x()）
p.y();   // 4
```

### 密封类（Java 17+）

```java
// 密封类限制继承层级，编译器可穷举所有子类
public sealed interface Shape permits Circle, Rectangle, Triangle {}

// 子类必须是 final、sealed 或 non-sealed
public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}
public non-sealed class Triangle implements Shape {
    private final double a, b, c;
    public Triangle(double a, double b, double c) { this.a = a; this.b = b; this.c = c; }
}
```

### 模式匹配 instanceof（Java 16+）

```java
// 旧写法
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// 新写法：同时判断和绑定变量
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s.toUpperCase()); // s 已绑定，直接使用
}

// 与逻辑运算组合
if (obj instanceof Integer i && i > 0) {
    System.out.println("正整数: " + i);
}
```

## 详细用法

### Switch 模式匹配（Java 21）

```java
// 使用模式匹配的 switch
static String formatShape(Shape shape) {
    return switch (shape) {
        case Circle(var r) when r > 0   -> "圆形，半径: " + r;
        case Circle(var r)              -> "退化的圆";
        case Rectangle(var w, var h)    -> "矩形，面积: " + (w * h);
        case Triangle t                 -> "三角形";
    };
}

// 穷举密封类型的所有分支，无需 default
static double area(Shape shape) {
    return switch (shape) {
        case Circle(var r)         -> Math.PI * r * r;
        case Rectangle(var w, var h) -> w * h;
        case Triangle t            -> heronFormula(t);
    };
}
```

### 文本块（Java 15+）

```java
// 多行字符串，适合 SQL、JSON、HTML
String query = """
    SELECT u.name, u.email
    FROM users u
    WHERE u.age > %d
    ORDER BY u.name
    """.formatted(18);

String json = """
    {
        "name": "%s",
        "age": %d
    }
    """.formatted("张三", 25);
```

### 新增 String 方法

```java
// Java 11+ 新增方法
"  hello  ".strip();          // "hello"（Unicode 感知的 trim）
"  hello  ".stripLeading();   // "hello  "
"  hello  ".stripTrailing();  // "  hello"
"hello".repeat(3);            // "hellohellohello"
"hello".isBlank();            // false
"".isBlank();                 // true
"line1\nline2\nline3".lines().count(); // 3

// Java 12+ 新增方法
"hello".indent(4);            // "    hello\n"
"  hello  ".stripIndent();    // 去除公共缩进
```

### 新增集合工厂方法

```java
// Java 9+ 不可变集合工厂
List<String> list = List.of("a", "b", "c");
Set<Integer> set = Set.of(1, 2, 3);
Map<String, Integer> map = Map.of("a", 1, "b", 2);
Map<String, Integer> map2 = Map.ofEntries(
    Map.entry("x", 10),
    Map.entry("y", 20)
);

// 注意：返回的是不可变集合，修改会抛出 UnsupportedOperationException
```

## 常见场景

### Record 替代 DTO

```java
// 使用 Record 替代传统 DTO，代码量大幅减少
// 传统 DTO 需要 50+ 行，Record 只需 1 行
public record UserDTO(
    Long id,
    String name,
    String email,
    int age
) {}

// Record 与 Spring MVC 配合
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public UserDTO createUser(@RequestBody UserDTO dto) {
        return userService.create(dto);
    }
}
```

### 密封类建模领域

```java
// 用密封类建模支付方式，编译器保证穷举
public sealed interface PaymentMethod {
    record CreditCard(String number, String expiry) implements PaymentMethod {}
    record WeChatPay(String openId) implements PaymentMethod {}
    record BankTransfer(String account, String bank) implements PaymentMethod {}
}

// 处理支付时，编译器会检查是否覆盖所有情况
public String processPayment(PaymentMethod method) {
    return switch (method) {
        case PaymentMethod.CreditCard(var num, var exp)
            -> "信用卡支付: " + num.substring(num.length() - 4);
        case PaymentMethod.WeChatPay(var openId)
            -> "微信支付: " + openId;
        case PaymentMethod.BankTransfer(var acct, var bank)
            -> "银行转账: " + bank + " " + acct;
    };
}
```

## 注意事项

- Record 是不可变的，所有字段都是 final，不能继承其他类
- 密封类的 permits 列表必须与密封类在同一包中（模块化项目中可在同一模块）
- 模式匹配的 switch 必须穷举所有可能，否则编译错误
- 文本块中的尾部空格会被自动去除，注意缩进处理
- List.of() 等工厂方法创建的是不可变集合，不能添加或删除元素
- 虚拟线程在 Java 21 正式发布，Java 19-20 为预览特性

## 进阶用法

### 作用域值（Scoped Values，预览）

```java
// 作用域值替代 ThreadLocal，在虚拟线程中更安全
private static final ScopedValue<User> CURRENT_USER = ScopedValue.newInstance();

// 在方法中绑定作用域值
ScopedValue.where(CURRENT_USER, user).run(() -> {
    processRequest(); // 在此范围内可以访问 CURRENT_USER
});

// 在任意深层调用中获取
void processRequest() {
    User user = CURRENT_USER.get(); // 获取当前用户
    doSomething(user);
}
```

### Foreign Function & Memory API（预览）

```java
// Java 22+ 的外部函数和内存 API，替代 JNI
try (Arena arena = Arena.ofConfined()) {
    // 分配外部内存
    MemorySegment segment = arena.allocate(100);

    // 写入数据
    segment.setString(0, "Hello, FFM API!");

    // 读取数据
    String value = segment.getString(0);
    System.out.println(value);
}
```
