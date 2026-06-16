---
order: 77
title: Kotlin与Benchmark
module: kotlin
category: Kotlin
difficulty: intermediate
description: Kotlin性能基准测试
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与DSL
  - kotlin/Kotlin与原子操作
  - kotlin/Kotlin与IO
  - kotlin/Kotlin与正则
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

性能基准测试（Benchmark）是用来衡量代码执行速度和资源消耗的方法。在优化代码之前，你需要先知道哪段代码慢、慢多少，而不是凭直觉猜测。Kotlin 运行在 JVM 上，最成熟的基准测试工具是 JMH（Java Microbenchmark Harness），由 OpenJDK 团队开发，专门用于编写可靠的微基准测试。

为什么需要基准测试？因为 JVM 有即时编译（JIT）、内联优化、逃逸分析等机制，手动计时往往得到不准确的结果。JMH 会帮你处理预热、多次迭代、统计计算等细节，让测试结果更可信。

## 基础概念

JMH 的核心概念包括：

- **Benchmark 方法**：用 `@Benchmark` 注解标记的方法，就是要测试的代码
- **Mode（模式）**：衡量方式，比如平均时间（AverageTime）、吞吐量（Throughput）
- **State（状态）**：测试中用到的数据对象，用 `@State` 注解标记
- **Warmup（预热）**：正式测量前先跑几轮，让 JIT 编译器完成优化
- **Iteration（迭代）**：一次完整的测量循环
- **Fork**：在新的 JVM 进程中运行测试，避免不同测试之间的影响

## 快速上手

首先，在 `build.gradle.kts` 中添加 JMH 插件和依赖：

```kotlin
// build.gradle.kts
plugins {
    id("me.champeau.jmh") version "0.7.2"
    kotlin("jvm") version "2.0.0"
}

dependencies {
    // JMH 依赖由插件自动添加
}

// JMH 配置
jmh {
    iterations.set(3)        // 每次测试的迭代次数
    warmupIterations.set(2)  // 预热迭代次数
    fork.set(1)              // fork 数量
    benchmarkMode.set(listOf("avgt"))  // 平均时间模式
}
```

最简单的基准测试：

```kotlin
import org.openjdk.jmh.annotations.*
import java.util.concurrent.TimeUnit

// 基准测试模式：平均执行时间
@BenchmarkMode(Mode.AverageTime)
// 输出时间单位：微秒
@OutputTimeUnit(TimeUnit.MICROSECONDS)
// 状态作用域：每个线程独立实例
@State(Scope.Benchmark)
// 预热：2轮，每轮1秒
@Warmup(iterations = 2, time = 1)
// 正式测量：3轮，每轮1秒
@Measurement(iterations = 3, time = 1)
// fork 1个新进程
@Fork(1)
open class StringBenchmark {

    // 测试字符串拼接
    @Benchmark
    fun stringConcat(): String {
        return "Hello" + " " + "World"
    }

    // 测试 StringBuilder
    @Benchmark
    fun stringBuilder(): String {
        return StringBuilder()
            .append("Hello")
            .append(" ")
            .append("World")
            .toString()
    }
}
```

运行基准测试：

```bash
./gradlew jmh
```

## 详细用法

### 使用 State 对象管理测试数据

当测试需要输入数据时，用 `@State` 定义状态对象：

```kotlin
@State(Scope.Benchmark)
open class ListState {
    // Setup 方法在每次迭代前执行
    @Setup
    fun setup() {
        data = (1..1000).toList()
    }

    lateinit var data: List<Int>
}

// 在基准测试中引用状态
@BenchmarkMode(Mode.AverageTime)
@State(Scope.Benchmark)
open class ListBenchmark {

    private val state = ListState()

    @Benchmark
    fun filterList(): List<Int> {
        return state.data.filter { it % 2 == 0 }
    }

    @Benchmark
    fun filterSequence(): List<Int> {
        return state.data.asSequence().filter { it % 2 == 0 }.toList()
    }
}
```

### 测量吞吐量

吞吐量模式衡量每秒能执行多少次操作：

```kotlin
@BenchmarkMode(Mode.Throughput)
@OutputTimeUnit(TimeUnit.SECONDS)
@State(Scope.Benchmark)
open class ThroughputBenchmark {

    @Benchmark
    fun createList(): List<Int> {
        return listOf(1, 2, 3, 4, 5)
    }
}
```

### 多参数对比测试

用 `@Param` 测试不同参数下的性能：

