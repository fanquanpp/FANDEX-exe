---
order: 58
title: Kotlin内联类
module: kotlin
category: Kotlin
difficulty: intermediate
description: 'value class与内联优化'
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与Spring
  - kotlin/Kotlin与Android
  - kotlin/Kotlin契约
  - kotlin/Kotlin序列化
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

内联类（Inline Class），在 Kotlin 1.5 之后称为 value class，是一种特殊的类，它在编译时会被"内联"为其包装的底层类型，运行时没有任何额外开销。简单来说，value class 让你在编写代码时享受类型安全的好处，而在运行时不会产生额外的对象分配。

为什么需要它？假设你有一个用 String 表示的用户 ID 和一个用 String 表示的邮箱地址，它们都是 String 类型，但语义完全不同。如果不小心把邮箱传给了需要用户 ID 的函数，编译器不会报错，但逻辑上是错误的。value class 可以让编译器帮你检查这类错误。

## 基础概念

- **value class**：用 `@JvmInline value class` 标记的类，只能有一个只读属性（底层值）
- **内联**：编译器会在使用处将 value class 替换为其底层值，避免对象分配
- **类型安全**：在编译期区分不同的 value class，防止混用
- **零运行时开销**：在大多数场景下，value class 不会创建额外的对象

## 快速上手

```kotlin
// 定义 value class
@JvmInline
value class UserId(val value: String)

@JvmInline
value class Email(val value: String)

// 现在编译器会阻止你把 Email 传给需要 UserId 的函数
fun findUser(id: UserId) {
    println("查找用户: ${id.value}")
}

fun main() {
    val userId = UserId("123")
    val email = Email("alice@example.com")

    findUser(userId)     // 正确
    // findUser(email)   // 编译错误：类型不匹配

    // 底层值通过 .value 访问
    println(userId.value)  // "123"
}
```

## 详细用法

### 基本规则

value class 有几个必须遵守的规则：

```kotlin
@JvmInline
value class Seconds(val value: Int) {
    // 可以定义方法
    fun toMinutes(): Double = value / 60.0

    // 可以定义属性（不能有 backing field）
    val isPositive: Boolean
        get() = value > 0
}

fun main() {
    val duration = Seconds(120)
    println(duration.toMinutes())  // 2.0
    println(duration.isPositive)   // true
}
```

规则总结：

- 只能有一个主构造器参数（底层值）
- 底层值必须是只读属性（val）
- 不能有 init 块
- 不能有 backing field 的属性
- 不能继承其他类，也不能被继承
- 可以实现接口

### 实现接口

```kotlin
interface Printable {
    fun formatted(): String
}

@JvmInline
value class Name(val value: String) : Printable {
    override fun formatted(): String = "[$value]"
}

fun printIt(item: Printable) {
    println(item.formatted())
}

fun main() {
    val name = Name("Alice")
    println(name.formatted())  // [Alice]

    // 当 value class 被当作接口使用时，会发生装箱
    printIt(name)  // 这里 name 会被装箱为对象
}
```

### 与数据类对比

```kotlin
// 数据类：运行时创建对象，有额外开销
data class UserIdData(val value: String)

// value class：运行时内联为 String，无额外开销
@JvmInline
value class UserIdValue(val value: String)

fun main() {
    // 数据类：每次创建都是新对象
    val data1 = UserIdData("123")
    val data2 = UserIdData("123")
    println(data1 == data2)  // true（比较内容）

    // value class：比较底层值
    val value1 = UserIdValue("123")
    val value2 = UserIdValue("123")
    println(value1 == value2)  // true（比较底层值）
}
```

### 无符号整数的实现

Kotlin 的无符号整数类型（UInt、ULong 等）本身就是用 value class 实现的：

```kotlin
// Kotlin 标准库中 UInt 的简化实现
@JvmInline
value class UInt(val data: Int) : Comparable<UInt> {
    override fun compareTo(other: UInt): Int =
        compareValues(data.toLong() and 0xFFFFFFFFL, other.data.toLong() and 0xFFFFFFFFL)
}
```

### 在集合中使用

```kotlin
@JvmInline
value class ProductId(val value: Long)

fun main() {
    // 在 List 中使用，底层就是 List<Long>
    val ids = listOf(
        ProductId(1L),
        ProductId(2L),
        ProductId(3L)
    )

    // 遍历时也是类型安全的
    ids.forEach { id ->
        println("产品ID: ${id.value}")
    }

    // Map 的 key 也可以用 value class
    val productNames = mapOf(
        ProductId(1L) to "手机",
        ProductId(2L) to "电脑"
    )
}
```

