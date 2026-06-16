---
order: 59
title: Kotlin契约
module: kotlin
category: Kotlin
difficulty: advanced
description: 契约与编译器提示
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与Android
  - kotlin/Kotlin内联类
  - kotlin/Kotlin序列化
  - kotlin/Kotlin集合操作
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin 契约（Contract）是一种向编译器提供额外类型信息的机制。通常，编译器只能根据代码的静态结构做类型推断，但有些情况下，程序员知道更多的运行时信息。契约让你告诉编译器："如果这个函数正常返回，那么某个条件一定成立"，从而帮助编译器做更精确的类型推断，减少不必要的类型转换或空检查。

最常见的例子是 `requireNotNull` 函数：调用它之后，编译器就知道参数不为 null 了，不需要再手动做空检查。

## 基础概念

- **contract 块**：用 `contract { }` 声明契约，放在函数体的最前面
- **returns() implies**：最常用的契约形式，表示"如果函数正常返回，则某个条件成立"
- **callsInPlace**：表示传入的 lambda 会在特定时机被调用，用于智能推断局部变量的初始化状态
- **Experimental**：契约目前仍是实验性特性，需要添加 `@OptIn(ExperimentalContracts::class)` 注解

## 快速上手

```kotlin
import kotlin.contracts.*

// 最简单的契约：告诉编译器，如果函数正常返回，则 value 不为 null
@OptIn(ExperimentalContracts::class)
fun requireNonNull(value: Any?) {
    contract { returns() implies (value != null) }
    if (value == null) throw IllegalArgumentException("值不能为空")
}

fun process(s: String?) {
    requireNonNull(s)
    // 没有契约时，编译器不知道 s 不为 null，需要 s!!.length
    // 有了契约，编译器知道 s 不为 null
    println(s.length)  // 直接使用，无需 !! 或 ?.
}
```

## 详细用法

### returns() implies 契约

这是最常用的契约形式，表示"函数正常返回意味着某个条件成立"：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 契约：如果函数返回 true，则 value 不为 null
fun isValid(value: String?): Boolean {
    contract { returns(true) implies (value != null) }
    return value != null && value.isNotEmpty()
}

fun main() {
    val input: String? = readLine()
    if (isValid(input)) {
        // 编译器知道 input 不为 null，因为 isValid 返回 true
        println("输入长度: ${input.length}")
    }
}
```

### returns(false) implies 契约

也可以在返回 false 时提供信息：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 如果函数返回 false，则 value 为 null
fun isNullOrEmpty(value: String?): Boolean {
    contract { returns(false) implies (value != null) }
    return value == null || value.isEmpty()
}

fun main() {
    val input: String? = readLine()
    if (!isNullOrEmpty(input)) {
        // 编译器知道 input 不为 null
        println("非空输入: ${input.length}")
    }
}
```

### callsInPlace 契约

`callsInPlace` 告诉编译器传入的 lambda 会被调用几次、在什么时候调用：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// EXACTLY_ONCE：lambda 恰好被调用一次
fun <T> runOnce(block: () -> T): T {
    contract { callsInPlace(block, InvocationKind.EXACTLY_ONCE) }
    return block()
}

@OptIn(ExperimentalContracts::class)
// AT_LEAST_ONCE：lambda 至少被调用一次
fun <T> runAtLeastOnce(block: () -> T): T {
    contract { callsInPlace(block, InvocationKind.AT_LEAST_ONCE) }
    return block()
}

@OptIn(ExperimentalContracts::class)
// AT_MOST_ONCE：lambda 最多被调用一次
fun <T> runAtMostOnce(condition: Boolean, block: () -> T): T? {
    contract { callsInPlace(block, InvocationKind.AT_MOST_ONCE) }
    return if (condition) block() else null
}

fun main() {
    // 没有 callsInPlace 契约时，编译器不知道 lambda 一定会执行
    // 所以 x 可能未初始化
    val x: Int
    runOnce { x = 42 }  // 有契约，编译器知道 x 一定会被赋值
    println(x)  // 可以直接使用

    val y: Int
    runAtLeastOnce { y = 100 }
    println(y)  // 可以直接使用
}
```

### 自定义条件契约

可以创建更复杂的条件判断函数：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 判断是否为特定类型
fun <T> isType(value: Any?, klass: Class<T>): Boolean {
    contract { returns(true) implies (value != null) }
    return klass.isInstance(value)
}

// 更实用的例子：验证列表非空
@OptIn(ExperimentalContracts::class)
fun <T> isNotEmpty(list: List<T>?): Boolean {
    contract { returns(true) implies (list != null) }
    return list != null && list.isNotEmpty()
}

fun main() {
    val items: List<String>? = listOf("a", "b", "c")
    if (isNotEmpty(items)) {
        // 编译器知道 items 不为 null
        println("第一个元素: ${items.first()}")
    }
}
```

