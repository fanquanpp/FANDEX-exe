---
order: 84
title: Java记录类
module: java
category: Java
difficulty: intermediate
description: Record类与密封接口
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与GraalVM
  - java/Java与Kubernetes
  - java/Java文本块
  - java/Java模块系统
prerequisites:
  - java/概述与开发环境
---

## 概述

Record 类（Java 16 正式）和密封接口（Java 17 正式）是 Java 面向数据建模的两个重要特性。Record 类用于定义不可变的数据载体，自动生成样板代码；密封接口限制继承层级，使类型系统更安全。两者结合使用，可以构建优雅且类型安全的数据模型。

## 基础概念

### Record 类的特点

- 不可变：所有字段都是 final
- 自动生成：构造器、getter（x() 而非 getX()）、equals、hashCode、toString
- 不能继承其他类，但可以实现接口
- 可以声明实例方法和静态方法
- 可以声明紧凑构造器进行参数验证

### 密封类的特点

- 使用 sealed 关键字修饰，通过 permits 列出允许的子类
- 子类必须是 final、sealed 或 non-sealed
- 编译器可以穷举所有子类型，配合模式匹配使用
- 与 Record 结合可以构建代数数据类型（ADT）

## 快速上手

### Record 基本用法

```java
// 定义 Record 类
public record Point(int x, int y) {
    // 紧凑构造器：用于参数验证
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("坐标不能为负数");
        }
    }
}

// 使用 Record
var p = new Point(3, 4);
p.x();   // 3（注意：不是 getX()）
p.y();   // 4
p.toString(); // Point[x=3, y=4]

// 自动生成的 equals 和 hashCode
new Point(1, 2).equals(new Point(1, 2)); // true

// 解构（Java 21 预览特性）
// if (p instanceof Point(int x, int y)) { ... }
```

### 密封接口基本用法

```java
// 定义密封接口，限制实现类
public sealed interface Shape permits Circle, Rectangle, Triangle {}

// 实现类使用 record（最简洁的方式）
public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}

// 实现类使用普通类
public non-sealed class Triangle implements Shape {
    private final double a, b, c;
    public Triangle(double a, double b, double c) {
        this.a = a; this.b = b; this.c = c;
    }
}
```

## 详细用法

### Record 高级特性

```java
// Record 实现接口
public record User(Long id, String name, String email)
    implements Comparable<User> {

    // 自定义方法
    public String displayName() {
        return name + " <" + email + ">";
    }

    // 静态工厂方法
    public static User anonymous() {
        return new User(0L, "Anonymous", "anon@example.com");
    }

    // 静态字段（允许）
    public static final User SYSTEM = new User(-1L, "System", "system@example.com");

    // 实现 Comparable
    @Override
    public int compareTo(User other) {
        return this.name.compareTo(other.name);
    }
}
```

### Record 与泛型

```java
// 泛型 Record
public record Pair<K, V>(K key, V value) {
    // 紧凑构造器中可以修改参数
    public Pair {
        Objects.requireNonNull(key);
        Objects.requireNonNull(value);
    }

    // 交换键值
    public Pair<V, K> swap() {
        return new Pair<>(value, key);
    }
}

// 使用泛型 Record
Pair<String, Integer> entry = new Pair<>("age", 25);
Pair<Integer, String> swapped = entry.swap();
```

### Record 与 JSON 序列化

```java
// Record 与 Jackson 配合（Jackson 2.12+ 原生支持）
public record UserDTO(
    Long id,
    @JsonProperty("user_name") String name,
    @JsonProperty("email_address") String email,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate createdAt
) {}

// Spring Controller 中直接使用 Record
@RestController
@RequestMapping("/api/users")
public class UserController {
    @PostMapping
    public UserDTO createUser(@RequestBody UserDTO dto) {
        return userService.create(dto);
    }
}
```

### 密封类与模式匹配

