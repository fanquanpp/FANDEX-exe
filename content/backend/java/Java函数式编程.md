---
order: 66
title: Java函数式编程
module: java
category: Java
difficulty: intermediate
description: Lambda、Stream与函数式接口
author: fanquanpp
updated: '2026-06-14'
related:
  - java/SpringBoot数据访问
  - java/Java设计模式
  - java/Java网络编程
  - java/Java日志系统
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 8 引入的 Lambda 表达式和 Stream API 标志着 Java 迈入函数式编程时代。函数式编程强调将行为参数化、使用不可变数据和声明式风格，使代码更简洁、更易并行化。本文介绍 Java 函数式编程的核心概念和实用技巧。

## 基础概念

### 函数式接口

| 接口              | 签名         | 用途       |
| ----------------- | ------------ | ---------- |
| Function<T, R>    | T -> R       | 转换数据   |
| Consumer<T>       | T -> void    | 消费数据   |
| Supplier<T>       | () -> T      | 提供数据   |
| Predicate<T>      | T -> boolean | 判断条件   |
| BiFunction<T,U,R> | (T, U) -> R  | 双参数转换 |
| UnaryOperator<T>  | T -> T       | 一元操作   |
| BinaryOperator<T> | (T, T) -> T  | 二元操作   |

### 核心原则

- 函数是一等公民，可以作为参数传递和返回值
- 避免可变状态，优先使用不可变对象
- 声明式编程：描述"做什么"而非"怎么做"
- 纯函数：相同输入始终产生相同输出，无副作用

## 快速上手

### Lambda 表达式

```java
// 无参数
Runnable r = () -> System.out.println("Hello");

// 单参数（类型推断）
Consumer<String> print = s -> System.out.println(s);

// 多参数
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// 代码块
Comparator<String> cmp = (s1, s2) -> {
    int diff = s1.length() - s2.length();
    return diff != 0 ? diff : s1.compareTo(s2);
};

// 方法引用
Consumer<String> printRef = System.out::println;     // 实例方法引用
Function<String, Integer> len = String::length;       // 实例方法引用
Supplier<List<String>> listFactory = ArrayList::new;  // 构造方法引用
```

### 自定义函数式接口

```java
// 自定义函数式接口
@FunctionalInterface
interface Transformer<T, R> {
    R transform(T input);

    // 可以有默认方法
    default <V> Transformer<T, V> andThen(Function<R, V> after) {
        return input -> after.apply(transform(input));
    }
}

// 使用自定义接口
Transformer<String, Integer> strLen = String::length;
Transformer<String, String> upper = String::toUpperCase;
Transformer<String, String> composed = strLen.andThen(n -> "长度: " + n);
```

## 详细用法

### Stream 基本操作

```java
// 创建 Stream
Stream<String> s1 = Stream.of("a", "b", "c");
Stream<Integer> s2 = IntStream.range(1, 100).boxed();
Stream<Double> s3 = Stream.generate(Math::random).limit(10);

// 中间操作（惰性求值）
List<String> names = users.stream()
    .filter(u -> u.getAge() > 18)        // 过滤
    .map(User::getName)                   // 映射
    .flatMap(name -> Arrays.stream(name.split(" "))) // 展平
    .distinct()                           // 去重
    .sorted()                             // 排序
    .peek(System.out::println)            // 调试（不影响流）
    .skip(10)                             // 跳过前10个
    .limit(20)                            // 最多取20个
    .collect(Collectors.toList());        // 终端操作
```

### Collectors 收集器

```java
// 常用收集器
// 转为列表
List<String> list = stream.collect(Collectors.toList());

// 转为字符串
String joined = names.stream().collect(Collectors.joining(", "));

// 分组
Map<String, List<User>> byCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity));

// 分区（按条件分为 true/false 两组）
Map<Boolean, List<User>> partitioned = users.stream()
    .collect(Collectors.partitioningBy(u -> u.getAge() >= 18));

// 下游收集器：分组后统计
Map<String, Long> countByCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));

// 分组后取最大值
Map<String, Optional<User>> oldestByCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity,
        Collectors.maxBy(Comparator.comparingInt(User::getAge))));

// 收集为不可变列表
List<String> unmodifiable = stream.collect(
    Collectors.toUnmodifiableList());
```

