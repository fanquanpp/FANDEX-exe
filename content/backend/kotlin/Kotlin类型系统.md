---
order: 64
title: Kotlin类型系统
module: kotlin
category: Kotlin
difficulty: advanced
description: 泛型、型变与星投影
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin集合操作
  - kotlin/Kotlin作用域函数
  - kotlin/Kotlin与Compose
  - kotlin/Kotlin与Gradle
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin 的类型系统在 Java 泛型基础上引入了声明处型变（declaration-site variance），使泛型 API 更安全、更易用。理解协变、逆变和星投影是设计高质量泛型接口的前提。

## 基础概念

### 型变三种形式

| 型变 | 关键字 | 角色     | 说明                       |
| ---- | ------ | -------- | -------------------------- |
| 协变 | out    | 生产者   | 只能读取，不能写入         |
| 逆变 | in     | 消费者   | 只能写入，不能读取         |
| 不变 | 无     | 两者兼有 | 既能读又能写，无子类型关系 |

### 子类型关系

```kotlin
// 协变：Producer<String> 是 Producer<Any> 的子类型
interface Source<out T> { fun next(): T }
val stringSource: Source<String> = ...
val anySource: Source<Any> = stringSource // 合法

// 逆变：Consumer<Any> 是 Consumer<String> 的子类型
interface Sink<in T> { fun put(value: T) }
val anySink: Sink<Any> = ...
val stringSink: Sink<String> = anySink // 合法

// 不变：MutableStack<String> 不是 MutableStack<Any> 的子类型
class MutableStack<T> {
    fun push(item: T) {}
    fun pop(): T = TODO()
}
```

## 快速上手

### 协变（out）

```kotlin
// 协变：T 只能出现在返回位置
interface Repository<out T> {
    fun getAll(): List<T>
    fun findById(id: String): T
}

// 可以安全地将 Repository<String> 赋值给 Repository<Any>
val userRepo: Repository<User> = UserRepository()
val anyRepo: Repository<Any> = userRepo // 合法

// 错误：out 位置不能有 T 类型的参数
// interface Repository<out T> {
//     fun save(item: T) // 编译错误！T 在 in 位置
// }
```

### 逆变（in）

```kotlin
// 逆变：T 只能出现在参数位置
interface Comparator<in T> {
    fun compare(a: T, b: T): Int
}

// 可以安全地将 Comparator<Any> 赋值给 Comparator<String>
val anyComparator: Comparator<Any> = ...
val stringComparator: Comparator<String> = anyComparator // 合法

// 错误：in 位置不能返回 T
// interface Comparator<in T> {
//     fun get(): T // 编译错误！T 在 out 位置
// }
```

### 星投影

```kotlin
// 星投影：不知道或不在乎类型参数时使用
fun printSize(list: List<*>) {
    println(list.size) // 可以，不依赖 T
    // list.get(0) 返回 Any?
}

// 星投影的规则
// 对于 Source<out T>，Source<*> 等价于 Source<out Any?>
// 对于 Sink<in T>，Sink<*> 等价于 Sink<in Nothing>
// 对于 MutableStack<T>（不变），Stack<*> 读取按 Any?，写入按 Nothing

// 使用场景：类型参数不重要
fun dump(map: Map<*, *>) {
    map.forEach { (k, v) -> println("$k = $v") }
}
```

## 详细用法

### 泛型约束

```kotlin
// 上界约束：T 必须是 Comparable 的子类型
fun <T : Comparable<T>> maxOf(a: T, b: T): T = if (a > b) a else b

// 多重约束：使用 where 子句
fun <T> copyWhenGreater(source: List<T>, threshold: T): List<T>
    where T : Comparable<T>, T : CharSequence {
    return source.filter { it > threshold }
}

// 泛型约束与型变结合
interface SortedSet<out T : Comparable<T>> {
    fun first(): T
    fun last(): T
}
```

### 具体化类型参数（reified）

```kotlin
// 普通泛型在运行时被擦除，无法检查类型
// inline + reified 保留类型信息
inline fun <reified T> isType(value: Any): Boolean {
    return value is T // 运行时可以检查 T 的类型
}

// 常见用途：简化 Gson/Jackson 反序列化
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, object : TypeToken<T>() {}.type)
}

// 使用
val user: User = gson.fromJson(jsonString)
val users: List<User> = gson.fromJson(jsonArray)
```

### 泛型函数与扩展

```kotlin
// 泛型扩展函数
fun <T> List<T>.second(): T = this[1]

// 带型变的泛型扩展
fun <T> Iterable<T>.filterInstanceOf<R>(): List<R> {
    return filterIsInstance<R>()
}

// 使用处型变（use-site variance）
fun <T> copy(from: Array<out T>, to: Array<in T>) {
    for (i in from.indices) {
        to[i] = from[i]
    }
}
```

## 常见场景

### 类型安全的构建器

```kotlin
// 利用泛型和 Lambda 构建类型安全的 DSL
class Table<T> {
    private val rows = mutableListOf<T>()

    fun row(item: T) {
        rows.add(item)
    }

    fun build(): List<T> = rows.toList()
}

fun <T> table(block: Table<T>.() -> Unit): List<T> {
    return Table<T>().apply(block).build()
}

// 使用
val users = table<User> {
    row(User("张三", 25))
    row(User("李四", 30))
}
```

### 泛型 Repository 模式

```kotlin
// 协变的只读 Repository
interface ReadOnlyRepository<out T> {
    fun findById(id: String): T
    fun findAll(): List<T>
}

// 逆变的写操作
interface WriteRepository<in T> {
    fun save(item: T)
    fun delete(item: T)
}

// 完整的 Repository 组合
interface Repository<T> : ReadOnlyRepository<T>, WriteRepository<T>
```

## 注意事项

- 协变（out）的类型参数只能出现在返回位置，逆变（in）只能出现在参数位置
- Kotlin 的声明处型变比 Java 的使用处型变更安全、更简洁
- 星投影不能写入（除了 Nothing，即不能写入任何值）
- reified 只能与 inline 函数一起使用
- 泛型在运行时被擦除，reified 是唯一保留类型信息的方式
- 数组是协变的（Java 遗留设计），集合是不变的（更安全）

## 进阶用法

### 递归泛型约束

```kotlin
// 递归类型约束：枚举实现 Comparable
inline fun <reified T : Enum<T>> enumValueOfOrNull(name: String): T? {
    return try {
        enumValueOf<T>(name)
    } catch (e: IllegalArgumentException) {
        null
    }
}

// 自引用泛型（CRTP 模式）
interface Comparable<Self : Comparable<Self>> {
    fun compareTo(other: Self): Int
}
```

### 型变与集合操作

```kotlin
// 理解集合操作的型变
fun processItems(items: List<out Any>) {
    // 可以安全读取
    for (item in items) {
        println(item)
    }
    // 不能添加元素（编译错误）
    // items.add("new") // 错误
}

// 利用协变实现灵活的 API
fun <T : Any> merge(
    source1: List<out T>,
    source2: List<out T>
): List<T> {
    return source1 + source2
}

// 可以合并不同子类型
val result = merge(listOf(Dog(), Cat()), listOf(Animal()))
```
