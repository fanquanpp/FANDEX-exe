---
order: 55
title: Kotlin作用域函数
module: kotlin
category: Kotlin
difficulty: beginner
description: 'let、run、with、apply、also'
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/扩展函数
  - kotlin/Kotlin集合操作
  - kotlin/Kotlin与DSL
  - kotlin/空安全详解
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin 提供了五个作用域函数：let、run、with、apply、also。它们的核心功能是在一个对象上执行一段代码块，但各自在引用对象的方式和返回值上有所不同。选择合适的作用域函数可以让代码更简洁、更易读。

很多初学者觉得这五个函数容易混淆，但只要理解两个维度的区别就能轻松选择：一是如何引用对象（it 还是 this），二是返回什么（对象本身还是 lambda 的结果）。

## 基础概念

五个作用域函数的区别可以归纳为两个维度：

- **引用方式**：`it`（let、also）还是 `this`（run、with、apply）
- **返回值**：返回对象本身（apply、also）还是 lambda 结果（let、run、with）

| 函数  | 引用方式 | 返回值      | 是否是扩展函数 |
| ----- | -------- | ----------- | -------------- |
| let   | it       | lambda 结果 | 是             |
| run   | this     | lambda 结果 | 是             |
| with  | this     | lambda 结果 | 否（参数）     |
| apply | this     | 对象本身    | 是             |
| also  | it       | 对象本身    | 是             |

## 快速上手

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
    val person = Person("Alice", 25)

    // let：用 it 引用，返回 lambda 结果
    val greeting = person.let { "${it.name} is ${it.age}" }
    println(greeting)  // Alice is 25

    // run：用 this 引用，返回 lambda 结果
    val description = person.run { "$name is $age years old" }
    println(description)  // Alice is 25 years old

    // with：不是扩展函数，用 this 引用
    val info = with(person) { "$name, age $age" }
    println(info)  // Alice, age 25

    // apply：用 this 引用，返回对象本身
    val configured = person.apply {
        name = "Bob"
        age = 30
    }
    println(configured)  // Person(name=Bob, age=30)

    // also：用 it 引用，返回对象本身
    val logged = person.also {
        println("设置完成: $it")
    }
    println(logged)  // Person(name=Bob, age=30)
}
```

## 详细用法

### let -- 空安全检查与转换

let 最常见的用途是处理可空类型：

```kotlin
// 不使用 let：需要先判空
fun processName(name: String?) {
    if (name != null) {
        println(name.uppercase())
        println(name.length)
    }
}

// 使用 let：更简洁
fun processNameWithLet(name: String?) {
    name?.let {
        println(it.uppercase())
        println(it.length)
        // 在这个 lambda 内，it 是非空的 String
    }
}

// let 用于转换
val length = "Hello".let { it.length }
println(length)  // 5

// let 用于链式调用
val result = "  Hello World  "
    .let { it.trim() }
    .let { it.lowercase() }
    .let { it.replace(" ", "_") }
println(result)  // hello_world
```

### run -- 执行计算并返回结果

run 适合在对象上执行多个操作并返回一个结果：

```kotlin
// 在对象上计算
val person = Person("Alice", 25)
val isAdult = person.run {
    // this 指向 person，可以省略 this
    age >= 18
}
println(isAdult)  // true

// run 也可以不作为扩展函数使用
val result = run {
    // 执行一段代码，返回最后一个表达式
    val x = 10
    val y = 20
    x + y
}
println(result)  // 30

// run 用于初始化和计算
val config = run {
    val env = System.getenv("ENV") ?: "development"
    val port = System.getenv("PORT")?.toInt() ?: 8080
    Config(env, port)
}
```

### with -- 对对象执行多个操作

with 不是扩展函数，适合对一个对象执行多个操作而不需要返回对象本身：

```kotlin
val person = Person("Alice", 25)

// 使用 with 对对象执行多个操作
val description = with(person) {
    // this 指向 person
    println("处理 $name 的数据")
    name.uppercase()
    // 返回最后一个表达式的值
}
println(description)  // ALICE