### 结合扩展函数的契约

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 扩展函数中的契约
fun String?.isNotBlankOrThrow(): String {
    contract { returns() implies (this@isNotBlankOrThrow != null) }
    if (this == null || this.isBlank()) {
        throw IllegalArgumentException("字符串为空或空白")
    }
    return this
}

fun main() {
    val text: String? = "  Hello  "
    val trimmed = text.trim()
    trimmed.isNotBlankOrThrow()
    // 编译器知道 trimmed 不为 null
    println(trimmed.length)
}
```

## 常见场景

### 封装常见的空检查模式

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 如果 value 为 null，执行默认操作
inline fun <T : Any> T?.ifNull(action: () -> T): T {
    contract { returns() implies (this@ifNull != null) }
    return this ?: action()
}

@OptIn(ExperimentalContracts::class)
// 确保条件成立，否则抛出异常
fun ensure(condition: Boolean, lazyMessage: () -> String) {
    contract { returns() implies condition }
    if (!condition) throw IllegalStateException(lazyMessage())
}

fun main() {
    val name: String? = getInput()
    name.ifNull { "默认值" }
    // 编译器知道 name 不为 null
    println(name.length)

    val age = -1
    ensure(age >= 0) { "年龄不能为负数" }
    // 编译器知道 age >= 0
}
```

### 简化类型检查

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 类型检查并智能转换
inline fun <reified T> Any?.isInstanceOf(): Boolean {
    contract { returns(true) implies (this@isInstanceOf is T) }
    return this is T
}

fun main() {
    val value: Any = "Hello"
    if (value.isInstanceOf<String>()) {
        // 编译器知道 value 是 String
        println(value.length)
    }
}
```

### 状态验证

```kotlin
import kotlin.contracts.*

class StateMachine {
    private var initialized = false
    private var data: String? = null

    @OptIn(ExperimentalContracts::class)
    fun requireInitialized() {
        contract { returns() implies (this@StateMachine.initialized) }
        check(initialized) { "状态机未初始化" }
    }

    fun initialize(input: String) {
        data = input
        initialized = true
    }

    fun process() {
        requireInitialized()
        // 编译器知道 initialized 为 true
        // 但 data 仍需要空检查，因为契约只能作用于条件表达式
        println(data?.length)
    }
}
```

## 注意事项

- **实验性特性**：契约目前仍是实验性功能，API 可能会变化，需要用 `@OptIn(ExperimentalContracts::class)` 标注
- **契约必须在函数体第一条语句**：`contract { }` 必须是函数体的第一条语句，之前不能有任何代码
- **只能用在内联函数或有固定实现的函数中**：契约不能用在 open 或 abstract 函数中
- **编译器不会验证契约的正确性**：如果你声明了错误的契约（比如函数可能返回 null 但契约说不会），编译器不会报错，但可能导致运行时错误
- **不要滥用契约**：只在确实能帮助编译器做更精确推断时使用，不要为了省略空检查而随意添加契约
- **契约只影响编译期推断**：契约不会改变运行时行为，只是帮助编译器做更精确的类型推断

## 进阶用法

### 组合多个条件

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class)
// 同时检查多个条件
fun <A, B> requireBothNotNull(a: A?, b: B?) {
    contract {
        returns() implies (a != null)
        returns() implies (b != null)
    }
    requireNotNull(a) { "第一个参数不能为空" }
    requireNotNull(b) { "第二个参数不能为空" }
}

fun main() {
    val x: String? = "Hello"
    val y: Int? = 42
    requireBothNotNull(x, y)
    // 编译器知道 x 和 y 都不为 null
    println(x.length + y)
}
```

### 标准库中的契约

Kotlin 标准库中很多函数已经使用了契约，了解它们可以帮你更好地利用编译器的智能推断：

```kotlin
// 标准库中的契约示例（不需要自己添加 @OptIn）

// require - 如果返回，则条件为 true
require(x > 0)
// 此后编译器知道 x > 0

// check - 如果返回，则条件为 true
check(state != null)
// 此后编译器知道 state 不为 null

// let - callsInPlace 契约
val result = value?.let {
    // it 一定不为 null
    it.length
}

// also - callsInPlace 契约
val configured = list.also {
    // it 一定不为 null
    it.add("item")
}

// run/with/apply - 都有 callsInPlace 契约
val x: Int
run { x = 42 }
println(x)  // 编译器知道 x 已初始化
```