```java
// 密封类配合 switch 模式匹配（Java 21）
public static double area(Shape shape) {
    return switch (shape) {
        case Circle(var r) -> Math.PI * r * r;
        case Rectangle(var w, var h) -> w * h;
        case Triangle t -> heronFormula(t);
    };
    // 不需要 default，编译器知道所有子类型
}

// 带守卫条件的模式匹配
public static String describe(Shape shape) {
    return switch (shape) {
        case Circle(var r) when r > 10 -> "大圆";
        case Circle(var r) -> "小圆";
        case Rectangle(var w, var h) when w == h -> "正方形";
        case Rectangle(var w, var h) -> "矩形 " + w + "x" + h;
        case Triangle t -> "三角形";
    };
}
```

## 常见场景

### Record 替代 DTO 和值对象

```java
// API 响应使用 Record
public record ApiResponse<T>(
    int code,
    String message,
    T data,
    LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "成功", data, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null, LocalDateTime.now());
    }
}

// 分页响应
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {}
```

### 领域事件建模

```java
// 使用密封接口 + Record 建模领域事件
public sealed interface OrderEvent {
    String orderId();
    LocalDateTime timestamp();
}

public record OrderCreated(
    String orderId,
    String userId,
    BigDecimal amount,
    LocalDateTime timestamp
) implements OrderEvent {}

public record OrderPaid(
    String orderId,
    String paymentMethod,
    LocalDateTime timestamp
) implements OrderEvent {}

public record OrderShipped(
    String orderId,
    String trackingNumber,
    LocalDateTime timestamp
) implements OrderEvent {}

public record OrderCancelled(
    String orderId,
    String reason,
    LocalDateTime timestamp
) implements OrderEvent {}

// 处理事件时编译器保证穷举
public void handleEvent(OrderEvent event) {
    switch (event) {
        case OrderCreated(var id, var uid, var amt, var ts)
            -> processCreation(id, uid, amt);
        case OrderPaid(var id, var method, var ts)
            -> processPayment(id, method);
        case OrderShipped(var id, var tracking, var ts)
            -> processShipment(id, tracking);
        case OrderCancelled(var id, var reason, var ts)
            -> processCancellation(id, reason);
    }
}
```

## 注意事项

- Record 的字段是不可变的，不能有 setter 方法
- Record 不能继承其他类（隐式继承 java.lang.Record）
- Record 的紧凑构造器中修改参数会影响赋值，但字段本身仍不可变
- 密封类的 permits 列表中的类必须在同一包中（模块化项目中可在同一模块）
- Record 不能声明实例字段（只能通过构造器参数定义），但可以声明静态字段
- Record 的 getter 方法名是字段名（如 x()），不是 getX()，注意与 Bean 规范的区别

## 进阶用法

### Record 与序列化代理模式

```java
// 使用 Record 实现序列化代理模式
public class User implements Serializable {
    private final Long id;
    private final String name;
    private transient String password; // 不序列化

    // 序列化代理
    private record SerializationProxy(Long id, String name) {}

    private Object writeReplace() {
        return new SerializationProxy(id, name);
    }

    private void readObject(ObjectInputStream stream)
            throws InvalidObjectException {
        throw new InvalidObjectException("请使用序列化代理");
    }

    private User(SerializationProxy proxy) {
        this.id = proxy.id();
        this.name = proxy.name();
    }
}
```

### 局部 Record

```java
// 在方法内定义局部 Record，适合临时数据转换
public List<OrderSummary> summarize(List<Order> orders) {
    // 局部 Record，仅在此方法内可见
    record TempSummary(String category, BigDecimal total, int count) {}

    Map<String, TempSummary> summaries = orders.stream()
        .collect(Collectors.groupingBy(Order::getCategory,
            Collectors.collectingAndThen(
                Collectors.toList(),
                list -> new TempSummary(
                    list.get(0).getCategory(),
                    list.stream().map(Order::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                    list.size()
                )
            )));

    return summaries.values().stream()
        .map(ts -> new OrderSummary(ts.category(), ts.total(), ts.count()))
        .toList();
}
```