// with 常用于构建字符串或其他对象
val output = with(StringBuilder()) {
    append("姓名: ")
    append(person.name)
    append("\n年龄: ")
    append(person.age)
    toString()
}
println(output)
```

### apply -- 配置对象

apply 返回对象本身，适合用于初始化或配置对象：

```kotlin
// 配置对象
val person = Person("Alice", 25).apply {
    // this 指向 person，可以省略 this
    name = "Bob"
    age = 30
}
println(person)  // Person(name=Bob, age=30)

// 配置复杂对象
val request = HttpRequest.Builder().apply {
    url = "https://api.example.com"
    method = "POST"
    headers["Content-Type"] = "application/json"
    body = """{"name":"Alice"}"""
    timeout = 5000
}.build()

// apply 在 Android 中特别常用
val textView = TextView(context).apply {
    text = "Hello"
    textSize = 16f
    setTextColor(Color.BLACK)
}
```

### also -- 附加操作

also 返回对象本身，适合在链式调用中插入额外操作（如日志、验证）：

```kotlin
// also 用于日志
val numbers = mutableListOf(1, 2, 3)
    .also { println("原始列表: $it") }
    .apply { add(4) }
    .also { println("添加后: $it") }
    .apply { removeAt(0) }
    .also { println("删除后: $it") }

// also 用于验证
val user = User("Alice", 25)
    .also {
        require(it.name.isNotEmpty()) { "名字不能为空" }
        require(it.age >= 0) { "年龄不能为负数" }
    }

// also 用于调试
val result = computeValue()
    .also { println("计算结果: $it") }
    .let { it * 2 }
    .also { println("翻倍后: $it") }
```

## 常见场景

### 链式处理

```kotlin
// 读取输入、处理、输出
fun processInput(input: String?): String {
    return input
        ?.let { it.trim() }                    // 去除空白
        ?.takeIf { it.isNotEmpty() }           // 检查非空
        ?.let { it.uppercase() }               // 转大写
        ?: "DEFAULT"                            // 默认值
}
```

### 构建对象

```kotlin
// 使用 apply 构建配置对象
data class ServerConfig(
    var host: String = "localhost",
    var port: Int = 8080,
    var debug: Boolean = false,
    var maxConnections: Int = 100
)

fun createConfig(): ServerConfig = ServerConfig().apply {
    host = System.getenv("HOST") ?: "0.0.0.0"
    port = System.getenv("PORT")?.toInt() ?: 9090
    debug = System.getenv("DEBUG") == "true"
    maxConnections = 200
}
```

### 空安全链式调用

```kotlin
// 安全地获取嵌套属性
class Company(val address: Address?)
class Address(val city: String?)

val company: Company? = getCompany()

// 不使用 let：多层判空
val city1: String? = if (company != null && company.address != null) {
    company.address.city
} else null

// 使用 let：更简洁
val city2: String? = company?.let { it.address?.city }
```

## 注意事项

- **不要过度使用**：如果只是简单赋值或调用一个方法，不需要作用域函数
- **避免嵌套**：嵌套使用作用域函数会让代码难以阅读，特别是 it 的指向容易混淆
- **选择 it 还是 this**：如果 lambda 内需要频繁访问对象属性，用 this（run/apply/with）更简洁；如果只是偶尔使用，用 it（let/also）更明确
- **also 和 apply 的区别**：also 用 it 引用，适合附加操作；apply 用 this 引用，适合配置对象
- **let 不要滥用**：let 主要用于空安全检查，不要为了"函数式风格"而把所有代码都放进 let

## 进阶用法

### 自定义作用域函数

```kotlin
// 类似 let 但可以提供默认值
inline fun <T : Any, R> T?.letOrDefault(default: R, block: (T) -> R): R {
    return if (this != null) block(this) else default
}

// 使用
val name: String? = null
val length = name.letOrDefault(0) { it.length }
println(length)  // 0

// 类似 apply 但可以条件执行
inline fun <T> T.applyIf(condition: Boolean, block: T.() -> Unit): T {
    if (condition) block()
    return this
}

// 使用
val person = Person("Alice", 25).applyIf(age > 18) {
    name = name.uppercase()
}
```

### 作用域函数与协程

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    // 在协程中使用作用域函数
    val result = withContext(Dispatchers.IO) {
        // 模拟网络请求
        delay(100)
        "Hello"
    }.let { response ->
        // 处理响应
        response.uppercase()
    }.also {
        // 记录日志
        println("处理结果: $it")
    }
    println(result)  // HELLO
}
```