```kotlin
@State(Scope.Benchmark)
open class SizeBenchmark {
    // JMH 会为每个参数值分别运行测试
    @Param("10", "100", "1000", "10000")
    var size: Int = 0

    private var data: List<Int> = emptyList()

    @Setup
    fun setup() {
        data = (1..size).toList()
    }

    @Benchmark
    fun sumByFold(): Int {
        return data.fold(0) { acc, i -> acc + i }
    }

    @Benchmark
    fun sumBySum(): Int {
        return data.sum()
    }
}
```

### 避免死代码消除

JVM 可能会优化掉没有被使用的计算结果。用 `Blackhole` 防止这种情况：

```kotlin
import org.openjdk.jmh.infra.Blackhole

@State(Scope.Benchmark)
open class BlackholeBenchmark {

    private val data = (1..100).toList()

    // 使用 Blackhole 消费计算结果，防止被优化掉
    @Benchmark
    fun consumeResult(bh: Blackhole) {
        for (item in data) {
            bh.consume(item * 2)
        }
    }
}
```

## 常见场景

### 对比不同集合操作的性能

```kotlin
@State(Scope.Benchmark)
open class CollectionBenchmark {

    private var list: List<Int> = emptyList()
    private var set: Set<Int> = emptySet()

    @Setup
    fun setup() {
        list = (1..10000).toList()
        set = list.toSet()
    }

    // 测试 List 的 contains 操作
    @Benchmark
    fun listContains(): Boolean {
        return list.contains(9999)
    }

    // 测试 Set 的 contains 操作
    @Benchmark
    fun setContains(): Boolean {
        return set.contains(9999)
    }
}
```

### 对比协程与线程的性能

```kotlin
@State(Scope.Benchmark)
open class ConcurrencyBenchmark {

    @Benchmark
    fun coroutineLaunch() = runBlocking {
        val jobs = List(1000) {
            launch {
                delay(1)
            }
        }
        jobs.forEach { it.join() }
    }
}
```

### 测试 JSON 序列化性能

```kotlin
@State(Scope.Benchmark)
open class JsonBenchmark {

    private val json = Json { ignoreUnknownKeys = true }

    @Serializable
    data class User(val name: String, val age: Int, val email: String)

    private val user = User("Alice", 25, "alice@example.com")
    private var jsonString: String = ""

    @Setup
    fun setup() {
        jsonString = json.encodeToString(user)
    }

    @Benchmark
    fun serialize(): String {
        return json.encodeToString(user)
    }

    @Benchmark
    fun deserialize(): User {
        return json.decodeFromString(jsonString)
    }
}
```

## 注意事项

- **预热必不可少**：JIT 编译需要时间，不预热的结果不准确。至少预热 2-3 轮
- **避免微基准测试陷阱**：JMH 会帮你避免很多问题，但你仍需注意不要在 `@Benchmark` 方法中做与测试无关的操作
- **不要在循环中拼接字符串**：基准测试会证明 StringBuilder 远快于循环中的 `+` 拼接
- **fork 数量**：至少 fork 1 次，避免不同测试之间的 JVM 优化干扰
- **结果波动**：如果结果波动很大，增加迭代次数或 fork 数量
- **不要测试太简单的操作**：比如 `1 + 1`，JIT 可能会直接常量折叠，测试没有意义

## 进阶用法

### 使用 CompilerControl 控制内联

```kotlin
import org.openjdk.jmh.annotations.CompilerControl

@State(Scope.Benchmark)
open class InlineBenchmark {

    // 强制内联
    @CompilerControl(CompilerControl.Mode.INLINE)
    fun inlinedMethod(): Int = 42

    // 禁止内联
    @CompilerControl(CompilerControl.Mode.DONT_INLINE)
    fun notInlinedMethod(): Int = 42

    @Benchmark
    fun withInline(): Int = inlinedMethod()

    @Benchmark
    fun withoutInline(): Int = notInlinedMethod()
}
```

### 异步基准测试

测试异步操作的吞吐量：

```kotlin
@State(Scope.Benchmark)
open class AsyncBenchmark {

    private val scope = CoroutineScope(Dispatchers.Default)

    @Benchmark
    fun asyncComputation(): Int = runBlocking {
        val deferred = scope.async {
            // 模拟计算
            var sum = 0
            for (i in 1..1000) {
                sum += i
            }
            sum
        }
        deferred.await()
    }

    @TearDown
    fun tearDown() {
        scope.cancel()
    }
}
```

### 自定义 Profiler

JMH 支持附加 Profiler 来分析性能瓶颈：

```kotlin
// 在 jmh 配置块中启用 profiler
jmh {
    profilers.set(listOf("gc", "stack"))
}
```

也可以通过命令行指定：

```bash
./gradlew jmh -Pjmh.profilers=gc,stack
```

这会额外输出 GC 次数、内存分配量、栈采样等信息，帮助你定位性能问题的根源。