## 常见场景

### 防止参数混淆

```kotlin
@JvmInline
value class Latitude(val value: Double)

@JvmInline
value class Longitude(val value: Double)

// 没有 value class 时，经纬度容易传反
fun getDistance(lat1: Latitude, lon1: Longitude, lat2: Latitude, lon2: Longitude): Double {
    // 计算两点之间的距离
    val dLat = lat2.value - lat1.value
    val dLon = lon2.value - lon1.value
    return Math.sqrt(dLat * dLat + dLon * dLon)
}

fun main() {
    // 类型安全，不会传反
    val distance = getDistance(
        Latitude(39.9),
        Longitude(116.4),
        Latitude(31.2),
        Longitude(121.5)
    )
}
```

### 类型安全的度量单位

```kotlin
@JvmInline
value class Kilometers(val value: Double) {
    fun toMiles(): Miles = Miles(value * 0.621371)
}

@JvmInline
value class Miles(val value: Double) {
    fun toKilometers(): Kilometers = Kilometers(value * 1.60934)
}

@JvmInline
value class Celsius(val value: Double) {
    fun toFahrenheit(): Fahrenheit = Fahrenheit(value * 9 / 5 + 32)
}

@JvmInline
value class Fahrenheit(val value: Double) {
    fun toCelsius(): Celsius = Celsius((value - 32) * 5 / 9)
}

fun main() {
    val distance = Kilometers(100.0)
    println("${distance.value}公里 = ${distance.toMiles().value}英里")

    val temp = Celsius(37.0)
    println("${temp.value}摄氏度 = ${temp.toFahrenheit().value}华氏度")
}
```

### 领域建模中的类型安全 ID

```kotlin
@JvmInline
value class OrderId(val value: String)

@JvmInline
value class CustomerId(val value: String)

data class Order(
    val id: OrderId,
    val customerId: CustomerId,
    val amount: Double
)

fun findOrdersByCustomer(customerId: CustomerId): List<Order> {
    // 查询逻辑
    return emptyList()
}

fun cancelOrder(orderId: OrderId) {
    // 取消逻辑
}

fun main() {
    val customerId = CustomerId("C001")
    val orderId = OrderId("O001")

    // 不会把 orderId 误传给需要 customerId 的函数
    findOrdersByCustomer(customerId)
    cancelOrder(orderId)
}
```

## 注意事项

- **必须加 @JvmInline**：在 JVM 平台上，value class 必须加 `@JvmInline` 注解，否则编译错误
- **装箱场景**：当 value class 被当作其实现的接口类型使用、作为泛型类型参数、或放入可空位置时，会发生装箱（boxing），产生运行时开销
- **不能有多个构造器参数**：value class 只能包装一个值，如果需要多个值，应该用 data class
- **序列化需要额外处理**：value class 默认序列化为其底层值，如果需要不同行为，要自定义序列化器
- **反射限制**：通过反射访问 value class 时，可能会遇到一些边界情况

## 进阶用法

### 与序列化配合

```kotlin
import kotlinx.serialization.*

@Serializable
@JvmInline
value class Password(val value: String)

@Serializable
data class LoginRequest(
    val username: String,
    val password: Password
)

fun main() {
    val request = LoginRequest("alice", Password("secret123"))
    val json = kotlinx.serialization.json.Json.encodeToString(request)
    // password 字段直接序列化为字符串值，不是对象
    println(json)  // {"username":"alice","password":"secret123"}
}
```

### 条件初始化

虽然 value class 不能有 init 块，但可以通过伴生对象的工厂方法实现验证：

```kotlin
@JvmInline
value class PositiveInt private constructor(val value: Int) {
    companion object {
        // 工厂方法，带验证逻辑
        fun create(value: Int): PositiveInt {
            require(value > 0) { "值必须为正数，当前值: $value" }
            return PositiveInt(value)
        }
    }
}

fun main() {
    val valid = PositiveInt.create(42)    // 正确
    // PositiveInt.create(-1)             // 抛出 IllegalArgumentException
}
```

### 多平台项目中的 value class

value class 在 Kotlin Multiplatform 中特别有用，因为它们在各平台都没有额外开销：

```kotlin
// 在共享模块中定义
@JvmInline
value class NetworkResult(val statusCode: Int) {
    val isSuccess: Boolean get() = statusCode in 200..299
    val isClientError: Boolean get() = statusCode in 400..499
    val isServerError: Boolean get() = statusCode in 500..599
}
```