### 原始类型流

```java
// 使用 IntStream/LongStream/DoubleStream 避免装箱开销
IntSummaryStatistics stats = users.stream()
    .mapToInt(User::getAge)
    .summaryStatistics();

System.out.println("平均年龄: " + stats.getAverage());
System.out.println("最大年龄: " + stats.getMax());
System.out.println("总人数: " + stats.getCount());

// 数值范围操作
long evenCount = IntStream.rangeClosed(1, 100)
    .filter(n -> n % 2 == 0)
    .count();

// 数值聚合
double average = users.stream()
    .mapToInt(User::getAge)
    .average()
    .orElse(0.0);
```

## 常见场景

### 数据转换管道

```java
// 将原始数据转换为业务对象
List<OrderDTO> dtos = orders.stream()
    .filter(order -> order.getStatus() == Status.COMPLETED)
    .map(order -> {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getId());
        dto.setCustomerName(order.getCustomer().getName());
        dto.setTotal(order.getItems().stream()
            .mapToDouble(Item::getPrice)
            .sum());
        dto.setItemCount(order.getItems().size());
        return dto;
    })
    .sorted(Comparator.comparingDouble(OrderDTO::getTotal).reversed())
    .collect(Collectors.toList());
```

### 并行流

```java
// 使用并行流处理大数据集
long count = bigList.parallelStream()
    .filter(item -> isValid(item))
    .map(item -> transform(item))
    .count();

// 注意：并行流适合 CPU 密集型且无状态的操作
// 自定义并行度
ForkJoinPool customPool = new ForkJoinPool(4);
List<Result> results = customPool.submit(() ->
    bigList.parallelStream()
        .map(this::process)
        .collect(Collectors.toList())
).get();
```

## 注意事项

- Stream 只能消费一次，重复使用会抛出 IllegalStateException
- 并行流不保证元素顺序，除非使用 forEachOrdered
- 避免在 Lambda 中修改外部可变状态，这会导致难以调试的并发问题
- Stream 操作中的异常需要处理，受检异常需要包装为非受检异常
- 短路操作（findAny、anyMatch）可以提前终止流，提升性能
- 对于简单循环，传统 for 循环比 Stream 更易读且性能更好

## 进阶用法

### 自定义收集器

```java
// 实现自定义收集器：将流元素收集为以逗号分隔的字符串
public class StringJoiningCollector implements Collector<String, StringBuilder, String> {
    private final String delimiter;

    public StringJoiningCollector(String delimiter) {
        this.delimiter = delimiter;
    }

    @Override
    public Supplier<StringBuilder> supplier() {
        return StringBuilder::new;
    }

    @Override
    public BiConsumer<StringBuilder, String> accumulator() {
        return (sb, s) -> {
            if (sb.length() > 0) sb.append(delimiter);
            sb.append(s);
        };
    }

    @Override
    public BinaryOperator<StringBuilder> combiner() {
        return (sb1, sb2) -> sb1.append(delimiter).append(sb2);
    }

    @Override
    public Function<StringBuilder, String> finisher() {
        return StringBuilder::toString;
    }

    @Override
    public Set<Characteristics> characteristics() {
        return Set.of();
    }
}
```

### 函数组合与柯里化

```java
// 函数组合
Function<Integer, Integer> doubleIt = x -> x * 2;
Function<Integer, Integer> addOne = x -> x + 1;

// compose: 先执行参数函数，再执行当前函数
Function<Integer, Integer> doubleThenAdd = addOne.compose(doubleIt); // x*2+1

// andThen: 先执行当前函数，再执行参数函数
Function<Integer, Integer> addThenDouble = doubleIt.andThen(addOne); // (x+1)*2

// 柯里化：将多参数函数转换为一系列单参数函数
BiFunction<Integer, Integer, Integer> multiply = (a, b) -> a * b;
Function<Integer, Function<Integer, Integer>> curriedMultiply =
    a -> b -> a * b;

// 部分应用
Function<Integer, Integer> triple = curriedMultiply.apply(3);
System.out.println(triple.apply(5)); // 15
```
